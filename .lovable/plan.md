
# Fix TWC Option Mapping & Improve Toast Readability

## Issues Identified

### Issue 1: Option Keys Not Matching (ROOT CAUSE)
Your saved option keys have a TWC product suffix (e.g., `control_type_ce115355`), but the mapping only checks for base keys (e.g., `control_type`).

**Database has:**
```
optionKey: "control_type_ce115355"
optionKey: "cont_side_ce115355"  
optionKey: "fixing_ce115355"
```

**Mapping expects:**
```
'control_type': 'Control Type'
'cont_side': 'Cont Side'
'fixing': 'Fixing'
```

**Result:** No match → No fields sent → TWC validation fails

### Issue 2: Toast Still Hard to Read
The error toast needs:
- More height for longer messages (12+ errors)
- Visual scrollbar indicator
- Option to expand/collapse for very long errors

### Issue 3: Missing/Invalid Fields
- `Fascia` is required by TWC but not collected
- `Remote` with value "N/A" is invalid - should be excluded

## Solution

### Fix 1: Smart Option Key Matching
**File:** `src/components/integrations/TWCSubmitDialog.tsx`

Update the mapping logic to strip TWC suffixes before matching:

```typescript
// Line 176-197 - Update the forEach loop:
selectedOptions.forEach((opt: any) => {
  const optionKey = opt.optionKey || opt.key || '';
  const optionValue = opt.value || opt.selectedValue || opt.label || '';
  
  // Skip N/A or empty values - TWC doesn't want them
  if (!optionValue || optionValue === 'N/A' || optionValue === 'n/a') {
    return;
  }
  
  // Strip TWC item suffix (e.g., "control_type_ce115355" → "control_type")
  const baseKey = optionKey.replace(/_[a-z]{2}\d+$/i, '');
  
  // Check if this option maps to a TWC field
  const twcFieldName = OPTION_TO_TWC_MAPPING[baseKey] || 
                       OPTION_TO_TWC_MAPPING[baseKey.toLowerCase()] ||
                       OPTION_TO_TWC_MAPPING[optionKey] ||
                       OPTION_TO_TWC_MAPPING[optionKey.toLowerCase()];
  
  if (twcFieldName) {
    // ... rest of existing logic
  }
});
```

### Fix 2: Improve Toast for Long Error Messages
**File:** `src/components/ui/toast.tsx`

Increase max height and add visual scroll indicator:

```typescript
// Line 110 - Update ToastDescription className:
className={cn(
  "text-sm opacity-95 font-medium max-h-48 overflow-y-auto whitespace-pre-line scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent",
  className
)}
```

**File:** `src/components/ui/toaster.tsx`

Add better width for error toasts:

```typescript
// Line 17 - Update Toast className:
<Toast key={id} {...props} className="w-auto min-w-[320px] max-w-lg mx-auto">
```

### Fix 3: Add Missing TWC Field Mappings
**File:** `src/components/integrations/TWCSubmitDialog.tsx`

Add more mappings for common TWC fields:

```typescript
const OPTION_TO_TWC_MAPPING: Record<string, string> = {
  // ... existing mappings
  'fascia_type': 'Fascia',
  'woven_tape': 'Woven Tape',
  'acorn': 'Acorn',
  'cut_out': 'Cut Out',
  // Remote should NOT be mapped if value is N/A
};
```

## Technical Summary

| Issue | Root Cause | Fix |
|-------|------------|-----|
| "Control Type is required" | Key mismatch (`control_type_ce115355` vs `control_type`) | Strip suffix before mapping |
| "Remote is invalid" | Sending "N/A" value | Skip N/A values |
| Toast cut off | `max-h-32` too small | Increase to `max-h-48` |
| Missing Fascia | Not in saved options | User needs to select it in UI, or add default |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/integrations/TWCSubmitDialog.tsx` | Smart key matching, skip N/A values |
| `src/components/ui/toast.tsx` | Increase max height to 48, add scroll styling |
| `src/components/ui/toaster.tsx` | Increase max width to `max-w-lg` |

## Expected Outcome

1. Options like `control_type_ce115355` will correctly map to TWC's `Control Type`
2. Invalid "N/A" values won't be sent to TWC
3. Toast notifications will show more content with a visible scrollbar
4. Users get clear feedback about which specific fields need attention
