

## Fix Calendar Not Hiding Unavailable Dates and Times

### Problem Summary
The public booking calendar shows all time slots and dates instead of hiding unavailable ones. There are two issues:

1. **Wrong hook being used**: `BookingConfirmation` uses `useSchedulerSlots` which depends on `useAppointmentSchedulers` - this requires authentication and returns no data for public users
2. **Time format mismatch**: When checking if a slot is booked, the code compares `"10:15:00"` (database) with `"10:15"` (generated), which never matches

---

### Solution Overview

Switch `BookingConfirmation` to use the existing `useAppointmentBooking` hook which was specifically designed for public booking pages. This hook:
- Uses the `get_public_scheduler` RPC function (no authentication required)
- Generates available slots based on the scheduler's availability configuration
- Properly checks against booked appointments with correct time normalization

---

### Technical Implementation

#### Step 1: Fix Time Format Comparison in useAppointmentBooking

**File**: `src/hooks/useAppointmentBooking.ts`

The database stores times as `"10:15:00"` but the generated slot time is `"10:15"`. Normalize the database time before comparison:

```text
Line 88-90:
Before:
const isBooked = bookedAppointments.some(
  apt => apt.appointment_date === slotDate && apt.appointment_time === slotTime
);

After:
const isBooked = bookedAppointments.some(apt => {
  const aptTime = apt.appointment_time.substring(0, 5); // "10:15:00" -> "10:15"
  return apt.appointment_date === slotDate && aptTime === slotTime;
});
```

#### Step 2: Update BookingConfirmation to Use Correct Hook

**File**: `src/components/calendar/BookingConfirmation.tsx`

Replace `useSchedulerSlots` with `useAppointmentBooking`:

```text
Before (lines 4-6, 30):
import { useSchedulerSlots } from "@/hooks/useSchedulerSlots";
...
const { data: allSlots, refetch: refetchSlots, isLoading: slotsLoading } = useSchedulerSlots(undefined, 5000);

After:
import { useAppointmentBooking } from "@/hooks/useAppointmentBooking";
...
const { 
  scheduler, 
  isLoading, 
  generateAvailableSlots, 
  getAvailableDates 
} = useAppointmentBooking(slug);
```

Replace the `getAvailableSlotsForDate` helper function to use the hook's function and transform the output to match the expected interface.

#### Step 3: Update DateTimeSelector Integration

Transform the slot format from `useAppointmentBooking` to match `DateTimeSelector` expectations:

```typescript
// In BookingConfirmation.tsx
const getAvailableSlotsForDate = (date: Date) => {
  const slots = generateAvailableSlots(date);
  // Filter only available slots and transform to expected format
  return slots
    .filter(slot => slot.available)
    .map(slot => ({
      id: `${format(date, 'yyyy-MM-dd')}-${slot.time}`,
      startTime: slot.time,
      endTime: '', // Not used by DateTimeSelector
      isBooked: false // Already filtered to only available
    }));
};
```

#### Step 4: Update Calendar Date Disabling Logic

The `DateTimeSelector` already disables dates with no available slots (line 70-71), but we need to ensure the function now properly returns empty arrays for dates that are:
- Fully booked
- Not in the scheduler's availability
- Past the `min_advance_notice` threshold

---

### Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useAppointmentBooking.ts` | Fix time format comparison (substring to normalize) |
| `src/components/calendar/BookingConfirmation.tsx` | Replace `useSchedulerSlots` with `useAppointmentBooking`, update slot transformation |

---

### Why This Fixes the Issue

| Before | After |
|--------|-------|
| `useSchedulerSlots` returns empty because it requires auth | `useAppointmentBooking` uses public RPC function |
| Time comparison `"10:15:00" === "10:15"` fails | Normalized comparison `"10:15" === "10:15"` works |
| All dates shown as available | Only dates with actual available slots shown |
| All time slots shown | Only non-booked slots shown |

---

### Testing Checklist

After implementation, verify:
1. Open a public booking link (not logged in)
2. Calendar shows only weekdays with availability enabled
3. Dates with no available slots are grayed out/disabled
4. Clicking a date shows only unbooked time slots
5. Past time slots for today are hidden
6. Time slots within `min_advance_notice` are hidden

