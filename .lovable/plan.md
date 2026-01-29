
# Multi-Team Member Assignment for Jobs

## Overview

This feature adds the ability to:
1. Assign multiple team members to a job from the Team column
2. Display a stacked avatar group showing the owner (with a star) and assigned team members
3. Click on the Team column to open a selection dialog for adding/removing team members
4. Persist assignments using the existing `project_assignments` database table

---

## Current State Analysis

### What Already Exists

| Component | Status | Notes |
|-----------|--------|-------|
| `project_assignments` table | Exists | Stores user_id, project_id, role, is_active |
| `useProjectAssignments` hook | Exists | Full CRUD operations for assignments |
| `JobTeamInviteDialog` | Exists | Multi-select team member dialog (uses quotes table) |
| Team column in JobsTableView | Exists | Currently shows only the project owner |

### What Needs to Change

| Area | Change Required |
|------|-----------------|
| Team column display | Show stacked avatars instead of single owner |
| Click behavior | Open multi-select team dialog on column click |
| Data source | Use `project_assignments` table (not quotes.template_custom_data) |
| Visual design | Owner gets star indicator, team members stack in half-circle |

---

## Implementation Plan

### Phase 1: Create Stacked Avatar Component

Create a new component `TeamAvatarStack` that displays:
- Owner avatar with a gold star overlay
- Additional team members as overlapping circles (max 3 visible)
- "+N" indicator if more than 3 additional members
- Clickable to open assignment dialog

```text
┌───────────────────────────────────┐
│  [★👤]                            │  ← Owner with star
│      [👤][👤][👤] +2              │  ← Team members stacked + overflow
└───────────────────────────────────┘
```

**File**: `src/components/jobs/TeamAvatarStack.tsx`

### Phase 2: Create Enhanced Team Selection Dialog

Modify or replace `JobTeamInviteDialog` to:
- Use `project_assignments` table (not quotes.template_custom_data)
- Show currently assigned members with checkboxes pre-selected
- Allow bulk selection/deselection
- Include search filtering
- Display role badges for each team member

**File**: `src/components/jobs/ProjectTeamAssignDialog.tsx`

### Phase 3: Update JobsTableView Team Column

Modify the Team column rendering in `JobsTableView.tsx` to:
- Fetch assignments per project
- Render `TeamAvatarStack` component
- Pass click handler to open assignment dialog

**Lines to modify**: 927-952 (case 'team')

### Phase 4: Add Bulk Fetch for Assignments

Create a new hook `useProjectsWithAssignments` that:
- Fetches assignments for all visible projects in a single query
- Returns a map of projectId → assignments[]
- Optimizes performance by batching database calls

**File**: `src/hooks/useProjectsWithAssignments.ts`

---

## Technical Details

### TeamAvatarStack Component API

```typescript
interface TeamAvatarStackProps {
  owner: {
    id: string;
    name: string;
    initials: string;
    avatarUrl?: string;
    color: string;
  };
  assignedMembers: Array<{
    id: string;
    name: string;
    initials: string;
    avatarUrl?: string;
    role: string;
  }>;
  maxVisible?: number; // default: 3
  onClick?: () => void;
}
```

### Visual Design Specifications

| Element | Style |
|---------|-------|
| Owner avatar | 28x28px, gold star overlay in top-right corner |
| Team avatars | 24x24px, overlapping by 8px, border: 2px white |
| Overflow indicator | "+N" text, muted-foreground color |
| Container | flex row, items-center, gap-1 |

### Star Badge for Owner

```css
/* Gold star overlay */
.owner-star {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #fbbf24; /* amber-400 */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Database Query for Bulk Assignments

```sql
SELECT pa.*, up.display_name, up.avatar_url, up.role as user_role
FROM project_assignments pa
LEFT JOIN user_profiles up ON up.user_id = pa.user_id
WHERE pa.project_id IN (...project_ids)
AND pa.is_active = true
ORDER BY pa.assigned_at DESC
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/jobs/TeamAvatarStack.tsx` | Create | Stacked avatar display component |
| `src/components/jobs/ProjectTeamAssignDialog.tsx` | Create | Multi-select assignment dialog using project_assignments |
| `src/hooks/useProjectsWithAssignments.ts` | Create | Bulk fetch hook for assignments |
| `src/components/jobs/JobsTableView.tsx` | Modify | Update Team column rendering |
| `src/hooks/useProjectAssignments.ts` | Modify | Add bulk assign mutation |

---

## RLS Considerations

The `project_assignments` table should already have RLS policies. We need to verify:
1. Team members can read assignments for projects they own OR are assigned to
2. Only project owners/admins can insert/delete assignments
3. Multi-tenant isolation is maintained via `parent_account_id`

---

## User Flow

1. User views Jobs list → sees Team column with stacked avatars
2. User clicks on Team column → opens ProjectTeamAssignDialog
3. User searches/filters team members → selects multiple via checkboxes
4. User clicks "Save Assignments" → inserts/removes from project_assignments
5. Team column updates to show new stacked avatars
6. Assigned team members can now see the job in their dashboard (if permission allows)

---

## Future Enhancements (Not in Scope)

- Role-based filtering (only show installers for install jobs)
- Notification to assigned team members
- Calendar integration for assigned members
- Permission levels per assignment (view-only, edit, admin)
