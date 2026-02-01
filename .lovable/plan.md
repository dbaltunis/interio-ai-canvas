

# Task Status Report & Testing Plan

## Summary of Investigation

I've thoroughly investigated all the issues you raised by examining the database, code, and architecture. Here's the current status of each task:

---

## 1. Greg Shave's Account Invitation

### Status: ⚠️ NEEDS INVESTIGATION

**Findings:**
- I found a user named "Greg Taane" (created Jan 26, 2026) but no "Greg Shave" in the user_profiles table
- There is no `account_invitations` table in the database - the system appears to use a different invitation mechanism
- The `create-admin-account` edge function sends invitations via SendGrid

**Recommendation:**
If Greg Shave's invitation is more than a week old and he hasn't received it:
1. The invitation should be re-sent using the admin tools
2. Ensure his email domain isn't blocking SendGrid (this is a known issue with corporate IT)
3. Check if SendGrid click tracking is disabled (per memory: invitation links use `click_tracking: { enable: false }`)

**Technical Note:** Invitations are sent via the `create-admin-account` edge function and don't have a separate tracking table - they're one-time emails.

---

## 2. RFMS Integration - Multiple Stores

### Status: 🔧 NEEDS ENHANCEMENT

**Current Implementation:**
The RFMS integration (`RFMSIntegrationTab.tsx`) supports a single API connection with:
- One `api_url`
- One `client_id`  
- One `api_key`

**What's Needed:**
Add support for multiple RFMS database connections per account, allowing users to:
- Add multiple RFMS API configurations (each with name/label)
- Select which RFMS database to export to on a per-order basis

**Implementation Approach:**
```text
┌─────────────────────────────────────────────┐
│ RFMS Connections                            │
├─────────────────────────────────────────────┤
│ ○ Auckland Store (api.rfms.com/auckland)    │
│ ○ Wellington Store (api.rfms.com/wellington)│
│ ○ Christchurch Store (api.rfms.com/chch)    │
│                                             │
│ [+ Add Connection]                          │
└─────────────────────────────────────────────┘
```

Then on order export, show a dropdown to select the target RFMS database.

---

## 3. Vertical Blinds Not Pricing

### Status: 🔴 BUG IDENTIFIED

**Root Cause:**
The vertical blind materials have `pricing_grid_id = NULL` in the database, but they DO have:
- `pricing_method = 'pricing_grid'`
- `price_group = '1', '2', or 'Budget'`

The pricing grids exist (TWC-VER-1, TWC-VER-2, TWC-VER-Budget) and are active for CCCO Admin, but they're not linked to the materials via `pricing_grid_id`.

**Why It's Not Working:**
The grid auto-matcher in `gridAutoMatcher.ts` tries to match on:
1. `supplier_id` + `product_type` + `price_group` (exact)
2. `product_type` + `price_group` (fallback)

The query uses `product_type = 'vertical_blinds'` but the grids have this correctly. The issue is likely:
- Case sensitivity mismatch: Items have `price_group: '1'` but grids might use different format
- OR the fallback logic isn't matching properly

**Database Evidence:**
```text
Item: "Verticals - FOCUS"      price_group: "1"
Grid: "Vertical Blinds - Group 1"  price_group: "1" ✅ SHOULD MATCH

Item: "Verticals - QUBE"       price_group: "Budget"  
Grid: "Vertical Blinds - Group Budget"  price_group: "BUDGET" ⚠️ CASE MISMATCH
```

**Fix Required:**
1. The auto-matcher already has case-insensitive matching (`normalizedPriceGroup = priceGroup.toString().toUpperCase().trim()`)
2. But the grid lookup uses `.eq('price_group', ...)` which may not be case-insensitive in Supabase
3. Need to verify the grid lookup returns results even with case differences

---

## 4. Vertical Blinds Not in Library

### Status: 🔴 BUG IDENTIFIED

**Root Cause:**
The vertical blind materials have `category = 'material'` and `subcategory = 'vertical_slats'` or `'vertical_fabric'`.

The MaterialInventoryView code DOES have correct group-based matching:
```javascript
const matchesCategory = activeCategory === "all" || 
  matchesSubcategoryGroup(item.subcategory, activeCategory);
```

The `LIBRARY_SUBCATEGORY_GROUPS.vertical` includes: `['vertical_slats', 'vertical_fabric', 'vertical_vanes', 'vertical', 'blind_material']`

**Possible Issues:**
1. The items might not have `category = 'material'` (they may have been imported as `category = 'fabric'`)
2. The subcategory might not match exactly

**Database Evidence:**
All vertical blind items for CCCO Admin have:
- `category: 'material'` ✅
- `subcategory: 'vertical_slats'` or `'vertical_fabric'` ✅

**Likely Cause:**
The items exist but may be filtered out by vendor/collection selection, or there's a client-side rendering issue. Need browser testing to confirm.

---

## 5. Awnings Not Pricing

### Status: 🔴 BUG IDENTIFIED

**Root Cause:**
Same issue as vertical blinds. Awning materials have:
- `pricing_method = 'pricing_grid'`
- `price_group = 'AUTO-1', 'AUTO-2', 'Straight-1', etc.`

But they're not linked directly to pricing grids via `pricing_grid_id = NULL`.

