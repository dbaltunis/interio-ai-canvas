

# Fix Duplicate Pricing & Hidden Value Filtering Bugs

## Confirmed Root Causes (Code Evidence)

### Bug 1: Duplicate Pricing Entries
**File:** `src/components/measurements/roller-blind-fields/DynamicRollerBlindFields.tsx` (lines 645-660)

The code calls BOTH:
- `onOptionPriceChange()` (line 646) - adds entry like `control_type_af6eed75_motor: Motor`
- `onSelectedOptionsChange()` (line 650) - adds ANOTHER entry with different name format

This bypasses the deduplication filter in `VisualMeasurementSheet.tsx` (line 176) which only filters by `optionKey + ':'` prefix.

### Bug 2: Hidden Values Still Visible
**File:** `src/components/measurements/roller-blind-fields/DynamicRollerBlindFields.tsx` (lines 72-75)

```typescript
const { data: settings } = await supabase
  .from('template_option_settings')
  .select('treatment_option_id, is_enabled')  // ← Missing hidden_value_ids!
```

This bypasses the `useTreatmentOptions` hook's correct filtering.

---

## Implementation Plan

### Step 1: Remove Duplicate `onSelectedOptionsChange` Calls

**File:** `src/components/measurements/roller-blind-fields/DynamicRollerBlindFields.tsx`

Remove lines 649-660 where `onSelectedOptionsChange` is manually called after `onOptionPriceChange`. The `onOptionPriceChange` handler in `VisualMeasurementSheet.tsx` already updates `selectedOptions` correctly.

### Step 2: Trust Hook's Pre-Filtered Data

**File:** `src/components/measurements/roller-blind-fields/DynamicRollerBlindFields.tsx`

Replace lines 64-109 with simplified logic:

```typescript
useEffect(() => {
  // useTreatmentOptions already handles:
  // ✅ is_enabled filtering (WHITELIST)
  // ✅ hidden_value_ids filtering
  // ✅ template_order_index sorting
  
  // Deduplicate by label to prevent duplicate dropdowns
  const uniqueOptions = allOptions.reduce((acc, opt) => {
    if (!acc.some(existing => existing.label === opt.label)) {
      acc.push(opt);
    }
    return acc;
  }, [] as typeof allOptions);
  
  setTreatmentOptions(uniqueOptions);
}, [allOptions]);
```

### Step 3: Apply Same Fix to DynamicCurtainOptions

**File:** `src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx`

Remove duplicate `onSelectedOptionsChange` calls at lines 1550-1564 and 1592-1605.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/measurements/roller-blind-fields/DynamicRollerBlindFields.tsx` | Remove duplicate calls, simplify filtering |
| `src/components/measurements/dynamic-options/DynamicCurtainOptions.tsx` | Remove duplicate calls |

---

## Expected Results

| Before | After |
|--------|-------|
| `control_type_af6eed75: Stainless Steel Chain $15.00` | Single entry: |
| `control_type_af6eed75: Stainless Steel Chain $10.00` | `control_type_af6eed75: Stainless Steel Chain $10.00` |
| Hidden values still selectable | Only visible values in dropdown |

---

## Accounts Affected

- **All accounts using roller blinds templates** - this is a code bug, not data issue
- Fix will apply universally once deployed
- Greg's account and demo account will both benefit

