
## Fix "Add Client" Focus Group - Complete Overhaul

The current implementation has several issues causing the inconsistent, delayed, and disappearing tooltip behavior. This plan completely redesigns the approach for reliability.

---

### Root Cause Analysis

1. **Priority Conflict**: The `app-jobs-column-customize` teaching point has `trigger: { type: 'first_visit', page: '/app', section: 'projects' }` and gets selected first by the teaching system, blocking `app-job-add-client` from showing.

2. **Missing TeachingTrigger Wrapper**: The Plus button only has `data-teaching="add-client-action"` attribute but is NOT wrapped in the `<TeachingTrigger>` component. The auto-show only works when the teaching system picks it as the "next" teaching - but another teaching keeps winning.

3. **Competing Delays**: There are 500ms delays in both `TeachingContext.tsx` and `TeachingTrigger.tsx`.

4. **No Visual Feedback**: When the tooltip shows, the Plus icon doesn't blink or pulse to draw attention.

---

### Solution

**Approach**: Wrap the Plus button directly in a `<TeachingTrigger>` component with immediate display (no delay), and add a pulsing animation to the button while the tooltip is active.

---

### File Changes

**1. `src/components/jobs/tabs/ProjectDetailsTab.tsx`**
- Import `TeachingTrigger` and `useTeaching`
- Wrap the Plus button in `<TeachingTrigger teachingId="app-job-add-client" autoShowDelay={0}>`
- Add conditional CSS class for pulsing animation when teaching is active:

```tsx
// Get teaching state
const { activeTeaching } = useTeaching();
const isAddClientTeachingActive = activeTeaching?.id === 'app-job-add-client';

// Apply pulsing class to button when tooltip is showing
<TeachingTrigger teachingId="app-job-add-client" autoShowDelay={0}>
  <Button 
    className={cn(
      "shrink-0 h-8 w-8 p-0",
      isAddClientTeachingActive && "animate-pulse ring-2 ring-primary ring-offset-2"
    )}
    ...
  >
    <Plus className="h-4 w-4" />
  </Button>
</TeachingTrigger>
```

- Only render the TeachingTrigger when there's no client assigned (empty state condition)

**2. `src/components/teaching/TeachingTrigger.tsx`**
- Reduce default `autoShowDelay` from 500ms to 100ms for snappier response
- Add logic to show immediately when autoShowDelay is 0
- Remove dependency on context's active teaching check in useEffect (let it show independently)

**3. `src/config/teachingPoints.ts`**
- Update `app-job-add-client` trigger to use `first_visit` type (simpler, doesn't need contextual checking)
- Give it `priority: 'critical'` or handle it separately to avoid conflicts

**4. Optional: Update `tailwind.config.ts`**
- Add a subtle "teaching-pulse" animation that's more distinctive than the standard pulse

---

### Animation Design

When the tooltip appears, the Plus button will:
1. Have a pulsing ring effect (`ring-2 ring-primary ring-offset-2`)
2. Use `animate-pulse` for subtle size/opacity pulsing
3. This draws the user's eye to the button location

When user clicks "Got it":
1. The tooltip dismisses
2. The pulsing stops immediately
3. User understands where to click

---

### Expected Behavior After Fix

| Scenario | Behavior |
|----------|----------|
| New project created, no client | Tooltip appears immediately (no delay) |
| Tooltip visible | Plus button pulses with ring effect |
| User clicks "Got it" | Tooltip closes, pulsing stops, marked as seen |
| Project has client assigned | No tooltip, no pulsing |
| User already saw this teaching | No tooltip shown |

---

### Technical Details

**Files to modify:**
1. `src/components/jobs/tabs/ProjectDetailsTab.tsx` - Add TeachingTrigger wrapper and pulse animation
2. `src/components/teaching/TeachingTrigger.tsx` - Reduce delay, improve reliability
3. `src/config/teachingPoints.ts` - Change trigger type to avoid conflict with column customize tooltip

This approach makes the Add Client teaching completely independent of the page-level teaching system, ensuring it always shows when conditions are met.
