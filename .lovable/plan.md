
# Fix Formula Display Inconsistency - Single Source of Truth

## Problem Statement

The app shows mathematically incorrect formula strings like:
- "6 width(s) × 273cm = **16.53m**" (should be 16.38m - the math is 6 × 273 = 1638cm = 16.38m)
- "8.30m × 2 = **16.63m**" (should be 16.60m - the math is 8.30 × 2 = 16.60m)

Users see "2+2=5" and lose trust in the app. This is unacceptable for a professional quoting tool.

---

## Root Cause Analysis

The app has **TWO separate calculation paths** that produce slightly different results:

| Source | Used For | Result (Your Test) |
|--------|----------|-------------------|
| **CalculationEngine** (`useCurtainEngine`) | `displayLinearMeters` → formula text | 16.63m |
| **useFabricCalculator** (legacy hook) | `fabricCalculation.linearMeters` → cost | 16.60m |

### Why The Formula Text Doesn't Match The Math Shown

**Line 951-953 in AdaptiveFabricPricingDisplay.tsx:**
```typescript
const totalInUserUnit = metersToFabricUnit(totalLinearMeters); // = 16.63m (from ENGINE)
calculationText = `${perPieceInUserUnit.toFixed(2)}m × ${pieces} = ${totalInUserUnit.toFixed(2)}m × price`;
// Shows: "8.30m × 2 = 16.63m" but 8.30 × 2 = 16.60, not 16.63!
```

The formula text shows:
- `perPieceInUserUnit` = 8.30m (from `fabricCalculation.linearMetersPerPiece`)
- `totalInUserUnit` = 16.63m (from `engineResult.linear_meters`)

These come from **DIFFERENT sources**, so they don't mathematically align!

### Why The Two Engines Calculate Differently

1. **CalculationEngine** (lines 279-282):
   ```typescript
   seam_allowance_cm = seams_count * seam_hem_cm;  // Uses seam_hem_cm from template
   total_fabric_cm = (total_width_cm * horizontal_pieces) + seam_allowance_cm;
   ```

2. **useFabricCalculator** (line 127):
   ```typescript
   totalSeamAllowance = widthsRequired > 1 ? (widthsRequired - 1) * seamHems * 2 : 0;
   // Multiplies by 2 (double-sided seams)
   ```

The **seam allowance formulas are different** - one uses `seamHems × 2`, the other uses just `seam_hem_cm`. This causes the 0.03m difference.

---

## Solution: Use CONSISTENT Values in Formula Display

### Principle: Formula Text Must Show Math That Actually Equals The Displayed Result

If we show "A × B = C", then mathematically A × B MUST equal C.

### Fix 1: Use totalLinearMetersToOrder in Formula Text (Not Engine Result)

**File:** `src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx`
**Lines:** 951-953

```typescript
// BEFORE (broken):
const totalInUserUnit = metersToFabricUnit(totalLinearMeters);  // From ENGINE = 16.63m
calculationText = `${perPieceInUserUnit}m × ${pieces} = ${totalInUserUnit}m × price`;
// Shows: "8.30m × 2 = 16.63m" (WRONG! 8.30 × 2 = 16.60)

// AFTER (fixed):
const totalInUserUnit = metersToFabricUnit(totalLinearMetersToOrder);  // = 8.30 × 2 = 16.60m
calculationText = `${perPieceInUserUnit}m × ${pieces} = ${totalInUserUnit}m × price`;
// Shows: "8.30m × 2 = 16.60m" (CORRECT! Math checks out)
```

### Fix 2: Fix Vertical Calculation Breakdown Similarly

**File:** `src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx`
**Lines:** 1007-1022

The vertical breakdown shows:
- "6 width(s) × 273cm = 16.53m"

But:
- `widthsRequired × dropWithAllowances` from fabricCalculation
- `breakdownQuantity` comes from `quantity` which may come from engine

**Fix:** Use the same calculated value for both the formula and result:

```typescript
// BEFORE:
calculationBreakdown = `${widthsRequired} × ${dropWithAllowances}cm = ${breakdownQuantity}m × price`;
// breakdownQuantity may come from engine, not match widths × drop

// AFTER:
const calculatedTotal = (widthsRequired * dropWithAllowances + totalSeamAllowance) / 100;
calculationBreakdown = `${widthsRequired} × ${dropWithAllowances}cm + ${totalSeamAllowance}cm seams = ${calculatedTotal.toFixed(2)}m × price`;
// Shows the actual math that produces the result
```

### Fix 3: Ensure Cost Uses Same Value As Formula

**File:** `src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx`
**Lines:** 938-940

```typescript
// Horizontal: Already fixed in previous changes
quantity = totalLinearMetersToOrder;  // Uses correct calculated value
totalCost = quantity * pricePerUnit;  // Cost matches formula

// Vertical needs same treatment:
// Use calculated total, not engine result
quantity = calculatedTotal;  // From widths × drop + seams
totalCost = quantity * pricePerUnit;
```

---

## Files to Modify

