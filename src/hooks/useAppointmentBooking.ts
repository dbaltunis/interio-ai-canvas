
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

export const useAppointmentBooking = (slug: string) => {
  const { data: scheduler, isLoading } = usePublicScheduler(slug);
  
  const generateAvailableSlots = (selectedDate: Date): AvailableSlot[] => {
    if (!scheduler || !scheduler.availability) {
      return [];
    }

    const dayOfWeek = DAYS_OF_WEEK[selectedDate.getDay()];
    const availability = scheduler.availability as DayAvailability[];
    const dayAvailability = availability.find(day => day.day === dayOfWeek);

    if (!dayAvailability || !dayAvailability.enabled) {
      return [];
    }

    const slots: AvailableSlot[] = [];
    const duration = scheduler.duration || 60;
    const bufferTime = scheduler.buffer_time || 15;

    dayAvailability.timeSlots.forEach(timeSlot => {
      const [startHour, startMin] = timeSlot.startTime.split(':').map(Number);
      const [endHour, endMin] = timeSlot.endTime.split(':').map(Number);
      
      let currentTime = new Date(selectedDate);
      currentTime.setHours(startHour, startMin, 0, 0);
      
      const endTime = new Date(selectedDate);
      endTime.setHours(endHour, endMin, 0, 0);

      // Generate slots within the time window
      while (currentTime < endTime) {
        const slotEndTime = addMinutes(currentTime, duration);
        
        // Check if the slot fits within the availability window
        if (slotEndTime <= endTime) {
          const timeString = format(currentTime, 'HH:mm');
          
          // Check if slot is in the future (for today only)
          const now = new Date();
          const isToday = selectedDate.toDateString() === now.toDateString();
          const isInFuture = !isToday || currentTime > now;
          
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

    return slots.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getAvailableDates = (): Date[] => {
    if (!scheduler) return [];
    
    const dates: Date[] = [];
    const maxDays = scheduler.max_advance_booking || 30;
    const minHours = scheduler.min_advance_notice || 24;
    
    const startDate = addDays(new Date(), Math.ceil(minHours / 24));
    
    for (let i = 0; i < maxDays; i++) {
      const date = addDays(startDate, i);
      const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
      const availability = scheduler.availability as DayAvailability[];
      const dayAvailability = availability.find(day => day.day === dayOfWeek);
      
      if (dayAvailability && dayAvailability.enabled) {
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
