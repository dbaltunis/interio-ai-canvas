

## Fix: Overlap Missing from Display — Causes Display vs Pricing Mismatch

### The Problem

The **Fabric Usage Breakdown** shows `Total Width: 1006.0cm` and computes fabric usage WITHOUT overlap.
The **Quote Summary** pricing uses the engine result which INCLUDES overlap (`(500 + 1) * 2.0 = 1002cm`).

This is why the numbers don't match — the display path skips overlap entirely.

### Root Cause

In `VisualMeasurementSheet.tsx` line 532:

```
const requiredWidth = width * fullnessRatioValue;  // BUG: missing overlap
```

Should be:

```
const overlapCm = selectedTemplate.overlap || 0;
const requiredWidth = (width + overlapCm) * fullnessRatioValue;
```

Same bug in `AdaptiveFabricPricingDisplay.tsx` lines 605 and 699 — the display fallback computes `railWidth * fullness` without overlap.

### What Needs to Change

#### File 1: `VisualMeasurementSheet.tsx` (line 532)

Add overlap to width calculation AND include it in `fabricCalcResult`:

```
Before:
  const requiredWidth = width * fullnessRatioValue;
  const totalWidthWithAllowances = requiredWidth + returnLeft + returnRight + totalSideHems;

After:
  const overlapCm = selectedTemplate.overlap ?? 0;
  const requiredWidth = (width + overlapCm) * fullnessRatioValue;
  const totalWidthWithAllowances = requiredWidth + returnLeft + returnRight + totalSideHems;
```

Also add `overlap: overlapCm` to the `fabricCalcResult` object (around line 551) so the display component can show it.

#### File 2: `AdaptiveFabricPricingDisplay.tsx`

**Vertical display** (line 605): Add overlap to the Total Width calculation:
```
Before:
  const totalWidthMM = railWidthMM * fullness + returnsMM + sideHemsMM + seamAllowanceMM;

After:
  const overlapMM = (fabricCalculation?.overlap || 0) * 10;
  const totalWidthMM = (railWidthMM + overlapMM) * fullness + returnsMM + sideHemsMM + seamAllowanceMM;
```

**Vertical sub-item** (line 617): Show `(Rail + Overlap) x Fullness`:
```
Before:
  return formatMeasurement(railWidthMM * (displayFullness || 1), 'mm');

After:
  const overlapMM = (fabricCalculation?.overlap || 0) * 10;
  return formatMeasurement((railWidthMM + overlapMM) * (displayFullness || 1), 'mm');
```

Add an **Overlap line** after Returns in the vertical breakdown (after line 639):
```
{fabricCalculation?.overlap > 0 && (
  <div className="flex justify-between pl-2 text-muted-foreground/70">
    <span>Overlap:</span>
    <span>{formatMeasurement(fabricCalculation.overlap, 'cm')}</span>
  </div>
)}
```

**Horizontal display** (line 699): Same fix:
```
Before:
  const totalCM = railWidthCM * displayFullness + returnsCM + sideHemsCM;

After:
  const overlapCM = fabricCalculation?.overlap || 0;
  const totalCM = (railWidthCM + overlapCM) * displayFullness + returnsCM + sideHemsCM;
```

Add Overlap line in horizontal breakdown too (after line 674).

### Files to Change

| File | Lines | Change |
|---|---|---|
| `VisualMeasurementSheet.tsx` | 532-533 | Add overlap to width formula |
| `VisualMeasurementSheet.tsx` | ~551 | Add `overlap` field to `fabricCalcResult` |
| `AdaptiveFabricPricingDisplay.tsx` | 605 | Add overlap to vertical Total Width fallback |
| `AdaptiveFabricPricingDisplay.tsx` | 617 | Add overlap to Rail x Fullness display |
| `AdaptiveFabricPricingDisplay.tsx` | ~639 | Add Overlap display line (vertical) |
| `AdaptiveFabricPricingDisplay.tsx` | 699 | Add overlap to horizontal Total Width fallback |
| `AdaptiveFabricPricingDisplay.tsx` | ~674 | Add Overlap display line (horizontal) |

### Verification

With user values (rail 500, overlap 1, fullness 2.0, returns 2, side hems 4):
- Before fix: `500 * 2.0 + 2 + 4 = 1006cm` (wrong, no overlap)
- After fix: `(500 + 1) * 2.0 + 2 + 4 = 1008cm` (correct, matches engine)

Both display AND pricing will use 1008cm, producing identical linear meters.
