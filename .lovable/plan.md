
# Changes Implementation Plan

Based on your requests, here are the changes needed:

---

## 1. Dynamic "Invite Team" vs "Limit Access" Label

**Current Issue**: The menu always shows "Limit Access", but it should show "Invite team" when staff members (with `view_assigned_jobs` only) have **not** been invited yet, and "Limit Access" when they have been invited.

**Logic**:
- If there are `needsAssignmentMembers` and **none** of them are assigned → Show "Invite team" 
- If there are `needsAssignmentMembers` and **some or all** are assigned → Show "Limit Access"
- If all team members have `view_all_jobs` (no one needs assignment) → Show "Limit Access" (or hide entirely since there's nothing to manage)

**Files to Modify**:
- `src/components/jobs/JobsTableView.tsx` - Update menu item label based on assignment status

---

## 2. Fix: Admins Can Manage Job Access

**Current Issue**: Admins can't use the "Limit Access" feature even though they have `manage_team` permission.

**Root Cause Analysis**: Need to verify the permission check. According to `ROLE_PERMISSIONS`:
- Admin role **does have** `manage_team` permission ✓

**Investigation Needed**: Check if there's a bug in how the `canManageTeamAccess` permission is being evaluated. The check uses `useHasPermission('manage_team')` which should return true for Admins.

**Likely Fix**: The permission hook may not be merging role-based permissions correctly with custom permissions.

---

## 3. Remove Separate Activity Tab from Job Detail

**Current Issue**: There's a separate "Activity" tab in the job detail page that duplicates the `ProjectActivityCard` in the Client tab.

**Solution**: Remove the "Activity" tab from `allTabs` array in `JobDetailPage.tsx`. The activity will remain visible only in the `ProjectDetailsTab` (Client tab) via the `ProjectActivityCard`.

**Files to Modify**:
- `src/components/jobs/JobDetailPage.tsx` - Remove activity tab from `allTabs` array and remove the `TabsContent` for activity

---

## 4. Add More Activity Types to Track

**Current Activity Types** (from `useProjectActivityLog.ts`):
- `status_changed`
- `team_assigned` / `team_removed`
- `email_sent`
- `quote_created` / `quote_sent`
- `note_added`
- `client_linked`
- `project_created`
- `project_duplicated`

**New Activity Types to Add**:

| Event | Activity Type | Where to Log |
|-------|--------------|--------------|
| Room created | `room_added` | When a new room is added |
| Window/Surface created | `window_added` | When a new window is added |
| Treatment created | `treatment_added` | When a treatment is added |
| Client added to job | `client_added` | When a client is linked (already `client_linked`) |
| Share link created | `share_link_created` | When a share link is generated |
| PDF saved/exported | `pdf_exported` | When a PDF is generated |

**Files to Modify**:
- `src/hooks/useProjectActivityLog.ts` - Add new activity types
- `src/components/jobs/ProjectActivityCard.tsx` - Add icons and colors for new types
- `src/components/jobs/tabs/ProjectActivityTab.tsx` - Add icons, colors, and labels for new types
- Various hooks/components that create rooms, windows, treatments, share links, PDFs - Add activity logging

---

## Detailed Implementation

### Step 1: Dynamic Menu Label in JobsTableView.tsx

```typescript
// In the renderCellContent function for 'actions' case:
// Calculate if any needs-assignment members are assigned to this project
const projectAssignments = projectAssignmentsMap[project.id] || [];
const needsAssignmentIds = new Set(
  (teamPermissionsData?.needsAssignmentMembers ?? []).map(m => m.id)
);
const hasAnyNeedsAssignmentAssigned = projectAssignments.some(
  a => needsAssignmentIds.has(a.user_id)
);

// Show "Invite team" when staff aren't invited, "Limit Access" when they are
const menuLabel = hasAnyNeedsAssignmentAssigned ? "Limit Access" : "Invite team";
const MenuIcon = hasAnyNeedsAssignmentAssigned ? ShieldCheck : UserPlus;
```

### Step 2: Remove Activity Tab from JobDetailPage.tsx

Remove the activity tab from the `allTabs` array (line 845):
```typescript
const allTabs = [
  { id: "details", label: "Client", mobileLabel: "Client", icon: PixelUserIcon, disabled: false },
  { id: "rooms", label: "Project", mobileLabel: "Project", icon: PixelClipboardIcon, disabled: false },
  { id: "quotation", label: "Quote", mobileLabel: "Quote", icon: PixelDocumentIcon, disabled: false },
  { id: "workroom", label: "Workroom", mobileLabel: "Work", icon: PixelTeamIcon, disabled: !canViewWorkroomExplicit },
  // REMOVE: { id: "activity", label: "Activity", mobileLabel: "Activity", icon: Activity, disabled: false },
];
```

Also remove the `TabsContent` for activity (lines 1118-1122).

### Step 3: Update Activity Types

**In `useProjectActivityLog.ts`**, add new types:
```typescript
export type ProjectActivityType = 
  | 'status_changed'
  | 'team_assigned'
  | 'team_removed'
  | 'email_sent'
  | 'quote_created'
  | 'quote_sent'
  | 'note_added'
  | 'client_linked'
  | 'project_created'
  | 'project_duplicated'
  // NEW TYPES:
  | 'room_added'
  | 'window_added'
  | 'treatment_added'
  | 'share_link_created'
  | 'pdf_exported';
```

**In `ProjectActivityCard.tsx` and `ProjectActivityTab.tsx`**, add icons and colors for new types:
```typescript
const activityIcons = {
  // ... existing icons
  room_added: Home,         // or DoorOpen
  window_added: Square,     // or Maximize2
  treatment_added: Palette, // or Wand2
  share_link_created: Link,
  pdf_exported: FileOutput, // or Download
};

const activityColors = {
  // ... existing colors
  room_added: "text-sky-500",
  window_added: "text-slate-500", 
  treatment_added: "text-fuchsia-500",
  share_link_created: "text-lime-500",
  pdf_exported: "text-rose-500",
};
```

### Step 4: Add Logging to Creation Points

Find where rooms, windows, treatments, share links, and PDFs are created and add:

```typescript
import { logProjectActivity } from "@/hooks/useProjectActivityLog";

// After successfully creating a room:
await logProjectActivity({
  projectId: project.id,
  activityType: 'room_added',
  title: `Added room "${roomName}"`,
  metadata: { room_id: newRoom.id, room_name: roomName }
});
```

Similar logging for:
- Windows: `useCreateSurface` or surface creation component
- Treatments: Treatment creation logic
- Share links: Share link generation component
- PDF exports: PDF generation utilities

---

## Files to Modify Summary

| File | Changes |
|------|---------|
| `src/components/jobs/JobsTableView.tsx` | Dynamic "Invite team" / "Limit Access" label based on assignment status |
| `src/components/jobs/JobDetailPage.tsx` | Remove Activity tab from `allTabs` and remove `TabsContent` |
| `src/hooks/useProjectActivityLog.ts` | Add new activity types |
| `src/components/jobs/ProjectActivityCard.tsx` | Add icons/colors for new activity types |
| `src/components/jobs/tabs/ProjectActivityTab.tsx` | Add icons/colors/labels for new activity types |
| `src/hooks/useRooms.ts` or room creation component | Log `room_added` activity |
| `src/hooks/useSurfaces.ts` or surface creation | Log `window_added` activity |
| Treatment creation logic | Log `treatment_added` activity |
| Share link creation | Log `share_link_created` activity |
| PDF generation | Log `pdf_exported` activity |

---

## Note on "Compact" Activity Display

The `ProjectActivityCard` already has a compact format that shows:
- Icon + title + user + relative time
- "View All" expands to show full history

This won't look like "toilet paper" since it shows 5 items by default with compact formatting. The full timeline is only shown when expanded.
