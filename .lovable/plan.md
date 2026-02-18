
## Fix: Hem Values Still Showing 0 Despite Template Settings

### Root Causes Found (3 distinct bugs)

#### Bug 1: `handleTemplateSelect` is dead code
The function at line 2937 that initializes measurements with template hem values is **never called**. The actual template selection at line 3094 (`onCoveringSelect`) calls `setSelectedTemplate(template)` directly but never calls `handleTemplateSelect`. So for new curtains, `measurements.header_hem` is never set from the template.

#### Bug 2: `template_details` snapshot missing hem values
When saving to `windows_summary` (line 3119-3130), the `template_details` JSONB only saves pricing and manufacturing fields -- it does NOT save `header_allowance`, `bottom_hem`, `side_hems`, `seam_hems`, `return_left`, `return_right`. On restore, the code at line 730 uses this incomplete snapshot as `freshTemplate`, so all hems resolve to 0.

#### Bug 3: `0` is treated as valid by `??`
Once `header_hem: 0` is saved to `measurements_details` (which happened after the previous "fix" changed fallbacks from 8/15 to 0), the nullish coalescing operator `??` treats 0 as a valid value and never falls through to the template's actual value.

### Why side hems work but header/bottom don't
Side hems were already set to 2 in a previous save. The `??` operator preserves them. But header/bottom were saved as 0 (from the fallback change), so they stay 0.

### Fix Plan

#### Fix 1: Wire up `handleTemplateSelect` properly

**File: `DynamicWindowWorksheet.tsx` (line ~3094)**

The `onCoveringSelect` callback must call `handleTemplateSelect(template)` to initialize measurements with template hems.

```
Before:
  onCoveringSelect={async template => {
    setSelectedTemplate(template);
    setSelectedOptions([]);
    ...

After:
  onCoveringSelect={async template => {
    handleTemplateSelect(template);  // This sets both selectedTemplate AND measurements hems
    ...
```

Remove the duplicate `setSelectedTemplate(template)` call since `handleTemplateSelect` already does it.

#### Fix 2: Save ALL template manufacturing values in template_details

**File: `DynamicWindowWorksheet.tsx` (line ~3119)**

Add the missing fields to the template_details snapshot:

```
template_details: {
  id: template.id,
  name: template.name,
  pricing_type: template.pricing_type,
  ...existing fields...
  // ADD THESE:
  header_allowance: template.header_allowance,
  bottom_hem: template.bottom_hem,
  side_hems: template.side_hems,
  seam_hems: template.seam_hems,
  return_left: template.return_left,
  return_right: template.return_right,
  waste_percent: template.waste_percent,
  overlap: template.overlap,
}
```

#### Fix 3: Use `fullTemplate` (from DB fetch) instead of async `selectedTemplate` for restore hems

**File: `DynamicWindowWorksheet.tsx` (line ~730)**

The current code uses `selectedTemplate` which hasn't been updated yet (async state). Change to use the locally available `fullTemplate` variable that was just fetched from the database.

This requires restructuring the restore code so that the hem initialization uses the local `fullTemplate` variable (which has the fresh DB values including `header_allowance: 2`) instead of the stale `selectedTemplate` state.

```
Before (line 730):
  const freshTemplate = selectedTemplate || existingWindowSummary.template_details;

After:
  // fullTemplate is the locally-fetched DB template (available in this same scope)
  // It has the REAL values, not the stale snapshot
  const freshTemplate = fullTemplate || selectedTemplate || existingWindowSummary.template_details;
```

But `fullTemplate` is defined inside a try/catch block above. We need to hoist it to be accessible at line 730.

#### Fix 4: Change hem resolution to prefer template over saved 0

**File: `VisualMeasurementSheet.tsx` (line ~361)**

The enrichment should prefer template values for manufacturing settings, not saved measurement values. Manufacturing settings (hems, returns, waste) are template-level properties, not per-window measurements.

```
Before:
  header_hem: measurements.header_hem ?? selectedTemplate.header_allowance ?? 0,

After:
  header_hem: selectedTemplate.header_allowance ?? selectedTemplate.header_hem ?? measurements.header_hem ?? 0,
```

This makes the template authoritative for all manufacturing settings.

#### Fix 5: Same fix in `useFabricCalculator.ts` (line ~78)

```
Before:
  const headerHem = measurementsAny.header_hem ?? templateAny.header_allowance ?? templateAny.header_hem;

After:
  const headerHem = templateAny.header_allowance ?? templateAny.header_hem ?? measurementsAny.header_hem;
```

### Files to Change

| File | Change |
|---|---|
| `DynamicWindowWorksheet.tsx` (~line 3094) | Call `handleTemplateSelect(template)` instead of `setSelectedTemplate(template)` |
| `DynamicWindowWorksheet.tsx` (~line 3119) | Add hem/return/seam fields to template_details snapshot |
| `DynamicWindowWorksheet.tsx` (~line 730) | Use local `fullTemplate` variable for hem resolution, not async `selectedTemplate` |
| `VisualMeasurementSheet.tsx` (~line 361-364) | Template hems authoritative over saved measurements |
| `useFabricCalculator.ts` (~line 78-84) | Template hems authoritative over saved measurements |

### How Many Calculation Algorithms Exist

There are **4 separate calculation paths** that all need consistent hem resolution:

1. **`src/engine/formulas/curtain.formulas.ts`** -- New engine (pure functions, single source of truth for math). Used by `CalculationEngine.ts` via `useCurtainEngine`. Gets hems from `TemplateContract` via `buildTemplate()` in `shadowModeRunner.ts`.

2. **`src/components/shared/measurement-visual/hooks/useFabricCalculator.ts`** -- Legacy display calculator used by `MeasurementVisual`. Resolves hems from measurements then template.

3. **`src/components/measurements/VisualMeasurementSheet.tsx`** (line 324-580) -- Inline useMemo calculation that calls `calculateFabricUsage` and builds the `fabricCalculation` object for display. Resolves hems via `enrichedMeasurements`.

4. **`src/utils/pricing/calculateTreatmentPricing.ts`** -- Legacy pricing calculator. Resolves hems from template directly.

All four must agree on hem values. The fix ensures that in all paths, **template values are authoritative** for manufacturing settings.

### Expected Result After Fix

- Template manufacturing values (header 2, bottom 2, sides 2, seams 2) will immediately show in the Fabric Usage Breakdown
- No more mystery 0 values from incomplete template_details snapshots
- Template selection properly initializes all manufacturing measurements
- Saved quotes will pick up current template values on restore (not stale snapshots)
