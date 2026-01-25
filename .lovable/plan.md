
# Plan: Fix Critical Fabric Calculation Bugs and Display Synchronization Issues

## Executive Summary

After thorough investigation, I've identified **5 critical bugs** causing incorrect calculations and display issues when changing inputs like rotation, width, and drop. These bugs are causing significant financial risk to users by either under-quoting or displaying incorrect values.

---

## Critical Bugs Found

### Bug #1: Missing `horizontalPiecesNeeded` in Return Object (HIGHEST IMPACT)
**File**: `src/components/shared/measurement-visual/hooks/useFabricCalculator.ts`  
**Lines**: 142-148, 177-206

**Problem**: The hook calculates `horizontalPiecesNeeded` inside the `if (isRailroaded)` block but **never returns it**. The display component then defaults to `1`, causing the formula text to show wrong calculations.

**Current Code (line 145)**:
```typescript
const horizontalPiecesNeeded = Math.ceil(totalDrop / fabricWidthCm);
linearMeters = (totalWidthWithAllowances / 100) * horizontalPiecesNeeded * wasteMultiplier;
// ... but horizontalPiecesNeeded is NEVER returned!
```

**Return Object (lines 177-206)** - Missing `horizontalPiecesNeeded`:
```typescript
return {
  linearMeters,
  orderedLinearMeters,
  // ... many fields
  // ❌ horizontalPiecesNeeded NOT INCLUDED
};
```

**Impact**: Display shows "16.33m × 1 piece = 16.33m" when it should show "16.33m × 2 pieces = 32.66m"

---

### Bug #2: Double Multiplication in Display Logic
**File**: `src/components/measurements/fabric-pricing/AdaptiveFabricPricingDisplay.tsx`  
**Lines**: 908-915

**Problem**: The `linearMeters` from `useFabricCalculator` **already includes** the multiplication by `horizontalPiecesNeeded` (see line 146 above). But the display logic multiplies again:

```typescript
const linearMeters = fabricCalculation.linearMeters || 0;  // Already includes pieces!
const horizontalPiecesNeeded = fabricCalculation.horizontalPiecesNeeded || 1;
const totalLinearMetersToOrder = linearMeters * piecesToCharge;  // ❌ DOUBLE MULTIPLICATION
```

**Impact**: Your test showed 32.66m displayed when actual requirement is 16.33m × 2 = 32.66m, but the text says "16.33m × 2 pieces = 32.66m × £100" with cost of £1633 (not £3266), indicating the actual cost IS correct but display text is wrong.

---

### Bug #3: Backwards Formula in "Quick Add" Flow
**File**: `src/components/projects/AddCurtainToProject.tsx`  
**Lines**: 121-131

**Problem**: The "Standard" (non-railroaded) calculation is **missing multiplication by widths required**:

```typescript
// ❌ CURRENT BROKEN CODE (lines 127-131):
const seamsNeeded = Math.max(0, Math.ceil(totalFabricWidth / selectedFabricWidth) - 1);
const seamAllowance = seamsNeeded * template.seam_hems * 2;
totalFabricRequired = (totalDrop + seamAllowance) / 100;  // Missing × widthsRequired!
```

**Correct Formula**:
```typescript
const widthsRequired = Math.ceil(totalFabricWidth / selectedFabricWidth);
const seamsNeeded = Math.max(0, widthsRequired - 1);
const seamAllowance = seamsNeeded * template.seam_hems * 2;
totalFabricRequired = ((totalDrop + seamAllowance) * widthsRequired) / 100;  // ✅ Multiply!
```

**Impact**: For your 250cm × 400cm example with 140cm fabric (x2 fullness):
- **Broken code**: ~2.5m fabric
- **Correct formula**: 6 drops × 2.73m = 16.38m fabric

---

### Bug #4: Missing `fabricRotated` and `fabricOrientation` in Return Object
**File**: `src/components/shared/measurement-visual/hooks/useFabricCalculator.ts`  
**Lines**: 177-206

**Problem**: The display component checks `fabricCalculation.fabricRotated` and `fabricCalculation.fabricOrientation` but these are **never returned**:

```typescript
// AdaptiveFabricPricingDisplay.tsx line 801:
const isHorizontal = fabricCalculation.fabricRotated === true || 
                     fabricCalculation.fabricOrientation === 'horizontal';
// Both are ALWAYS undefined because useFabricCalculator doesn't return them!
```

**Impact**: The display may not switch to horizontal mode even when fabric is rotated.

---

### Bug #5: Stale Calculation During Save
**File**: `src/components/measurements/DynamicWindowWorksheet.tsx`  
**Lines**: 1366-1381

**Problem**: During save, the code manually recalculates width allowances instead of using the already-calculated `fabricCalculation` object:

```typescript
// ❌ MANUAL RECALCULATION (lines 1366-1381):
const railWidthCm = (parseFloat(measurements.rail_width || '0')) / 10;
const widthWithAllowancesCm = (railWidthCm * fullness) + (sideHemCm * 2) + returnsCm;
// This may differ from fabricCalculation.totalWidthWithAllowances!
```

**Impact**: Saved values may differ from displayed values, causing quote/invoice mismatches.

---

## Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SINGLE SOURCE OF TRUTH                               │
│                                                                             │
│  calculationFormulas.ts  ──────────────►  orientationCalculator.ts          │
│  (CURTAIN_VERTICAL_FORMULA)               (calculates fabricCalculation)    │
│  (CURTAIN_HORIZONTAL_FORMULA)                                               │
└───────────────────────────────────────────┬─────────────────────────────────┘
                                            │
                                            ▼
                    ┌───────────────────────────────────────────┐
                    │  useFabricCalculator.ts (REFACTORED)      │
                    │  - Imports from calculationFormulas.ts    │
                    │  - Returns horizontalPiecesNeeded         │
                    │  - Returns fabricRotated, fabricOrientation│
                    │  - linearMeters = per-piece value          │
                    └───────────────────────┬───────────────────┘
                                            │
              ┌─────────────────────────────┼─────────────────────────────┐
              ▼                             ▼                             ▼
    AddCurtainToProject.tsx    AdaptiveFabricPricingDisplay.tsx    DynamicWindowWorksheet.tsx
    (IMPORT FROM FORMULAS)     (USE PRE-CALCULATED VALUES)         (USE fabricCalculation)
```

---

## Technical Implementation Details

### Fix 1: Update `useFabricCalculator.ts` Return Object
**Add missing fields to return statement (lines 177-206)**:

```typescript
return {
  linearMeters,
  orderedLinearMeters,
  remnantMeters,
  totalCost,
  fabricCost,
  pricePerMeter: fabric.price_per_meter,
  widthsRequired,
  seamsCount,
  seamLaborHours,
  railWidth: width,
  fullnessRatio,
  drop: height,
  headerHem,
  bottomHem,
  pooling,
  totalDrop,
  returns: returnLeft + returnRight,
  wastePercent,
  sideHems,
  seamHems,
  totalSeamAllowance,
  totalSideHems,
  returnLeft,
  returnRight,
  curtainCount,
  curtainType: template.panel_configuration || 'pair',
  totalWidthWithAllowances,
  dropPerWidthMeters,
  // ✅ NEW: Add missing fields for display
  horizontalPiecesNeeded: isRailroaded ? horizontalPiecesNeeded : 1,
  fabricRotated: isRailroaded,
  fabricOrientation: isRailroaded ? 'horizontal' : 'vertical',
  // ✅ NEW: Add per-piece meters for accurate display
  linearMetersPerPiece: isRailroaded ? (totalWidthWithAllowances / 100) * wasteMultiplier : undefined
};
```

**Also move `horizontalPiecesNeeded` declaration outside the if block (around line 138)**:
```typescript
let linearMeters: number;
let orderedLinearMeters: number;
let dropPerWidthMeters: number;
let horizontalPiecesNeeded = 1;  // ✅ Declare with default value

