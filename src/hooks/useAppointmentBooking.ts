
import { usePublicScheduler } from "./useAppointmentSchedulers";
import { format, addDays, isSameDay, setHours, setMinutes } from "date-fns";

export const useAppointmentBooking = (slug: string) => {
  const { data: scheduler, isLoading, error } = usePublicScheduler(slug);

  const generateAvailableSlots = (date: Date) => {
    if (!scheduler?.availability) return [];
    
    const dayName = format(date, 'EEEE').toLowerCase();
    const availabilityData = scheduler.availability as any[];
    const dayAvailability = availabilityData.find(day => day.day === dayName);
    
    if (!dayAvailability?.enabled || !dayAvailability?.timeSlots?.length) {
      return [];
    }
    
    const slots: Array<{time: string, available: boolean}> = [];
    
    dayAvailability.timeSlots.forEach((timeSlot: any) => {
      const timeString = timeSlot.startTime;
      const [startHour, startMin] = timeSlot.startTime.split(':').map(Number);
      const slotDateTime = new Date(date);
      slotDateTime.setHours(startHour, startMin, 0, 0);
      
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const isInFuture = !isToday || slotDateTime > now;
      
      if (isInFuture) {
        slots.push({
          time: timeString,
          available: true // Simplified for now, in real implementation check against booked slots
        });
      }
    });
    
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getAvailableDates = () => {
    if (!scheduler?.availability) return [];
    
    const dates: Date[] = [];
    const today = new Date();
    const maxDays = scheduler.max_advance_booking || 30;
    
    for (let i = 0; i < maxDays; i++) {
      const date = addDays(today, i);
      const dayName = format(date, 'EEEE').toLowerCase();
      const availabilityData = scheduler.availability as any[];
      const dayAvailability = availabilityData.find(day => day.day === dayName);
      
      if (dayAvailability?.enabled && dayAvailability?.timeSlots?.length) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  return {
    scheduler,
    isLoading,
    error,
    generateAvailableSlots,
    getAvailableDates
  };
};