| File | Lines | Change |
|------|-------|--------|
| `AdaptiveFabricPricingDisplay.tsx` | 951-953 | Use `totalLinearMetersToOrder` instead of `totalLinearMeters` for horizontal formula text |
| `AdaptiveFabricPricingDisplay.tsx` | 953 | Use consistent value for breakdown cost display |
| `AdaptiveFabricPricingDisplay.tsx` | 1009-1022 | For vertical: calculate formula result directly from shown values, don't use external source |
| `AdaptiveFabricPricingDisplay.tsx` | 968-970 | Ensure quantity uses same calculation as formula breakdown |

---

## Implementation Details

### Change 1: Horizontal Formula Text Fix (Lines 950-954)

Replace the formula text generation to use calculated values:

```typescript
} else {
  // ✅ FIX: Formula text must show math that equals the result
  // totalLinearMetersToOrder = linearMetersPerPiece × piecesToCharge (calculated above)
  const totalForFormula = metersToFabricUnit(totalLinearMetersToOrder);
  calculationText = `${perPieceInUserUnit.toFixed(2)}${unitSuffix} per piece × ${horizontalPiecesNeeded} = ${totalForFormula.toFixed(2)}${unitSuffix} × ${formatPricePerFabricUnit(pricePerUnit)}`;
  
  // ✅ FIX: Breakdown cost must use same value
  const totalCostForFormula = totalLinearMetersToOrder * pricePerUnit;
  calculationBreakdown = `Railroaded fabric requiring ${horizontalPiecesNeeded} horizontal pieces. ${perPieceInUserUnit.toFixed(2)}${unitSuffix} per piece × ${horizontalPiecesNeeded} = ${totalForFormula.toFixed(2)}${unitSuffix} total × ${formatPricePerFabricUnit(pricePerUnit)} = ${formatPrice(totalCostForFormula)}`;
}
```

### Change 2: Vertical Formula Text Fix (Lines 1007-1022)

Calculate the formula result directly from the shown components:

```typescript
// ✅ FIX: Calculate total directly from displayed components
// This ensures "A × B + C = D" where D actually equals A×B+C
const calculatedTotalCm = (widthsRequired * dropWithAllowances) + totalSeamAllowance;
const calculatedTotalMeters = calculatedTotalCm / 100;
const breakdownQuantityForFormula = metersToFabricUnit(calculatedTotalMeters);

if (totalAllowances > 0 || totalSeamAllowance > 0) {
  let breakdownParts = `${widthsRequired} width(s) × ${dropWithAllowances.toFixed(0)}cm`;
  if (totalAllowances > 0) {
    breakdownParts += ` (${rawDrop.toFixed(0)}cm drop + ${totalAllowances.toFixed(0)}cm allowances)`;
  }
  if (totalSeamAllowance > 0) {
    breakdownParts += ` + ${totalSeamAllowance.toFixed(0)}cm seams`;
  }
  // ✅ Use calculated value, not external quantity
  const formulaCost = calculatedTotalMeters * pricePerUnit;
  calculationBreakdown = `${breakdownParts} = ${breakdownQuantityForFormula.toFixed(2)}${getFabricUnitSuffix()} × ${formatPricePerFabricUnit(pricePerUnit)} = ${formatPrice(formulaCost)}`;
} else {
  // Simple case without allowances
  const formulaCost = calculatedTotalMeters * pricePerUnit;
  calculationBreakdown = `${widthsRequired} width(s) × ${dropWithAllowances.toFixed(0)}cm = ${breakdownQuantityForFormula.toFixed(2)}${getFabricUnitSuffix()} × ${formatPricePerFabricUnit(pricePerUnit)} = ${formatPrice(formulaCost)}`;
}
```

### Change 3: Synchronize Quantity With Formula (Lines 967-970)

For vertical calculation, ensure quantity matches the formula breakdown:

```typescript
// Before using engine-sourced quantity, verify it matches our formula
// Or use calculated value for consistency
quantity = calculatedTotalMeters;  // Same value shown in formula
totalCost = quantity * pricePerUnit;
```

---

## Expected Results After Fix

**Horizontal Test Case (400cm × 250cm, railroaded):**
- Formula text: "8.30m × 2 = **16.60m** × £100 = **£1660**"
- Math check: 8.30 × 2 = 16.60 ✅

**Vertical Test Case (400cm × 250cm, standard):**
- Formula text: "6 width(s) × 273cm + 0cm seams = **16.38m** × £100 = **£1638**"
- Math check: 6 × 273 = 1638cm = 16.38m ✅

---

## Why Not Just Hide The Formulas?

Hiding formulas would:
1. Remove transparency that professional users need
2. Make debugging harder
3. Not fix the underlying calculation inconsistency

Fixing the formulas to show accurate math:
1. Builds user trust
2. Helps users verify quotes manually
3. Demonstrates professional attention to detail

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Cost changes slightly | The ACTUAL cost calculation uses engine result - we're only fixing the DISPLAY text to match |
| Regression in other displays | Changes are isolated to formula string generation |
| Rounding differences | Use consistent 2-decimal rounding throughout |

---

## Technical Summary

The fix ensures that **every formula displayed follows mathematical truth**:
- If we show "A × B = C", then C = A × B exactly
- If we show "A × B + C = D", then D = A × B + C exactly

The actual pricing can still use the engine's calculated value - we're only ensuring the **educational/transparency text** doesn't show impossible math.
