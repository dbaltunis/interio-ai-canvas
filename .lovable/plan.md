
# Deep Testing Report: Sadath's Account & Global Calculation Issues

## Executive Summary

After comprehensive testing of Sadath's Homekaara account and tracing through the codebase, I've identified **11 distinct bugs** affecting calculations, displays, data persistence, and form saving across ALL accounts. These issues explain:
1. **"Save Failed" error** - Caused by passing string "standard" to a UUID field
2. **Formula/calculation mismatches** - Different values shown in worksheet vs saved data
3. **Hardcoded values overriding user settings** - 8cm/15cm hems appearing despite user setting 0
4. **$0 pricing on saved blinds** - Calculation results not persisting correctly

---

## Issue #1: CRITICAL - "Save Failed" Error

### Root Cause
The error `invalid input syntax for type uuid: "standard"` occurs in the database logs.

**Location:** `DynamicWindowWorksheet.tsx` (Lines 277-280)

```typescript
const windowTypes = [
  { id: 'standard', name: 'Standard Window', key: 'standard', visual_key: 'standard' },
  { id: 'room_wall', name: 'Wall', key: 'room_wall', visual_key: 'room_wall' },
];
```

When auto-selecting window types, the code sets `selectedWindowType.id` to the **string** `'standard'` instead of a valid **UUID**.

Then at line 2139:
```typescript
window_type_id: selectedWindowType?.id, // Saves 'standard' instead of UUID!
```

This causes the database upsert to fail because `window_type_id` is a UUID column.

### Fix Required
Replace hardcoded string IDs with `null` or fetch actual UUIDs from the `window_types` table:
```typescript
window_type_id: selectedWindowType?.id && isValidUUID(selectedWindowType.id) ? selectedWindowType.id : null,
```

---

## Issue #2: Hardcoded Hem Fallbacks STILL EXIST

### Evidence
Despite previous fixes, I found **5 MORE locations** with hardcoded fallbacks:

| File | Line | Code | Impact |
|------|------|------|--------|
| `ManufacturingStep.tsx` | 81 | `value={settings.bottom_hem_cm \|\| 15}` | Shows 15cm in onboarding |
| `ManufacturingStep.tsx` | 97 | `value={settings.side_hems_cm \|\| 3}` | Shows 3cm for side hems |
| `TreatmentSpecificFields.tsx` | 355 | `value={treatmentData.fold_spacing \|\| 8}` | Shows 8cm for fold spacing |
| `DynamicWindowWorksheet.tsx` | 2286 | `waste_percent_saved: ... \|\| 5` | Forces 5% waste |
| `DynamicWindowWorksheet.tsx` | 2280 | `fabric_width_cm: ... \|\| 140` | Forces 140cm width |

---

## Issue #3: Sadath's Template Settings vs Database Reality

### His Database Values:

| Template | header_allowance | bottom_hem | blind_header_hem_cm | blind_bottom_hem_cm |
|----------|------------------|------------|---------------------|---------------------|
| Curtains | **0** | **0** | **8** | **8** |
| Roller Blinds | 8 | 0 | 8 | 8 |
| Zebra Blinds | 8 | 0 | 8 | 8 |

### Problem
For Curtains, Sadath set hems to **0**, but `blind_header_hem_cm = 8` overrides this because of the priority chain in `blindCalculationDefaults.ts`:
```typescript
const headerRaw = template.blind_header_hem_cm ?? template.header_allowance;
// Returns 8 even when header_allowance = 0!
```

---

## Issue #4: Saved Windows Show $0 Selling Price

### Database Evidence
From Sadath's `windows_summary` records:

| Window | total_cost | total_selling | markup_applied |
|--------|------------|---------------|----------------|
| Window 3 (Curtains) | 220.28 | **0** | 0 |
| test (Curtains) | 208.85 | **0** | 0 |
| Window 1 (Curtains) | null | **0** | 0 |

### Root Cause
The worksheet calculates `total_cost` correctly but fails to calculate/save `total_selling` due to:
1. Missing markup settings resolution during save
2. Markup percentage = 0 when it should use category defaults

---

## Issue #5: CalculationBreakdown Displays Misleading Formulas

### Problem
The `CalculationBreakdown.tsx` component shows a "Final calculation" formula:
```
Total drop × Widths + Seam allowances = Linear meters
```

But the displayed values don't add up correctly because:
1. **Seam allowances** are calculated for width (horizontal) but displayed after drop (vertical) items
2. **Header/bottom hems** shown as `0` when user sets them, but template defaults still applied in calculation

### Evidence from Database
For window `2f82fd00` (Curtains):
- `measurements_details.header_hem: 8` (from template)
- `measurements_details.bottom_hem: 15` (from template)

But Sadath's template has `header_allowance: 0` and `bottom_hem: 0`.

---

## Issue #6: measurements_details Saves Template Defaults Instead of User Values

