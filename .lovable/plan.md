

# Fix: Display TWC Options in Settings Options Manager

## Problem Confirmed

When TWC products are synced, the options are created in `treatment_options` but **no matching `option_type_categories` records are created**. The Options Manager in Settings displays tabs based on `option_type_categories`, so TWC options are invisible.

**Database Evidence:**
- 466 TWC treatment_options exist
- 0 matching option_type_categories exist

## Solution

### Part 1: Database Migration (Immediate Fix)

Backfill missing `option_type_categories` for ALL existing TWC treatment_options:

```sql
INSERT INTO option_type_categories (
  account_id, 
  type_key, 
  type_label, 
  treatment_category, 
  sort_order, 
  active, 
  hidden_by_user
)
SELECT DISTINCT
  to2.account_id,
  to2.key,
  to2.label,
  to2.treatment_category,
  COALESCE(to2.order_index, 999),
  true,
  false
FROM treatment_options to2
WHERE to2.source = 'twc'
  AND to2.account_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM option_type_categories otc
    WHERE otc.account_id = to2.account_id
      AND otc.type_key = to2.key
      AND otc.treatment_category = to2.treatment_category
  );
```

This will immediately make all existing TWC options visible in the Options Manager.

### Part 2: Code Fix (Prevent Future Issues)

Update `src/components/settings/tabs/products/TemplateOptionsManager.tsx` to create `option_type_categories` during TWC sync.

**Location:** Lines 498-512 (after creating treatment_option)

**Add this code block after line 499:**
```typescript
// Create matching option_type_category for Options Manager visibility
await supabase
  .from('option_type_categories')
  .upsert({
    account_id: accountId,
    type_key: optionKey,
    type_label: question.name,
    treatment_category: treatmentCategory,
    sort_order: twcQuestions.indexOf(question),
    active: true,
    hidden_by_user: false,
  }, {
    onConflict: 'account_id,type_key,treatment_category',
    ignoreDuplicates: true
  });
```

## Files to Modify

| File | Change |
|------|--------|
| New SQL Migration | Backfill missing option_type_categories for TWC options |
| `src/components/settings/tabs/products/TemplateOptionsManager.tsx` | Add option_type_categories creation to TWC sync (after line 499) |

## What This Enables

After this fix, Daniel (and all users) can:

1. **See TWC options** in Settings → Products → Options under the correct treatment category
2. **Add pricing** to individual option values
3. **Create rules** that affect TWC options (e.g., "If Control Type = Motorized, hide Manual Chain")
4. **Hide/show values** they don't want to offer
5. **Reorder options** using drag-and-drop
6. **Link to inventory** items for stock tracking

## Order Submission Compatibility

Making changes to TWC options in the Options Manager will NOT break TWC order submission because:

- The order submission maps options by their `key` field (e.g., `control_type_35d8d72a`)
- Editing labels, prices, or visibility doesn't change the key
- The TWC API receives the original option code/value, not your customizations

## Technical Notes

- The migration is safe to run multiple times (uses `NOT EXISTS` check)
- Works for ALL accounts automatically - no manual action needed
- Existing rules and pricing on non-TWC options are unaffected
- The fix follows the same pattern used by `useTreatmentOptionsManagement.ts` (lines 50-57)

