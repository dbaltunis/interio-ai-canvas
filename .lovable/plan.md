
# Fix Status Filtering - Use status_id for Custom Statuses

## Problem Identified

The filtering compares the **wrong fields**:

| Component | What it sends | What table compares against |
|-----------|---------------|----------------------------|
| `JobsFilter.tsx` | `status.name.toLowerCase()` → `"lead"` | `project.status` → `"planning"` (legacy) |

### Database Evidence

```text
projects table:
- status (legacy): "planning", "Approved", "CLOSED"  ← OLD field, inconsistent
- status_id: "c2751aaa-..."                          ← NEW field, links to job_statuses

job_statuses table:
- id: "c2751aaa-..."
- name: "Draft", "Lead", "Quote Sent"               ← Per-user custom names
```

The `project.status` is a legacy text field with old values. The **real status** is in `project.status_id`, which links to the user's custom `job_statuses.name`.

---

## Root Cause

1. **Filter dropdown** uses custom status names from `job_statuses` table (e.g., "Lead")
2. **Table filtering** compares against legacy `project.status` field (e.g., "planning")
3. These values **never match** → empty results

The archived filter already works correctly because it uses `status_id` lookup (lines 351-354). The regular status filter doesn't.

---

## Solution

Change the filtering logic to look up the status name via `status_id`, just like the archived filter does:

### File 1: `src/components/jobs/JobsTableView.tsx`

**Line 358 - Current (broken):**
```typescript
return group.project?.status?.toLowerCase() === statusFilter.toLowerCase();
```

**Fixed:**
```typescript
// Look up the actual status name via status_id (custom per-user statuses)
if (!group.project?.status_id) return false;
const projectStatus = jobStatuses.find(s => s.id === group.project.status_id);
return projectStatus?.name?.toLowerCase() === statusFilter.toLowerCase();
```

### File 2: `src/components/jobs/MobileJobsView.tsx`

**Line 144 - Current (broken):**
```typescript
return group.project.status === statusFilter;
```

**Fixed:**
```typescript
// Look up the actual status name via status_id (custom per-user statuses)
if (!group.project?.status_id) return false;
const projectStatus = jobStatuses.find(s => s.id === group.project.status_id);
return projectStatus?.name?.toLowerCase() === statusFilter.toLowerCase();
```

---

## Why This Works with Custom Statuses

| User Action | Filter Value | status_id Lookup | Match? |
|-------------|-------------|------------------|--------|
| Select "Lead" | `"lead"` | Finds `job_statuses.name = "Lead"` via `status_id` | ✅ Yes |
| Select "Draft" | `"draft"` | Finds `job_statuses.name = "Draft"` via `status_id` | ✅ Yes |
| Select custom status | `"custom name"` | Finds matching custom status | ✅ Yes |

The `useJobStatuses()` hook already fetches only the current user's custom statuses, so the lookup will correctly match their defined workflow.

---

## Files to Modify

| File | Line | Change |
|------|------|--------|
| `src/components/jobs/JobsTableView.tsx` | 358 | Use `status_id` lookup instead of legacy `status` field |
| `src/components/jobs/MobileJobsView.tsx` | 144 | Use `status_id` lookup instead of legacy `status` field |

---

## Edge Case: Projects Without status_id

Some older projects may not have a `status_id` set. The fix handles this by returning `false` (no match) for those projects when filtering by a specific status. They will still appear when "All Statuses" is selected.