### Location: `DynamicWindowWorksheet.tsx` (Lines 2234-2237)
```typescript
header_hem: measurements.header_hem || selectedTemplate?.header_allowance || selectedTemplate?.header_hem || null,
bottom_hem: measurements.bottom_hem || selectedTemplate?.bottom_hem || selectedTemplate?.bottom_allowance || null,
side_hems: measurements.side_hem || selectedTemplate?.side_hem || selectedTemplate?.side_hems || null,
seam_hems: measurements.seam_hem || selectedTemplate?.seam_allowance || selectedTemplate?.seam_hems || null,
```

**Problem:** Uses `||` operator which treats `0` as falsy, so template defaults override user's explicit `0` values.

---

## Issue #7: fabric_details Missing cost_price

### Database Evidence
From Sadath's windows:
```json
fabric_details: {
  "name": "ADARA",
  "selling_price": 26.5,  // ← Only selling_price saved
  // cost_price: MISSING
}
```

This causes profit margin calculations to fail because there's no base cost to compare against.

---

## Issue #8: Room Card Totals Use Fallback Calculations

### Code: `RoomCardLogic.tsx` (Lines 56-71)
```typescript
const storedSelling = Number(w.summary.total_selling || 0);
if (storedSelling > 0) {
  totalSelling += storedSelling;  // Uses stored value
} else {
  // Fallback - recalculates with current markup settings
  const markupResult = resolveMarkup(...);
  const sellingPrice = applyMarkup(costPrice, markupResult.percentage);
  totalSelling += sellingPrice;
}
```

**Problem:** When `total_selling = 0` in database, the fallback kicks in with potentially different markup values than what was used during worksheet calculation.

---

## Issue #9: Quote List/Work Orders Read Stale Data

### Verification Needed
The quote generation and work order components likely read from `windows_summary` which contains:
- Outdated `measurements_details` with template defaults
- Missing `total_selling` values
- Incorrect hem/allowance values

---

## Issue #10: Unit Conversion Inconsistencies

### Sadath's Configuration:
- Length unit: **inches**
- Fabric unit: **meters**
- Currency: **INR**

### Database Storage Standard:
- All measurements stored in **MM**

### Problem
The `extractWindowMetrics` utility in `windowSummaryExtractors.ts` attempts to normalize units but has edge cases where:
- Values stored as CM are treated as MM
- Values without unit hints default incorrectly

---

## Issue #11: Missing Calculation Logging for Debugging

The calculation flow between:
1. `AdaptiveFabricPricingDisplay.tsx` (live calculation)
2. `DynamicWindowWorksheet.tsx` (save calculation)
3. `CalculationBreakdown.tsx` (display saved data)

...lacks consistent logging to trace where values diverge.

---

## Files Requiring Fixes

| Priority | File | Issues |
|----------|------|--------|
| P0 | `DynamicWindowWorksheet.tsx` | UUID validation (#1), hem fallbacks (#6), fabric cost (#7) |
| P0 | `ManufacturingStep.tsx` | Hardcoded `\|\| 15`, `\|\| 3` (#2) |
| P0 | `TreatmentSpecificFields.tsx` | Hardcoded `\|\| 8` (#2) |
| P1 | `blindCalculationDefaults.ts` | Priority chain ordering (#3) |
| P1 | `RoomCardLogic.tsx` | Fallback calculation consistency (#8) |
| P1 | `CalculationBreakdown.tsx` | Formula display clarity (#5) |
| P2 | `windowSummaryExtractors.ts` | Unit conversion edge cases (#10) |

---

## Recommended Fix Sequence

### Phase 1: Critical - Fix Save Failures
1. Add UUID validation before saving `window_type_id`
2. Set `window_type_id: null` when ID is a string literal

### Phase 2: Remove All Hardcoded Fallbacks
1. Replace `|| 15`, `|| 3`, `|| 8`, `|| 5`, `|| 140` with `?? 0` or explicit null handling
2. Change `||` to `?? 0` for all hem/allowance values in save logic

### Phase 3: Fix Template Priority Chain
1. Invert priority: `header_allowance ?? blind_header_hem_cm` instead of reverse
2. Run SQL migration to sync `blind_*_hem_cm` with user-editable columns

### Phase 4: Ensure total_selling Persistence
1. Always calculate and save `total_selling` during worksheet save
2. Include `cost_price` in `fabric_details` alongside `selling_price`

### Phase 5: Improve Formula Display
1. Clarify seam allowance placement in CalculationBreakdown
2. Add visual equation that actually sums correctly

---

## Verification Checklist After Fixes

| Test | Expected Result |
|------|-----------------|
| Save any window configuration | No "Save Failed" error |
| Set hems to 0 in template | Display shows 0, not 5in/8cm |
| Check Room Card total | Shows non-zero selling price |
| Check Quote/Work Order | Values match worksheet |
| Imperial user saves | Units stored as MM, displayed as inches |

