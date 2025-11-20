# CRITICAL: STOP RECALCULATING

## The Problem

`AdaptiveFabricPricingDisplay.tsx` lines 671-710 manually recalculates fabric requirements:

```typescript
const requiredWidthCm = (railWidth × fullness) + sideHems + returns;
// MISSING: + seam allowances!
```

This causes a discrepancy with the Cost Summary which correctly uses `fabricCalculation.linearMeters`.

## The Solution

**ALWAYS USE `fabricCalculation.linearMeters`** - it already includes:
- Rail width × fullness
- Side hems
- Returns
- **SEAM ALLOWANCES** ← THIS IS WHAT'S MISSING IN MANUAL CALC
- Header/bottom hems (for vertical)
- Pattern repeat adjustments
- Waste percentage

## Formula Source: orientationCalculator.ts

```typescript
// Line 135-142
const totalSeamAllowance = (verticalSeamsRequired × seamHem × 2) + (horizontalSeamsRequired × seamHem × 2);

if (orientation === 'horizontal') {
  totalLengthCm = (widthsRequired × requiredWidth) + totalSeamAllowance;
} else {
  totalLengthCm = (widthsRequired × requiredLength) + totalSeamAllowance;
}

linearMeters = totalLengthCm / 100;
```

## DO NOT RECALCULATE
Use `fabricCalculation.linearMeters` × `horizontalPiecesNeeded` for cost.
