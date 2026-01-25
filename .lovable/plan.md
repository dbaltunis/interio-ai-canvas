
# Fix Critical Fabric Calculation Synchronization Bug

## Problem Summary

Three different values are displayed for the same fabric:
| Location | Value | What's Wrong |
|----------|-------|--------------|
| Formula Text | 8.30m × 2 = 16.63m × £100 = £1663 | Formula text uses different source |
| Fabric Cost (display) | £1660.00 | Uses `totalCost` from different calculation |
| Quote Summary | £2494.50 | 50% markup on £1663 (not £1660) |

## Root Cause

**Legacy Path Double-Multiplication Bug** in `DynamicWindowWorksheet.tsx`:

```typescript
// Line 2987: Gets TOTAL meters (already includes pieces!)
const fabricCalcMeters = fabricCalculation?.linearMeters || 0;  // = 16.63m

// Line 3062-3065: LEGACY PATH treats it as per-piece and multiplies again!
perPieceMeters = fabricCalcMeters;  // Should be 8.30m, but gets 16.63m
totalMeters = perPieceMeters * piecesToCharge;  // 16.63m × 2 = 33.26m (WRONG!)
```

However, in your case, the numbers show ~£1660 which suggests the LEGACY PATH is **dividing by 2 somewhere** or the hook's calculation is different. Let me trace this more precisely:

- `useFabricCalculator.ts` line 149: `linearMeters = linearMetersPerPiece * horizontalPiecesNeeded`
- So `linearMeters` = 8.30m × 2 = 16.60m (TOTAL)
- The hook returns `linearMetersPerPiece` = 8.30m separately (line 213)

**The ACTUAL bug** is in `DynamicWindowWorksheet` lines 3060-3066:
```typescript
// LEGACY PATH: fabricCalculation returns per-width meters
perPieceMeters = fabricCalcMeters;  // fabricCalcMeters = 16.60m (TOTAL, not per-piece!)
```

The code comment says "per-width meters" but `fabricCalculation.linearMeters` is actually TOTAL meters!

## Solution

### Fix 1: Correct the Legacy Path in DynamicWindowWorksheet

**File**: `src/components/measurements/DynamicWindowWorksheet.tsx`
**Lines**: 3060-3066

Current (broken):
```typescript
} else {
  // LEGACY PATH: fabricCalculation returns per-width meters
  perPieceMeters = fabricCalcMeters;  // WRONG: This is TOTAL, not per-piece!
  const piecesToCharge = usesLeftover && horizontalPiecesNeeded > 1 ? 1 : horizontalPiecesNeeded;
  totalMeters = perPieceMeters * piecesToCharge;  // WRONG: Double counts pieces!
  fabricCost = totalMeters * pricePerMeter;
}
```

Fixed:
```typescript
} else {
  // LEGACY PATH: fabricCalculation.linearMeters is TOTAL (includes all pieces)
  // fabricCalculation.linearMetersPerPiece is per-piece for horizontal fabric
  
  if (isRailroaded && horizontalPiecesNeeded > 1) {
    // For railroaded: get per-piece value from hook, or calculate from total
    perPieceMeters = fabricCalculation?.linearMetersPerPiece || (fabricCalcMeters / horizontalPiecesNeeded);
    const piecesToCharge = usesLeftover ? 1 : horizontalPiecesNeeded;
    totalMeters = perPieceMeters * piecesToCharge;
  } else {
    // For vertical: linearMeters is already correct total
    perPieceMeters = fabricCalcMeters;
    totalMeters = fabricCalcMeters;
  }
  fabricCost = totalMeters * pricePerMeter;
}
```

### Fix 2: Ensure Quote Summary Uses Consistent Fabric Cost

**File**: `src/components/measurements/dynamic-options/CostCalculationSummary.tsx`
**Lines**: 770-772

Current:
```typescript
const meters = fabricDisplayData.totalMeters;
const pricePerUnit = fabricDisplayData.pricePerMeter;
fabricDetails = `${formatFabricLength(meters)} × ${formatPricePerFabricUnit(pricePerUnit)} = ${formatPrice(fabricCost)}`;
```

Issue: The text shows `meters × pricePerUnit` but uses `fabricCost` which may come from a different calculation.

Fixed:
```typescript
const meters = fabricDisplayData.totalMeters;
const pricePerUnit = fabricDisplayData.pricePerMeter;
const calculatedFromDisplay = meters * pricePerUnit;
// Use the prop fabricCost, but show calculation based on display data for consistency
fabricDetails = `${formatFabricLength(meters)} × ${formatPricePerFabricUnit(pricePerUnit)} = ${formatPrice(calculatedFabricCost || calculatedFromDisplay)}`;
```

Better fix: Ensure `calculatedFabricCost` prop ALWAYS equals `fabricDisplayData.totalMeters × pricePerMeter`:

### Fix 3: Synchronize All Values in DynamicWindowWorksheet

**File**: `src/components/measurements/DynamicWindowWorksheet.tsx`
**Lines**: 3336-3346

Ensure `fabricDisplayData.totalMeters × pricePerMeter === fabricCost`:
```typescript
fabricDisplayData={{
  linearMeters: perPieceMeters,
  totalMeters: totalMeters,
  pricePerMeter: pricePerMeter,
  horizontalPieces: piecesToDisplay,
  orientation: isRailroaded ? 'horizontal' : 'vertical',
  usesLeftover,
  usesPricingGrid: curtainUsesPricingGrid,
  gridPrice: curtainUsesPricingGrid ? fabricCost : undefined,
  gridName: curtainUsesPricingGrid ? selectedFabricItem?.resolved_grid_name : undefined
}}
```

Add validation before passing:
```typescript
// ✅ CRITICAL: Ensure fabric cost matches display data for consistency
const displayFabricCost = totalMeters * pricePerMeter;
if (Math.abs(displayFabricCost - fabricCost) > 0.01) {
  console.warn('⚠️ Fabric cost mismatch!', { fabricCost, displayFabricCost, totalMeters, pricePerMeter });
  // Use display-calculated value to ensure text matches displayed cost
  fabricCost = displayFabricCost;
}
```

## Files to Modify

| File | Lines | Change |
|------|-------|--------|
| `DynamicWindowWorksheet.tsx` | 3060-3066 | Fix legacy path to use `linearMetersPerPiece` for railroaded fabric |
| `DynamicWindowWorksheet.tsx` | 3330-3346 | Add validation to ensure `fabricCost === totalMeters * pricePerMeter` |
| `CostCalculationSummary.tsx` | 770-772 | Ensure details text uses consistent cost source |

## Expected Results

After fix, your test case (400cm × 250cm railroaded with 140cm fabric, x2 fullness):

| Display | Before | After |
|---------|--------|-------|
| Formula Text | 8.30m × 2 = 16.63m × £100 = £1663 | 8.30m × 2 = 16.60m × £100 = £1660 |
| Fabric Cost | £1660.00 | £1660.00 |
| Linear Meters | 16.60m | 16.60m |
| Quote Summary Fabric | £1663 details, £2494.50 price | £1660 details, £2490 price |

All values will now be synchronized from a single source of truth.

## Technical Notes

- The core `useFabricCalculator.ts` hook is calculating correctly
- The issue is in how `DynamicWindowWorksheet.tsx` interprets the hook's output
- The key insight: `fabricCalculation.linearMeters` is TOTAL meters (already multiplied by pieces), not per-piece meters
- The hook now returns `linearMetersPerPiece` separately for accurate display breakdown
