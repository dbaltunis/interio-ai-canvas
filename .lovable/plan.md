
# Fix Plan: Revenue Display & Library Awning Filter Issues

## Issues Identified

### Issue 1: Revenue Not Showing for Approved Projects
**Severity**: HIGH - Dashboard shows "Your first sale awaits!" even with approved projects

**Root Cause**: The `useRevenueHistory` hook queries `job_statuses` filtered by the current user's ID:
```typescript
// Line 48-51 in useRevenueHistory.ts
const { data: revenueStatuses } = await supabase
  .from("job_statuses")
  .select("id, name")
  .eq("user_id", effectiveOwnerId);  // ← This is correct
```

BUT for team members, the `effectiveOwnerId` resolves to the parent account owner (correct), however the revenue status lookup uses the status_id from projects, and those projects may reference status IDs from a different user account entirely.

**Database Evidence**:
- Project ORDER-007 (value: $876.23) is owned by `greg@cccone.com.au`
- Uses status "Approved" (id: `b506f057...`) owned by `daniel+ccco@rfmsanz.com`
- Revenue query finds no matching status IDs → returns $0

**Fix**: Instead of filtering statuses by user_id, we should filter projects by status NAME matching revenue criteria, joined to their actual status records.

---

### Issue 2: Awning Fabrics Not Showing in Library "Awnings" Tab
**Severity**: MEDIUM - User-unfriendly experience

**Root Cause**: The filter in `FabricInventoryView.tsx` only matches by exact `subcategory`:
```typescript
// Line 135-138
const matchesCategory = activeCategory === "all" || 
  item.subcategory === activeCategory ||
  (activeCategory === 'curtain_fabric' && item.subcategory === 'roman_fabric');
```

**Database Evidence**:
- Daniel's account has 33 awning fabrics with `subcategory = 'awning_fabric'`
- These ARE correctly fetched via `effectiveOwnerId`
- The AMAZON collection the user was viewing only contains `curtain_fabric` items

The awning fabrics exist but are in different collections. The screenshot shows user filtering by the AMAZON collection which doesn't contain awning items.

**Enhancement Request**: User wants fabrics with `compatible_treatments: ['awning']` to also appear in the Awnings tab, not just those with the exact subcategory. This is the "multi-treatment use case" mentioned.

---

## Implementation Plan

### Fix 1: Revenue Hook - Use Status Name Matching

**File**: `src/hooks/useRevenueHistory.ts`

**Current Logic** (broken for team members):
```typescript
// Get status IDs owned by effective owner
const revenueStatusIds = await getStatusIdsByOwnerId(effectiveOwnerId);
// Query projects with those status IDs
.in("status_id", revenueStatusIds)
```

**New Logic** (works for all users):
```typescript
// Get ALL projects for effective owner
// Join with job_statuses to get status name
// Filter in-memory by status name matching REVENUE_STATUS_NAMES
```

**Changes**:
1. Remove the pre-filter for status IDs
2. Query projects with LEFT JOIN to job_statuses to get status name
3. Filter projects where `LOWER(status_name)` matches `REVENUE_STATUS_NAMES`

**Technical Implementation**:
- Modify lines 47-60 to remove the initial status ID query
- Modify project queries (lines 63-88) to include status name in select
- Add in-memory filter for status names matching revenue criteria

---

### Fix 2: Library Awnings Tab - Include Compatible Treatments

**File**: `src/components/inventory/FabricInventoryView.tsx`

**Current Logic**:
```typescript
const matchesCategory = activeCategory === "all" || 
  item.subcategory === activeCategory ||
  (activeCategory === 'curtain_fabric' && item.subcategory === 'roman_fabric');
```

**New Logic** (includes compatible treatments):
```typescript
const matchesCategory = activeCategory === "all" || 
  item.subcategory === activeCategory ||
  (activeCategory === 'curtain_fabric' && item.subcategory === 'roman_fabric') ||
  // NEW: For awning tab, also include fabrics marked as compatible with awning
  (activeCategory === 'awning_fabric' && 
    item.compatible_treatments?.includes('awning'));
```

**Benefit**: Users who mark a fabric as "compatible with awnings" will see it in the Awnings tab even if its subcategory is something else (e.g., curtain_fabric that can also be used for awnings).

---

## Files to Modify

| File | Change | Effort |
|------|--------|--------|
| `src/hooks/useRevenueHistory.ts` | Fix status matching to work across user accounts | Medium |
| `src/components/inventory/FabricInventoryView.tsx` | Enhance category filter to include compatible_treatments | Low |

---

## Technical Details

### useRevenueHistory.ts Changes

**Remove** (lines 47-60):
```typescript
// First get revenue status IDs for this user
const { data: revenueStatuses } = await supabase
  .from("job_statuses")
  .select("id, name")
  .eq("user_id", effectiveOwnerId);

const revenueStatusIds = revenueStatuses
  ?.filter(s => REVENUE_STATUS_NAMES.includes(s.name.toLowerCase()))
  .map(s => s.id) || [];

if (revenueStatusIds.length === 0) {
  return { data: [], currentTotal: 0, previousTotal: 0, changePercent: 0 };
}
```

**Replace project queries** (lines 63-88) with:
```typescript
// Query projects with their status names joined
const { data: currentProjects } = await supabase
  .from("projects")
  .select(`
    id,
    created_at,
    status_id,
    job_statuses!status_id(name),
    quotes!inner(total_amount)
  `)
  .eq("user_id", effectiveOwnerId)
  .gte("created_at", start.toISOString())
  .lte("created_at", end.toISOString());

// Filter by status name matching revenue criteria
const revenueProjects = currentProjects?.filter(p => {
  const statusName = (p.job_statuses as any)?.name?.toLowerCase() || '';
  return REVENUE_STATUS_NAMES.includes(statusName);
}) || [];
```

### FabricInventoryView.tsx Changes

**Update** lines 135-138:
```typescript
// Map subcategory keys to compatible_treatments values for cross-matching
const CATEGORY_TO_TREATMENT: Record<string, string> = {
  'awning_fabric': 'awning',
  'curtain_fabric': 'curtains',
  'roman_fabric': 'roman_blinds',
  'sheer_fabric': 'sheers',
};

const matchesCategory = activeCategory === "all" || 
  item.subcategory === activeCategory ||
  (activeCategory === 'curtain_fabric' && item.subcategory === 'roman_fabric') ||
  // NEW: Include items with matching compatible_treatments
  (CATEGORY_TO_TREATMENT[activeCategory] && 
    item.compatible_treatments?.includes(CATEGORY_TO_TREATMENT[activeCategory]));
```

---

## Testing Checklist

### Revenue Fix
1. [ ] Log in as Greg (team member under Daniel)
2. [ ] View Home Dashboard Revenue Trend
3. [ ] Verify ORDER-007 ($876.23) appears in the chart
4. [ ] Check that only projects with revenue-qualifying statuses are counted

### Library Awning Tab Fix
1. [ ] Navigate to Library → Fabrics → Awnings tab
2. [ ] Verify awning fabrics appear (should see Daniel's 33 awning items)
3. [ ] If any curtain fabrics are marked `compatible_treatments: ['awning']`, verify they also appear
4. [ ] Clear any collection filter to see all awnings

---

## Edge Cases Considered

- **Team members without parent account**: Fall back to their own user_id (existing behavior preserved)
- **Custom status names**: Already handled - we match against `REVENUE_STATUS_NAMES` array which includes variations
- **Fabrics with multiple compatible treatments**: Will appear in all matching tabs
