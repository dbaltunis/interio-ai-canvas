

# Consolidated Fix Plan: Critical Bugs #4, #5, #6 + TWC Collection Ownership

## Executive Summary

I've verified the codebase and found:

1. **Code fixes are already in place** for bugs #4, #5, #6 (subcategory filtering, awning handler, rules dropdown)
2. **TWC sync function still has a bug** causing collections to be linked to wrong vendors
3. **Database data needs fixing** - 111 collections are linked to a vendor owned by a different user

---

## Current Status

### ✅ Already Fixed (Code in Place)

| Component | Status | Lines |
|-----------|--------|-------|
| `inventorySubcategories.ts` | ✅ Has `LIBRARY_SUBCATEGORY_GROUPS` + `matchesSubcategoryGroup()` | 157-204 |
| `MaterialInventoryView.tsx` | ✅ Uses group-based filtering | 38, 121-124 |
| `FabricSelector.tsx` | ✅ Has awning handler + vertical_fabric | 72-101 |
| `OptionRulesManager.tsx` | ✅ Uses `templateId` + `'template'` query type | 98-101 |

### ❌ Still Broken (Needs Fix)

| Issue | Root Cause |
|-------|------------|
| 111 collections show as "Unassigned" | Data linked to wrong vendor (RLS blocks access) |
| TWC sync creates mislinked collections | Uses `user.id` instead of `accountId` for vendor/collection lookups |

---

## What's Causing "Unassigned" Collections

```text
Database State:
┌──────────────────────────────────────────────────────────────────┐
│  YOUR ACCOUNT: ec930f73-ef23-4430-921f-1b401859825d              │
│                                                                   │
│  Collections you own:                                             │
│  ├── 111 collections → vendor_id: 93608e2c... (OTHER user's!)    │
│  ├──  20 collections → vendor_id: c956c497... (YOUR vendor) ✓    │
│  └──   1 collection  → vendor_id: NULL                            │
│                                                                   │
│  TWC Vendors in system:                                           │
│  ├── 93608e2c... → owner: 504dcfd2... (NOT YOU)                  │
│  └── c956c497... → owner: ec930f73... (YOU) ✓                     │
│                                                                   │
│  RESULT: RLS policy blocks vendor lookup → shows "Unassigned"    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Fix Existing Data (Database Migration)

Reassign the 111 mislinked collections to your correct TWC vendor:

```sql
-- Update collections to use YOUR TWC vendor
UPDATE collections
SET vendor_id = 'c956c497-153a-4c1e-9df9-314110943351'
WHERE user_id = 'ec930f73-ef23-4430-921f-1b401859825d'
  AND vendor_id = '93608e2c-0048-4d6c-bf29-928137fb027e'
  AND active = true;
```

**Expected Result:** "Unassigned" count drops from 111 to ~1, TWC shows all 131 collections.

---

### Phase 2: Fix TWC Sync Function

**File:** `supabase/functions/twc-sync-products/index.ts`

**Change 1: Vendor Lookup (line 86)**
```typescript
// BEFORE:
.eq('user_id', user.id)

// AFTER:
.eq('user_id', accountId)  // Use accountId for team member support
```

**Change 2: Vendor Creation (line 99)**
```typescript
// BEFORE:
user_id: user.id,

// AFTER:
user_id: accountId,  // Use accountId for consistency
```

**Change 3: Collection Lookup (line 460)**
```typescript
// BEFORE:
.eq('user_id', user.id)

// AFTER:
.eq('user_id', accountId)  // Use accountId for team member support
```

**Change 4: Collection Creation (line 474)**
```typescript
// BEFORE:
user_id: user.id,

// AFTER:
user_id: accountId,  // Use accountId for consistency
```

---

### Phase 3: Add Memory Note for Prevention

Create a memory note to document the pattern:

```markdown
# Memory: twc-sync-account-id-standard

The TWC sync function MUST use `accountId` (not `user.id`) for ALL 
tenant-scoped resources:
- Vendor lookups and creation
- Collection lookups and creation  
- Inventory item creation

This ensures team members using the sync function create resources 
owned by the account owner, maintaining proper RLS access across 
the team.

Pattern:
const accountId = userProfile?.parent_account_id || user.id;
// Then use accountId for all .eq('user_id', ...) queries
```

---

## Files to Modify

| File | Changes | Purpose |
|------|---------|---------|
| Database Migration | Update 111 collections to correct vendor_id | Fix existing data |
| `supabase/functions/twc-sync-products/index.ts` | 4 line changes (user.id → accountId) | Prevent future mislinks |

---

## Testing Checklist

After implementation:

### Library Collections
- [ ] Navigate to Library
- [ ] Verify "Unassigned" count drops from 111 to ~1
- [ ] Click TWC in sidebar → verify 131 collections appear
- [ ] Click any TWC collection → verify items display correctly

### Vertical Blinds (Bug #4)
- [ ] Navigate to Library → Materials → Vertical tab
- [ ] Verify both `vertical_slats` AND `vertical_fabric` items appear (25+ items)
- [ ] Create a Vertical Blind worksheet
- [ ] Verify fabric selector shows all vertical materials

### Awnings (Bug #5)
- [ ] Navigate to Library → Fabrics → Awnings tab
- [ ] Verify awning_fabric items appear (146 items)
- [ ] Create an Awning worksheet
- [ ] Verify fabric selector filters to awning fabrics only
- [ ] Confirm pricing calculates correctly

### Rules Dropdown (Bug #6)
- [ ] Go to Settings → Products → Templates
- [ ] Select any template → Rules tab
- [ ] Click "Add Rule"
- [ ] Verify dropdown shows ONLY options enabled for that template
- [ ] Verify no options from other templates appear

### New TWC Sync
- [ ] Trigger a new TWC product sync
- [ ] Verify new collections are linked to YOUR TWC vendor (c956c497...)
- [ ] Check database to confirm correct user_id and vendor_id

---

## Impact Analysis

| Area | Status | Notes |
|------|--------|-------|
| Existing TWC items | ✅ Safe | Only updating collection vendor_id |
| Pricing grids | ✅ Safe | Grid matching uses item properties, not collection |
| Other users | ⚠️ Review | May have same issue - need diagnostic query |
| Team members | ✅ Improved | Will now properly share account data |

---

## Prevention Standards

After this fix, we establish:

1. **Always use `accountId`** for tenant-scoped queries in edge functions
2. **Never use `user.id` directly** when team member support is needed
3. **Add memory notes** for patterns that have caused recurring bugs
4. **Test with team member accounts** before releasing multi-tenant features

