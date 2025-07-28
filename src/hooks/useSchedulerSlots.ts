import { useQuery } from "@tanstack/react-query";
import { useAppointmentSchedulers } from "./useAppointmentSchedulers";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, isSameDay, setHours, setMinutes, isWithinInterval, startOfDay, endOfDay } from "date-fns";

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
}

export const useSchedulerSlots = (date?: Date) => {
  const { data: schedulers } = useAppointmentSchedulers();

  return useQuery({
    queryKey: ["scheduler-slots", date ? format(date, 'yyyy-MM-dd') : 'all'],
    queryFn: async () => {
      console.log('useSchedulerSlots queryFn called with schedulers:', schedulers?.length, 'date:', date);
      if (!schedulers?.length) {
        console.log('No schedulers found, returning empty array');
        return [];
      }

      // Get booked appointments
      const { data: bookedAppointments } = await supabase
        .from("appointments_booked")
        .select("*")
        .gte("appointment_date", date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
        .lte("appointment_date", date ? format(date, 'yyyy-MM-dd') : format(addDays(new Date(), 7), 'yyyy-MM-dd'));

      const slots: SchedulerSlot[] = [];

      for (const scheduler of schedulers) {
        if (!scheduler.active || !scheduler.availability) continue;

        const availabilityArray = Array.isArray(scheduler.availability) 
          ? scheduler.availability 
          : Object.entries(scheduler.availability).map(([day, config]: [string, any]) => ({
              day,
              enabled: config.enabled,
              timeSlots: config.timeSlots || []
            }));

        // Generate slots for the next 30 days (or specific date)
        const startDate = date || new Date();
        const endDate = date ? new Date(date) : addDays(new Date(), 30);
        
        for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
          const dayName = format(d, 'EEEE').toLowerCase();
          console.log('Processing date:', format(d, 'yyyy-MM-dd'), 'dayName:', dayName);
          
          // More flexible day matching - try both full name and short versions
          const dayAvailability = availabilityArray.find(day => {
            const dayKey = day.day.toLowerCase();
            return dayKey === dayName || 
                   dayKey === dayName.substring(0, 3) || // "mon", "tue", etc.
                   dayKey === dayName.substring(0, 4);   // "mond", "tues", etc.
          });
          
          console.log('Day availability for', dayName, ':', dayAvailability);

          if (dayAvailability?.enabled && dayAvailability.timeSlots?.length) {
            for (const timeSlot of dayAvailability.timeSlots) {
              const slotDate = format(d, 'yyyy-MM-dd');
              const slotDateTime = new Date(`${slotDate}T${timeSlot.start}:00`);
              
              // Skip past time slots (only for today)
              const now = new Date();
              const isToday = isSameDay(d, now);
              if (isToday && slotDateTime <= now) {
                console.log('Skipping past slot:', timeSlot.start, 'for today');
                continue;
              }
              
              const isBooked = bookedAppointments?.some(booking => 
                booking.scheduler_id === scheduler.id &&
                booking.appointment_date === slotDate &&
                booking.appointment_time === timeSlot.start
              );

              console.log('Adding slot:', {
                schedulerId: scheduler.id,
                date: slotDate,
                time: timeSlot.start,
                isBooked
              });

              slots.push({
                id: `${scheduler.id}-${slotDate}-${timeSlot.start}`,
                schedulerId: scheduler.id,
                schedulerName: scheduler.name,
                date: new Date(d), // Create new date object to avoid reference issues
                startTime: timeSlot.start,
                endTime: timeSlot.end,
                duration: scheduler.duration,
                isBooked: !!isBooked,
                bookingId: isBooked ? bookedAppointments?.find(b => 
                  b.scheduler_id === scheduler.id &&
                  b.appointment_date === slotDate &&
                  b.appointment_time === timeSlot.start
                )?.id : undefined
              });
            }
          }
        }
      }

      console.log('Generated slots:', slots.length, slots);
      return slots;
    },
    enabled: !!schedulers?.length,
  });
};