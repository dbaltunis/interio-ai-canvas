# Fabric Calculation Algorithms

## Critical Bug Fix (2025-01-17)

### Bug: 50% Overcharge in Horizontal (Railroaded) Fabric Calculations

**Root Cause:** In `orientationCalculator.ts`, the `horizontalPiecesNeeded` value was being calculated correctly from the centralized formula, but then **OVERWRITTEN** with a different calculation when `requiredLength > fabricWidth`.

**Before (Buggy):**
```typescript
// Line 110: Correct value from centralized formula
horizontalPiecesNeeded = formulaResult.widthsRequired; // = 2

// Lines 120-121: OVERWRITES with wrong calculation using requiredLength
if (requiredLength > fabricWidth) {
  horizontalPiecesNeeded = Math.ceil(requiredLength / fabricWidth); // = 3 (wrong!)
}
```

**Problem:** `requiredLength` includes pattern repeat rounding, inflating the value. For a 230cm drop + 30cm hems = 260cm total, rounded to a 50cm pattern repeat = 300cm, then 300/140 = 3 pieces instead of the correct 260/140 = 2 pieces.

**After (Fixed):**
```typescript
// Use ONLY the centralized formula result
horizontalPiecesNeeded = formulaResult.widthsRequired; // = 2 (correct!)

// Leftover calculation is for USER INFO ONLY, does not affect piece count
```

**Impact:**
- 260cm drop ÷ 140cm fabric = **2 pieces** (not 3)
- 5.15m × 2 = **10.30m** (not 15.90m)
- **50% reduction** in fabric cost for affected calculations

---

## Algorithm Overview

### Centralized Source: `src/utils/calculationFormulas.ts`

All fabric calculations use formulas defined in ONE place. No calculation file should implement its own formula.

---

## Horizontal (Railroaded) Formula

Fabric runs **side to side** (rotated 90°).

```
1. totalDropCm = drop + headerHem + bottomHem + pooling
2. returnsCm = returnLeft + returnRight
3. totalWidthCm = (railWidth × fullness) + returns + (sideHem × 2)
4. horizontalPieces = ceil(totalDropCm / fabricWidthCm)  ← DROP divided by fabric width
5. seamsCount = horizontalPieces - 1
6. seamAllowanceCm = seamsCount × seamHem × 2
7. linearMetersCm = (horizontalPieces × totalWidthCm) + seamAllowance
8. linearMeters = linearMetersCm / 100
```

**Example:**
- Rail: 200cm, Drop: 230cm, Fullness: 2.5, Fabric: 140cm wide
- totalDropCm = 230 + 15 + 15 + 0 = 260cm
- totalWidthCm = (200 × 2.5) + 0 + 10 = 510cm
- horizontalPieces = ceil(260 / 140) = **2**
- seamsCount = 2 - 1 = 1
- seamAllowanceCm = 1 × 3 × 2 = 6cm
- linearMetersCm = (2 × 510) + 6 = 1026cm = **10.26m**

---

## Vertical (Standard) Formula

Fabric runs **top to bottom** (normal orientation).

```
1. totalDropCm = drop + headerHem + bottomHem + pooling
2. returnsCm = returnLeft + returnRight
3. widthPerPanelCm = ((railWidth × fullness) + returns) / quantity
4. dropsPerPanel = ceil(widthPerPanelCm / fabricWidthCm)
5. widthsRequired = dropsPerPanel × quantity
6. seamsCount = widthsRequired - 1
7. seamAllowanceCm = seamsCount × seamHem × 2
8. linearMetersCm = (widthsRequired × totalDropCm) + seamAllowance
9. linearMeters = linearMetersCm / 100
```

**Example:**
- Rail: 200cm, Drop: 230cm, Fullness: 2.5, Fabric: 140cm wide, Qty: 2 panels
- totalDropCm = 230 + 15 + 15 + 0 = 260cm
- widthPerPanelCm = ((200 × 2.5) + 0) / 2 = 250cm
- dropsPerPanel = ceil(250 / 140) = 2
- widthsRequired = 2 × 2 = 4
- seamsCount = 4 - 1 = 3
- seamAllowanceCm = 3 × 3 × 2 = 18cm
- linearMetersCm = (4 × 260) + 18 = 1058cm = **10.58m**

---

## User Settings Reference

All values come from user settings/templates - NO HARDCODED DEFAULTS:

| Setting | Source |
|---------|--------|
| `railWidth` | `measurements.rail_width` (in CM) |
| `drop` | `measurements.drop` (in CM) |
| `fullness` | Selected heading's `fullness_ratio` |
| `fabricWidth` | `fabric_item.fabric_width` (in CM) |
| `quantity` | `measurements.curtain_type === 'pair' ? 2 : 1` |
| `headerHem` | Template's `header_hem_allowance` |
| `bottomHem` | Template's `bottom_hem_allowance` |
| `sideHem` | Template's `side_hem_allowance` |
| `seamHem` | Template's `seam_allowance` |
| `pooling` | `measurements.pooling_amount` |
| `returnLeft` | `measurements.return_left` |
| `returnRight` | `measurements.return_right` |

---

## Debug Verification

When horizontal calculation runs, console shows:
```
🔧 HORIZONTAL FABRIC CALC: {
  totalDropCm: 260,
  fabricWidthCm: 140,
  formulaWidthsRequired: 2,
  horizontalPiecesNeeded: 2,
  expectedPieces: 2,
  MATCHES_EXPECTED: true  ← Should always be true!
}
```

If `MATCHES_EXPECTED: false`, there's still a bug.
