

# Convert "More Options" from Modal to Expanded Popover

## Current Behavior (the problem)

1. **Create event**: Click calendar slot opens a nice small inline `QuickAddPopover` -- this is good
2. **Click "More options"**: Closes that popover and opens `UnifiedAppointmentDialog` as a big centered modal with dark backdrop overlay -- this is the bad experience you want to eliminate
3. **Edit event**: Click existing event opens a nice small inline `EventDetailPopover` -- this is good
4. **Click "More options" on edit**: Closes that popover and opens the same big modal -- same problem

## New Behavior (the solution)

Instead of opening a separate modal, clicking "More options" will **expand the current popover in-place** to show the additional fields. The popover grows taller (scrollable) but stays anchored to the same position. No backdrop, no modal, no context switch.

**Create flow:**
- Click slot: small popover with title, duration, calendar group, note
- Click "More options": popover smoothly expands to also show event type, client/job selectors, team members, location, video meeting toggle, reminders, email invite
- Click "Less options": popover shrinks back to the compact view

**Edit flow:**
- Click event: small popover with view details and Edit button
- Click Edit: inline edit mode (title, duration, color) -- already works
- Click "More options": popover expands to show all fields (same as create)
- Click "Less options": shrinks back

## What Changes

### File 1: `src/components/calendar/QuickAddPopover.tsx`

- Add an `expanded` state (boolean, default false)
- "More options" button toggles `expanded = true` instead of calling `onMoreOptions` (which closes the popover and opens the modal)
- When expanded, render the additional fields currently in `UnifiedAppointmentDialog`: event type chips, client/job selectors, team member picker, location, notes (longer), video meeting toggle, reminders
- Add a "Less options" button (ChevronUp) to collapse back
- Increase width from `w-80` (320px) to `w-96` (384px) when expanded
- Increase `maxHeight` from 480px to 85vh when expanded
- All fields scroll within the existing `ScrollArea`

### File 2: `src/components/calendar/EventDetailPopover.tsx`

- Same pattern: add `expanded` state
- "More options" button in edit mode toggles `expanded = true` instead of calling `onEdit` (which opens the modal)
- When expanded, show the additional fields: event type, client/job, team members, location, video, reminders
- The `handleSaveEdit` function gets extended to save all expanded fields
- Add "Less options" collapse button

### File 3: `src/components/calendar/CalendarView.tsx`

- The `handleQuickAddMoreOptions` function and the `UnifiedAppointmentDialog` for creation are no longer needed since the popover handles everything inline
- Keep `UnifiedAppointmentDialog` only as a fallback for programmatic event creation from other parts of the app (e.g., from a client page), but remove it from the calendar slot click flow

## What Does NOT Change

- The `UnifiedAppointmentDialog` component itself stays in the codebase (used by other parts of the app for event creation from client/job pages)
- All hooks: `useCreateAppointment`, `useUpdateAppointment`, `useDeleteAppointment`, `useClients`, `useProjects`, `useTeamMembers`, etc.
- The calculation engine (`src/engine/formulas/`)
- Permissions logic
- Database queries
- The visual design of the compact popover (stays identical)

## Technical Details

### New imports needed in QuickAddPopover:
- `useClients`, `useProjects` (for client/job selectors)
- `TeamMemberPicker` (for team members)
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` (for dropdowns)
- `Switch` (for video toggle)
- `MapPin`, `Video`, `Users`, `Briefcase`, `ChevronUp` icons

### State additions in QuickAddPopover:
- `expanded: boolean` -- controls compact vs expanded view
- `appointmentType: string` -- event type
- `clientId: string` -- linked client
- `projectId: string` -- linked job
- `selectedTeamMembers: string[]` -- team members
- `location: string` -- location text
- `addVideoMeeting: boolean` -- video toggle
- `videoLink: string` -- manual video link

### Save function update:
The existing `handleSave` in QuickAddPopover will pass the expanded fields to `createAppointment.mutateAsync` when they are set.

### Animation:
The popover width and height transitions will use CSS `transition-all duration-200` for a smooth expand/collapse feel.

## Implementation Order

1. Update `QuickAddPopover.tsx` -- add expanded state and additional fields
2. Update `EventDetailPopover.tsx` -- add expanded state in edit mode
3. Update `CalendarView.tsx` -- remove the modal dialog from the calendar slot creation flow
