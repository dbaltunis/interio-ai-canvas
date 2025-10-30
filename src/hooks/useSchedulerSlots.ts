import { useQuery } from "@tanstack/react-query";
import { useAppointmentSchedulers } from "./useAppointmentSchedulers";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, isSameDay } from "date-fns";

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
      if (!schedulers?.length) return [];

      const { data: bookedAppointments } = await supabase
        .from("appointments_booked")
        .select("*")
        .gte("appointment_date", date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
        .lte("appointment_date", date ? format(date, 'yyyy-MM-dd') : format(addDays(new Date(), 7), 'yyyy-MM-dd'));

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
            const slotDateTime = new Date(`${slotDate}T${timeSlot.start}:00`);
            
            if (isSameDay(d, new Date()) && slotDateTime <= new Date()) continue;
            
            const isBooked = bookedAppointments?.some(booking => 
              booking.scheduler_id === scheduler.id &&
              booking.appointment_date === slotDate &&
              booking.appointment_time === timeSlot.start
            );

            slots.push({
              id: `${scheduler.id}-${slotDate}-${timeSlot.start}`,
              schedulerId: scheduler.id,
              schedulerName: scheduler.name,
              date: new Date(d),
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

      return slots;
    },
    enabled: !!schedulers?.length,
  });
};
