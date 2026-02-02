
# Fix Plan: Remaining Hardcoded Fallbacks

## Overview

Testing revealed **12 additional locations** where hardcoded fallbacks still override user's explicit `0` values. This causes Sadath's account (and all users) to see incorrect hem values, wrong fabric calculations, and inaccurate pricing.

## Issues Summary

| Priority | Files | Count | Impact |
|----------|-------|-------|--------|
| P0 - Critical | TreatmentSpecificFields.tsx | 4 | Shows wrong values in UI inputs |
| P0 - Critical | VisualMeasurementSheet.tsx | 4 | Wrong values in fabric calculations |
| P1 - High | DynamicWindowWorksheet.tsx | 2 | Calculation errors |
| P1 - High | AddCurtainToProject.tsx | 2 | Wrong waste/pooling defaults |
| P2 - Medium | EnhancedMeasurementWorksheet.tsx | 2 | Forces 140cm fabric width |
| P2 - Medium | FabricUsageDisplay.tsx | 1 | Forces 140cm fabric width |
| P2 - Medium | FabricSelector.tsx | 1 | Forces 137cm fabric width |

---

## Fix Details

### Fix 1: TreatmentSpecificFields.tsx (Lines 145, 156, 169, 180)

Change `||` to `??` for all hem input values:

```text
BEFORE:
- Line 145: value={treatmentData.header_hem || 4}
- Line 156: value={treatmentData.bottom_hem || 4}
- Line 169: value={treatmentData.side_hem || 1.5}
- Line 180: value={treatmentData.seam_allowance || 0.5}

AFTER:
- Line 145: value={treatmentData.header_hem ?? ""}
- Line 156: value={treatmentData.bottom_hem ?? ""}
- Line 169: value={treatmentData.side_hem ?? ""}
- Line 180: value={treatmentData.seam_allowance ?? ""}
```

Use empty string fallback for form inputs so the placeholder shows the expected value, but `0` is respected when explicitly set.

---

### Fix 2: VisualMeasurementSheet.tsx (Lines 349-352)

Change `||` to `??` for enriched measurements:

```text
BEFORE:
header_hem: measurements.header_hem || selectedTemplate.header_allowance || ...
bottom_hem: measurements.bottom_hem || selectedTemplate.bottom_hem || ...
side_hem: measurements.side_hem || selectedTemplate.side_hem || ...
seam_hem: measurements.seam_hem || selectedTemplate.seam_allowance

AFTER:
header_hem: measurements.header_hem ?? selectedTemplate.header_allowance ?? ...
bottom_hem: measurements.bottom_hem ?? selectedTemplate.bottom_hem ?? ...
side_hem: measurements.side_hem ?? selectedTemplate.side_hem ?? ...
seam_hem: measurements.seam_hem ?? selectedTemplate.seam_allowance ?? null
```

---

### Fix 3: DynamicWindowWorksheet.tsx (Lines 1408-1409)

Change fallbacks in manufacturing calculation:

```text
BEFORE:
- Line 1408: fullness_ratio || 1
- Line 1409: side_hem || 4

AFTER:
- Line 1408: fullness_ratio ?? 1 (keep 1 as default for fullness - 0 fullness makes no sense)
- Line 1409: side_hem ?? 0 (respect user's 0)
```

---

### Fix 4: AddCurtainToProject.tsx (Lines 104-105, 142)

Lines 104-105 are already using `??` which is correct - they maintain fallback values for templates that don't define these.

Line 142 needs fix:

```text
BEFORE:
const wastePercent = template.waste_percent || 5;

AFTER:
const wastePercent = template.waste_percent ?? 0;
```

---

### Fix 5: EnhancedMeasurementWorksheet.tsx (Lines 145, 819)

```text
BEFORE:
fabric_width: ... || 140

AFTER:
fabric_width: ... ?? null
```

Show an error/warning if fabric width is missing instead of silently assuming 140cm.

---

### Fix 6: FabricUsageDisplay.tsx (Line 83)

```text
BEFORE:
fabricWidth={costs.fabricWidthCm || parseFloat(formData.fabric_width) || 140}

AFTER:
fabricWidth={costs.fabricWidthCm ?? parseFloat(formData.fabric_width) ?? 140}
```

This file can keep the 140 fallback as it's just for the visual diagram display.

---

### Fix 7: FabricSelector.tsx (Line 136)

```text
BEFORE:
width: item.fabric_width || 137

AFTER:
width: item.fabric_width ?? 137
```

Keep fallback since this is for inventory items that may not have width defined.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/measurements/TreatmentSpecificFields.tsx` | 4 lines |
| `src/components/measurements/VisualMeasurementSheet.tsx` | 4 lines |
| `src/components/measurements/DynamicWindowWorksheet.tsx` | 2 lines |
| `src/components/projects/AddCurtainToProject.tsx` | 1 line |
| `src/components/measurements/EnhancedMeasurementWorksheet.tsx` | 2 lines |
| `src/components/job-creation/treatment-pricing/fabric-details/FabricUsageDisplay.tsx` | 1 line |
| `src/components/fabric/FabricSelector.tsx` | 1 line |

---

## Expected Results After Fix

| Test | Before | After |
|------|--------|-------|
| Sadath sets header_hem = 0 | Shows 4cm in UI | Shows 0 |
| Sadath sets bottom_hem = 0 | Shows 4cm in UI | Shows 0 |
| Sadath's Curtains template | Uses blind_*_hem_cm = 8 | Uses header_allowance = 0 |
| Fabric calculation with 0 hems | Adds 8cm extra | Adds 0cm extra |
| Waste percentage = 0 | Forces 5% | Respects 0% |
| Saved windows_summary | header_hem: null | header_hem: 0 |

---

## Technical Notes

### Why `||` vs `??` Matters

```javascript
// || treats 0 as falsy
const value = 0 || 8;  // Returns 8! ❌

// ?? only treats null/undefined as falsy  
const value = 0 ?? 8;  // Returns 0! ✅
```

### For Input Fields

For form inputs, use empty string as fallback so placeholder shows:
```javascript
value={treatmentData.header_hem ?? ""}
placeholder="4"
```
This way:
- If header_hem = undefined → shows placeholder "4"
- If header_hem = 0 → shows "0"
- If header_hem = 8 → shows "8"
