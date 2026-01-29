
# Team Assignment System - Standards and Implementation

## Confirmed Business Rules

Based on your answers, here are the **confirmed standards**:

| Rule | Standard |
|------|----------|
| **Who sees "Limit Access"** | Anyone with `manage_team` permission |
| **Default Team Column** | Owner avatar + "All team" badge |
| **Restricted Team Column** | Owner avatar + assigned member avatars + lock icon overlay on last avatar |

---

## Visual Standards

### Default State (All Team Has Access)

When a job is created and no access restrictions are set:

```text
┌──────────────────────────────────────────┐
│  [👤 Owner Avatar]  All team             │
│                     ────────             │
│                     (small badge)        │
└──────────────────────────────────────────┘
```

### Restricted State (Some Members Removed)

When the owner restricts access (e.g., 4 of 6 members have access):

```text
┌──────────────────────────────────────────┐
│  [👤 Owner] [🔒📷] [📷] [📷]             │
│                                          │
│  The lock icon overlays the first        │
│  team avatar to indicate restriction     │
└──────────────────────────────────────────┘
```

The lock icon on an avatar indicates "access is restricted" - not everyone on the team can see this job.

---

## Permission Logic

### Who Sees "Limit Access" Button?

```typescript
// In JobsTableView.tsx and JobDetailPage.tsx
const canManageTeamAccess = useHasPermission('manage_team');

// Show button only if user has manage_team permission
{canManageTeamAccess && (
  <DropdownMenuItem onClick={() => openTeamDialog()}>
    <ShieldCheck className="mr-2 h-4 w-4" />
    Limit Access
  </DropdownMenuItem>
)}
```

### Who Gets Listed in Team Dialog?

The dialog lists all team members the current user can see (from `useTeamMembers`). However, the dialog itself is only accessible to users with `manage_team` permission.

For limited users (e.g., Staff with only `view_assigned_jobs`):
- They will NOT see the "Limit Access" button at all
- They can only see jobs assigned to them
- The Team column still shows who has access (for transparency)

---

## Assignment Logic (Already Implemented)

The current "limit access" model from the previous change works as follows:

1. **New Job Created**: All team members are **selected by default** (full access)
2. **Opening Dialog**: Shows all team members with checkboxes, all checked
3. **Restricting Access**: User unchecks members they want to restrict
4. **Saving**: Only checked members remain assigned to the project

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/jobs/TeamAvatarStack.tsx` | Add "All team" badge for default state, add lock icon overlay for restricted state |
| `src/components/jobs/JobsTableView.tsx` | Add permission check for "Limit Access" button, rename from "Invite team" to "Limit Access" |
| `src/components/jobs/ProjectTeamAssignDialog.tsx` | Update dialog title/description to match "Limit Access" terminology |

---

## Technical Implementation Details

### 1. Update TeamAvatarStack.tsx

**Default State (No assignments = everyone has access)**:
- Show: Owner avatar + "All team" badge
- Logic: If `assignedMembers.length === 0`, show the badge

**Restricted State (Has specific assignments)**:
- Show: Owner avatar + assigned member avatars + lock icon overlay on first member avatar
- Logic: If `assignedMembers.length > 0`, show avatars with lock indicator

```tsx
// Determine if access is restricted
const isRestricted = assignedMembers.length > 0;
const isFullAccess = assignedMembers.length === 0;

// Render different UIs
{isFullAccess && (
  <Badge variant="secondary" className="text-xs">All team</Badge>
)}

{isRestricted && (
  <div className="flex -space-x-2.5">
    {/* First avatar with lock overlay */}
    <div className="relative">
      <Avatar>...</Avatar>
      <Lock className="absolute -top-1 -right-1 h-3 w-3 text-amber-600" />
    </div>
    {/* Other avatars */}
    ...
  </div>
)}
```

### 2. Update JobsTableView.tsx

Add permission check before showing the menu item:

```tsx
const canManageTeamAccess = useHasPermission('manage_team');

// In the dropdown menu:
{canManageTeamAccess && (
  <DropdownMenuItem onClick={() => openTeamDialog()}>
    <ShieldCheck className="mr-2 h-4 w-4" />
    Limit Access
  </DropdownMenuItem>
)}
```

### 3. Update ProjectTeamAssignDialog.tsx

Update labels to match the "Limit Access" model:
- Title: "Limit Access" (instead of "Manage Team Access")
- Description: "All team members have access by default. Unselect members to restrict access."
- Button: "Save" or "Update Access"

---

## Edge Cases

### User With Only `view_assigned_jobs` Permission

- They see jobs assigned to them
- The Team column shows owner + assigned avatars (or "All team")
- They do NOT see "Limit Access" button (no `manage_team` permission)
- They cannot modify who has access

### New User Joins Account

- If no assignments exist on a job, they can see it (full access default)
- If assignments exist and they're not in the list, they cannot see it (RLS enforced)

### Single-User Account

- Team column shows just the owner avatar
- No "All team" badge (no team to show)
- "Limit Access" button shows but dialog would be empty

---

## Memory Update

After implementation, the memory should be updated to reflect:

> **Multi-Team Assignment UI Standard**: The multi-team assignment system allows delegating projects to multiple users via the `project_assignments` table. The UI for displaying these assignments uses a stacked avatar group. When NO assignments exist (default = all team access), show owner avatar + "All team" badge. When assignments exist (restricted access), show owner avatar with team avatars and a lock icon overlay on the first team avatar. The assignment dialog is accessible ONLY to users with `manage_team` permission via "Limit Access" in the Actions dropdown. The dialog operates on a "limit access" model: all team members are displayed as selected by default, and users unselect those they wish to restrict access for.

---

## Summary

1. **Rename button**: "Invite team" → "Limit Access"
2. **Add permission check**: Only show button if user has `manage_team`
3. **Update Team column display**:
   - No assignments → Owner + "All team" badge
   - Has assignments → Owner + avatars + lock icon indicator
4. **Dialog already correct**: Uses "limit access" model from previous change
