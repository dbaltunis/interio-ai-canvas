

# Add Activity Log to Client Section (First Tab)

## Overview

Based on your feedback, you want to add the **Project Activity Log** directly to the **Client section** (the first tab you see when viewing/creating a job) rather than keeping it as a separate tab.

This makes sense because:
- **Immediate visibility**: Users see project history right away
- **Context**: Activity log sits alongside client info, notes, and timeline
- **Reduced navigation**: No need to click to a separate tab to see what happened
- **Better UX**: Everything about the project state is in one place

---

## Current Layout of Client Tab (ProjectDetailsTab)

```text
┌────────────────────────────────────────────────────┐
│  Compact Summary Bar                               │
│  [Client] [Rooms: 2] [Quote: $3,500]               │
├────────────────────────────────────────────────────┤
│  Timeline: Jan 15 → Jan 30                         │
├────────────────────────────────────────────────────┤
│  📋 Document Number                                │
│  Draft #DFT-0123                                   │
├────────────────────────────────────────────────────┤
│  👤 Client Assignment                              │
│  John Smith • john@email.com                       │
├────────────────────────────────────────────────────┤
│  📝 Project Notes                                  │
│  [Note entries...]                                 │
└────────────────────────────────────────────────────┘
```

---

## Proposed Layout (Activity Log Added)

Add the Activity Log **below Project Notes** to create a complete project history view:

```text
┌────────────────────────────────────────────────────┐
│  Compact Summary Bar                               │
│  [Client] [Rooms: 2] [Quote: $3,500]               │
├────────────────────────────────────────────────────┤
│  Timeline: Jan 15 → Jan 30                         │
├────────────────────────────────────────────────────┤
│  📋 Document Number                                │
│  Draft #DFT-0123                                   │
├────────────────────────────────────────────────────┤
│  👤 Client Assignment                              │
│  John Smith • john@email.com                       │
├────────────────────────────────────────────────────┤
│  📝 Project Notes                                  │
│  [Note entries...]                                 │
├────────────────────────────────────────────────────┤
│  🕐 Project Activity                         ← NEW │
│  ─────────────────────────────────────────────     │
│  ○ Status changed from "Draft" to "Quote Sent"    │
│    by Daniel • Jan 29, 2:45pm                     │
│  ○ Quote v1 created                               │
│    by Daniel • Jan 28, 10:00am                    │
│  ○ Client assigned: John Smith                    │
│    by Daniel • Jan 27, 3:30pm                     │
│  ○ Project created                                │
│    by Daniel • Jan 27, 3:15pm                     │
│                                    [View All →]   │
└────────────────────────────────────────────────────┘
```

---

## Design Decisions

### Option A: Compact Card (Recommended)

Show the **last 5 activities** in a compact card with a "View All" link that expands or opens the full timeline.

**Pros:**
- Keeps the page scannable
- Most important/recent activity visible at a glance
- Full history available on demand

### Option B: Collapsible Section

Make the Activity section collapsible (like an accordion), defaulting to collapsed state.

**Pros:**
- Users who don't need it won't see it
- Keeps page shorter for simple jobs

### Recommended: Option A (Compact Card with "View All")

---

## Implementation Plan

### File Changes

| File | Change |
|------|--------|
| `src/components/jobs/tabs/ProjectDetailsTab.tsx` | Add `ProjectActivityCard` component |
| `src/components/jobs/ProjectActivityCard.tsx` | **NEW** - Compact activity timeline card |
| `src/components/jobs/JobDetailPage.tsx` | Remove Activity from separate tab (optional - keep for detailed view) |

### New Component: ProjectActivityCard

```tsx
// src/components/jobs/ProjectActivityCard.tsx

interface ProjectActivityCardProps {
  projectId: string;
  maxItems?: number;  // Default: 5
  onViewAll?: () => void;  // Optional expand callback
}
```

Features:
- Shows most recent 5 activities by default
- Each activity shows: icon, title, user name, relative timestamp
- "View All" button to expand to full timeline or navigate to Activity tab
- Compact single-line entries to save vertical space

### UI Design

**Activity Entry (Compact):**

```text
[○] Status → Quote Sent           by Daniel • 2h ago
[○] Note added                    by Sarah  • Yesterday
[○] Quote v1 created              by Daniel • Jan 27
```

**Activity Entry (Expanded on View All):**

```text
┌─────────────────────────────────────────────────────┐
│ ○ Status changed from "Draft" to "Quote Sent"      │
│   Reason: Ready for client review                  │
│   by Daniel • January 29, 2026 at 2:45 PM          │
└─────────────────────────────────────────────────────┘
```

---

## Technical Details

### Integration with ProjectDetailsTab

```tsx
// In ProjectDetailsTab.tsx, after ProjectNotesCard:

import { ProjectActivityCard } from "../ProjectActivityCard";

// In the return JSX, after {/* Project Notes */}:
<ProjectActivityCard 
  projectId={project.id}
  maxItems={5}
/>
```

### Compact Activity Item Component

```tsx
const activityIcons: Record<string, LucideIcon> = {
  status_changed: ArrowRightCircle,
  team_assigned: UserPlus,
  team_removed: UserMinus,
  email_sent: Mail,
  quote_created: FileText,
  note_added: MessageSquare,
  client_linked: Link,
  project_created: Plus,
  project_duplicated: Copy,
};

const CompactActivityItem = ({ activity }) => (
  <div className="flex items-center justify-between py-2 border-b last:border-0">
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-sm truncate max-w-[200px]">{activity.title}</span>
    </div>
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{activity.user_name}</span>
      <span>•</span>
      <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
    </div>
  </div>
);
```

---

## Handling the Separate Activity Tab

Two options:

### Option 1: Keep Both (Recommended)
- **Client Section**: Show compact recent activity (5 items)
- **Activity Tab**: Show full detailed timeline with filters

This gives users quick access AND detailed history when needed.

### Option 2: Remove Activity Tab
- Move all activity display to Client section
- Add expandable "full history" view within the card

I recommend **Option 1** - keep the detailed Activity tab but make the compact card the primary entry point.

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/jobs/ProjectActivityCard.tsx` | Create | Compact activity timeline card |
| `src/components/jobs/tabs/ProjectDetailsTab.tsx` | Modify | Add ProjectActivityCard after notes |

---

## Expected Result

When viewing a job, the Client section (first tab) will now show:
1. Summary bar with client, rooms, quote
2. Timeline with dates
3. Document number
4. Client assignment
5. Project notes
6. **Project Activity** (last 5 events with "View All" link)

Users get immediate visibility into what happened on the project without navigating to a separate tab.

