

# Enhanced Team Display and Project Activity Log

## Summary of Changes

This plan addresses four requests:
1. **Team column display** - Show owner name only when team members are invited, remove the star
2. **Default behavior for open access** - Best practice recommendation for accounts where all team members have equal access
3. **Notifications when team members are invited** - What happens when assignments are made
4. **Project Activity Log** - A new tab/section to track all project-level events

---

## Part 1: Team Avatar Stack Improvements

### Current State
- Owner always shows with a gold star badge
- Owner avatar is always 28x28px
- No textual name is shown

### Proposed Changes

**Visual Logic:**

| Scenario | Display |
|----------|---------|
| No team assigned | Owner avatar only (no star, no name) |
| Team members assigned | Owner avatar (slightly larger) + name + stacked team avatars |

**File: `src/components/jobs/TeamAvatarStack.tsx`**

```text
BEFORE (always shows):
[★👤]  ← star on all

AFTER (conditional):
No team:     [👤]              ← Just owner avatar, clean
With team:   [👤 Daniel] [MI][KU]  ← Owner with name + team stacked
```

Changes:
- Remove the gold star badge completely
- Only show owner's name when `assignedMembers.length > 0`
- Make owner avatar slightly more prominent when team exists (ring/border highlight)
- Keep the avatar-only display when no team is assigned (clean, minimal)

---

## Part 2: Default Behavior for Open Access Accounts

### Best Practice Recommendation

When an account has "all team has equal access to all projects", displaying every team member on every job would be:
- Visually cluttered
- Redundant information
- Performance-heavy

**Recommended Approach:**

| Scenario | Display | Meaning |
|----------|---------|---------|
| Open access account (no restrictions) | Show owner only | "Everyone has access" is implied |
| Restricted access with explicit assignments | Show owner + assigned members | "Only these people have access" |

**Implementation:** This is already the default behavior. The `project_assignments` table only stores explicit assignments. If a project has no assignments and the account has open permissions, all team members can see it based on role permissions, but they won't be displayed in the Team column.

**Optional Enhancement:** Add a tooltip or indicator "Open to all team members" on hover when no explicit assignments exist but the account has open access settings.

---

## Part 3: Notifications for Team Assignments

### Current State
- When a team member is assigned, a record is inserted into `project_assignments`
- **No notification is sent**
- The assigned member will see the job in their list on next refresh

### Proposed Enhancements

**Option A: In-App Notification (Recommended)**
Create a notification record when assignments are made:

```typescript
// When assigning a team member
await supabase.from('notifications').insert({
  user_id: assignedUserId,
  type: 'project_assigned',
  title: 'New Project Assignment',
  message: `You've been assigned to "${projectName}"`,
  metadata: { project_id: projectId, assigned_by: currentUserId },
  read: false
});
```

**Option B: Email Notification**
Send an email via edge function when assignment is created:
- Subject: "You've been assigned to a new project"
- Body: Project name, client, link to view

**For this plan, we'll implement Option A (in-app notifications).**

---

## Part 4: Project Activity Log (Audit Trail)

### Concept
A dedicated section/tab in the Job Detail page that logs ALL significant events:

| Event Type | Example |
|------------|---------|
| Status changes | "Status changed from Draft to Quote Sent by Daniel at Jan 29, 2026 3:45pm" |
| Team assignments | "Sarah was assigned to this project by Daniel at Jan 28, 2026 10:00am" |
| Emails sent | "Quote email sent to client@email.com by Daniel at Jan 27, 2026" |
| Notes added | "Note added by Sarah at Jan 26, 2026" |
| Quote created | "Quote v1 created by Daniel at Jan 25, 2026" |
| Client linked | "Client 'John Smith' linked to project by Daniel" |

### Database Table

**Table: `project_activity_log`**

```sql
CREATE TABLE project_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_project_activity_project_id ON project_activity_log(project_id);
CREATE INDEX idx_project_activity_created_at ON project_activity_log(created_at DESC);
```

**Activity Types:**
- `status_changed` - Status transitions
- `team_assigned` - Team member added
- `team_removed` - Team member removed
- `email_sent` - Email to client
- `quote_created` - New quote version
- `quote_sent` - Quote emailed/shared
- `note_added` - Note created
- `client_linked` - Client assigned
- `project_created` - Initial creation
- `project_duplicated` - Job duplicated from another

### UI Component

**New Tab: "Activity" in JobDetailPage**

```text
Tabs: [Client] [Project] [Quote] [Workroom] [Activity]
                                              ↑ NEW
