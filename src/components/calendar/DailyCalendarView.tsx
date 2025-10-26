import { format, isSameDay, isToday } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useState, useRef, useEffect } from "react";
import { Clock, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClients } from "@/hooks/useClients";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";

interface DailyCalendarViewProps {
  currentDate: Date;
  onEventClick?: (eventId: string) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
}

export const DailyCalendarView = ({ currentDate, onEventClick, onTimeSlotClick }: DailyCalendarViewProps) => {
  const { data: appointments } = useAppointments();
  const { data: clients } = useClients();
  const { data: currentUserProfile } = useCurrentUserProfile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to get client name
  const getClientName = (clientId?: string) => {
    if (!clientId || !clients) return null;
    const client = clients.find(c => c.id === clientId);
    if (!client) return null;
    return client.client_type === 'B2B' ? client.company_name : client.name;
  };

  // Helper function to get attendee info with avatar data
  const getAttendeeInfo = (event: any) => {
    const attendees = [];
    
    // Add organizer (current user)
    if (currentUserProfile) {
      attendees.push({
        id: currentUserProfile.user_id,
        name: currentUserProfile.display_name || 'You',
        avatar: currentUserProfile.avatar_url,
        isOwner: true
      });
    }
    
    // Add client if exists
    const clientName = getClientName(event.client_id);
    if (clientName) {
      attendees.push({
        id: event.client_id,
        name: clientName,
        avatar: null,
        isOwner: false
      });
    }
    
    return attendees;
  };

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

    if (startSlotIndex === -1) return { top: 0, height: 48, visible: false };

    // Calculate exact position within the slot
    const slotHeight = 48; // 12rem / 2 = 48px per 30-min slot
    const minutesFromSlotStart = startMinutes % 30;
    const top = startSlotIndex * slotHeight + (minutesFromSlotStart / 30) * slotHeight;

    // Calculate duration and height
    const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const height = Math.max((durationInMinutes / 30) * slotHeight, 24);

    return { top, height, visible: true };
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
      
      {/* Scrollable time grid */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto">
        <div className="relative">
          {timeSlots.map((time, index) => {
            const isHourSlot = index % 2 === 0;
            
            return (
              <div 
                key={time} 
                className={`h-12 flex border-b ${
                  isHourSlot ? 'border-border' : 'border-dashed border-muted'
                }`}
              >
                {/* Time label */}
                <div className="w-20 p-2 text-xs text-muted-foreground bg-muted/20 border-r">
                  {isHourSlot && (
                    <span className="font-medium">{time}</span>
                  )}
                </div>
                
                {/* Time slot */}
                <div 
                  className="flex-1 hover:bg-accent/30 cursor-pointer transition-colors relative"
                  onClick={() => onTimeSlotClick?.(currentDate, time)}
                  title={`${format(currentDate, 'MMM d')} at ${time}`}
                >
                  {/* Current time indicator */}
                  {isToday(currentDate) && (() => {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentMinutes = now.getMinutes();
                    
                    if (currentHour >= 6 && currentHour <= 22) {
                      const [slotHour, slotMinute] = time.split(':').map(Number);
                      if (slotHour === currentHour && 
                          ((slotMinute === 0 && currentMinutes < 30) ||
                           (slotMinute === 30 && currentMinutes >= 30))) {
                        const minutesFromSlotStart = currentMinutes % 30;
                        const top = (minutesFromSlotStart / 30) * 48;
                        
                        return (
                          <div 
                            className="absolute left-0 right-0 h-0.5 bg-red-500 z-20"
                            style={{ top: `${top}px` }}
                          >
                            <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>
              </div>
            );
          })}
          
          {/* Events overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="relative ml-20"> {/* Offset for time labels */}
              {dayEvents.map((event, eventIndex) => {
                const startTime = new Date(event.start_time);
                const endTime = new Date(event.end_time);
                const style = calculateEventStyle(startTime, endTime);
                
                if (!style.visible) return null;
                
                const attendees = getAttendeeInfo(event);
                const eventColor = event.color || '#3b82f6'; // Default blue
                
                return (
                  <div
                    key={event.id}
                    className="absolute left-2 right-2 rounded-lg border bg-card/95 backdrop-blur-sm hover:bg-card hover:shadow-lg transition-all pointer-events-auto cursor-pointer group overflow-hidden"
                    style={{
                      top: `${style.top}px`,
                      height: `${style.height}px`,
                      zIndex: 10 + eventIndex,
                    }}
                    onClick={() => onEventClick?.(event.id)}
                    title={`${event.title}\n${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}\n${event.description || ''}`}
                  >
                    {/* Left color border */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: eventColor }}
                    />
                    
                    <div className="ml-3 p-2 pr-8 h-full flex flex-col justify-center">
                      {/* Title */}
                      <div className="font-medium text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {event.title}
                      </div>
                      
                      {/* Time */}
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                        {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                      </div>
                      
                      {/* Location - only show if there's enough height */}
                      {style.height > 70 && event.location && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      
                      {/* Attendees - only show if there's enough height */}
                      {style.height > 90 && attendees.length > 0 && (
                        <div className="flex items-center mt-2 gap-1">
                          <div className="flex -space-x-1">
                            {attendees.slice(0, 3).map((attendee) => (
                              <Avatar key={attendee.id} className="w-5 h-5 border border-background">
                                <AvatarImage src={attendee.avatar || undefined} />
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {attendee.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {attendees.length > 3 && (
                              <div className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">+{attendees.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Color dot indicator in top right */}
                    <div 
                      className="absolute top-2 right-2 w-3 h-3 rounded-full border border-white/50 shadow-sm"
                      style={{ backgroundColor: eventColor }}
                    />
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
