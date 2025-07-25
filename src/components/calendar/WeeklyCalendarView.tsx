import { format, addDays, startOfWeek, isToday, isSameDay } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useState, useRef, useEffect } from "react";

interface WeeklyCalendarViewProps {
  currentDate: Date;
  onEventClick?: (eventId: string) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
}

export const WeeklyCalendarView = ({ currentDate, onEventClick, onTimeSlotClick }: WeeklyCalendarViewProps) => {
  const { data: appointments } = useAppointments();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate extended time slots from 6 AM to 10 PM
  const timeSlots = (() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 22) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
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
    if (!appointments) return [];
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.start_time), date)
    );
  };

  // Calculate event position and styling
  const calculateEventStyle = (startTime: Date, endTime: Date) => {
    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMinutes = endTime.getMinutes();

    // Find the start slot index (each slot is 30 minutes)
    const startSlotIndex = timeSlots.findIndex(slot => {
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      return slotHour === startHour && (
        (slotMinute === 0 && startMinutes < 30) ||
        (slotMinute === 30 && startMinutes >= 30)
      );
    });

    if (startSlotIndex === -1) return { top: 0, height: 32, visible: false };

    // Calculate exact position within the slot
    const slotHeight = 32; // 8rem / 2 = 32px per 30-min slot
    const minutesFromSlotStart = startMinutes % 30;
    const top = startSlotIndex * slotHeight + (minutesFromSlotStart / 30) * slotHeight;

    // Calculate duration and height
    const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const height = Math.max((durationInMinutes / 30) * slotHeight, 20);

    return { top, height, visible: true };
  };

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const scrollToHour = Math.max(0, currentHour - 2); // Scroll 2 hours before current time
      const scrollPosition = (scrollToHour - 6) * 64; // Each hour is 64px (2 slots * 32px)
      scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* All-day events section */}
      <div className="border-b bg-muted/30">
        <div className="grid grid-cols-8 text-xs">
          <div className="p-2 border-r font-medium text-muted-foreground">All day</div>
          {weekDays.map(day => (
            <div key={day.toString()} className="p-2 border-r min-h-8">
              {/* All-day events would go here */}
            </div>
          ))}
        </div>
      </div>

      {/* Week header with dates */}
      <div className="grid grid-cols-8 border-b bg-background sticky top-0 z-10">
        <div className="p-3 border-r"></div>
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
      
      {/* Scrollable time grid */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 relative">
          {/* Time labels column */}
          <div className="border-r bg-muted/20">
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
          {weekDays.map(day => {
            const dayEvents = getEventsForDate(day);
            const isCurrentDay = isToday(day);
            
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
                  
                  if (currentHour >= 6 && currentHour <= 22) {
                    const minutesFromStart = (currentHour - 6) * 60 + currentMinutes;
                    const top = (minutesFromStart / 30) * 32;
                    
                    return (
                      <div 
                        className="absolute left-0 right-0 h-0.5 bg-red-500 z-20"
                        style={{ top: `${top}px` }}
                      >
                        <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {/* Events */}
                {dayEvents.map((event, eventIndex) => {
                  const startTime = new Date(event.start_time);
                  const endTime = new Date(event.end_time);
                  const style = calculateEventStyle(startTime, endTime);
                  
                  if (!style.visible) return null;
                  
                  // Color coding by appointment type
                  const getEventColor = (type: string) => {
                    switch (type) {
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
                      className={`absolute left-0.5 right-0.5 rounded border-l-4 p-1 text-xs overflow-hidden cursor-pointer hover:shadow-md transition-all z-10 ${
                        getEventColor(event.appointment_type || 'meeting')
                      }`}
                      style={{
                        top: `${style.top}px`,
                        height: `${style.height}px`,
                        marginLeft: `${eventIndex * 2}px`, // Slight offset for overlapping events
                        zIndex: 10 + eventIndex
                      }}
                      onClick={() => onEventClick?.(event.id)}
                      title={`${event.title}\n${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}\n${event.description || ''}`}
                    >
                      <div className="font-medium truncate text-xs leading-tight">
                        {event.title}
                      </div>
                      <div className="text-xs opacity-90 leading-tight">
                        {format(startTime, 'HH:mm')}
                      </div>
                      {style.height > 40 && (
                        <div className="text-xs opacity-75 leading-tight truncate">
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
  );
};
