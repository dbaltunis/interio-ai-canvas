

# Replace All Modal Dialogs with Inline Popovers + Fix Scroll and Note Issues

## Summary

Four changes in one pass:
1. Convert the old modal dialog (`UnifiedAppointmentDialog`) to a popover-style panel so Jobs, Clients, and RoomCard pages get the same experience as the calendar
2. Fix the scroll issue in `QuickAddPopover` so all fields are reachable
3. Fix the note textarea causing the popover to disappear
4. Remove the "Event Type" section from both `QuickAddPopover` and `EventDetailPopover`

---

## Issue 1: Old Modal Still Used on Jobs, Clients, and RoomCard Pages

**Where the old modal is still used:**
- `src/components/clients/ClientQuickActionsBar.tsx` (line 262) -- "Schedule" button on client page
- `src/components/jobs/tabs/ProjectDetailsTab.tsx` (line 818) -- "Schedule" button on job details
- `src/components/job-creation/RoomCard.tsx` (line 282) -- service scheduling from room card
- `src/components/calendar/MobileCalendarView.tsx` (lines 411, 418) -- mobile create/edit

**Fix:** Convert `UnifiedAppointmentDialog` from a `Dialog` (centered modal with dark backdrop) to a fixed-position popover panel (no backdrop, same visual style as `QuickAddPopover`). This automatically updates every page that uses it.

**Technical details:**
- Replace `<Dialog>` / `<DialogContent>` wrapper with a fixed-position `div` (same pattern as QuickAddPopover)
- Position: centered horizontally, vertically centered in viewport
- Width: `max-w-md` (same as current)
- No dark backdrop overlay
- Add click-outside-to-close and Escape-to-close handlers
- Wrap content in `ScrollArea` with `max-h-[85vh]`
- Add subtle shadow and border (matching QuickAddPopover)
- All form fields, hooks, permissions, and save logic stay identical

**Files changed:** `src/components/calendar/UnifiedAppointmentDialog.tsx`

---

## Issue 2: Popover Not Scrollable

**Root cause:** The `ScrollArea` in `QuickAddPopover.tsx` (line 259) uses `className="flex-1 min-h-0"` which relies on the flex parent having a constrained height. The outer div sets `maxHeight` via inline style, but Radix ScrollArea's internal viewport doesn't always pick up the flex-based height constraint correctly.

**Fix:** Give the `ScrollArea` an explicit max-height calculated from the container's maxHeight minus the header (approx 48px) and footer (approx 48px) heights, using CSS `calc()`. This guarantees Radix creates a proper scrollable region.

**File changed:** `src/components/calendar/QuickAddPopover.tsx` (line 259)

---

## Issue 3: Popover Disappears When Adding a Note

**Root cause:** The click-outside handler (line 143) listens for `mousedown` events. When the user clicks into the `Textarea` for the note field, the event fires correctly and the popover should stay open since the textarea is inside `popoverRef`. However, if the user clicks on the `ScrollArea`'s scrollbar track (which Radix renders outside the normal content flow), or if the textarea causes a layout shift that moves the popover, the `contains()` check can fail.

**Fix:**
- Add the `Textarea`'s container to the click-outside exclusion list
- Add a check for `[data-radix-scroll-area-viewport]` elements in the click-outside handler (same pattern already used for `[data-radix-popper-content-wrapper]`)
- Prevent `mousedown` propagation on all form inputs within the popover to be safe

**File changed:** `src/components/calendar/QuickAddPopover.tsx` (lines 143-148)

---

## Issue 4: Remove Event Type

**Current state:** Both `QuickAddPopover` (lines 342-362) and `EventDetailPopover` (lines 288-308) show an "Event Type" chip selector (Meeting, Consultation, Measurement, etc.) in the expanded view.

**Fix:** Remove the Event Type section entirely from both components. The `appointmentType` state and its inclusion in the save payload will remain (defaulting to "meeting") so existing data is not broken -- it just won't be shown in the UI.

**Files changed:**
- `src/components/calendar/QuickAddPopover.tsx` -- remove lines 342-362 (Event Type section)
- `src/components/calendar/EventDetailPopover.tsx` -- remove lines 288-308 (Event Type section)

---

## What Does NOT Change

- All hooks: `useCreateAppointment`, `useUpdateAppointment`, `useDeleteAppointment`, `useClients`, `useProjects`, `useTeamMembers`
- All permission checks (`useCalendarPermissions`, `useHasPermission`)
- The calculation engine (`src/engine/formulas/`)
- Database queries and edge functions
- The `QuickAddPopover` calendar-anchored positioning (only used on calendar page)
- The `EventDetailPopover` (stays as Radix Popover, just removes Event Type)

## Implementation Order

1. Remove Event Type from both popovers (safest, UI-only)
2. Fix scroll in QuickAddPopover (CSS change)
3. Fix click-outside handler for note textarea (event handler tweak)
4. Convert UnifiedAppointmentDialog from Dialog to popover panel (wrapper change, zero logic change)

