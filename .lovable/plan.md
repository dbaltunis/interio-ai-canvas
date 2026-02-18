

## Supplier Ordering: Complete Bug Report and Fix Plan

### Issues Found (3 Critical, 1 Medium)

---

### Issue 1 (CRITICAL): Quote Items Duplicated -- 37 Items Instead of 1

**Root Cause:** The quotation sync (`useQuotationSync.ts`) does a delete-then-insert on every sync cycle. However, the previous FK crash (`inventory_item_id` pointing to non-existent items) caused the INSERT to fail while the DELETE succeeded. On the next sync, the `hasChanges` check sees data is different (because items are now gone), so it creates them again. Over multiple cycles, this creates massive duplication.

**Database proof:**
- Project `4d297d22` has 6 windows but 37 quote_items
- ALL 37 items are identical: "Roller Blinds", same price ($191.69), same room ("Room 2 / Window 1"), same `twc_item_number: 500`
- Only 1 unique window exists

**Why the previous fix didn't fully resolve it:** The FK crash fix (setting `inventory_item_id: null`) prevents NEW duplicates, but the 37 existing duplicates were never cleaned up. Additionally, the sync has a race condition: it runs on BOTH an immediate trigger AND a 1-second debounce (lines 1228-1245), meaning two syncs can overlap -- one deletes, the other inserts before the first finishes, creating duplicates.

**Fix:**
1. Add a sync mutex/lock to prevent concurrent syncs (`isSyncingRef`)
2. Remove the double-sync pattern (immediate + debounced) -- use only debounced
3. SQL cleanup: deduplicate existing quote_items across all quotes
4. The item count in `useProjectSuppliers.ts` should only count parent items (items where `product_details.hasChildren = true`), not child rows

---

### Issue 2 (CRITICAL): RFMS Integration -- Edge Functions Use `user_id` Instead of `account_owner_id`

**Root Cause:** All 3 RFMS edge functions (`rfms-sync-customers`, `rfms-sync-quotes`, `rfms-test-connection`) query `integration_settings` using `user_id = user.id`. But in a multi-tenant team setup, team members' `user.id` differs from the `account_owner_id` where the integration is stored.

**Database proof:**
- RFMS integration `5de5bb4f` has `user_id = b0c727dd` and `account_owner_id = b0c727dd`
- If a team member (different user_id) tries to sync, the query `.eq("user_id", user.id)` returns nothing -- "RFMS integration not found"

**This same bug exists in `rfms-sync-quotes/index.ts` (line 125-128) and `rfms-sync-customers/index.ts` (line 136-142).**

**Fix:**
1. Update all RFMS edge functions to first resolve the `account_owner_id` for the current user, then query `integration_settings` by `account_owner_id`
2. Pattern: Look up the user's `account_owner_id` from the `profiles` or `account_users` table, then use that for the integration lookup

---

### Issue 3 (CRITICAL): Supplier Item Counting Counts Every Quote Row

**Root Cause:** In `useProjectSuppliers.ts`, the detection loop iterates over ALL `quoteItems` and pushes each one into the supplier's items array. But `quoteItems` includes parent rows AND child option rows (e.g., "Brackets", "Control Type", "Roll Direction"). Each child inherits `twc_item_number` from the parent via `product_details`, so they ALL get counted as TWC items.

**Actual example:** 1 window = 1 parent "Roller Blinds" + 8 children (Brackets, Material, Control Type, Cont Side, Control Length, Base Rail Colour, Roll Direction, Fitting, Smart Home Devices) = 9 items counted per window.

**Fix:** Filter the detection to only count items where `product_details.hasChildren === true` (parent items), OR items that are NOT children. This correctly counts 1 product per window.

---

### Issue 4 (MEDIUM): Other Suppliers Show "No Items Detected"

**Root Cause:** For non-TWC vendors (Betta Blinds, Capitol, CW Systems, Norman, Suntex), detection relies on `product_details.vendor_id` or `inventory_item_id` in quote_items. The backfill migration ran but only matched items where `windows_summary.fabric_details->>'id'` exists in `enhanced_inventory_items`. For this particular job (`d0312814`), the `windows_summary` has NO surfaces (0 rows), so there's nothing to backfill.

The "All suppliers" section correctly shows these vendors from Settings, but they'll always show "No items detected" unless:
1. The job's windows have inventory items linked to those vendors
2. The vendor_id is persisted through the save chain

This is working as designed -- vendors without products in the job show as available for manual email ordering but report no auto-detected items.

---

### Files to Change

| File | Change | Issue |
|---|---|---|
| `useQuotationSync.ts` | Add sync mutex; remove double-sync pattern | Issue 1 |
| `useProjectSuppliers.ts` | Filter to parent items only (hasChildren check) | Issue 3 |
| `rfms-sync-customers/index.ts` | Use `account_owner_id` lookup instead of `user_id` | Issue 2 |
| `rfms-sync-quotes/index.ts` | Use `account_owner_id` lookup instead of `user_id` | Issue 2 |
| `rfms-session/index.ts` | Use `account_owner_id` lookup instead of `user_id` (if applicable) | Issue 2 |
| SQL Migration | Deduplicate existing quote_items across all quotes | Issue 1 |

### SQL Deduplication (Issue 1)

```sql
-- Remove duplicate quote_items, keeping only ONE per unique 
-- (quote_id, name, room_name, surface_name, unit_price) combination
DELETE FROM quote_items
WHERE id NOT IN (
  SELECT DISTINCT ON (
    quote_id, 
    name, 
    product_details->>'room_name', 
    product_details->>'surface_name',
    unit_price::text
  ) id
  FROM quote_items
  ORDER BY 
    quote_id, 
    name, 
    product_details->>'room_name', 
    product_details->>'surface_name',
    unit_price::text,
    created_at ASC
);
```

### RFMS Edge Function Fix Pattern

```typescript
// Before (broken for team members):
.eq("user_id", user.id)

// After (works for all team members):
// Step 1: Resolve account_owner_id
const { data: profile } = await supabase
  .from("profiles")
  .select("account_owner_id")
  .eq("id", user.id)
  .single();
const ownerId = profile?.account_owner_id || user.id;

// Step 2: Query by account_owner_id
.eq("account_owner_id", ownerId)
```

### Item Count Fix (Issue 3)

```typescript
// In useProjectSuppliers.ts - only count parent items
quoteItems
  .filter(item => {
    const pd = item.product_details || {};
    // Skip child rows - they inherit vendor/twc data from parent
    return pd.hasChildren !== false || !pd.isChild;
  })
  .forEach((item) => { /* existing detection logic */ });
```

### After All Fixes

- Existing duplicates cleaned up via SQL
- No new duplicates due to sync mutex
- TWC shows correct item count (1 product per window, not 9)
- RFMS sync works for team members (uses account_owner_id)
- Email ordering works for all vendors with detected products
- All fixes are multi-tenant safe and apply to ALL accounts

