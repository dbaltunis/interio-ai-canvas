import { isSameDay } from "date-fns";

// Slot height constant used across all calendar views
export const SLOT_HEIGHT = 56; // px per 30-minute slot
export const MINUTES_PER_SLOT = 30;
export const PX_PER_MINUTE = SLOT_HEIGHT / MINUTES_PER_SLOT;

// --- Event filtering ---

export const getEventsForDate = (appointments: any[] | undefined, date: Date): any[] => {
  if (!appointments) return [];
  return appointments.filter(appointment => {
    const startTime = new Date(appointment.start_time);
    const endTime = new Date(appointment.end_time);
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || endTime <= startTime) return false;
    return isSameDay(startTime, date);
  });
};

export const getBookedEventsForDate = (
  bookedAppointments: any[] | undefined,
  date: Date,
  currentUserId: string | null
): any[] => {
  if (!bookedAppointments) return [];
  return bookedAppointments
    .filter(booking => {
      const bookingDate = new Date(booking.appointment_date);
      return isSameDay(bookingDate, date);
    })
    .map(booking => {
      const schedulerInfo = booking.scheduler;
      const duration = schedulerInfo?.duration || 60;
      const schedulerName = schedulerInfo?.name || 'Customer Appointment';
      const [hours, minutes] = booking.appointment_time.split(':');
      const startTime = new Date(booking.appointment_date);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return null;
      return {
        id: booking.id,
        title: `${booking.customer_name} · ${schedulerName}`,
        description: `${booking.customer_email}${booking.customer_phone ? '\n' + booking.customer_phone : ''}`,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        location: 'Booked Appointment',
        appointment_type: 'consultation',
        color: '#3B82F6',
        user_id: currentUserId,
        isBooking: true,
        bookingData: booking,
        scheduler_id: booking.scheduler_id,
        scheduler_name: schedulerName,
        scheduler_slug: schedulerInfo?.slug || '',
        video_meeting_link: booking.video_call_link || schedulerInfo?.google_meet_link || ''
      };
    })
    .filter(Boolean);
};

export const getTasksForDate = (tasks: any[] | undefined, date: Date): any[] => {
  if (!tasks) return [];
  return tasks
    .filter(task => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), date);
    })
    .map(task => {
      const startTime = new Date(date);
      const [hours, minutes] = (task.due_time || "09:00").split(':').map(Number);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        isTask: true,
        taskData: task,
        priority: task.priority,
        status: task.status
      };
    });
};

// --- Deduplication ---

export const deduplicateEvents = (events: any[]): any[] => {
  const seen = new Map<string, any>();
  for (const event of events) {
    const startTime = new Date(event.start_time);
    const roundedMinutes = Math.round(startTime.getTime() / (5 * 60 * 1000));
    const key = `${(event.title || '').toLowerCase().trim()}_${roundedMinutes}`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, event);
    } else if (event.google_event_id && !existing.google_event_id) {
      seen.set(key, event);
    }
  }
  return Array.from(seen.values());
};

export const getAllEventsForDate = (
  appointments: any[] | undefined,
  bookedAppointments: any[] | undefined,
  tasks: any[] | undefined,
  date: Date,
  currentUserId: string | null
): any[] => {
  const regularEvents = deduplicateEvents(getEventsForDate(appointments, date));
  const bookedEvents = getBookedEventsForDate(bookedAppointments, date, currentUserId);
  const dateTasks = getTasksForDate(tasks, date);
  return [...regularEvents, ...bookedEvents, ...dateTasks];
};

// --- Event positioning ---

export interface EventPosition {
  top: number;
  height: number;
  visible: boolean;
}

export const calculateEventPosition = (
  startTime: Date,
  endTime: Date,
  offsetMinutes: number = 0 // 0 for 24-hour view, 360 for 6 AM start
): EventPosition => {
  const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();

  // Validate end time
  if (endTime <= startTime) {
    endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
  }

  let adjustedMinutes = startMinutes - offsetMinutes;
  if (adjustedMinutes < 0) adjustedMinutes = 0;

  const top = adjustedMinutes * PX_PER_MINUTE;
  const durationMinutes = Math.max((endTime.getTime() - startTime.getTime()) / 60000, 15);
  const height = Math.max(durationMinutes * PX_PER_MINUTE, 24);

  return { top, height, visible: true };
};

