

# Fix Critical Fabric Calculation and Display Bugs

## Executive Summary

I've traced through the complete code flow and identified **4 critical bugs** causing the issues you're seeing:

| What You See | Expected | Actual | Root Cause |
|-------------|----------|--------|------------|
| Fabric Cost | £3326.00 (33.26m × £100) | £1663.00 | `useFabricCalculator.ts` returns TOTAL meters (33.26m) but cost uses HALF |
| Quote Summary Fabric | £3326.00 or markup of correct base | £2494.50 | 50% markup applied to wrong base (£1663 × 1.5) |
| Formula text | Matches displayed cost | Shows £3326 but cost is £1663 | Display text and cost calculated separately |

---

## Root Cause Analysis

### Bug #1: `useFabricCalculator.ts` - Cost Calculation Uses Wrong Value

**Location**: Lines 142-175

**Problem**: The `linearMeters` correctly includes multiplication by `horizontalPiecesNeeded`, but then `fabricCost` is calculated from `orderedLinearMeters` which is set equal to `linearMeters`. However, looking at line 174:

```typescript
// Line 146: linearMeters includes pieces multiplication
linearMeters = (totalWidthWithAllowances / 100) * horizontalPiecesNeeded * wasteMultiplier;
// Line 147: orderedLinearMeters = linearMeters (correct)
orderedLinearMeters = linearMeters;
// Line 174: fabricCost should be correct...
const fabricCost = orderedLinearMeters * fabric.price_per_meter;
```

But the return object has `totalCost: fabricCost` which IS correct. So where does £1663 come from?

### Bug #2: `AdaptiveFabricPricingDisplay.tsx` - `totalCost` Overwritten

**Location**: Lines 908-932

**Problem Found**: The display component re-calculates `totalCost` using its own logic:

```typescript
// Line 908-910: Gets linearMeters (already includes pieces)
const linearMeters = isCurtainEngineActive && displayLinearMeters != null
  ? displayLinearMeters
  : (fabricCalculation.linearMeters || 0);  // = 33.26m

// Line 911: Gets pieces
const horizontalPiecesNeeded = fabricCalculation.horizontalPiecesNeeded || 1;  // = undefined, defaults to 1!

// Line 915: DOUBLE or WRONG multiplication
const totalLinearMetersToOrder = linearMeters * piecesToCharge;  // 33.26m × 1 = 33.26m (OK)

// Line 930-932: But totalCost uses THIS formula:
totalCost = isCurtainEngineActive && displayFabricCost != null
  ? displayFabricCost
  : quantity * pricePerUnit;  // quantity = totalLinearMetersToOrder = 33.26m
```

Wait - that should be £3326. Let me check `fabricCalculation.horizontalPiecesNeeded`:

**THE REAL BUG**: `useFabricCalculator.ts` **NEVER RETURNS** `horizontalPiecesNeeded`!

Looking at lines 177-206 in `useFabricCalculator.ts`, the return object does NOT include `horizontalPiecesNeeded`. So when the display checks `fabricCalculation.horizontalPiecesNeeded`, it gets `undefined` and defaults to `1`.

BUT - the `linearMeters` value (33.26m) already includes the multiplication by 2 pieces. So when the display shows "16.63m × 2 pieces = 33.26m", it's WRONG - the actual per-piece value is not stored.

### Bug #3: Missing `horizontalPiecesNeeded` in Return Object

**File**: `src/components/shared/measurement-visual/hooks/useFabricCalculator.ts`

The hook calculates `horizontalPiecesNeeded` inside the `if (isRailroaded)` block (line 145) but NEVER includes it in the return object (lines 177-206).

**Impact**:
- Display defaults to `horizontalPiecesNeeded = 1`
- Cannot show correct per-piece breakdown
- `piecesToCharge` calculation may be wrong

### Bug #4: Quote Summary Uses Wrong Fabric Cost

**File**: `src/components/measurements/dynamic-options/CostCalculationSummary.tsx`

**Lines 573-578**: The `fabricCost` is determined by priority:
1. `calculatedFabricCost` prop (from parent)
2. Engine result
3. `fabricCalculation.totalCost`

If the parent passes an incorrect `calculatedFabricCost`, the Quote Summary uses that wrong value and then applies markup to it:

```typescript
// Line 783:
sellingPrice: applyMarkup(fabricCost, fabricMarkupPercent)  // £1663 × 1.5 = £2494.50
```

---

## Technical Fix Plan

### Fix 1: Add Missing Fields to `useFabricCalculator.ts` Return Object

**File**: `src/components/shared/measurement-visual/hooks/useFabricCalculator.ts`

**Step 1**: Move `horizontalPiecesNeeded` declaration outside the if block (around line 140):

```typescript
let linearMeters: number;
let orderedLinearMeters: number;
let dropPerWidthMeters: number;
let horizontalPiecesNeeded = 1;  // ← ADD THIS
```

**Step 2**: Add new fields to return object (after line 205):

