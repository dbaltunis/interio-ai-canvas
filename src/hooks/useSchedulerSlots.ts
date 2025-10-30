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

export const useSchedulerSlots = (date?: Date) => {
  const { data: schedulers } = useAppointmentSchedulers();

  return useQuery({
    queryKey: ["scheduler-slots", date ? format(date, 'yyyy-MM-dd') : 'all'],
    queryFn: async () => {
      if (!schedulers?.length) return [];

      // Fetch booked appointments
      const { data: bookedAppointments } = await supabase
        .from("appointments_booked")
        .select("*")
        .gte("appointment_date", date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
        .lte("appointment_date", date ? format(date, 'yyyy-MM-dd') : format(addDays(new Date(), 30), 'yyyy-MM-dd'));

      // Fetch regular appointments to check for conflicts
      const { data: regularAppointments } = await supabase
        .from("appointments")
        .select("*")
        .gte("start_time", date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
        .lte("start_time", date ? format(addDays(date || new Date(), 1), 'yyyy-MM-dd') : format(addDays(new Date(), 30), 'yyyy-MM-dd'));

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

        const startDate = date || new Date();
        const endDate = date ? new Date(date) : addDays(new Date(), scheduler.max_advance_booking || 30);
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
              const isBooked = bookedAppointments?.some(booking => 
                booking.scheduler_id === scheduler.id &&
                booking.appointment_date === slotDate &&
                booking.appointment_time === slotStartTime
              );

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

              // Only add slot if not booked and no conflicts
              if (!isBooked && !hasConflictWithRegularAppointment) {
                slots.push({
                  id: `${scheduler.id}-${slotDate}-${slotStartTime}`,
                  schedulerId: scheduler.id,
                  schedulerName: scheduler.name,
                  date: new Date(d),
                  startTime: slotStartTime,
                  endTime: slotEndTime,
                  duration: duration,
                  isBooked: false,
                  bufferTime: bufferTime
                });
              }
              
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
