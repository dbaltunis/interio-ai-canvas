

# Fix Client Projects & Files Issues

## Overview

Two bugs are preventing clients from displaying their projects and files properly:

1. **Projects not showing in client profile** - Team members create projects, but the client detail page query filters by account owner's ID
2. **Files/Documents breaking the page** - Infinite loop caused by date formatting callback

---

## Bug 1: Projects Not Showing

### What's Happening

When viewing a client profile, you see "No projects yet" even though the client list shows they have projects:

| Client List | Client Profile |
|-------------|----------------|
| Shows "1 project" | Shows "No projects yet" |

**Database evidence:**
- Client "Sacha Test" has project created by team member `sacha` (user_id: `42fdc9d1`)
- Team member has `parent_account_id`: `b0c727dd` (account owner)
- Account owner views client and queries for `user_id = b0c727dd` (their ID)
- Project has `user_id = 42fdc9d1` (team member's ID)
- Query returns nothing

### The Fix

**File:** `src/hooks/useClientJobs.ts`

Change the query to rely on RLS (like `useProjects` does) instead of filtering by `user_id`:

```typescript
// BEFORE (broken):
.eq("user_id", effectiveOwnerId)
.eq("client_id", clientId)

// AFTER (fixed):
.eq("client_id", clientId)
// RLS handles account-level filtering automatically
```

The same fix applies to:
- `useClientStats` - client stats with projects
- `useClientQuotes` - quotes linked to client projects
- `useClientEmails` - emails for the client

---

## Bug 2: Files Section Crashes

### What's Happening

Console error:
```
Maximum update depth exceeded. This can happen when a component 
calls setState inside useEffect...
ClientFilesManager@...tsx:24
```

The date formatting hook causes an infinite render loop:

```typescript
// This creates a NEW function on every render
const { formattedDates } = useFormattedDates(files, (file) => file.created_at);
```

Because the arrow function is created fresh each render, the hook's dependency array sees a "changed" function, triggering a re-render.

### The Fix

**File:** `src/components/clients/ClientFilesManager.tsx`

Memoize the callback function:

```typescript
import { useCallback } from "react";

// Stable function reference
const getFileDate = useCallback((file: any) => file.created_at, []);
const { formattedDates } = useFormattedDates(files, getFileDate);
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useClientJobs.ts` | Remove `.eq("user_id", effectiveOwnerId)` from all queries, rely on RLS |
| `src/components/clients/ClientFilesManager.tsx` | Memoize the `getDate` callback with `useCallback` |

---

## What This Fixes

After implementation:
- **Projects visible**: Account owners see ALL projects for a client (including those created by team members)
- **Files section works**: No more infinite loop crash, files display correctly with preview buttons

---

## Technical Notes

### Why RLS Works for Projects

The RLS policy on `projects` table uses:
```sql
get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
```

This returns all projects where the viewer and the project creator belong to the same account - exactly what we need for multi-tenant visibility.

