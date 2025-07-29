import { format, isSameDay, isToday } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useState, useRef, useEffect } from "react";

interface DailyCalendarViewProps {
  currentDate: Date;
  onEventClick?: (eventId: string) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
}

export const DailyCalendarView = ({ currentDate, onEventClick, onTimeSlotClick }: DailyCalendarViewProps) => {
  const { data: appointments } = useAppointments();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate time slots - MAIN HOURS for grid structure (6 AM to 10 PM)
  const mainTimeSlots = (() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  })();

  // Generate ALL time slots for precise positioning (including 30-minute marks)
  const allTimeSlots = (() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 22) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  })();

  // Get events for the current day
  const getDayEvents = () => {
    if (!appointments) return [];
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.start_time), currentDate)
    );
  };

  const dayEvents = getDayEvents();

  // COMPACT CALENDAR: 24px per hour = 0.4px per minute 
  const timeToPixels = (hour: number, minutes: number) => {
    const hourOffset = hour - 6; // Hours from 6 AM
    return hourOffset * 24 + (minutes / 60) * 24;
  };

  const pixelsToTime = (pixels: number) => {
    const totalMinutes = (pixels / 24) * 60; // 24px per hour
    const hour = Math.floor(totalMinutes / 60) + 6;
    const minutes = Math.floor(totalMinutes % 60);
    return { hour, minutes };
  };

  const calculateEventStyle = (startTime: Date, endTime: Date) => {
    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    
    const top = timeToPixels(startHour, startMinutes);
    const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const height = Math.max((durationInMinutes / 60) * 24, 12);

    return { top, height, visible: startHour >= 6 && startHour <= 22 };
  };

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollContainerRef.current && isToday(currentDate)) {
      const now = new Date();
      const currentHour = now.getHours();
      const scrollToHour = Math.max(0, currentHour - 2); // Scroll 2 hours before current time
      const scrollPosition = timeToPixels(scrollToHour, 0); // Each hour is 48px
      scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, [currentDate]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10 p-4">
        <div className="text-center">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            {format(currentDate, 'EEEE')}
          </div>
          <div className={`text-2xl font-bold ${
            isToday(currentDate) 
              ? 'bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto' 
              : ''
          }`}>
            {format(currentDate, 'd')}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {format(currentDate, 'MMMM yyyy')}
          </div>
        </div>
      </div>

      {/* All-day events section */}
      <div className="border-b bg-muted/30 p-2">
        <div className="text-xs font-medium text-muted-foreground mb-2">All day</div>
        <div className="min-h-8">
          {/* All-day events would go here */}
        </div>
      </div>
      
      {/* COMPACT GRID: 12px per 30-minute slot */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto">
        <div className="relative">
          {/* Time slots with Google Calendar pixel alignment */}
          {Array.from({ length: 17 }, (_, index) => {
            const hour = index + 6; // Start from 6 AM
            const hourTime = `${hour.toString().padStart(2, '0')}:00`;
            const halfHourTime = `${hour.toString().padStart(2, '0')}:30`;
            
            return (
              <div key={hour}>
                {/* Hour slot - EXACTLY 12px with subtle border */}
                <div 
                  className="relative border-b-2 border-border" 
                  style={{ height: '12px' }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const { hour, minutes } = pixelsToTime(y + index * 24);
                    const timeStr = `${hour.toString().padStart(2, '0')}:${Math.floor(minutes / 30) * 30 === 0 ? '00' : '30'}`;
                    onTimeSlotClick?.(currentDate, timeStr);
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const { hour, minutes } = pixelsToTime(y + index * 24);
                    const timeStr = `${hour.toString().padStart(2, '0')}:${Math.floor(minutes / 30) * 30 === 0 ? '00' : '30'}`;
                    e.currentTarget.title = `Click to book at ${timeStr}`;
                  }}
                >
                  <div className="absolute left-2 top-0 text-xs font-medium text-muted-foreground bg-background px-1 z-10">
                    {hourTime}
                  </div>
                  <div 
                    className="h-full hover:bg-accent/20 cursor-pointer"
                    style={{ backgroundColor: index % 2 === 0 ? 'hsl(var(--muted)/0.3)' : 'transparent' }}
                  />
                </div>
                
                {/* Half hour slot - EXACTLY 12px with dashed border */}
                <div 
                  className="relative border-b border-dashed border-border/50" 
                  style={{ height: '12px' }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const { hour, minutes } = pixelsToTime(y + index * 24 + 12);
                    const timeStr = `${hour.toString().padStart(2, '0')}:${Math.floor(minutes / 30) * 30 === 0 ? '00' : '30'}`;
                    onTimeSlotClick?.(currentDate, timeStr);
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const { hour, minutes } = pixelsToTime(y + index * 24 + 12);
                    const timeStr = `${hour.toString().padStart(2, '0')}:${Math.floor(minutes / 30) * 30 === 0 ? '00' : '30'}`;
                    e.currentTarget.title = `Click to book at ${timeStr}`;
                  }}
                >
                  <div 
                    className="h-full hover:bg-accent/20 cursor-pointer"
                    style={{ backgroundColor: index % 2 === 0 ? 'hsl(var(--muted)/0.3)' : 'transparent' }}
                  />
                </div>
              </div>
            );
          })}
          
          {/* Current time indicator */}
          {isToday(currentDate) && (() => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinutes = now.getMinutes();
            
            if (currentHour >= 6 && currentHour <= 22) {
              // EXACT GRID ALIGNMENT: Match the hour boundary positioning  
              const currentHourOffset = currentHour - 6;
              const top = currentHourOffset * 24 + (currentMinutes / 60) * 24;
              
              return (
                <div 
                  className="absolute left-0 right-0 h-0.5 bg-red-500 z-30"
                  style={{ top: `${top}px` }}
                >
                  <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="absolute left-4 -top-6 text-xs bg-red-500 text-white px-1 py-0.5 rounded text-[10px]">
                    {format(now, 'HH:mm')}
                  </div>
                </div>
              );
            }
            return null;
          })()}
          
          {/* Events overlay with precise positioning */}
          <div className="absolute inset-0 pointer-events-none">
            {dayEvents.map((event, eventIndex) => {
              const startTime = new Date(event.start_time);
              const endTime = new Date(event.end_time);
              const style = calculateEventStyle(startTime, endTime);
              
               if (!style.visible) return null;
               
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
                   className={`absolute left-4 right-4 rounded border-l-4 p-2 text-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all z-20 pointer-events-auto ${
                     getEventColor(event)
                   }`}
                   style={{
                     top: `${style.top}px`,
                     height: `${style.height}px`,
                     marginLeft: `${eventIndex * 6}px`,
                     zIndex: 20 + eventIndex,
                     backgroundColor: event.color || undefined,
                     borderLeftColor: event.color || undefined
                   }}
                    onClick={() => onEventClick?.(event.id)}
                    title={`${event.title}\n${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}\n${event.description || ''}`}
                 >
                   <div className="font-semibold truncate leading-tight text-base">
                     {event.title}
                   </div>
                   <div className="text-sm opacity-90 leading-tight">
                     {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                   </div>
                   {style.height > 60 && event.location && (
                     <div className="text-sm opacity-75 leading-tight truncate mt-1">
                       📍 {event.location}
                     </div>
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
