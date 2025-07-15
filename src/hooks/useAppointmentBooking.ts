
import { useState, useMemo } from "react";
import { usePublicScheduler } from "@/hooks/useAppointmentSchedulers";
import { addDays, format, startOfDay, addMinutes, isAfter, isBefore, parseISO } from "date-fns";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  day: string;
  enabled: boolean;
  timeSlots: TimeSlot[];
}

interface AvailableSlot {
  time: string;
  available: boolean;
  duration: number;
}

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Type guard to check if data is a valid DayAvailability array
const isDayAvailabilityArray = (data: any): data is DayAvailability[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' &&
    typeof item.day === 'string' &&
    typeof item.enabled === 'boolean' &&
    Array.isArray(item.timeSlots)
  );
};

export const useAppointmentBooking = (slug: string) => {
  const { data: scheduler, isLoading } = usePublicScheduler(slug);
  
  const generateAvailableSlots = (selectedDate: Date): AvailableSlot[] => {
    if (!scheduler || !scheduler.availability) {
      console.log('No scheduler or availability data');
      return [];
    }

    // Safely cast the availability data
    const availabilityData = scheduler.availability;
    if (!isDayAvailabilityArray(availabilityData)) {
      console.error('Invalid availability data format:', availabilityData);
      return [];
    }

    const dayOfWeek = DAYS_OF_WEEK[selectedDate.getDay()];
    const dayAvailability = availabilityData.find(day => day.day === dayOfWeek);

    console.log('Day of week:', dayOfWeek);
    console.log('Day availability:', dayAvailability);

    if (!dayAvailability || !dayAvailability.enabled || !dayAvailability.timeSlots?.length) {
      console.log('Day not available or no time slots configured');
      return [];
    }

    const slots: AvailableSlot[] = [];
    const duration = scheduler.duration || 60;
    const bufferTime = scheduler.buffer_time || 15;

    console.log('Processing time slots:', dayAvailability.timeSlots);

    // Process each configured time slot
    dayAvailability.timeSlots.forEach((timeSlot, index) => {
      console.log(`Processing time slot ${index}:`, timeSlot);
      
      // Parse start and end times
      const [startHour, startMin] = timeSlot.startTime.split(':').map(Number);
      const [endHour, endMin] = timeSlot.endTime.split(':').map(Number);
      
      let currentTime = new Date(selectedDate);
      currentTime.setHours(startHour, startMin, 0, 0);
      
      const endTime = new Date(selectedDate);
      endTime.setHours(endHour, endMin, 0, 0);

      console.log(`Time slot from ${currentTime.toLocaleTimeString()} to ${endTime.toLocaleTimeString()}`);

      // Generate appointment slots within this time window
      while (currentTime < endTime) {
        const slotEndTime = addMinutes(currentTime, duration);
        
        // Check if the slot fits within the availability window
        if (slotEndTime <= endTime) {
          const timeString = format(currentTime, 'HH:mm');
          
          // Check if slot is in the future (for today only)
          const now = new Date();
          const isToday = selectedDate.toDateString() === now.toDateString();
          const isInFuture = !isToday || currentTime > now;
          
          console.log(`Adding slot: ${timeString}, available: ${isInFuture}`);
          
          slots.push({
            time: timeString,
            available: isInFuture,
            duration: duration
          });
        }
        
        // Move to next slot (duration + buffer time)
        currentTime = addMinutes(currentTime, duration + bufferTime);
      }
    });

    console.log('Final slots:', slots);
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getAvailableDates = (): Date[] => {
    if (!scheduler) return [];
    
    const dates: Date[] = [];
    const maxDays = scheduler.max_advance_booking || 30;
    const minHours = scheduler.min_advance_notice || 24;
    
    const startDate = addDays(new Date(), Math.ceil(minHours / 24));
    
    // Safely cast the availability data
    const availabilityData = scheduler.availability;
    if (!isDayAvailabilityArray(availabilityData)) {
      console.error('Invalid availability data format:', availabilityData);
      return [];
    }
    
    for (let i = 0; i < maxDays; i++) {
      const date = addDays(startDate, i);
      const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
      const dayAvailability = availabilityData.find(day => day.day === dayOfWeek);
      
      // Only include dates that have enabled availability and configured time slots
      if (dayAvailability && dayAvailability.enabled && dayAvailability.timeSlots?.length > 0) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  return {
    scheduler,
    isLoading,
    generateAvailableSlots,
    getAvailableDates
  };
};
