
# Fix Job Detail Page Header to Show Project Name with Inline Editing

## Problem Summary

The job detail page header is currently displaying the **client name** ("Evelina") instead of the **project name** ("New Job 1/29/2026"). This makes it confusing because users see the same information twice - in the header and in the Client Assignment card.

## Current Behavior

| Location | What it shows |
|----------|--------------|
| Header (main title) | Client name (e.g., "Evelina") |
| Subtitle | Date only (e.g., "29-Jan-2026") |
| Client Assignment card | Client name again |
| Project tab | Project name is buried inside |

## Proposed Behavior

| Location | What it shows |
|----------|--------------|
| Header (main title) | **Project name** (e.g., "New Job 1/29/2026") with pencil edit icon |
| Subtitle | Client name + Date (e.g., "Evelina • 29-Jan-2026") |
| Client Assignment card | Full client details (as it is now) |

---

## Implementation

### File: `src/components/jobs/JobDetailPage.tsx`

**Changes to make:**

1. **Add inline editing state** (similar to `ProjectHeader.tsx` lines 89-92):
   - `isEditingName` - boolean to toggle edit mode
   - `editedName` - string holding the edited value
   - `isSavingName` - boolean for save loading state

2. **Add name editing handlers**:
   - `handleSaveName()` - calls `updateProject.mutateAsync({ id: project.id, name: editedName })`
   - `handleCancelEdit()` - resets editedName and exits edit mode

3. **Add permission check for editing**:
   - Import `useCanEditJob` hook
   - Use `ProjectStatusProvider` to get `isLocked` status
   - Combine: `canEdit = canEditJob && !isLocked`

4. **Update header JSX (lines 871-886)**:

   Before:
   ```tsx
   {client && (
     <h1 className="...">
       {client.name}  // Client name
     </h1>
   )}
   <span className="...">{formattedCreatedDate}</span>
   ```

   After:
   ```tsx
   {/* Project Name - editable */}
   {isEditingName ? (
     <div className="flex items-center gap-2">
       <Input
         value={editedName}
         onChange={(e) => setEditedName(e.target.value)}
         onKeyDown={(e) => {
           if (e.key === 'Enter') handleSaveName();
           if (e.key === 'Escape') handleCancelEdit();
         }}
         autoFocus
       />
       <Button onClick={handleSaveName}>✓</Button>
       <Button onClick={handleCancelEdit}>✕</Button>
     </div>
   ) : (
     <div className="flex items-center gap-2">
       <h1>{project.name || "Untitled Project"}</h1>
       {canEdit && <Button onClick={() => setIsEditingName(true)}><Pencil /></Button>}
       {/* Duplicate indicator stays */}
     </div>
   )}
   
   {/* Client name + date as subtitle */}
   <span className="text-muted-foreground">
     {client?.name} • {formattedCreatedDate}
   </span>
   ```

5. **Add useEffect to sync editedName with project.name**:
   ```tsx
   useEffect(() => {
     setEditedName(project?.name || "");
   }, [project?.name]);
   ```

---

## Permission & Lock Handling

The edit pencil button will only show when:
1. User has `canEditJob` permission (via `useCanEditJob` hook)
2. Project is NOT in a locked status

This matches the existing pattern used in:
- `ProjectHeader.tsx` (line 410): `{canEditJob && currentStatusInfo?.action !== 'locked' && ...}`
- `ProjectJobsHeader.tsx` (line 114): `{canEditJob && ...}`

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/jobs/JobDetailPage.tsx` | Add editing state, handlers, update header JSX to show project name with inline editing |

---

## Technical Notes

- Imports needed: `Pencil`, `Check`, `X` from lucide-react (Check/X may already be imported)
- Need to wrap content in `ProjectStatusProvider` or use existing status context
- The `updateProject` mutation is already imported and available in the component
- Uses same UX pattern as `ProjectHeader.tsx` for consistency
