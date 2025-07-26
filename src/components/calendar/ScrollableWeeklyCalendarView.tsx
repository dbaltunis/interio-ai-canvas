import { format, addDays, startOfWeek, isToday, isSameDay, addWeeks, subWeeks } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useSchedulerSlots } from "@/hooks/useSchedulerSlots";
import { useState, useRef, useEffect, useCallback } from "react";

interface ScrollableWeeklyCalendarViewProps {
  currentDate: Date;
  onEventClick?: (eventId: string) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  filteredAppointments?: any[];
}

export const ScrollableWeeklyCalendarView = ({ currentDate, onEventClick, onTimeSlotClick, filteredAppointments }: ScrollableWeeklyCalendarViewProps) => {
  const { data: appointments } = useAppointments();
  const displayAppointments = filteredAppointments || appointments;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Event creation state
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventCreationStart, setEventCreationStart] = useState<{ date: Date; timeSlot: number } | null>(null);
  const [eventCreationEnd, setEventCreationEnd] = useState<{ date: Date; timeSlot: number } | null>(null);

  // Generate multiple weeks for horizontal scrolling (current week + 20 weeks before and after)
  const numberOfWeeks = 41; // 20 before + current + 20 after
  const centerWeekIndex = 20;

  // Generate all 24-hour time slots (00:00 to 23:30)
  const allTimeSlots = (() => {
    const slots = [];
    for (let hour = 0; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 23) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    slots.push('23:30');
    return slots;
  })();

  const [showExtendedHours, setShowExtendedHours] = useState(false);
  const timeSlots = showExtendedHours ? allTimeSlots : allTimeSlots.slice(12, 44); // Working hours: 6 AM to 10 PM

  // Get single week days starting from Sunday for each week
  const getWeekDays = (weekDate: Date) => {
    const startOfCurrentWeek = startOfWeek(weekDate, { weekStartsOn: 0 });
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startOfCurrentWeek, i));
    }
    return days;
  };
  // Generate weeks for horizontal scrolling
  const getWeeks = () => {
    const weeks = [];
    const startWeek = subWeeks(currentDate, centerWeekIndex);
    
    for (let weekIndex = 0; weekIndex < numberOfWeeks; weekIndex++) {
      const weekStart = addWeeks(startWeek, weekIndex);
      const startOfCurrentWeek = startOfWeek(weekStart, { weekStartsOn: 0 });
      const days = getWeekDays(weekStart);
      
      weeks.push({
        weekIndex,
        startDate: startOfCurrentWeek,
        days
      });
    }
    
    return weeks;
  };

  const weeks = getWeeks();

  // Scroll to current week on mount (horizontal)
  useEffect(() => {
    if (scrollContainerRef.current) {
      const weekWidth = scrollContainerRef.current.scrollWidth / numberOfWeeks;
      const scrollPosition = centerWeekIndex * weekWidth;
      scrollContainerRef.current.scrollLeft = scrollPosition;
    }
  }, []);

  const handleMouseDown = (date: Date, timeSlot: string) => {
    const timeSlotIndex = timeSlots.indexOf(timeSlot);
    setIsCreatingEvent(true);
    setEventCreationStart({ date, timeSlot: timeSlotIndex });
    setEventCreationEnd({ date, timeSlot: timeSlotIndex });
  };

  const handleMouseEnter = (date: Date, timeSlot: string) => {
    if (isCreatingEvent && eventCreationStart) {
      const timeSlotIndex = timeSlots.indexOf(timeSlot);
      setEventCreationEnd({ date, timeSlot: timeSlotIndex });
    }
  };

  const handleMouseUp = () => {
    if (isCreatingEvent && eventCreationStart && eventCreationEnd && onTimeSlotClick) {
      const startTime = timeSlots[Math.min(eventCreationStart.timeSlot, eventCreationEnd.timeSlot)];
      onTimeSlotClick(eventCreationStart.date, startTime);
    }
    setIsCreatingEvent(false);
    setEventCreationStart(null);
    setEventCreationEnd(null);
  };

  const isSlotInSelection = (date: Date, timeSlotIndex: number) => {
    if (!isCreatingEvent || !eventCreationStart || !eventCreationEnd) return false;
    
    const isSameDate = isSameDay(date, eventCreationStart.date);
    if (!isSameDate) return false;
    
    const minSlot = Math.min(eventCreationStart.timeSlot, eventCreationEnd.timeSlot);
    const maxSlot = Math.max(eventCreationStart.timeSlot, eventCreationEnd.timeSlot);
    
    return timeSlotIndex >= minSlot && timeSlotIndex <= maxSlot;
  };

  const getEventsForSlot = (date: Date, timeSlot: string) => {
    if (!displayAppointments) return [];
    
    return displayAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.start_time);
      const appointmentTime = format(appointmentDate, 'HH:mm');
      
      return isSameDay(appointmentDate, date) && appointmentTime === timeSlot;
    });
  };

  return (
    <div className="h-full max-h-screen flex flex-col overflow-hidden" onMouseUp={handleMouseUp}>
      {/* Horizontal scrolling weeks container */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Single header row */}
        <div className="flex-shrink-0 border-b bg-background">
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto overflow-y-hidden"
            style={{ scrollBehavior: 'smooth' }}
          >
            {weeks.map((week) => (
              <div key={week.weekIndex} data-week={week.weekIndex} className="flex-shrink-0 border-r">
                {/* Week header */}
                <div className="flex bg-background">
                  <div className="w-16 border-r flex-shrink-0 bg-muted/30 flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      {format(week.startDate, 'MMM')}
                    </span>
                  </div>
                  {week.days.map((day, dayIndex) => (
                    <div key={dayIndex} className="w-24 p-2 text-center border-r last:border-r-0">
                      <div className={`text-sm font-medium ${isToday(day) ? 'text-primary' : 'text-foreground'}`}>
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-lg ${isToday(day) ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-muted-foreground'}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable content with time slots */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            {/* Time column - fixed */}
            <div className="w-16 flex-shrink-0 border-r bg-muted/20">
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot} className="h-12 border-b text-xs text-muted-foreground flex items-center justify-center">
                  {timeSlot}
                </div>
              ))}
            </div>
            
            {/* Horizontal scrolling weeks content */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex">
                {weeks.map((week) => (
                  <div key={week.weekIndex} className="flex-shrink-0 border-r">
                    {week.days.map((day, dayIndex) => (
                      <div key={dayIndex} className="w-24 border-r last:border-r-0">
                        {timeSlots.map((timeSlot, timeIndex) => {
                          const events = getEventsForSlot(day, timeSlot);
                          const isInSelection = isSlotInSelection(day, timeIndex);
                          
                          return (
                            <div
                              key={timeSlot}
                              className={`h-12 border-b border-border/30 relative cursor-pointer hover:bg-muted/50 transition-colors ${
                                isInSelection ? 'bg-primary/20' : ''
                              }`}
                              onMouseDown={() => handleMouseDown(day, timeSlot)}
                              onMouseEnter={() => handleMouseEnter(day, timeSlot)}
                            >
                              {events.map((event) => (
                                <div
                                  key={event.id}
                                  className="absolute inset-x-1 top-1 bottom-1 bg-primary/80 text-primary-foreground text-xs p-1 rounded truncate cursor-pointer hover:bg-primary transition-colors"
                                  onClick={() => onEventClick?.(event.id)}
                                >
                                  <div className="font-medium truncate">{event.title}</div>
                                  {event.client_name && (
                                    <div className="text-xs opacity-90 truncate">{event.client_name}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};