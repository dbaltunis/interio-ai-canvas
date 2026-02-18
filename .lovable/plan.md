

## Fix: Hem Values Ignoring Template Settings (8cm/15cm Hardcoded Fallbacks)

### Root Cause Found

The bug is on **lines 739-751** of `DynamicWindowWorksheet.tsx`. When loading a saved quote, the code tries to find hem values through a chain of property names. When none match (due to mismatched property names between the template snapshot and the DB), it falls through to **hardcoded fallbacks**:

```text
header_hem fallback chain:
  saved header_hem -> saved header_allowance -> snapshot.header_hem -> snapshot.header_allowance -> 8  (HARDCODED!)

bottom_hem fallback chain:
  saved bottom_hem -> saved bottom_allowance -> snapshot.bottom_hem -> snapshot.bottom_allowance -> 15 (HARDCODED!)

side_hems fallback -> 7.5 (HARDCODED!)
seam_hems fallback -> 1.5 (HARDCODED!)
waste_percent fallback -> 5 (HARDCODED!)
```

These hardcoded values (8cm header, 15cm bottom) override whatever you set in the template Manufacturing tab.

### Additional Problem: "Defaults" Section

The "Manufacturing Defaults" section in Settings > Products > Defaults:
- Is ONLY used to pre-fill new template forms (not calculations)
- Has its own separate values that never reach the calculation engine
- Creates confusion because it looks like it should control calculations

### What Will Be Fixed

#### 1. Remove all hardcoded hem fallbacks (lines 739-781)

Replace the hardcoded 8, 15, 7.5, 1.5, 5 values with `0` (no hem). If the template has values, they will be used. If not, 0 is the safe default (no hidden cost inflation).

**Before:**
```text
header_hem fallback -> 8
bottom_hem fallback -> 15
side_hems fallback -> 7.5
seam_hems fallback -> 1.5
waste_percent fallback -> 5
```

**After:**
```text
header_hem fallback -> 0
bottom_hem fallback -> 0
side_hems fallback -> 0
seam_hems fallback -> 0
waste_percent fallback -> 0
```

#### 2. Fix property name resolution order

The DB column is `header_allowance`, but the restore code checks `templateToUse.header_hem` first (which may not exist in the snapshot). Fix the order to check `header_allowance` FIRST since that's the actual DB column name.

**Before:**
```text
templateToUse.header_hem -> templateToUse.header_allowance
```

**After:**
```text
templateToUse.header_allowance -> templateToUse.header_hem
```

#### 3. Also fetch fresh template values on restore

Currently, the code fetches the full template from DB (line 430-451) for heading IDs, but the hem values still come from the stale `template_details` snapshot. Change the restore logic so that when the full template is fetched, its current hem values are used instead of the snapshot's.

#### 4. Remove the confusing "Defaults" tab

- Remove `ManufacturingDefaults.tsx` component
- Remove the "Defaults" tab from `WindowCoveringsTab.tsx`
- Remove the `useManufacturingDefaults` hook and its useEffect from `CurtainTemplateForm.tsx` (which pre-fills new templates from defaults)

### Files Changed

| File | Change |
|---|---|
| `DynamicWindowWorksheet.tsx` (lines 739-781) | Replace hardcoded fallbacks (8, 15, 7.5, 1.5, 5) with 0; fix property name order to check `header_allowance` before `header_hem`; use freshly fetched template values over snapshot |
| `VisualMeasurementSheet.tsx` (lines 358-362) | Same property name order fix for enrichedMeasurements |
| `ManufacturingDefaults.tsx` | Delete this component |
| `WindowCoveringsTab.tsx` | Remove "Defaults" tab and ManufacturingDefaults import |
| `CurtainTemplateForm.tsx` | Remove `useManufacturingDefaults` hook and the useEffect that applies defaults |
| `calculateTreatmentPricing.ts` (lines 107-108) | Fix property resolution order: `header_allowance` before `header_hem` |

### Also fix the build error

The `create-admin-account` edge function has a broken `npm:resend@2.0.0` import. Add the dependency to the edge function's import map or fix the import.

### Expected Result

- Template Manufacturing values (e.g., 12/12) will correctly appear in the Fabric Usage Breakdown
- No more mystery 8cm/15cm values appearing from hardcoded fallbacks
- No more confusing duplicate "Defaults" section in Settings
- Side hems, seam hems, and waste also correctly use template values (no hidden 7.5/1.5/5 defaults)