if (isRailroaded) {
  horizontalPiecesNeeded = Math.ceil(totalDrop / fabricWidthCm);  // ✅ Assign
  // ...
}
```

### Fix 2: Update Display Logic in `AdaptiveFabricPricingDisplay.tsx`
**Lines 908-915** - Use per-piece value instead of total:

```typescript
if (isHorizontal) {
  // ✅ FIX: linearMeters from hook ALREADY includes piece multiplication
  // Use linearMetersPerPiece if available, otherwise divide by pieces
  const horizontalPiecesNeeded = fabricCalculation.horizontalPiecesNeeded || 1;
  const linearMetersPerPiece = fabricCalculation.linearMetersPerPiece || 
    (fabricCalculation.linearMeters / horizontalPiecesNeeded);
  
  const piecesToCharge = useLeftoverForHorizontal && horizontalPiecesNeeded > 1 ? 1 : horizontalPiecesNeeded;
  
  // ✅ CORRECT: Multiply per-piece value by pieces to charge
  const totalLinearMetersToOrder = linearMetersPerPiece * piecesToCharge;
  
  // Display text now shows accurate breakdown
  calculationText = `${linearMetersPerPiece.toFixed(2)}m × ${piecesToCharge} pieces = ${totalLinearMetersToOrder.toFixed(2)}m × ${formatPricePerFabricUnit(pricePerUnit)}`;
}
```

### Fix 3: Fix `AddCurtainToProject.tsx` Standard Calculation
**Lines 125-136** - Add missing multiplication by widths:

```typescript
} else if (selectedFabricWidth) {
  // ✅ FIX: Calculate widths required first
  const widthsRequired = Math.ceil(totalFabricWidth / selectedFabricWidth);
  const seamsNeeded = Math.max(0, widthsRequired - 1);
  const seamAllowance = seamsNeeded * template.seam_hems * 2;

  // ✅ FIX: Multiply by widthsRequired!
  totalFabricRequired = ((totalDrop + seamAllowance) * widthsRequired) / 100;
} else {
```

### Fix 4: Update Types Definition
**File**: `src/components/shared/measurement-visual/types.ts`

Add the new fields to `FabricCalculation` interface:
```typescript
export interface FabricCalculation {
  // ... existing fields
  horizontalPiecesNeeded?: number;
  leftoverFromLastPiece?: number;
  // ✅ NEW fields
  fabricRotated?: boolean;
  fabricOrientation?: 'horizontal' | 'vertical';
  linearMetersPerPiece?: number;
}
```

### Fix 5: Refactor Save Logic in `DynamicWindowWorksheet.tsx`
**Lines 1366-1381** - Use fabricCalculation instead of recalculating:

```typescript
// ✅ FIX: Use pre-calculated values from fabricCalculation
const finalWidthM = fabricCalculation?.totalWidthWithAllowances 
  ? (fabricCalculation.totalWidthWithAllowances * (1 + (fabricCalculation.wastePercent || 0) / 100)) / 100
  : 0;
```

---

## Files to Modify

| File | Lines | Change Type | Priority |
|------|-------|-------------|----------|
| `useFabricCalculator.ts` | 138, 145, 177-206 | Add missing return fields | Critical |
| `AdaptiveFabricPricingDisplay.tsx` | 908-945 | Fix double multiplication | Critical |
| `AddCurtainToProject.tsx` | 125-136 | Add missing × widthsRequired | Critical |
| `types.ts` | 91-122 | Add new interface fields | Required |
| `DynamicWindowWorksheet.tsx` | 1366-1381 | Use fabricCalculation values | Medium |

---

## Unit Tests to Add

Create `src/utils/__tests__/fabricCalculation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('Fabric Calculation Formulas', () => {
  describe('Vertical/Standard Orientation', () => {
    it('should calculate 15m for 250cm×400cm with 140cm fabric at x2 fullness', () => {
      // Your Scenario 1
      const result = calculateVertical({
        railWidthCm: 400,
        dropCm: 250,
        fullness: 2,
        fabricWidthCm: 140,
        // No hems for simplicity
      });
      expect(result.widthsRequired).toBe(6);  // ceil(800/140)
      expect(result.linearMeters).toBe(15);    // 6 × 250cm = 1500cm = 15m
    });
  });

  describe('Horizontal/Railroaded Orientation', () => {
    it('should calculate 10.5m for 350cm×400cm with 300cm fabric at x2 fullness (rotated wide fabric)', () => {
      // Your Scenario: Wide fabric used with vertical seams
      const result = calculateHorizontal({
        railWidthCm: 400,
        dropCm: 350,
        fullness: 2,
        fabricWidthCm: 300,
      });
      expect(result.horizontalPiecesNeeded).toBe(2);  // ceil(350/300)
      expect(result.linearMeters).toBe(16);           // 2 × 800cm = 16m
    });
  });
});
```

---

## Verification Steps

After implementing these fixes:

1. **Test Vertical Calculation**: 250cm H × 400cm W, 140cm fabric, x2 fullness
   - Expected: 6 widths × 2.73m = 16.38m (with hems)
   - Display should show: "6 width(s) × 273cm = 16.38m × £100.00/m = £1638.00"

2. **Test Horizontal Calculation**: 250cm H × 800cm W, 140cm fabric, rotated
   - Expected: 2 pieces × 8.15m = 16.30m
   - Display should show: "8.15m × 2 pieces = 16.30m × £100.00/m = £1630.00"

3. **Test Input Changes**: Change width from 400cm → 500cm
   - Numbers should update immediately
   - Cost should recalculate

4. **Test Rotation Toggle**: Toggle fabric rotation
   - Formula and numbers should switch between vertical/horizontal modes
   - All displayed values should update

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Existing saved quotes affected | Changes only affect calculation logic, not stored data |
| Regression in other components | Unit tests will catch formula regressions |
| Display/cost mismatch | Single source of truth architecture prevents divergence |

---

## Expected Outcome

After implementation:
- ✅ Numbers update immediately when inputs change
- ✅ Rotation toggle switches calculation mode correctly
- ✅ Display formula matches actual cost
- ✅ "Quick Add" flow uses correct fabric requirements
- ✅ Saved values match displayed values
- ✅ No more under-quoting or over-quoting fabric

