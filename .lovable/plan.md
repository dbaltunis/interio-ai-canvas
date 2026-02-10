

## Unify Event Creation with the Inline Edit Experience

### Problem
The **new event creation** currently uses a `Dialog` component (modal overlay with blurred/dimmed backdrop), which feels disconnected from the calendar. The **inline edit** mode on `EventDetailPopover` uses a `Popover` that appears sharp and attached directly next to the event on the calendar -- this is the experience you prefer.

### Solution
Convert `QuickAddPopover` from a `Dialog` (modal with backdrop blur) to a `Popover` that appears inline on the calendar, matching the same sharp, clean look as the edit mode in `EventDetailPopover`. Both creation and editing will then share the same visual style.

### Technical Changes

**1. `src/components/calendar/QuickAddPopover.tsx` -- Switch from Dialog to Popover**

- Replace `Dialog`/`DialogContent` with `Popover`/`PopoverContent`
- Accept an anchor position (click coordinates or a ref) so the popover appears near where the user clicked on the calendar grid
- Keep all the existing form content (title, duration chips, type pills, color, save/more options) exactly the same
- Add the colored header bar (`h-2` with selected color) matching the edit popover
- Use the same styling: `p-0 overflow-hidden`, `w-80`, rounded corners, shadow

**2. `src/components/calendar/CalendarView.tsx` -- Pass click position**

- When the user clicks a time slot, capture the click event coordinates or the clicked element
- Store a ref/position so the popover can anchor to the click location
- Pass anchor info to QuickAddPopover

**3. Shared constants**

- The `DURATION_CHIPS`, `EVENT_TYPES`, and `COLOR_DOTS` arrays are already duplicated between both files. Extract them into a shared `calendarConstants.ts` file for consistency.

### What Will Change Visually

- No more blurred backdrop overlay when creating an event
- The creation form appears as a sharp, clean popover anchored to the calendar grid (just like the edit popover)
- Same color header bar, same typography, same button styles
- Users can still see the calendar behind the popover
- Clicking outside dismisses it (same as edit)
- "More options" still opens the full advanced dialog

### What Stays the Same

- All form fields (title, duration, type, color, save, more options)
- Keyboard shortcuts (Enter to save, Escape to close)
- Permission checks
- The "More options" flow to UnifiedAppointmentDialog