// --- Overlap layout (sweep-line, O(n log n)) ---

export interface OverlapInfo {
  column: number;
  totalColumns: number;
}

export const calculateOverlapLayout = (events: any[]): Map<string, OverlapInfo> => {
  const result = new Map<string, OverlapInfo>();
  if (events.length === 0) return result;

  // Sort by start time, then by end time descending (longer events first)
  const sorted = [...events].sort((a, b) => {
    const diff = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    if (diff !== 0) return diff;
    return new Date(b.end_time).getTime() - new Date(a.end_time).getTime();
  });

  // Track active columns: each entry is the end time of the event in that column
  const columns: number[] = [];
  const eventColumns = new Map<string, number>();

  for (const event of sorted) {
    const start = new Date(event.start_time).getTime();
    const end = new Date(event.end_time).getTime();

    // Find the first available column (one that has ended before this event starts)
    let placed = false;
    for (let col = 0; col < columns.length; col++) {
      if (columns[col] <= start) {
        columns[col] = end;
        eventColumns.set(event.id, col);
        placed = true;
        break;
      }
    }
    if (!placed) {
      eventColumns.set(event.id, columns.length);
      columns.push(end);
    }
  }

  // Second pass: determine total columns for each overlap group
  for (const event of sorted) {
    const start = new Date(event.start_time).getTime();
    const end = new Date(event.end_time).getTime();

    // Count how many events overlap with this one
    let maxCol = eventColumns.get(event.id) || 0;
    for (const other of sorted) {
      if (other.id === event.id) continue;
      const otherStart = new Date(other.start_time).getTime();
      const otherEnd = new Date(other.end_time).getTime();
      if (start < otherEnd && end > otherStart) {
        maxCol = Math.max(maxCol, eventColumns.get(other.id) || 0);
      }
    }

    result.set(event.id, {
      column: eventColumns.get(event.id) || 0,
      totalColumns: maxCol + 1,
    });
  }

  return result;
};

// --- Time slot generation ---

export const generateTimeSlots = (startHour: number = 0, endHour: number = 24): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

export const ALL_TIME_SLOTS = generateTimeSlots(0, 24);
export const WORKING_HOURS_SLOTS = generateTimeSlots(6, 22);

// --- Event styling ---

export interface EventStyling {
  background: string;
  border: string;
  textClass: string;
  minHeight: number;
}

const PRIORITY_COLORS = {
  urgent: { bg: 'rgba(239, 68, 68, 0.12)', border: '#EF4444' },
  high: { bg: 'rgba(249, 115, 22, 0.12)', border: '#F97316' },
  medium: { bg: 'rgba(234, 179, 8, 0.12)', border: '#EAB308' },
  low: { bg: 'rgba(59, 130, 246, 0.12)', border: '#3B82F6' },
};

export const getEventStyling = (event: any): EventStyling => {
  if (event.isTask) {
    if (event.status === 'completed') {
      return { background: 'rgba(34, 197, 94, 0.12)', border: '#22C55E', textClass: 'text-foreground', minHeight: 28 };
    }
    const colors = PRIORITY_COLORS[event.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
    return { background: colors.bg, border: colors.border, textClass: 'text-foreground', minHeight: 28 };
  }
  if (event.isBooking) {
    return { background: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6', textClass: 'text-foreground', minHeight: 28 };
  }
  const color = event.color || '#6366F1';
  return {
    background: `${color}1A`, // ~10% opacity
    border: color,
    textClass: 'text-foreground',
    minHeight: 28,
  };
};

// --- Time slot occupancy check ---

export const isTimeSlotOccupied = (allEvents: any[], timeString: string, date: Date): boolean => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const slotTime = new Date(date);
  slotTime.setHours(hours, minutes, 0, 0);
  return allEvents.some(event => {
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);
    return slotTime >= eventStart && slotTime < eventEnd;
  });
};
