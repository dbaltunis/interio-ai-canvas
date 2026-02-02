
# Fix Plan: Infinite Re-render Bug & Calculation Display Mismatches

## Problem Summary

### Issue #1: Maximum Update Depth Exceeded Error
The console shows a "Maximum update depth exceeded" error originating from `useFormattedDate.ts` inside `ProjectNotesCard.tsx`. This causes the page to crash or become unresponsive.

### Issue #2: Calculation Formula Mismatches in Room Window View
Previously addressed seam allowance display issue, but need to verify complete fix and check for remaining formula display inconsistencies.

---

## Root Cause Analysis

### Issue #1: Infinite Re-render Loop

**Location:** `src/hooks/useFormattedDate.ts` (line 78)

```typescript
useEffect(() => {
  formatDates();
}, [items, getDate, includeTime]);  // ← getDate causes infinite loop!
```

**Problem:** The `getDate` function is passed as a dependency to `useEffect`. When components pass an **inline arrow function** like:

```typescript
// ProjectNotesCard.tsx line 29
const { formattedDates } = useFormattedDates(notes, (n) => n.created_at, true);
```

This creates a **new function reference on every render**, causing the `useEffect` to run again, which calls `setFormattedDates`, triggering another render, creating an **infinite loop**.

**Affected Components:**
| File | Line | Code |
|------|------|------|
| `ProjectNotesCard.tsx` | 29 | `(n) => n.created_at` |
| `JobsTable.tsx` | 39 | `(q) => q.created_at` |
| `JobsDashboard.tsx` | 18-19 | `(p) => p.created_at`, `(q) => q.created_at` |
| `JobGridView.tsx` | 21 | `(j) => j.created_at` |
| `ClientQuotesList.tsx` | 25 | `(quote) => quote.created_at` |
| `ClientProjectsList.tsx` | 40 | `(p) => p.due_date` |
| `ClientManagement.tsx` | 23 | `(client) => client.created_at` |

**Correct Pattern (already exists in codebase):**
```typescript
// ClientFilesManager.tsx lines 39-41 - CORRECT
const getFileDate = useCallback((file: any) => file.created_at, []);
const { formattedDates } = useFormattedDates(files, getFileDate);
```

### Issue #2: Seam Allowance Display

This was already fixed in the previous approved plan. The seam allowance was removed from the Height Breakdown display (lines 766-770 show the removal comment). The fix is in place.

---

## Fix Plan

### Phase 1: Fix Infinite Re-render Bug

**Fix all 7 affected components** by wrapping the `getDate` function in `useCallback`:

#### 1. `src/components/jobs/ProjectNotesCard.tsx`
```typescript
// BEFORE (line 29):
const { formattedDates } = useFormattedDates(notes, (n) => n.created_at, true);

// AFTER:
const getNotesDate = useCallback((n: any) => n.created_at, []);
const { formattedDates } = useFormattedDates(notes, getNotesDate, true);
```

#### 2. `src/components/jobs/JobsTable.tsx`
```typescript
// BEFORE (line 39):
const { formattedDates } = useFormattedDates(quotes, (q) => q.created_at, false);

// AFTER:
const getQuoteDate = useCallback((q: any) => q.created_at, []);
const { formattedDates } = useFormattedDates(quotes, getQuoteDate, false);
```

#### 3. `src/components/jobs/JobsDashboard.tsx`
```typescript
// BEFORE (lines 18-19):
const { formattedDates: projectDates } = useFormattedDates(projects, (p) => p.created_at, false);
const { formattedDates: quoteDates } = useFormattedDates(quotes, (q) => q.created_at, false);

// AFTER:
const getProjectDate = useCallback((p: any) => p.created_at, []);
const getQuoteDate = useCallback((q: any) => q.created_at, []);
const { formattedDates: projectDates } = useFormattedDates(projects, getProjectDate, false);
const { formattedDates: quoteDates } = useFormattedDates(quotes, getQuoteDate, false);
```

#### 4. `src/components/jobs/JobGridView.tsx`
```typescript
// BEFORE (line 21):
const { formattedDates } = useFormattedDates(jobs, (j) => j.created_at, false);

// AFTER:
const getJobDate = useCallback((j: any) => j.created_at, []);
const { formattedDates } = useFormattedDates(jobs, getJobDate, false);
```

#### 5. `src/components/clients/ClientQuotesList.tsx`
```typescript
// BEFORE (line 25):
const { formattedDates } = useFormattedDates(quotes, (quote) => quote.created_at);

// AFTER:
const getQuoteDate = useCallback((quote: any) => quote.created_at, []);
const { formattedDates } = useFormattedDates(quotes, getQuoteDate);
```

#### 6. `src/components/clients/ClientProjectsList.tsx`
```typescript
// BEFORE (line 40):
const { formattedDates: dueDates } = useFormattedDates(projects, (p) => p.due_date, false);

// AFTER:
const getProjectDueDate = useCallback((p: any) => p.due_date, []);
const { formattedDates: dueDates } = useFormattedDates(projects, getProjectDueDate, false);
```

#### 7. `src/components/clients/ClientManagement.tsx`
```typescript
// BEFORE (lines 21-25):
const { formattedDates } = useFormattedDates(
  clients,
  (client) => client.created_at,
  false
);

// AFTER:
const getClientDate = useCallback((client: any) => client.created_at, []);
const { formattedDates } = useFormattedDates(clients, getClientDate, false);
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/jobs/ProjectNotesCard.tsx` | Add `useCallback` import and wrap getDate |
| `src/components/jobs/JobsTable.tsx` | Add `useCallback` import and wrap getDate |
| `src/components/jobs/JobsDashboard.tsx` | Add `useCallback` import and wrap both getDate functions |
| `src/components/jobs/JobGridView.tsx` | Add `useCallback` import and wrap getDate |
| `src/components/clients/ClientQuotesList.tsx` | Add `useCallback` import and wrap getDate |
| `src/components/clients/ClientProjectsList.tsx` | Add `useCallback` import and wrap getDate |
| `src/components/clients/ClientManagement.tsx` | Add `useCallback` import and wrap getDate |

---

## Verification Checklist

| Test | Expected Result |
|------|-----------------|
| Open a project with notes | No "Maximum update depth" error |
| View Jobs table | Page loads without freezing |
| View Jobs dashboard | Dates display correctly |
| View Jobs grid view | No console errors |
| Check Client Quotes list | Loads without infinite loop |
| Check Client Projects list | Loads without infinite loop |
| Check Client Management | Loads without infinite loop |

---

## Technical Notes

### Why `useCallback` Fixes This

React's `useCallback` hook memoizes a function, returning the **same function reference** across re-renders (unless dependencies change). This prevents the `useEffect` in `useFormattedDates` from re-running on every render.

```typescript
// Without useCallback - new function reference every render
(n) => n.created_at  // Different reference each time

// With useCallback - stable function reference
const fn = useCallback((n) => n.created_at, []);  // Same reference unless deps change
```

### Alternative Fix (Not Recommended)

We could also fix this in `useFormattedDate.ts` by using a ref for `getDate`, but fixing at the call sites is cleaner and more explicit about the contract of the hook.
