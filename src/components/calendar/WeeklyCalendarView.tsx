import { format, addDays, startOfWeek, isToday, isSameDay } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useSchedulerSlots } from "@/hooks/useSchedulerSlots";
import { useState, useRef, useEffect } from "react";

interface WeeklyCalendarViewProps {
  currentDate: Date;
  onEventClick?: (eventId: string) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  filteredAppointments?: any[];
}

export const WeeklyCalendarView = ({ currentDate, onEventClick, onTimeSlotClick, filteredAppointments }: WeeklyCalendarViewProps) => {
  const { data: appointments } = useAppointments();
  const displayAppointments = filteredAppointments || appointments;
  const { data: schedulerSlots } = useSchedulerSlots(currentDate);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Event creation state
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventCreationStart, setEventCreationStart] = useState<{ date: Date; timeSlot: number } | null>(null);
  const [eventCreationEnd, setEventCreationEnd] = useState<{ date: Date; timeSlot: number } | null>(null);

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

  // Default to full 24-hour view, with toggle for working hours
  const [showExtendedHours, setShowExtendedHours] = useState(true);
  const timeSlots = showExtendedHours ? allTimeSlots : allTimeSlots.slice(12, 44); // Working hours: 6 AM to 10 PM

  // Get week days starting from Sunday
  const getWeekDays = () => {
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startOfCurrentWeek, i));
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    if (!displayAppointments) return [];
    return displayAppointments.filter(appointment => 
      isSameDay(new Date(appointment.start_time), date)
    );
  };

  const getSchedulerSlotsForDate = (date: Date) => {
    if (!schedulerSlots) return [];
    return schedulerSlots.filter(slot => 
      isSameDay(slot.date, date)
    );
  };

  // Calculate event position and styling
  const calculateEventStyle = (startTime: Date, endTime: Date, isExtendedHours: boolean = false) => {
    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    
    // Calculate position based on 30-minute slots (20px each)
    const slotHeight = 20;
    
    // Calculate minutes from start of day (00:00)
    let minutesFromStart = startHour * 60 + startMinutes;
    
    // For working hours view, adjust the offset
    if (!isExtendedHours) {
      minutesFromStart -= 6 * 60; // Subtract 6 AM offset
      // If event starts before 6 AM, position it at the top
      if (minutesFromStart < 0) minutesFromStart = 0;
    }
    
    const top = (minutesFromStart / 30) * slotHeight;

    // Calculate duration and height
    const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const height = Math.max((durationInMinutes / 30) * slotHeight, 15);

    return { top, height, visible: true };
  };

  // Handle event creation mouse events
  const handleMouseDown = (date: Date, timeSlotIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsCreatingEvent(true);
    setEventCreationStart({ date, timeSlot: timeSlotIndex });
    setEventCreationEnd({ date, timeSlot: timeSlotIndex });
  };

  const handleMouseMove = (date: Date, timeSlotIndex: number) => {
    if (isCreatingEvent && eventCreationStart) {
      setEventCreationEnd({ date, timeSlot: timeSlotIndex });
    }
  };

  const handleMouseUp = () => {
    if (isCreatingEvent && eventCreationStart && eventCreationEnd) {
      // Calculate start and end times
      const startDate = eventCreationStart.date;
      const endDate = eventCreationEnd.date;
      
      if (isSameDay(startDate, endDate)) {
        const minSlot = Math.min(eventCreationStart.timeSlot, eventCreationEnd.timeSlot);
        const maxSlot = Math.max(eventCreationStart.timeSlot, eventCreationEnd.timeSlot);
        
        const startTime = timeSlots[minSlot];
        const endTime = timeSlots[Math.min(maxSlot + 1, timeSlots.length - 1)];
        
        onTimeSlotClick?.(startDate, `${startTime}-${endTime}`);
      }
    }
    
    setIsCreatingEvent(false);
    setEventCreationStart(null);
    setEventCreationEnd(null);
  };

  // Get event creation preview style
  const getEventCreationPreviewStyle = () => {
    if (!isCreatingEvent || !eventCreationStart || !eventCreationEnd) return null;
    
    const minSlot = Math.min(eventCreationStart.timeSlot, eventCreationEnd.timeSlot);
    const maxSlot = Math.max(eventCreationStart.timeSlot, eventCreationEnd.timeSlot);
    
    const slotHeight = 20;
    const top = minSlot * slotHeight;
    const height = (maxSlot - minSlot + 1) * slotHeight;
    
    return { top, height };
  };

  // Auto-scroll to earliest event or 8 AM
  useEffect(() => {
    if (scrollContainerRef.current && displayAppointments) {
      let scrollPosition = 0;
      
      // Find earliest event in the current week
      const weekEvents = displayAppointments.filter(appointment => {
        const eventDate = new Date(appointment.start_time);
        return weekDays.some(day => isSameDay(eventDate, day));
      });
      
      if (weekEvents.length > 0) {
        const earliestEvent = weekEvents.reduce((earliest, current) => {
          return new Date(current.start_time) < new Date(earliest.start_time) ? current : earliest;
        });
        
        const eventHour = new Date(earliestEvent.start_time).getHours();
        const scrollToHour = Math.max(eventHour - 1, showExtendedHours ? 0 : 6); // 1 hour before event, but not before visible range
        
        if (showExtendedHours) {
          scrollPosition = (scrollToHour * 60 / 30) * 20; // Each 30-minute slot is 20px
        } else {
          const relativeHour = scrollToHour - 6; // Relative to 6 AM start
          scrollPosition = Math.max(relativeHour * 2 * 20, 0); // 2 slots per hour * 20px
        }
      } else {
        // Default to 8 AM if no events
        if (showExtendedHours) {
          scrollPosition = (8 * 60 / 30) * 20;
        } else {
          scrollPosition = 4 * 20; // 4 slots from 6 AM to 8 AM
        }
      }
      
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [showExtendedHours, displayAppointments, weekDays]);

  return (
    <div className="h-full max-h-screen flex flex-col overflow-hidden" onMouseUp={handleMouseUp}>
      {/* Week header with dates */}
      <div className="flex border-b bg-background sticky top-0 z-10 flex-shrink-0">
        <div className="w-16 border-r flex-shrink-0"></div>
        <div className="flex-1">
          <div className="grid grid-cols-7">
            {weekDays.map(day => {
              const isCurrentDay = isToday(day);
              return (
                <div key={day.toString()} className="p-2 text-center border-r">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-lg font-semibold ${
                    isCurrentDay 
                      ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto' 
                      : ''
                  }`}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Scrollable time grid */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex">
          {/* Fixed time labels column */}
          <div className="w-16 border-r bg-muted/20 flex-shrink-0">
            {timeSlots.map((time, index) => (
              <div 
                key={time} 
                className={`h-[20px] px-2 text-xs text-muted-foreground flex items-center justify-end ${
                  index % 2 === 0 ? 'border-b' : 'border-b border-dashed border-muted/50'
                }`}
              >
                {time.endsWith(':00') && (
                  <span className="font-medium text-[10px]">{time}</span>
                )}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          <div className="flex-1">
            <div className="grid grid-cols-7 h-full">
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentDay = isToday(day);
                const previewStyle = getEventCreationPreviewStyle();
                const showPreview = isCreatingEvent && eventCreationStart && isSameDay(eventCreationStart.date, day);
                
                return (
                  <div key={day.toString()} className={`border-r relative ${
                    isCurrentDay ? 'bg-primary/5' : ''
                  }`} style={{ height: `${timeSlots.length * 20}px` }}>
                    {/* Time slot grid */}
                    {timeSlots.map((time, index) => (
                      <div 
                        key={time} 
                        className={`h-[20px] hover:bg-accent/50 cursor-pointer transition-colors ${
                          index % 2 === 0 ? 'border-b' : 'border-b border-dashed border-muted/50'
                        }`}
                        onMouseDown={(e) => handleMouseDown(day, index, e)}
                        onMouseMove={() => handleMouseMove(day, index)}
                        onClick={() => !isCreatingEvent && onTimeSlotClick?.(day, time)}
                        title={`${format(day, 'MMM d')} at ${time}`}
                      />
                    ))}

                    {/* Event creation preview */}
                    {showPreview && previewStyle && (
                      <div
                        className="absolute left-0 right-0 bg-primary/30 border-l-4 border-primary z-15"
                        style={{
                          top: `${previewStyle.top}px`,
                          height: `${previewStyle.height}px`
                        }}
                      />
                    )}
                    
                    {/* Current time indicator */}
                    {isCurrentDay && (() => {
                      const now = new Date();
                      const currentHour = now.getHours();
                      const currentMinutes = now.getMinutes();
                      
                      // Calculate position from start of visible time range
                      let minutesFromStart = currentHour * 60 + currentMinutes;
                      if (!showExtendedHours) {
                        minutesFromStart -= 6 * 60; // Subtract 6 AM offset for working hours
                        if (minutesFromStart < 0) return null; // Don't show if before visible hours
                      }
                      
                      const top = (minutesFromStart / 30) * 20;
                      
                      return (
                        <div 
                          className="absolute left-0 right-0 h-0.5 bg-red-500 z-20"
                          style={{ top: `${top}px` }}
                        >
                          <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                      );
                    })()}
                    
                    {/* Events */}
                    {dayEvents.map((event, eventIndex) => {
                      const startTime = new Date(event.start_time);
                      const endTime = new Date(event.end_time);
                      
                      const style = calculateEventStyle(startTime, endTime, showExtendedHours);
                      
                      if (!style.visible) return null;
                      
                      // Calculate overlapping events positioning
                      const overlappingEvents = dayEvents.filter(otherEvent => {
                        const otherStart = new Date(otherEvent.start_time);
                        const otherEnd = new Date(otherEvent.end_time);
                        return (
                          (startTime < otherEnd && endTime > otherStart) || 
                          (otherStart < endTime && otherEnd > startTime)
                        );
                      });
                      
                      const eventWidth = overlappingEvents.length > 1 ? `${98 / overlappingEvents.length}%` : '98%';
                      const eventLeft = overlappingEvents.length > 1 ? `${(98 / overlappingEvents.length) * eventIndex + 1}%` : '1%';
                      
                      // Color coding by appointment color or type
                      const getEventColor = (event: any) => {
                        if (event.color) {
                          return `text-white border-l-4`;
                        }
                        
                        switch (event.appointment_type) {
                          case 'meeting': return 'bg-blue-500/90 text-white border-blue-600';
                          case 'consultation': return 'bg-green-500/90 text-white border-green-600';
                          case 'call': return 'bg-purple-500/90 text-white border-purple-600';
                          case 'follow-up': return 'bg-orange-500/90 text-white border-orange-600';
                          default: return 'bg-primary/90 text-primary-foreground border-primary';
                        }
                      };
                      
                      return (
                        <div
                          key={event.id}
                          className={`absolute rounded border-l-4 p-0.5 text-xs overflow-hidden cursor-pointer hover:shadow-md transition-all z-10 ${
                            getEventColor(event)
                          }`}
                          style={{
                            top: `${style.top}px`,
                            height: `${style.height}px`,
                            width: eventWidth,
                            left: eventLeft,
                            zIndex: 10 + eventIndex,
                            backgroundColor: event.color || undefined,
                            borderLeftColor: event.color || undefined
                          }}
                          onClick={() => onEventClick?.(event.id)}
                          title={`${event.title}\n${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}\n${event.description || ''}`}
                        >
                          <div className="font-semibold truncate text-xs leading-tight mb-0.5">
                            {event.title}
                          </div>
                          <div className="text-[11px] opacity-90 leading-tight">
                            {format(startTime, 'HH:mm')}
                          </div>
                          {style.height > 40 && (
                            <div className="text-[10px] opacity-75 leading-tight truncate">
                              {event.location}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