```

**Component: `src/components/jobs/tabs/ProjectActivityTab.tsx`**

Features:
- Timeline view with icons per activity type
- Filterable by type (All, Status, Team, Emails)
- Shows user name, action, timestamp
- Expandable for additional details (e.g., "Reason: Client requested changes")

### Automatic Logging Points

Events will be logged automatically at these code locations:

| Event | Hook/Function to Modify |
|-------|------------------------|
| Status change | Already exists in `status_change_history` - will sync to new table |
| Team assignment | `useAssignUserToProject` mutation |
| Email sent | `useProjectCommunicationStats` or email sending function |
| Quote created | `useCreateQuote` mutation |
| Note added | `useCreateProjectNote` |

---

## File Changes Summary

### New Files
| File | Description |
|------|-------------|
| `src/components/jobs/tabs/ProjectActivityTab.tsx` | Activity timeline UI |
| `src/hooks/useProjectActivityLog.ts` | Hook for fetching/creating activity records |
| `supabase/migrations/project_activity_log.sql` | Database table creation |

### Modified Files
| File | Changes |
|------|---------|
| `src/components/jobs/TeamAvatarStack.tsx` | Remove star, show name only when team exists |
| `src/components/jobs/JobDetailPage.tsx` | Add Activity tab |
| `src/hooks/useProjectAssignments.ts` | Log assignment activity + create notification |
| `src/hooks/useLogStatusChange.ts` | Also log to project_activity_log |

---

## Technical Details

### TeamAvatarStack Updates

```tsx
// New display logic
const hasTeamMembers = assignedMembers.length > 0;

return (
  <div className="flex items-center gap-2">
    {/* Owner avatar - always visible */}
    <Avatar className={cn(
      "border-2 border-background",
      hasTeamMembers ? "h-7 w-7 ring-2 ring-primary/20" : "h-6 w-6"
    )}>
      ...
    </Avatar>
    
    {/* Owner name - only when team exists */}
    {hasTeamMembers && (
      <span className="text-xs font-medium text-muted-foreground max-w-[60px] truncate">
        {owner.name.split(' ')[0]}
      </span>
    )}
    
    {/* Team avatars - only when team exists */}
    {hasTeamMembers && (
      <div className="flex -space-x-2">
        {/* ... existing stacked avatars ... */}
      </div>
    )}
  </div>
);
```

### Activity Log Hook

```typescript
export type ProjectActivityType = 
  | 'status_changed'
  | 'team_assigned'
  | 'team_removed'
  | 'email_sent'
  | 'quote_created'
  | 'note_added'
  | 'client_linked'
  | 'project_created'
  | 'project_duplicated';

export const useLogProjectActivity = () => {
  return useMutation({
    mutationFn: async ({
      projectId,
      activityType,
      title,
      description,
      metadata
    }: {
      projectId: string;
      activityType: ProjectActivityType;
      title: string;
      description?: string;
      metadata?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("project_activity_log")
        .insert({
          project_id: projectId,
          user_id: user.id,
          activity_type: activityType,
          title,
          description,
          metadata
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  });
};
```

### RLS Policy for Activity Log

```sql
-- Users can view activity for projects they have access to
CREATE POLICY "View project activities"
ON project_activity_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_activity_log.project_id 
    AND p.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM project_assignments pa 
    WHERE pa.project_id = project_activity_log.project_id 
    AND pa.user_id = auth.uid() 
    AND pa.is_active = true
  )
);

-- Users can insert activity for projects they have access to
CREATE POLICY "Insert project activities"
ON project_activity_log FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## Implementation Order

1. **Phase 1: TeamAvatarStack improvements** (quick win)
   - Remove star
   - Add conditional name display

2. **Phase 2: Project Activity Log table and UI**
   - Create database table
   - Create hook
   - Create tab component
   - Add to JobDetailPage

3. **Phase 3: Automatic logging integration**
   - Integrate with status changes
   - Integrate with team assignments
   - Integrate with email sending
   - Integrate with notes

4. **Phase 4: In-app notifications for assignments**
   - Create notification on assignment
   - Display in notification center