**Database Evidence:**
```text
Item: "Auto - DAYSCREEN 95"    price_group: "Auto-Budget"
Grid: "Awnings - Group Budget"  price_group: "AUTO-BUDGET" ⚠️ CASE + FORMAT MISMATCH

Item: "Straight Drop - VISTAWEAVE PLUS 95"  price_group: "Straight-1"
Grid: "Awnings - Group Straight-1"          price_group: "STRAIGHT-1" ⚠️ CASE MISMATCH
```

**Fix Required:**
The price_group formats are inconsistent:
- Items: `Auto-Budget`, `Straight-1` (mixed case with hyphen)
- Grids: `AUTO-BUDGET`, `STRAIGHT-1` (uppercase)

The auto-matcher's case normalization should handle this, but need to verify the query level.

---

## 6. Option Rules - Dropdown Shows All Products

### Status: ✅ ALREADY FIXED (in code)

**Investigation:**
The `OptionRulesManager.tsx` already uses the correct template-scoped query:
```javascript
const { data: options = [] } = useTreatmentOptions(
  templateId,  // Pass template ID, not category
  'template'   // Use template-specific query
);
```

This queries `template_option_settings` with `is_enabled: true` to only show options linked to the specific template.

**If Still Broken:**
- May be a data issue where `template_option_settings` records don't exist for the template
- Or the options aren't properly linked during TWC sync

---

## 7. Price Grid Updates Without Breaking Setup

### Status: 📝 DOCUMENTATION NEEDED

**Current Mechanism:**
Pricing grids use a versioning system:
- `pricing_grids.version` (integer, increments on update)
- `pricing_grids.replaced_by_grid_id` (links old to new)

**Safe Update Process:**
1. **Edit in Place (Recommended):** Open the grid preview, update prices directly. The `updated_at` timestamp changes but grid stays active.
2. **Re-upload CSV:** Upload a new CSV with the same grid name. The system will update the existing grid data.
3. **Create New Version:** Upload with a different name, then deactivate the old grid and activate the new one.

**What NOT to Do:**
- Don't delete a grid that's linked to materials via `pricing_grid_id`
- Don't change the `grid_code` if materials are matched by it

---

## 8. Quote Output - Summarize Pricing Per Room

### Status: ✅ ALREADY IMPLEMENTED

**Finding:**
The quote template system already supports `groupByRoom`:
```javascript
// In LivePreview.tsx
const groupedItems = groupByRoom && hasRealData ? 
  projectItems.reduce((acc, item) => {
    const room = item.room_name || item.location || 'Unassigned Room';
    // Groups items by room name
  }, {});
```

**How to Enable:**
1. Go to **Settings > Document Templates**
2. Edit the quote template
3. Enable "Group by Room" toggle in the items table settings
4. This will show room headers with subtotals per room

---

## Implementation Priority

| Issue | Priority | Effort | Status |
|-------|----------|--------|--------|
| Vertical Blinds Not Pricing | HIGH | Medium | Bug - price_group case mismatch |
| Awnings Not Pricing | HIGH | Medium | Bug - price_group format mismatch |
| Vertical Blinds Not in Library | HIGH | Low | Investigation needed |
| Option Rules Dropdown | MEDIUM | Low | Verify template linking |
| RFMS Multiple Stores | MEDIUM | High | New feature needed |
| Greg Shave Invitation | MEDIUM | Low | Re-send invitation |
| Price Grid Updates | LOW | Documentation | Already works |
| Quote Room Summary | LOW | None | Already implemented |

---

## Recommended Next Steps

### Immediate Fixes (Bug Fixes):

1. **Fix Price Group Matching Logic**
   - Normalize both item and grid price_groups before comparison
   - Update `gridAutoMatcher.ts` to use ILIKE or case-insensitive matching at query level
   - Add a fallback for format variations (e.g., `Auto-Budget` = `AUTO-BUDGET`)

2. **Verify Library Visibility**
   - Need browser testing with CCCO Admin account to confirm vertical items appear

3. **Test Pricing Calculations End-to-End**
   - Create a test worksheet with vertical blinds
   - Verify grid resolution logs show matching

### Feature Additions:

4. **RFMS Multi-Store Support**
   - Add `rfms_connections` table or modify `api_credentials` to store array of connections
   - Update `RFMSIntegrationTab.tsx` to support multiple entries
   - Add connection selector to order export flow

---

## Technical Details: Pricing Grid Bug Fix

The core fix needed in `gridAutoMatcher.ts`:

```typescript
// Current: Case-insensitive matching in memory
const normalizedPriceGroup = priceGroup.toString().toUpperCase().trim();

// Problem: Supabase query uses exact match
.eq('active', true)  // Then filtered in JS

// Solution: Fetch ALL active grids for product type, then filter with fuzzy matching
const { data: grids } = await supabase
  .from('pricing_grids')
  .select('*')
  .eq('user_id', userId)
  .eq('product_type', productType)
  .eq('active', true);

// Then apply flexible matching on price_group
const matchedGrid = grids?.find(g => 
  normalizePriceGroup(g.price_group) === normalizePriceGroup(priceGroup)
);
```

This ensures `Auto-Budget` matches `AUTO-BUDGET` properly.

