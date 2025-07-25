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

  // Generate 24-hour time slots
  const timeSlots = (() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  })();

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

  // Calculate event position and styling for 24-hour view
  const calculateEventStyle = (startTime: Date, endTime: Date) => {
    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMinutes = endTime.getMinutes();
    
    // Calculate position based on 30-minute slots (24 hours)
    const slotHeight = 32; // Each 30-minute slot is 32px
    
    // Calculate minutes from midnight (00:00) start
    const minutesFromStart = startHour * 60 + startMinutes;
    const top = (minutesFromStart / 30) * slotHeight;

    // Calculate duration in minutes
    const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const height = Math.max((durationInMinutes / 30) * slotHeight, 20);

    return { top, height, visible: true };
  };

  // Auto-scroll to working hours (8 AM) on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Scroll to 8 AM to show working hours by default
      const targetHour = 8;
      const scrollPosition = targetHour * 64; // Each hour is 64px (2 slots * 32px)
      
      // Use setTimeout to ensure the DOM is fully rendered
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollPosition;
        }
      }, 100);
    }
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* All-day events section */}
      <div className="border-b bg-muted/30 flex-shrink-0">
        <div className="flex">
          <div className="p-1 border-r font-medium text-muted-foreground w-16 flex-shrink-0">All day</div>
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map(day => (
              <div key={day.toString()} className="p-2 border-r min-h-8">
                {/* All-day events would go here */}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Week header with dates */}
      <div className="border-b bg-background sticky top-0 z-10 flex-shrink-0 flex">
        <div className="p-3 border-r w-16 flex-shrink-0"></div>
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map(day => {
            const isCurrentDay = isToday(day);
            return (
              <div key={day.toString()} className="p-3 text-center border-r">
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
      
      {/* Scrollable time grid */}
      <div 
        ref={scrollContainerRef} 
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ height: 'calc(100vh - 200px)' }}
      >
        <div className="flex min-h-full">
          {/* Time labels column */}
          <div className="border-r bg-muted/20 w-16 flex-shrink-0">
            {timeSlots.map((time, index) => (
              <div 
                key={time} 
                className={`h-8 p-1 text-xs text-muted-foreground flex items-center ${
                  index % 2 === 0 ? 'border-b' : 'border-b border-dashed border-muted'
                }`}
              >
                {index % 2 === 0 && (
                  <span className="font-medium">{time}</span>
                )}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map(day => {
              const dayEvents = getEventsForDate(day);
              const isCurrentDay = isToday(day);
              
              // Group overlapping events
              const groupedEvents = (() => {
                const groups: any[] = [];
                dayEvents.forEach(event => {
                  const eventStart = new Date(event.start_time);
                  const eventEnd = new Date(event.end_time);
                  
                  // Find if this event overlaps with any existing group
                  let addedToGroup = false;
                  for (let group of groups) {
                    const hasOverlap = group.some((groupEvent: any) => {
                      const groupStart = new Date(groupEvent.start_time);
                      const groupEnd = new Date(groupEvent.end_time);
                      return eventStart < groupEnd && eventEnd > groupStart;
                    });
                    
                    if (hasOverlap) {
                      group.push(event);
                      addedToGroup = true;
                      break;
                    }
                  }
                  
                  if (!addedToGroup) {
                    groups.push([event]);
                  }
                });
                return groups;
              })();
              
              return (
                <div key={day.toString()} className={`border-r relative ${
                  isCurrentDay ? 'bg-primary/5' : ''
                }`}>
                {/* Time slot grid */}
                {timeSlots.map((time, index) => (
                  <div 
                    key={time} 
                    className={`h-8 hover:bg-accent/30 cursor-pointer transition-colors ${
                      index % 2 === 0 ? 'border-b' : 'border-b border-dashed border-muted'
                    }`}
                    onClick={() => onTimeSlotClick?.(day, time)}
                    title={`${format(day, 'MMM d')} at ${time}`}
                  />
                ))}
                
                {/* Current time indicator */}
                {isCurrentDay && (() => {
                  const now = new Date();
                  const currentHour = now.getHours();
                  const currentMinutes = now.getMinutes();
                  
                  // Calculate position for 24-hour view
                  const minutesFromStart = currentHour * 60 + currentMinutes;
                  const top = (minutesFromStart / 30) * 32;
                  
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
                {groupedEvents.map((group, groupIndex) => 
                  group.map((event: any, eventIndex: number) => {
                    const startTime = new Date(event.start_time);
                    const endTime = new Date(event.end_time);
                    const style = calculateEventStyle(startTime, endTime);
                    
                    if (!style.visible) return null;
                    
                    // Calculate width and position for overlapping events
                    const totalInGroup = group.length;
                    const eventWidth = totalInGroup > 1 ? `${95 / totalInGroup}%` : '95%';
                    const leftPosition = totalInGroup > 1 ? `${(eventIndex * 95) / totalInGroup}%` : '2.5%';
                    
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
                        className={`absolute rounded border-l-4 p-1 text-xs overflow-hidden cursor-pointer hover:shadow-md transition-all z-10 ${
                          getEventColor(event)
                        }`}
                        style={{
                          top: `${style.top}px`,
                          height: `${style.height}px`,
                          left: leftPosition,
                          width: eventWidth,
                          zIndex: 10 + groupIndex * 10 + eventIndex,
                          backgroundColor: event.color || undefined,
                          borderLeftColor: event.color || undefined
                        }}
                        onClick={() => onEventClick?.(event.id)}
                        title={`${event.title}\n${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}\n${event.description || ''}`}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-3 h-3 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                            {event.user_id ? 'U' : '?'}
                          </div>
                          <div className="font-medium truncate text-xs leading-tight flex-1">
                            {event.title}
                          </div>
                        </div>
                        <div className="text-xs opacity-90 leading-tight">
                          {format(startTime, 'HH:mm')}
                        </div>
                        {style.height > 60 && (
                          <div className="text-xs opacity-75 leading-tight truncate">
                            {event.location}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
               </div>
             );
           })}
         </div>
        </div>
      </div>
    </div>
  );
};
