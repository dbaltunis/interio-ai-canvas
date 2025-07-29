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

  // Get events for the current day
  const getDayEvents = () => {
    if (!appointments) return [];
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.start_time), currentDate)
    );
  };

  const dayEvents = getDayEvents();

  // Calculate event position and styling
  const calculateEventStyle = (startTime: Date, endTime: Date) => {
    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    
    // FIXED: Use exact pixel calculation based on actual grid
    // Each slot is 48px (h-12), each slot is 30 minutes
    // So: 48px / 30min = 1.6px per minute
    const pixelsPerMinute = 48 / 30; // 1.6px per minute
    
    // Calculate minutes from start of visible time range (6 AM)
    const totalMinutesFromStart = (startHour - 6) * 60 + startMinutes;
    const top = Math.round(totalMinutesFromStart * pixelsPerMinute);

    // Calculate duration and height
    const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const height = Math.max(Math.round(durationInMinutes * pixelsPerMinute), 24);

    return { top, height, visible: startHour >= 6 && startHour <= 22 };
  };

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollContainerRef.current && isToday(currentDate)) {
      const now = new Date();
      const currentHour = now.getHours();
      const scrollToHour = Math.max(0, currentHour - 2); // Scroll 2 hours before current time
      const scrollPosition = (scrollToHour - 6) * 96; // Each hour is 96px (2 slots * 48px)
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
      
      {/* Scrollable time grid - COMPLETELY REBUILT */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto">
        <div className="relative bg-background">
          {/* Time grid with clear visual hierarchy */}
          {timeSlots.map((time, index) => {
            const isHourSlot = index % 2 === 0;
            const [hour, minute] = time.split(':');
            
            return (
              <div key={time} className="relative">
                {/* STRONG horizontal line marking EXACT time start */}
                <div className={`absolute left-0 right-0 z-10 ${
                  isHourSlot 
                    ? 'border-t-2 border-border' 
                    : 'border-t border-dashed border-muted-foreground/40'
                }`} 
                style={{ top: `${index * 48}px` }}>
                  {/* Time label positioned EXACTLY at the line */}
                  <div className={`absolute -top-3 left-2 text-xs font-semibold px-2 py-1 rounded ${
                    isHourSlot 
                      ? 'bg-background text-foreground border border-border' 
                      : 'bg-muted/80 text-muted-foreground'
                  }`}>
                    {time}
                  </div>
                </div>
                
                {/* 30-minute content area with clear boundaries */}
                <div 
                  className={`h-12 relative cursor-pointer transition-colors ${
                    isHourSlot ? 'bg-background hover:bg-accent/20' : 'bg-muted/10 hover:bg-accent/30'
                  }`}
                  style={{ top: `${index * 48}px` }}
                  onClick={() => onTimeSlotClick?.(currentDate, time)}
                  title={`Book appointment at ${time} on ${format(currentDate, 'MMM d')}`}
                >
                  {/* Visual feedback for clickable area */}
                  <div className="absolute inset-0 border border-transparent hover:border-accent/50 rounded-sm"></div>
                </div>
              </div>
            );
          })}
          
          {/* Current time indicator with precise positioning */}
          {isToday(currentDate) && (() => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinutes = now.getMinutes();
            
            if (currentHour >= 6 && currentHour <= 22) {
              const pixelsPerMinute = 48 / 30; // 1.6px per minute
              const totalMinutesFromStart = (currentHour - 6) * 60 + currentMinutes;
              const top = Math.round(totalMinutesFromStart * pixelsPerMinute);
              
              return (
                <div 
                  className="absolute left-0 right-0 h-1 bg-red-500 z-30 shadow-lg"
                  style={{ top: `${top}px` }}
                >
                  <div className="absolute -left-2 -top-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></div>
                  <div className="absolute left-6 -top-7 text-xs bg-red-500 text-white px-2 py-1 rounded font-bold shadow-lg">
                    {format(now, 'HH:mm')} ({top}px)
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
                   title={`${event.title}\n${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}\n${event.description || ''}\nPosition: ${style.top}px-${style.top + style.height}px`}
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
