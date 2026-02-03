

## Fix Project Details Tab UI Issues

This plan addresses four issues you identified:

1. **Project Notes closed by default** - Should open automatically
2. **Add Client button needs onboarding focus** - Help users find the new compact button
3. **Set start/due date buttons barely visible** - Poor color contrast on hover
4. **Timeline not saving/displaying** - Data sync issues for other users

---

### Issue 1: Project Notes Open by Default

**Current State:** The notes section collapses by default because `isOpen` is initialized to `false` in the component state. *Wait - I see it's actually already `true` on line 25!* However, there's a separate `notesOpen` state in `ProjectDetailsTab.tsx` (line 62) that is set to `false`.

**The Fix:**
Looking at the code, `ProjectNotesCard` already defaults to open (`isOpen = true`). The issue might be the `notesOpen` state in `ProjectDetailsTab.tsx` is not being used correctly or there's a conflicting state. I'll verify `ProjectNotesCard` is being rendered with its own internal state (which is `true`) and remove any conflicting external state control.

**File:** `src/components/jobs/tabs/ProjectDetailsTab.tsx`
- Remove the unused `notesOpen` state variable if it's not controlling the notes card
- Verify `ProjectNotesCard` uses its internal `isOpen = true` default

---

### Issue 2: Add Client Onboarding Focus Point

**Goal:** Show a spotlight tooltip pointing to the client "+" button for first-time users. This should appear 3 times when someone creates a new project without a client assigned.

**Implementation:**
1. Add `data-teaching="add-client-action"` attribute to the Plus button in the client summary bar
2. Create a new teaching point in the configuration that triggers when:
   - User is on the job details page
   - No client is assigned
   - Show maximum 3 times (tracked in localStorage)

**Files:**
- `src/components/jobs/tabs/ProjectDetailsTab.tsx` - Add data-teaching attribute
- `src/config/teachingPoints.ts` - Add new teaching point for client assignment

**Teaching Point Configuration:**
```typescript
{
  id: 'app-job-add-client',
  title: 'Add or Create a Client',
  description: 'Click here to assign an existing client or create a new one for this project.',
  targetSelector: '[data-teaching="add-client-action"]',
  position: 'bottom',
  trigger: { type: 'empty_state', page: '/app', section: 'projects' },
  priority: 'high',
  category: 'app',
  maxShows: 3,  // Show maximum 3 times
}
```

---

### Issue 3: Date Buttons Visibility (Contrast Fix)

**Current State:** The "Set start date" and "Set due date" buttons use `text-muted-foreground` when no date is set. On hover, the background changes but the text color doesn't provide enough contrast.

**The Fix:** Update the button styling to ensure visible text on hover:

**Current (line 476-479):**
```tsx
className={cn(
  "h-7 px-2 font-medium hover:bg-primary/10 hover:text-primary transition-colors",
  !project.start_date && "text-muted-foreground"
)}
```

**Updated:**
```tsx
className={cn(
  "h-7 px-2 font-medium transition-colors",
  project.start_date 
    ? "text-foreground hover:bg-accent hover:text-accent-foreground" 
    : "text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
)}
```

This ensures:
- Text becomes clearly visible on hover (uses `text-primary` which has good contrast)
- Adds a subtle border on hover for better definition
- Works in both light and dark modes

**File:** `src/components/jobs/tabs/ProjectDetailsTab.tsx` (lines 476-479 and 536-539)

---

### Issue 4: Timeline Not Saving/Displaying for Other Users

**Root Cause Analysis:**
1. **Query Invalidation Issue:** When a user updates the project's `start_date` or `due_date`, the `useUpdateProject` hook only invalidates `["projects"]` (the list query), but NOT `["projects", id]` (the single project query). This means other users or the same user on a different tab won't see the updated dates until they fully refresh.

2. **State Sync Issue:** The `formData` state in `ProjectDetailsTab.tsx` is initialized once from `project` props but doesn't update when the `project` prop changes (e.g., from a refetch).

**The Fix:**

**File 1:** `src/hooks/useProjects.ts`
- Update `onSuccess` callback in `useUpdateProject` to also invalidate the specific project query:
```tsx
onSuccess: ({ project, ... }) => {
  queryClient.invalidateQueries({ queryKey: ["projects"] });
  queryClient.invalidateQueries({ queryKey: ["projects", project.id] }); // Add this!
  ...
}
```

**File 2:** `src/components/jobs/tabs/ProjectDetailsTab.tsx`
- Add a `useEffect` to sync `formData` with the `project` prop when it changes:
```tsx
useEffect(() => {
  setFormData({
    name: project.name || "",
    description: project.description || "",
    priority: project.priority || "medium",
    client_id: project.client_id || null,
    start_date: project.start_date || "",
    due_date: project.due_date || "",
  });
}, [project.id, project.start_date, project.due_date, project.client_id, project.name, project.description, project.priority]);
```

---

### Summary of Changes

| File | Change |
|------|--------|
| `src/components/jobs/tabs/ProjectDetailsTab.tsx` | 1. Add `data-teaching` to client + button 2. Fix date button hover contrast 3. Add useEffect for formData sync 4. Remove unused `notesOpen` state |
| `src/hooks/useProjects.ts` | Invalidate specific project query on update |
| `src/config/teachingPoints.ts` | Add "Add Client" teaching point with 3-show limit |

---

### Expected Results

After these changes:
- **Notes Section:** Opens by default when viewing a project
- **Client Button:** New users see a helpful spotlight 3 times pointing them to add a client
- **Date Buttons:** Text is clearly visible on hover with better contrast
- **Timeline Sync:** Dates save and display correctly for all users viewing the job

