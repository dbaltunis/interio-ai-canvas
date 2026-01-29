
# Fix Team Assignment Permissions Logic

## The Problem

When you create a new job, the UI shows **"All team has access"** with all team members selected by default. However, this is **incorrect** because:

1. **Mike** has the role `Staff` with only `view_assigned_jobs` permission (NOT `view_all_jobs`)
2. Without `view_all_jobs`, Mike can **only** see jobs he is explicitly assigned to
3. The current UI is misleading - it implies Mike has access when he actually doesn't

### Screenshot Analysis
From your screenshot of Mike's permissions:
- `View All Jobs` = **OFF** (disabled)
- `View Assigned Jobs` = **ON** (enabled with "Default" badge)
- This means Mike can **only see jobs he's explicitly assigned to**

## Root Cause

The `ProjectTeamAssignDialog` and `TeamAvatarStack` components don't consider **each team member's individual job viewing permissions**. They just show all team members and assume everyone has access.

## The Solution

We need to differentiate between:
1. **Users with `view_all_jobs`**: Can see all jobs automatically (no assignment needed)
2. **Users with only `view_assigned_jobs`**: Can ONLY see jobs they're explicitly assigned to

### Visual Standards (Updated)

| Scenario | Team Column Display |
|----------|---------------------|
| All team members have `view_all_jobs` | Owner + "All team" badge |
| Some members only have `view_assigned_jobs` | Owner + avatars of those with access + lock icon |
| Restricted (explicit assignments) | Owner + assigned avatars + lock icon |

### Dialog Behavior (Updated)

The "Limit Access" dialog should show:
1. **Section 1: Full Access** - Team members with `view_all_jobs` (always have access, can't be unchecked)
2. **Section 2: Requires Assignment** - Team members with only `view_assigned_jobs` (can be checked/unchecked)

## Implementation Plan

### Step 1: Create a Hook to Fetch Team Members with Their Permissions

Create a new hook `useTeamMembersWithJobPermissions` that:
- Fetches all team members (like `useTeamMembers`)
- Also fetches each member's `view_all_jobs` and `view_assigned_jobs` permissions
- Returns members categorized by their access level

```typescript
// New hook: src/hooks/useTeamMembersWithJobPermissions.ts

interface TeamMemberWithAccess extends TeamMember {
  hasViewAllJobs: boolean;
  hasViewAssignedJobs: boolean;
}

export const useTeamMembersWithJobPermissions = () => {
  // Fetch team members
  // For each member, call RPC get_user_effective_permissions
  // Categorize: fullAccess vs needsAssignment
};
```

### Step 2: Update ProjectTeamAssignDialog

Modify the dialog to:
1. Show members with `view_all_jobs` in a separate section (or with a badge)
2. Only allow assignment changes for members with `view_assigned_jobs`
3. Update the description to explain the access model

```tsx
// Updated dialog sections:
<DialogDescription>
  Team members with "View All Jobs" permission always have access.
  Other team members need to be assigned to see this job.
</DialogDescription>

{/* Full Access Section */}
<div className="border-b pb-3">
  <p className="text-xs text-muted-foreground mb-2">
    Always have access (View All Jobs permission)
  </p>
  {fullAccessMembers.map(member => (
    <div className="opacity-60">
      <Avatar /> {member.name}
      <Badge>Full Access</Badge>
    </div>
  ))}
</div>

{/* Assignment Required Section */}
<div>
  <p className="text-xs text-muted-foreground mb-2">
    Requires assignment to access
  </p>
  {needsAssignmentMembers.map(member => (
    <div onClick={() => handleToggle(member.id)}>
      <Checkbox checked={selectedMembers[member.id]} />
      <Avatar /> {member.name}
    </div>
  ))}
</div>
```

### Step 3: Update TeamAvatarStack

Update the component to:
1. Receive information about who has `view_all_jobs` vs `view_assigned_jobs`
2. Calculate actual access:
   - Members with `view_all_jobs` = always have access
   - Members with `view_assigned_jobs` = only have access if assigned
3. Display accurate access status

```tsx
// Props update
interface TeamAvatarStackProps {
  owner: TeamMemberInfo;
  assignedMembers?: TeamMemberInfo[];
  fullAccessMembers?: TeamMemberInfo[]; // NEW: members with view_all_jobs
  maxVisible?: number;
  onClick?: () => void;
}

// Logic update
const totalWithAccess = fullAccessMembers.length + assignedMembers.length;
const showAllTeamBadge = fullAccessMembers.length === totalTeamSize - 1; // -1 for owner
```

### Step 4: Update JobsTableView

Pass the additional permission data to `TeamAvatarStack`:
- Fetch team members with their permissions
- Pass both `assignedMembers` and `fullAccessMembers` to the component

## Database Query for Permissions

Use the existing `get_user_effective_permissions` RPC function to check each team member's permissions:

```sql
SELECT 
  up.user_id,
  up.display_name,
  'view_all_jobs' = ANY(get_user_effective_permissions(up.user_id)) as has_view_all_jobs,
  'view_assigned_jobs' = ANY(get_user_effective_permissions(up.user_id)) as has_view_assigned_jobs
FROM user_profiles up
WHERE up.parent_account_id = :account_owner_id
   OR up.user_id = :account_owner_id
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useTeamMembersWithJobPermissions.ts` | **CREATE** | New hook to fetch team members with their job viewing permissions |
| `src/components/jobs/ProjectTeamAssignDialog.tsx` | Modify | Separate full access vs needs assignment members |
| `src/components/jobs/TeamAvatarStack.tsx` | Modify | Accept and display full access members |
| `src/components/jobs/JobsTableView.tsx` | Modify | Use new hook and pass data to TeamAvatarStack |

## Edge Cases

### User with Both Permissions
If a user has BOTH `view_all_jobs` AND `view_assigned_jobs`, treat them as "Full Access" (view_all_jobs takes precedence).

### Dealers
Dealers only have `view_assigned_jobs`, so they should always appear in the "Requires Assignment" section.

### New Team Member Added to Account
When a new team member joins:
- If they have `view_all_jobs` by role → they automatically see all jobs
- If they only have `view_assigned_jobs` → they only see jobs assigned to them (not existing unassigned jobs)

## Memory Update

After implementation, update the memory entry for "multi-team-assignment-ui-standard" to include:

> The multi-team assignment system respects user permissions. Members with `view_all_jobs` permission always have access to all jobs (shown as "Full Access"). Members with only `view_assigned_jobs` permission can only see jobs they're explicitly assigned to. The "Limit Access" dialog shows both categories separately - full access members are displayed but cannot be toggled, while assignment-required members can be checked/unchecked.

## Summary

1. **Create hook** to fetch team permissions per member
2. **Update dialog** to show two sections: Full Access vs Requires Assignment
3. **Update avatar stack** to accurately reflect who has access
4. **Update table view** to pass correct data

This ensures the UI accurately reflects who can actually see each job based on their permissions.
