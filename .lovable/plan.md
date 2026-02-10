

## Fix QuickAddPopover UX Issues and Calendar Event Display

### Issues Identified

1. **Save/More options buttons disappear when scrolling** -- The QuickAddPopover uses `ScrollArea` but the footer gets pushed off-screen when the popover is near the bottom of the viewport. The `maxHeight` is hardcoded to 480px, but the viewport clamping logic doesn't properly account for the sticky footer.

2. **Save button not clickable** -- The `pointer-events` chain is broken. The popover sits at `z-[10000]` but the calendar grid's `onMouseUp` handler on the parent div intercepts clicks. The `handleMouseUp` in `WeeklyCalendarView.tsx` (line 368) wraps the entire view, potentially stealing clicks from the popover.

3. **No visual distinction between event type icons and team colors** -- Events on the calendar grid all use the same `getEventStyling` which only reads `event.color`. When a team group color overrides the type color, you lose the type indication. Need to show both: team group color as the event background/bar, plus the type icon with its own color dot or badge.

4. **No event slot preview on the calendar canvas** -- When creating an event via QuickAddPopover (single click, not drag), there's no visual indicator on the calendar grid showing where the event will appear. Only drag-to-create shows a preview block.

5. **Drag-to-create only works in 15-min increments but snaps oddly** -- The drag creation preview works but the user wants smoother Apple-style free-form dragging.

6. **"Description" label still in UnifiedAppointmentDialog** -- Already shows "Add a note..." placeholder but the collapsible trigger text says "Location, note, video..." which is correct. The internal state field is still called `description` (which is fine for the DB column).

7. **Color overlap between Type and Team Group** -- When a team group is selected, the event color should come from the group, not the type. The color picker / type color should become purely informational. Currently in `UnifiedAppointmentDialog` line 544, clicking a type sets `color: type.color`, which overrides the group color.

8. **"My Teams" sidebar has no visual indication when no groups exist** -- The empty state just shows a small "+ New Group" link that's easy to miss.

### Changes

**File: `src/components/calendar/QuickAddPopover.tsx`**
- Fix viewport clamping: reduce `popoverHeight` estimate and use dynamic measurement via `useLayoutEffect` to measure actual popover height before positioning
- Ensure the sticky footer always remains visible by clamping `top` so footer stays in viewport
- Add `onMouseDown` stopPropagation on the entire popover to prevent the calendar grid's mouseUp handler from stealing clicks
- When a team group is selected, hide the manual color from the type selector -- show type as informational only (icon + label, no color override)
- When a group is selected, the effective color comes from the group; the type pills become purely descriptive indicators

**File: `src/components/calendar/WeeklyCalendarView.tsx`**
- Add a "pending event" preview slot when `QuickAddPopover` is open -- pass the `quickAddStartTime` and `quickAddDate` down and render a ghost event block at the clicked time slot
- Stop the `onMouseUp` handler from propagating when the click target is inside the popover (check `e.target` against popover ref)

**File: `src/components/calendar/DailyCalendarView.tsx`**
- Same "pending event" preview slot treatment as WeeklyCalendarView

**File: `src/components/calendar/CalendarView.tsx`**
- Pass `quickAddOpen`, `quickAddDate`, and `quickAddStartTime` to the Weekly/Daily views so they can render the ghost event indicator

**File: `src/components/calendar/EventPill.tsx`**
- When event has both a `calendar_group_name` and an `appointment_type`, show both: the group name with its color dot, plus the type icon
- Add first-letter credentials/initials for the team group name as a small badge when height allows

**File: `src/components/calendar/UnifiedAppointmentDialog.tsx`**
- When a calendar group is selected (via TeamMemberPicker's group mode), auto-set the event color to the group color and disable/hide the manual color picker
- Type selector becomes informational: shows type icon and label but does NOT override the color when a group is active
- Add a "Calendar Group" selector similar to QuickAddPopover's group chips, above or alongside the team member picker

**File: `src/components/calendar/CalendarSidebar.tsx`**
- Improve empty state for "My Teams": show a more prominent card-style prompt with an icon and description instead of just a small text link

### Technical Details

**Fixing the Save button click issue:**
The root cause is the `onMouseUp` handler on line 368 of `WeeklyCalendarView.tsx`:
```
<div className="flex flex-col h-full" onMouseUp={handleMouseUp}>
```
This captures all mouseUp events including those on the QuickAddPopover (which is a fixed-position element rendered as a sibling). The fix is to add `e.stopPropagation()` on the popover's `onMouseDown` (already partially done) and ensure the `handleMouseUp` checks if the event creation state is active before doing anything.

**Color priority logic:**
```
// In QuickAddPopover and UnifiedAppointmentDialog:
// 1. If team group selected -> use group.color (hide color picker)
// 2. If no group -> use event type color (type selector sets color)
// 3. Fallback -> default indigo #6366F1
```

**Ghost event preview on calendar grid:**
When `quickAddOpen` is true, render a semi-transparent pill at the corresponding time slot showing "New Event" with the effective color, similar to the existing drag-to-create preview but triggered by the popover being open.

### Summary of File Changes

| File | Change |
|------|--------|
| `src/components/calendar/QuickAddPopover.tsx` | Fix viewport positioning, stop event propagation, team color priority over type color |
| `src/components/calendar/WeeklyCalendarView.tsx` | Add ghost event preview when popover is open, fix mouseUp propagation |
| `src/components/calendar/DailyCalendarView.tsx` | Add ghost event preview when popover is open |
| `src/components/calendar/CalendarView.tsx` | Pass quickAdd state to weekly/daily views |
| `src/components/calendar/EventPill.tsx` | Show both team group indicator and type icon with distinct visuals |
| `src/components/calendar/UnifiedAppointmentDialog.tsx` | Team color takes priority, type becomes informational, add group selector |
| `src/components/calendar/CalendarSidebar.tsx` | Better empty state for My Teams section |
