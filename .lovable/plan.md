

## Fix: Display-vs-Pricing Mismatch in Fabric Calculations

### The Problem (What You're Seeing)

The "Fabric Usage Breakdown" display shows one set of numbers (e.g., Total Width: 818cm, 7.74m), but the pricing formula below it shows a DIFFERENT amount (e.g., 8.24m x 26.50 = 218.36). These come from **different calculation paths that disagree on the math**.

### Root Causes (3 Bugs)

#### Bug 1: `quantity` not set from `curtain_type` in `fabricUsageCalculator`

The `fabricUsageCalculator.ts` (line 159) reads `formData.quantity || 1`, but the actual panel count comes from `curtain_type === 'pair'` (which means 2 panels). This means:

- **Display** (VisualMeasurementSheet): Uses `curtainCount = 2` for side hems, showing `3cm x 2 x 2 = 12cm`
- **Calculator** (fabricUsageCalculator): Uses `quantity = 1`, computing side hems as `3cm x 2 x 1 = 6cm`

Result: The display says 818cm total width, but the calculator uses 812cm. The linear meters are **wrong because side hems are halved**.

**Fix:** In `fabricUsageCalculator.ts`, derive quantity from `formData.curtain_type`:
```
const quantity = formData.curtain_type === 'pair' ? 2 : (formData.quantity || 1);
```

#### Bug 2: `overlap` not passed to fabricUsageCalculator

The `fabricUsageCalculator.ts` (line 243-244) reads `formData.return_left` and `formData.return_right` but never reads `overlap`. The template has `overlap: 3cm` but it's not in formData. The engine correctly picks up overlap from the template via `buildMeasurements`, but the legacy calculator ignores it.

**Fix:** In `fabricUsageCalculator.ts`, add overlap reading:
```
const overlap = parseFloat(formData.overlap) || 0;
```
And pass it in the `params` object (line 264-279).

Also in `VisualMeasurementSheet.tsx`, enrich measurements with the template's overlap value so it reaches the calculator.

#### Bug 3: `calculateTreatmentPricing.ts` has its OWN linear meters formula

This file (line 161) computes:
```
linearMeters = ((totalDropPerWidth + totalSeamAllowance) / 100) * widthsRequired * wasteMultiplier
```

This has TWO differences from the engine:
1. It multiplies `seamHems * 2` per seam (line 151), but the engine treats `seamHemCm` as TOTAL per join (not per side)
2. It adds seam allowance to the DROP before multiplying by widths, which inflates the result when widthsRequired > 1

The engine formula (the correct one):
```
totalFabricCm = (widthsRequired * totalDropCm) + seamAllowanceCm
```

**Fix:** This file is a LEGACY path that should delegate to the engine formulas instead of computing its own. Replace lines 131-161 with a call to the engine's `calculateCurtainVertical` / `calculateCurtainHorizontal`.

### Fix Plan

#### File 1: `fabricUsageCalculator.ts`

| Line | Change |
|---|---|
| 159 | Derive `quantity` from `curtain_type === 'pair'` instead of `formData.quantity` |
| 243-244 | Read `overlap` from formData |
| 264-279 | Pass `overlap` in params object |

#### File 2: `VisualMeasurementSheet.tsx`

| Line | Change |
|---|---|
| ~356-377 | Add `overlap` to `enrichedMeasurements` from template |

#### File 3: `calculateTreatmentPricing.ts`

| Line | Change |
|---|---|
| 131-161 | Replace manual linear meters formula with call to engine's `calculateCurtainVertical`/`calculateCurtainHorizontal`. This eliminates the duplicate formula entirely. |
| 151 | Remove the `seamHems * 2` calculation (engine handles seams correctly) |

#### File 4: `orientationCalculator.ts`

| Line | Change |
|---|---|
| ~264-279 | Pass `overlap` from params to formula inputs (currently it's passed but the FabricCalculationParams type needs to include it) |

### Verification Math

With the fix, using the user's values (rail 400cm, fullness 2.0, pair, hems all 3cm, overlap 3cm, fabric 290cm, waste 2%):

**Correct calculation (vertical):**
- finishedWidth = (400 + 3 overlap) x 2.0 = 806cm
- sideHems = 3 x 2 sides x 2 panels = 12cm
- returns = 3 + 3 = 6cm
- totalWidth = 806 + 6 + 12 = 824cm
- widthsRequired = ceil(824/290) = 3
- totalDrop = 250 + 3 + 3 = 256cm
- seams = 2, seamAllowance = 2 x 3 = 6cm
- totalFabric = (3 x 256) + 6 = 774cm = 7.74m
- with 2% waste = 7.74 x 1.02 = 7.89m
- cost = 7.89 x 26.50 = 209.09

The display breakdown and the pricing formula will show the SAME numbers.

### Technical Details

The seam allowance convention difference is critical:
- Engine: `seamHemCm` = TOTAL per join (e.g., 3cm means 3cm total consumed per seam)
- Legacy (`calculateTreatmentPricing`): multiplies by 2, treating it as per-side

The engine convention (total per join) is correct for the industry. The legacy code's `* 2` doubles the seam consumption, inflating fabric usage.

### Expected Result

- Fabric Usage Breakdown numbers will exactly match the pricing formula
- Side hems correctly account for pair curtains (4 hems, not 2)
- Overlap included in width calculation
- Single formula (engine) used everywhere -- no more disagreements between paths

