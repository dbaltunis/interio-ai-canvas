
# Technical Fix Plan: Option Changes Not Updating Prices/Products

## Investigation Summary

I conducted a thorough code investigation and identified **3 specific bugs** that cause option changes to appear "stuck" - they display correctly in the UI but don't persist to the database when saved.

---

## Root Causes (Verified Code Evidence)

### Bug 1: Blind Costs Key Missing Option Selection Changes

**File:** `src/components/measurements/dynamic-options/CostCalculationSummary.tsx`

**Line 398** (Blinds - BROKEN):
```typescript
const blindCostsKey = `${blindCosts.fabricCost}-${blindCosts.manufacturingCost}-${blindCosts.optionsCost}-${blindCosts.totalCost}-${blindCosts.squareMeters}`;
```

**Lines 688-709** (Curtains - CORRECT):
```typescript
const optionSelectionKey = selectedOptions.map(o => `${o.name}-${(o as any).value || (o as any).label || ''}`).join(',');
const curtainCostsKey = `${fabricCost}-...-${optionSelectionKey}-${measurementKey}-${headingKey}`;
```

**Problem:** The blind costs key only includes numeric totals. When you switch between two options with the same price (or both $0), the key doesn't change, so:
- `useEffect` on line 200 doesn't fire
- Parent component (`DynamicWindowWorksheet`) never receives the updated options
- When you save, it uses stale option data

### Bug 2: Orphaned Sub-Options When Parent Option Changes

**File:** `src/components/measurements/VisualMeasurementSheet.tsx`

**Lines 174-176:**
```typescript
const currentOptions = selectedOptionsRef.current;
const filteredOptions = currentOptions.filter(opt => !opt.name.startsWith(optionKey + ':'));
```

**Problem:** This only filters options with exact key prefix (e.g., `control_type:`). Sub-options use keys like `control_type_motor:`, which DON'T match this filter.

**Scenario:**
1. User selects "Motor" for Control Type
2. Sub-option "Battery Type: Rechargeable" is added as `control_type_motor: Rechargeable`
3. User switches Control Type to "Chain" (no motor)
4. Filter removes `control_type: Motor` but leaves `control_type_motor: Rechargeable`
5. Quote still shows and charges for battery option!

### Bug 3: Sub-Option Values Not Cleared in Measurements

**File:** `src/components/measurements/roller-blind-fields/DynamicRollerBlindFields.tsx`

**Lines 584-587:**
```typescript
if (prevCategory && prevCategory !== categoryKey) {
  onChange(`${option.key}_${prevCategory}`, '');
}
```

**Problem:** This clears the measurement value when switching sub-categories, but it does NOT call `onOptionPriceChange` to remove the option from `selectedOptions`. The option stays in the cost summary.

---

## Implementation Plan

### Fix 1: Add optionSelectionKey to Blind Costs Key

**File:** `src/components/measurements/dynamic-options/CostCalculationSummary.tsx`

**Change at lines 396-398:**

```typescript
// ✅ FIX: Include option selection changes in key (same pattern as curtains)
const optionSelectionKey = selectedOptions.map(o => `${o.name}-${(o as any).label || ''}`).join(',');
const measurementKey = `${measurements?.rail_width || 0}-${measurements?.drop || 0}`;
const blindCostsKey = `${blindCosts.fabricCost}-${blindCosts.manufacturingCost}-${blindCosts.optionsCost}-${blindCosts.totalCost}-${blindCosts.squareMeters}-${optionSelectionKey}-${measurementKey}`;
```

### Fix 2: Clear Orphaned Sub-Options When Parent Changes

**File:** `src/components/measurements/VisualMeasurementSheet.tsx`

**Change at lines 174-176:**

```typescript
const currentOptions = selectedOptionsRef.current;
// ✅ FIX: Also remove any sub-options (keys starting with parentKey_)
const filteredOptions = currentOptions.filter(opt => {
  const optKeyFromName = opt.optionKey || (opt.name.includes(':') ? opt.name.split(':')[0] : opt.name);
  // Remove exact match AND any sub-options (e.g., control_type_motor when control_type changes)
  return !opt.name.startsWith(optionKey + ':') && !optKeyFromName.startsWith(optionKey + '_');
});
```

### Fix 3: Notify Parent When Sub-Option Is Cleared

**File:** `src/components/measurements/roller-blind-fields/DynamicRollerBlindFields.tsx`

**Change at lines 584-587:**

```typescript
if (prevCategory && prevCategory !== categoryKey) {
  const clearedKey = `${option.key}_${prevCategory}`;
  onChange(clearedKey, '');
  // ✅ FIX: Also remove from selectedOptions by calling onOptionPriceChange with 0/empty
  if (onOptionPriceChange) {
    onOptionPriceChange(clearedKey, 0, '', 'fixed', undefined, undefined);
  }
}
```

**Additionally, update handleOptionPriceChange in VisualMeasurementSheet to remove options when price is 0 and label is empty:**

**File:** `src/components/measurements/VisualMeasurementSheet.tsx` (lines 167-200)

Add a check:
```typescript
const handleOptionPriceChange = (optionKey: string, price: number, label: string, ...) => {
  if (onSelectedOptionsChange) {
    const currentOptions = selectedOptionsRef.current;
    
    // ✅ FIX: Also remove sub-options when parent changes
    const filteredOptions = currentOptions.filter(opt => {
      const optKeyFromName = opt.optionKey || (opt.name.includes(':') ? opt.name.split(':')[0] : opt.name);
      return !opt.name.startsWith(optionKey + ':') && !optKeyFromName.startsWith(optionKey + '_');
    });
    
    // ✅ FIX: If label is empty and price is 0, this is a removal request - don't add new option
    if (label === '' && price === 0) {
      selectedOptionsRef.current = filteredOptions;
      onSelectedOptionsChange(filteredOptions);
      return;
    }
    
    // ... rest of existing logic to add new option
  }
};
```

---

## Files to Modify

| File | Change | Lines |
|------|--------|-------|
| `src/components/measurements/dynamic-options/CostCalculationSummary.tsx` | Add optionSelectionKey to blind costs key | 396-398 |
| `src/components/measurements/VisualMeasurementSheet.tsx` | Clear sub-options when parent changes + handle removal requests | 167-200 |
| `src/components/measurements/roller-blind-fields/DynamicRollerBlindFields.tsx` | Notify parent when sub-option cleared | 584-587 |

---

## Expected Results After Fix

| Before | After |
|--------|-------|
| Change option with same price → no update | Any option change triggers update |
| Switch from Motor to Chain → battery still charged | Motor sub-options removed |
| UI shows correct options but save uses stale data | UI and save use identical data |

---

## Accounts Affected

| Impact | Accounts |
|--------|----------|
| **Directly affected** | All accounts using roller blinds, vertical blinds, or any blind template with options |
| **Not affected** | Curtain-only accounts (curtains already have the optionSelectionKey fix) |

This is a **code bug**, not a data issue - fix applies universally.

---

## Testing Checklist

1. [ ] Open Roller Blind worksheet
2. [ ] Select "Motor" for Control Type
3. [ ] Select a battery type in sub-options
4. [ ] Switch Control Type to "Chain"
5. [ ] Verify battery option disappears from cost summary
6. [ ] Click Save & Close
7. [ ] Re-open worksheet - verify Chain is selected, no battery option
8. [ ] Switch between two $0 options (e.g., Roll Direction)
9. [ ] Verify cost summary updates immediately
10. [ ] Save and verify correct option persisted

