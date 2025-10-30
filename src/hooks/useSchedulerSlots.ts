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

export const useSchedulerSlots = (weekStartDate?: Date) => {
  const { data: schedulers } = useAppointmentSchedulers();

  return useQuery({
    queryKey: ["scheduler-slots", weekStartDate ? format(weekStartDate, 'yyyy-MM-dd') : 'all'],
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

      // Fetch regular appointments to check for conflicts
      const { data: regularAppointments } = await supabase
        .from("appointments")
        .select("*")
        .gte("start_time", format(startDate, 'yyyy-MM-dd'))
        .lte("start_time", format(addDays(endDate, 1), 'yyyy-MM-dd'));

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
              const hasConflictWithRegularAppointment = regularAppointments?.some(appointment => {
                const appointmentStart = new Date(appointment.start_time);
                const appointmentEnd = new Date(appointment.end_time);
                const slotStart = new Date(`${slotDate}T${slotStartTime}`);
                const slotEnd = new Date(`${slotDate}T${slotEndTime}`);
                
                // Add buffer time to both ends
                const bufferedSlotStart = addMinutes(slotStart, -bufferTime);
                const bufferedSlotEnd = addMinutes(slotEnd, bufferTime);
                
                // Check for overlap
                return isAfter(bufferedSlotEnd, appointmentStart) && isBefore(bufferedSlotStart, appointmentEnd);
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
