

## Calendar Team Groups -- Apple/Google Style

### What This Builds

A sidebar calendar groups system inspired by Apple Calendar (as shown in your screenshot), where you create named sub-calendars like "Sales Team" or "Installers", assign team members to them, and any event placed on that calendar is automatically visible to all group members.

### How It Works for You

1. In the sidebar, under the existing "Calendars" section, you'll see a new "My Teams" section
2. Click "+ New Group" to create a group like "Sales Team" with a color
3. Add John, Mike, Sarah to that group
4. When creating an event, pick which calendar/group it belongs to (instead of manually selecting 8 people)
5. All members of that group automatically see the event -- no manual sharing needed
6. Toggle groups on/off in the sidebar to show/hide their events (like Apple Calendar checkboxes)

### What Gets Removed

- **EventVisibilitySelector** (Private/Team/Organization radio group) -- redundant, visibility is now determined by which calendar group the event belongs to
- Manual individual team member selection for basic sharing (still available as override in advanced options)

### Database

**New table: `calendar_team_groups`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Group name (e.g., "Sales Team") |
| user_id | UUID | Account owner (multi-tenant scoped) |
| member_ids | UUID[] | Array of team member user IDs |
| color | TEXT | Hex color for the group |
| is_default | BOOLEAN | Whether events go here by default |
| created_at | TIMESTAMPTZ | Timestamp |

RLS policy uses `get_effective_account_owner(auth.uid())` for multi-tenant support.

**Appointments table update:**
- Add `calendar_group_id` column (nullable UUID) to link events to a group
- When set, event is automatically visible to all group members (no need for `team_member_ids` manual array)

### File Changes

**New files:**
| File | Purpose |
|------|---------|
| `src/hooks/useCalendarTeamGroups.ts` | CRUD hook for team groups with multi-tenant scoping |
| `src/components/calendar/TeamGroupManager.tsx` | Dialog to create/edit/delete groups and assign members |

**Modified files:**
| File | Change |
|------|--------|
| `src/components/calendar/CalendarSidebar.tsx` | Add "My Teams" section with colored checkboxes (Apple-style), "+ New Group" button |
| `src/components/calendar/QuickAddPopover.tsx` | Add calendar group selector (dropdown showing group names with colors) |
| `src/components/calendar/UnifiedAppointmentDialog.tsx` | Remove `EventVisibilitySelector`, add group picker, auto-set visibility |
| `src/components/calendar/TeamMemberPicker.tsx` | Add "By Group" selection mode alongside "All" and "Individual" |
| `src/components/calendar/CalendarView.tsx` | Update event filtering to include events from groups the user belongs to |

### Sidebar Layout (Apple Calendar style)

```text
Calendar
+---------------------------------+
|  [Mini calendar]                |
+---------------------------------+
|  Next Up                        |
|  [Event preview]                |
+---------------------------------+
|  CALENDARS                      |
|  [x] My Calendar                |
|  [x] Bookings                   |
|  [x] Google Calendar            |
+---------------------------------+
|  MY TEAMS                       |
|  [x] Sales Team      (3)  [...]|
|  [x] Installers      (2)  [...]|
|  [x] Office Staff     (4)  [...]|
|  + New Group                    |
+---------------------------------+
```

### Quick Add Event Flow

When creating a new event, a small dropdown appears showing:
- "My Calendar" (default/personal)
- "Sales Team" (auto-shares with John, Mike, Sarah)
- "Installers" (auto-shares with Phoebe, Sam)

Selecting a group automatically assigns the event to all members -- no manual picking needed.

### Cross-Team Sharing

An installer can create an event on the "Installers" calendar, then also share it with "Sales Team" -- similar to how job sharing works with team assignments. The event shows up on both groups' calendars.

### What This Does NOT Include (Future Work)

- Push/phone notifications when events are created or changed (requires service worker infrastructure)
- Edit permission enforcement (preventing shared members from modifying events they don't own)
- Reminder delivery at scheduled times (requires cron/scheduled edge function)
- These are noted as future enhancements to build on top of this foundation

