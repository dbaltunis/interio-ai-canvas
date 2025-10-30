import { useQuery } from "@tanstack/react-query";
import { useAppointmentSchedulers } from "./useAppointmentSchedulers";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, isSameDay, addMinutes, parse, isAfter, isBefore } from "date-fns";

interface SchedulerSlot {
  id: string;
  schedulerId: string;
  schedulerName: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  isBooked: boolean;
  bookingId?: string;
  bufferTime?: number;
}

export const useSchedulerSlots = (weekStartDate?: Date, refetchInterval?: number) => {
  const { data: schedulers } = useAppointmentSchedulers();

  return useQuery({
    queryKey: ["scheduler-slots", weekStartDate ? format(weekStartDate, 'yyyy-MM-dd') : 'all'],
    refetchInterval, // Add refetch interval for real-time updates
    queryFn: async () => {
      if (!schedulers?.length) return [];

      // Calculate date range for the entire week
      const startDate = weekStartDate || new Date();
      const endDate = weekStartDate ? addDays(weekStartDate, 6) : addDays(new Date(), 30);

      // Fetch booked appointments for the date range
      const { data: bookedAppointments } = await supabase
        .from("appointments_booked")
        .select("*")
        .gte("appointment_date", format(startDate, 'yyyy-MM-dd'))
        .lte("appointment_date", format(endDate, 'yyyy-MM-dd'));

      // Fetch regular appointments for the scheduler owner to check for conflicts
      const schedulerUserIds = schedulers
        .filter(s => s.active && s.user_id)
        .map(s => s.user_id);
      
      const { data: regularAppointments } = schedulerUserIds.length > 0 
        ? await supabase
            .from("appointments")
            .select("*")
            .in("user_id", schedulerUserIds)
            .gte("start_time", format(startDate, 'yyyy-MM-dd'))
            .lte("start_time", format(addDays(endDate, 1), 'yyyy-MM-dd'))
        : { data: [] };

      const slots: SchedulerSlot[] = [];

      for (const scheduler of schedulers) {
        if (!scheduler.active || !scheduler.availability) continue;

        let availabilityArray;
        if (Array.isArray(scheduler.availability)) {
          availabilityArray = scheduler.availability;
        } else if (typeof scheduler.availability === 'object') {
          availabilityArray = Object.entries(scheduler.availability).map(([day, config]: [string, any]) => ({
            day,
            enabled: config?.enabled ?? false,
            timeSlots: config?.timeSlots || []
          }));
        } else {
          continue;
        }

        const duration = scheduler.duration || 60;
        const bufferTime = scheduler.buffer_time || 0;
        const minAdvanceNotice = scheduler.min_advance_notice || 0;
        
        for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
          const dayName = format(d, 'EEEE').toLowerCase();
          const dayAvailability = availabilityArray.find(day => {
            const dayKey = day.day.toLowerCase();
            return dayKey === dayName || dayKey === dayName.substring(0, 3) || dayName.startsWith(dayKey);
          });
          
          if (!dayAvailability?.enabled || !dayAvailability.timeSlots?.length) continue;

          for (const timeSlot of dayAvailability.timeSlots) {
            if (!timeSlot.start || !timeSlot.end) continue;
            
            const slotDate = format(d, 'yyyy-MM-dd');
            const startDateTime = parse(timeSlot.start, 'HH:mm', new Date(slotDate));
            const endDateTime = parse(timeSlot.end, 'HH:mm', new Date(slotDate));
            
            // Generate individual slots based on duration + buffer time
            let currentSlotStart = startDateTime;
            while (currentSlotStart < endDateTime) {
              const currentSlotEnd = addMinutes(currentSlotStart, duration);
              
              // Don't create slot if it would exceed the time range
              if (currentSlotEnd > endDateTime) break;
              
              const slotStartTime = format(currentSlotStart, 'HH:mm');
              const slotEndTime = format(currentSlotEnd, 'HH:mm');
              
              // Skip past slots for today + min advance notice
              const now = new Date();
              const minAdvanceTime = addMinutes(now, minAdvanceNotice);
              if (isSameDay(d, now) && currentSlotStart <= minAdvanceTime) {
                currentSlotStart = addMinutes(currentSlotStart, duration + bufferTime);
                continue;
              }
              
              // Check if slot conflicts with booked appointments
              // Normalize time format: database stores "22:00:00", we use "22:00"
              const isBooked = bookedAppointments?.some(booking => {
                const bookingTime = booking.appointment_time.substring(0, 5); // "22:00:00" -> "22:00"
                return booking.scheduler_id === scheduler.id &&
                  booking.appointment_date === slotDate &&
                  bookingTime === slotStartTime;
              });

              // Check if slot conflicts with regular appointments (including buffer time)
              // Only check appointments for this scheduler's owner
              const hasConflictWithRegularAppointment = regularAppointments?.some(appointment => {
                if (appointment.user_id !== scheduler.user_id) return false;
                const appointmentStart = new Date(appointment.start_time);
                const appointmentEnd = new Date(appointment.end_time);
                
                // Parse slot times with proper timezone handling
                const slotStartDateTime = parse(`${slotDate} ${slotStartTime}`, 'yyyy-MM-dd HH:mm', new Date());
                const slotEndDateTime = addMinutes(slotStartDateTime, duration);
                
                // Add buffer time to slot boundaries
                const bufferedSlotStart = addMinutes(slotStartDateTime, -bufferTime);
                const bufferedSlotEnd = addMinutes(slotEndDateTime, bufferTime);
                
                // Check for ANY overlap between buffered slot and appointment
                // Two intervals overlap if: start1 < end2 AND start2 < end1
                const overlaps = bufferedSlotStart < appointmentEnd && appointmentStart < bufferedSlotEnd;
                
                return overlaps;
              });

              // Add ALL slots (both available and booked) for calendar display
              slots.push({
                id: `${scheduler.id}-${slotDate}-${slotStartTime}`,
                schedulerId: scheduler.id,
                schedulerName: scheduler.name,
                date: new Date(d),
                startTime: slotStartTime,
                endTime: slotEndTime,
                duration: duration,
                isBooked: isBooked || hasConflictWithRegularAppointment,
                bookingId: isBooked ? bookedAppointments?.find(b => 
                  b.scheduler_id === scheduler.id && 
                  b.appointment_date === slotDate && 
                  b.appointment_time.substring(0, 5) === slotStartTime
                )?.id : undefined,
                bufferTime: bufferTime
              });
              
              // Move to next slot with buffer time applied
              currentSlotStart = addMinutes(currentSlotStart, duration + bufferTime);
            }
          }
        }
      }

      return slots;
    },
    enabled: !!schedulers?.length,
  });
};
