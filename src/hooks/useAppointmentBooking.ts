
import { usePublicScheduler } from "./useAppointmentSchedulers";
import { format, addDays, isSameDay, setHours, setMinutes, addMinutes } from "date-fns";

export const useAppointmentBooking = (slug: string) => {
  const { data: scheduler, isLoading, error } = usePublicScheduler(slug);

  const generateAvailableSlots = (date: Date) => {
    if (!scheduler?.availability) return [];
    
    const dayName = format(date, 'EEEE').toLowerCase();
    
    // Handle both array and object format for availability
    const availabilityArray = Array.isArray(scheduler.availability) 
      ? scheduler.availability 
      : Object.entries(scheduler.availability).map(([day, config]: [string, any]) => ({
          day,
          enabled: config.enabled,
          timeSlots: config.timeSlots || []
        }));
    
    const dayAvailability = availabilityArray.find(day => 
      day.day.toLowerCase() === dayName
    );
    
    if (!dayAvailability?.enabled || !dayAvailability?.timeSlots?.length) {
      return [];
    }
    
    const slots: Array<{time: string, available: boolean}> = [];
    const duration = scheduler.duration || 60;
    const bufferTime = scheduler.buffer_time || 0;
    const minAdvanceNotice = scheduler.min_advance_notice || 0;
    const now = new Date();
    const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
    
    dayAvailability.timeSlots.forEach((timeSlot: any) => {
      const startTimeStr = timeSlot.start || timeSlot.startTime;
      const endTimeStr = timeSlot.end || timeSlot.endTime;
      
      if (!startTimeStr || !endTimeStr) return;
      
      // Parse start and end times
      const [startHour, startMin] = startTimeStr.split(':').map(Number);
      const [endHour, endMin] = endTimeStr.split(':').map(Number);
      
      const startTime = setMinutes(setHours(date, startHour), startMin);
      const endTime = setMinutes(setHours(date, endHour), endMin);
      
      // Generate slots every (duration + buffer) minutes
      let currentSlotStart = startTime;
      
      while (currentSlotStart < endTime) {
        // Calculate slot end time
        const slotEndTime = addMinutes(currentSlotStart, duration);
        
        // Don't create slot if it exceeds the time range
        if (slotEndTime > endTime) break;
        
        // Check if slot is in the future (for today) + min advance notice
        const minAdvanceTime = addMinutes(now, minAdvanceNotice * 60); // min_advance_notice is in hours
        const isInFuture = !isToday || currentSlotStart > minAdvanceTime;
        
        if (isInFuture) {
          slots.push({
            time: format(currentSlotStart, 'HH:mm'),
            available: true
          });
        }
        
        // Move to next slot (duration + buffer time)
        currentSlotStart = addMinutes(currentSlotStart, duration + bufferTime);
      }
    });
    
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getAvailableDates = () => {
    if (!scheduler?.availability) return [];
    
    const dates: Date[] = [];
    const today = new Date();
    const maxDays = scheduler.max_advance_booking || 30;
    
    // Handle both array and object format for availability
    const availabilityArray = Array.isArray(scheduler.availability) 
      ? scheduler.availability 
      : Object.entries(scheduler.availability).map(([day, config]: [string, any]) => ({
          day,
          enabled: config.enabled,
          timeSlots: config.timeSlots || []
        }));
    
    for (let i = 0; i < maxDays; i++) {
      const date = addDays(today, i);
      const dayName = format(date, 'EEEE').toLowerCase();
      const dayAvailability = availabilityArray.find(day => 
        day.day.toLowerCase() === dayName
      );
      
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
