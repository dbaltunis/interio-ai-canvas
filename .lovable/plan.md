

# Fix Notification Navigation + Smart Notification Audience

## Problem 1: Notification Click Doesn't Navigate to the Right Place

**Current behavior**: Clicking a notification like "Appointment Scheduled" navigates to `/?tab=calendar` (generic calendar page) or `/?tab=projects` (generic jobs list). It never opens the specific event or job.

**Root cause**: Two issues working together:
- `action_url` is stored as `/calendar` (no event ID) or `/?tab=projects` (no job ID)
- The `handleTabChange` function in `ResponsiveHeader.tsx` (line 348) strips query params with `action_url.replace('/?tab=', '')` and passes only the tab name to `setSearchParams({ tab: tabId })`, which overwrites all other params

**Fix**:

### File 1: `src/components/layout/ResponsiveHeader.tsx` (line 345-350)

Replace the naive `onTabChange(action_url.replace(...))` with proper URL parsing:

```
onClick={() => {
  markAsRead(notif.id);
  if (notif.action_url) {
    const url = new URL(notif.action_url, window.location.origin);
    const params = Object.fromEntries(url.searchParams.entries());
    const tab = params.tab;
    delete params.tab;
    // Navigate to the tab with all query params preserved
    if (tab) {
      onTabChange(tab);
      // Set all additional params (jobId, eventId, clientId, etc.)
      setTimeout(() => {
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.set('tab', tab);
        Object.entries(params).forEach(([k, v]) => currentParams.set(k, v));
        window.history.replaceState(null, '', `?${currentParams.toString()}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 50);
    }
    setNotifPopoverOpen(false);
  }
});
```

### File 2: `src/hooks/useAppointments.ts` (line 95)

Change `action_url` from `/calendar` to include the event ID:
```
action_url: `/?tab=calendar&eventId=${appointmentId}`,
```

### File 3: `src/hooks/useClients.ts` (line 230)

Already has `action_url: /clients?clientId=${data.id}` -- just needs the `/?tab=` prefix format to match the parser:
```
action_url: `/?tab=clients&clientId=${data.id}`,
```

---

## Problem 2: Calendar Doesn't Handle Deep-Link to Specific Event

When `eventId` is in the URL, the calendar should auto-scroll to that date and open the event detail popover.

### File 4: `src/components/calendar/CalendarView.tsx`

Add a `useEffect` that reads `eventId` from `searchParams`, finds the matching appointment, sets the calendar date to the event's date, and opens the `EventDetailPopover` for it.

---

## Problem 3: Notification Audience (Industry Best Practice)

**Current behavior**: Only explicitly invited team members get notified. The event creator gets a toast but no persistent notification. The job owner (if the event is linked to a job) gets nothing. The client gets nothing unless email invites are sent.

**Industry standard** (Google Calendar, Outlook, Calendly):
- **Invited team members**: In-app notification + email -- already works
- **Event creator**: Confirmation notification (in-app) with event details -- for their own records
- **Job/project owner**: If the event is linked to a job and was created by a team member (not the owner), the owner should get notified that an event was scheduled on their job
- **Client**: Email only (no in-app since clients don't have app accounts) -- already handled by `send-calendar-invite-emails`

### File 5: `src/hooks/useAppointments.ts` -- `notifyTeamMembers` function

Extend to also:
1. **Notify the job owner** when the event is linked to a project (`project_id`): query the project's `user_id`, and if it differs from the creator, send them an in-app notification
2. **Notify the account owner** when a team member creates an event: use `getEffectiveOwnerForMutation` pattern to identify the parent account, notify them if different from creator
3. **Creator confirmation**: Add a self-notification for the creator with `action_url` pointing to the specific event

Rename function to `notifyRelevantParties` for clarity.

---

## Problem 4: Duplicate Notifications (from screenshot)

The screenshot shows 3 identical "Appointment Scheduled" notifications. This suggests the notification insert is being called multiple times (possibly from React strict mode double-rendering or from the toast + notification both triggering).

### File 6: `src/hooks/useAppointments.ts`

Add a guard to prevent duplicate notifications by checking if a notification with the same `source_id` already exists before inserting.

---

## Summary of Files Changed

| File | Change |
|------|--------|
| `ResponsiveHeader.tsx` | Parse `action_url` as full URL with query params |
| `useAppointments.ts` | Deep-link `action_url`, notify job owner + account owner, dedup guard |
| `useClients.ts` | Fix `action_url` format to `/?tab=clients&clientId=...` |
| `CalendarView.tsx` | Auto-open event from `eventId` URL param |

## What Does NOT Change

- Database schema (notifications table already has `action_url`, `source_type`, `source_id`)
- RLS policies (the cross-account insert policy was just fixed)
- Edge functions
- Permission hooks
- The popover UI components