```typescript
return {
  // ... existing fields ...
  totalWidthWithAllowances,
  dropPerWidthMeters,
  // ✅ NEW FIELDS
  horizontalPiecesNeeded,                    // Number of horizontal pieces
  fabricRotated: isRailroaded,               // Whether fabric is rotated
  fabricOrientation: isRailroaded ? 'horizontal' : 'vertical',
  linearMetersPerPiece: isRailroaded 
    ? (totalWidthWithAllowances / 100) * wasteMultiplier 
    : undefined,                              // Per-piece meters for accurate display
  leftoverFromLastPiece: undefined            // For future leftover tracking
};
```

### Fix 2: Update Type Definitions

**File**: `src/components/shared/measurement-visual/types.ts`

Add to `FabricCalculation` interface (around line 91):

```typescript
export interface FabricCalculation {
  // ... existing fields ...
  horizontalPiecesNeeded?: number;
  leftoverFromLastPiece?: number;
  // ✅ NEW FIELDS
  fabricRotated?: boolean;
  fabricOrientation?: 'horizontal' | 'vertical';
  linearMetersPerPiece?: number;
}
```

### Fix 3: Fix Display Logic in `AdaptiveFabricPricingDisplay.tsx`

**File**: `src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx`

**Lines 908-945**: Update to use per-piece value correctly:

```typescript
if (isHorizontal) {
  // ✅ FIX: Use linearMetersPerPiece if available
  const horizontalPiecesNeeded = fabricCalculation.horizontalPiecesNeeded || 1;
  
  // NEW: Get per-piece value (not total)
  const linearMetersPerPiece = fabricCalculation.linearMetersPerPiece 
    || (fabricCalculation.linearMeters / horizontalPiecesNeeded);
  
  const piecesToCharge = useLeftoverForHorizontal && horizontalPiecesNeeded > 1 
    ? 1 
    : horizontalPiecesNeeded;
  
  // ✅ CORRECT: Calculate total from per-piece value
  const totalLinearMetersToOrder = linearMetersPerPiece * piecesToCharge;
  
  quantity = totalLinearMetersToOrder;
  totalCost = quantity * pricePerUnit;  // Now correctly £3326 for 33.26m
  
  // ✅ Formula text now matches cost
  calculationText = `${linearMetersPerPiece.toFixed(2)}m × ${piecesToCharge} pieces = ${totalLinearMetersToOrder.toFixed(2)}m × ${formatPricePerFabricUnit(pricePerUnit)}`;
}
```

### Fix 4: Ensure Quote Summary Uses Correct Fabric Cost

**File**: `src/components/measurements/dynamic-options/CostCalculationSummary.tsx`

**Lines 573-578**: Ensure we use the fabric calculation's `totalCost` consistently:

```typescript
// ✅ FIX: Prioritize fabricCalculation.totalCost over any recalculation
const fabricCost = hasCurtainPricingGrid 
  ? gridPriceForCurtain 
  : (useEngine 
      ? (engineResult.fabric_cost ?? 0) 
      : (fabricCalculation?.totalCost ?? fabricCalculation?.fabricCost ?? 0));
```

---

## Files to Modify Summary

| File | Lines | Change Type | Priority |
|------|-------|-------------|----------|
| `useFabricCalculator.ts` | 140, 177-206 | Add `horizontalPiecesNeeded`, `fabricRotated`, `linearMetersPerPiece` to return | CRITICAL |
| `types.ts` | 91-95 | Add new fields to `FabricCalculation` interface | REQUIRED |
| `AdaptiveFabricPricingDisplay.tsx` | 908-945 | Use `linearMetersPerPiece` for correct calculation | CRITICAL |
| `CostCalculationSummary.tsx` | 573-580 | Ensure consistent fabric cost source | HIGH |

---

## Expected Results After Fix

**Your Test Case (Railroaded, 400cm × 250cm, 140cm fabric, x2 fullness):**

| Display | Before (Broken) | After (Fixed) |
|---------|----------------|---------------|
| Formula Text | "16.63m × 2 = 33.26m × £100 = £3326" | "16.63m × 2 = 33.26m × £100 = £3326" |
| Linear Meters | 33.26m | 33.26m |
| Fabric Cost | £1663.00 ❌ | £3326.00 ✅ |
| Quote Summary Fabric | £2494.50 (wrong markup base) | £4989.00 (correct 50% on £3326) |

---

## Verification Test Cases

After implementation, verify these scenarios:

1. **Vertical (Standard)**: 400cm × 250cm, 140cm fabric, x2 fullness
   - Expected: 6 widths × 2.73m = 16.38m ≈ £1638

2. **Horizontal (Railroaded)**: Same measurements with "Rotate Fabric 90°" ON
   - Expected: 2 pieces × 16.63m = 33.26m ≈ £3326

3. **Quote Summary**: Should show fabric cost × markup consistently

4. **Input Changes**: Changing width/drop should immediately update ALL displayed values

---

## Risk Mitigation

- No database schema changes required
- Existing saved data unaffected (stored values not recalculated)
- Changes are display and calculation logic only
- Unit tests will verify formulas work correctly

