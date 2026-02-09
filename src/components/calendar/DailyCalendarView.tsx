import { format, isSameDay, isToday } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useState, useRef, useEffect } from "react";
import { Clock, MapPin, CheckCheck, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClients } from "@/hooks/useClients";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { useMyTasks, Task } from "@/hooks/useTasks";
import { UnifiedTaskDialog } from "@/components/tasks/UnifiedTaskDialog";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { TimezoneUtils } from "@/utils/timezoneUtils";
import { EventHoverCard } from "./EventHoverCard";
import { motion } from "framer-motion";

interface DailyCalendarViewProps {
  currentDate: Date;
  onEventClick?: (eventId: string) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  filteredAppointments?: any[];
}

export const DailyCalendarView = ({ currentDate, onEventClick, onTimeSlotClick, filteredAppointments }: DailyCalendarViewProps) => {
  const { data: appointments } = useAppointments();
  const displayAppointments = filteredAppointments || appointments;
  const { data: clients } = useClients();
  const { data: currentUserProfile } = useCurrentUserProfile();
  const { data: tasks } = useMyTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data: userPreferences } = useUserPreferences();
  
  // Get user's timezone
  const userTimezone = userPreferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

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
    if (!displayAppointments) return [];
    return displayAppointments.filter(appointment => {
      const startTime = new Date(appointment.start_time);
      const endTime = new Date(appointment.end_time);
      // Skip invalid dates
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || endTime <= startTime) {
        return false;
      }
      // Format both dates in the same timezone for comparison
      const appointmentDateStr = TimezoneUtils.formatInTimezone(appointment.start_time, userTimezone, 'yyyy-MM-dd');
      const currentDateStr = TimezoneUtils.formatInTimezone(currentDate.toISOString(), userTimezone, 'yyyy-MM-dd');
      return appointmentDateStr === currentDateStr;
    });
  };

  // Get tasks for the current day
  const getDayTasks = () => {
    if (!tasks) return [];
    return tasks
      .filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        if (isNaN(taskDate.getTime())) return false;
        return isSameDay(taskDate, currentDate);
      })
      .map(task => {
        // Display tasks at 9 AM on their due date
        const startTime = new Date(currentDate);
        startTime.setHours(9, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);
        
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          isTask: true,
          taskData: task,
          priority: task.priority,
          status: task.status
        };
      });
  };

  const dayEvents = [...getDayEvents(), ...getDayTasks()];

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
    <>
    <div className="h-full flex flex-col">
      {/* Header - more compact */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10 py-2 px-3">
        <div className="flex items-center justify-center gap-3">
          <div className="text-xs font-medium text-muted-foreground">
            {format(currentDate, 'EEE')}
          </div>
          <div className={`text-lg font-semibold ${
            isToday(currentDate) 
              ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center' 
              : ''
          }`}>
            {format(currentDate, 'd')}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(currentDate, 'MMM yyyy')}
          </div>
        </div>
      </div>
      
      {/* Scrollable time grid - cleaner styling */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto bg-card pb-32">
        <div className="relative">
          {timeSlots.map((time, index) => {
            const isHourSlot = index % 2 === 0;
            const [slotH] = time.split(':').map(Number);
            const isBusinessHour = slotH >= 9 && slotH < 17;

            return (
              <div
                key={time}
                className={`h-12 flex ${
                  isHourSlot ? 'border-b border-border/20' : ''
                }`}
              >
                {/* Time label */}
                <div className="w-14 py-2 px-1 text-right flex-shrink-0">
                  {isHourSlot && (() => {
                    const h = slotH;
                    const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
                    return (
                      <span className={`text-[10px] font-medium tabular-nums ${isBusinessHour ? 'text-foreground/80' : 'text-muted-foreground/40'}`}>{label}</span>
                    );
                  })()}
                </div>

                {/* Time slot */}
                <div
                  className={`flex-1 cursor-pointer transition-colors relative border-l border-border/10 ${
                    isBusinessHour ? 'hover:bg-accent/30' : 'bg-muted/10 hover:bg-accent/20'
                  }`}
                  onClick={() => onTimeSlotClick?.(currentDate, time)}
                  title={`Click to create event at ${time}`}
                >
                  {/* Current time indicator - cleaner */}
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
                            className="absolute left-0 right-0 z-20 pointer-events-none"
                            style={{ top: `${top}px` }}
                          >
                            <div className="h-[2px] bg-red-500 w-full" />
                            <div className="absolute -left-1.5 -top-[5px] w-3 h-3 bg-red-500 rounded-full shadow-sm" />
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
            <div className="relative ml-14"> {/* Offset for time labels (matches w-14) */}
              {dayEvents.map((event: any, eventIndex) => {
                // Parse times directly in user's timezone for calculations
                // Extract hour and minute from the formatted time string
                const startTimeStr = TimezoneUtils.formatInTimezone(event.start_time, userTimezone, 'HH:mm');
                const endTimeStr = TimezoneUtils.formatInTimezone(event.end_time, userTimezone, 'HH:mm');
                
                const [startHour, startMin] = startTimeStr.split(':').map(Number);
                const [endHour, endMin] = endTimeStr.split(':').map(Number);

                // Create Date objects with these time components for style calculation
                const startTime = new Date(currentDate);
                startTime.setHours(startHour, startMin, 0, 0);
                const endTime = new Date(currentDate);
                endTime.setHours(endHour, endMin, 0, 0);
                const style = calculateEventStyle(startTime, endTime);
                
                if (!style.visible) return null;

                // Render tasks differently
                if (event.isTask) {
                  return (
                    <div
                      key={event.id}
                      className="absolute left-2 right-2 rounded-lg border border-border bg-card shadow-md hover:shadow-lg transition-all pointer-events-auto cursor-pointer group overflow-hidden"
                      style={{
                        top: `${style.top}px`,
                        height: `${Math.max(style.height, 48)}px`, // Slightly smaller minimum height
                        zIndex: 10 + eventIndex,
                      }}
                      onClick={() => setSelectedTask(event.taskData as Task)}
                      title={`Task: ${event.title}\nDue: ${format(startTime, 'HH:mm')}\n${event.description || ''}`}
                    >
                       <div className="px-2 h-full flex items-center gap-2">
                         {/* Circular checkbox */}
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             // Toggle task completion here if needed
                           }}
                           className={`
                             flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center
                             transition-all duration-200
                             ${event.status === 'completed' 
                               ? "border-primary bg-primary" 
                               : "border-muted-foreground bg-white hover:border-primary"
                             }
                           `}
                         >
                           {event.status === 'completed' && (
                             <CheckCheck className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                           )}
                         </button>
                         <div className="flex-1 min-w-0">
                           <div className="font-medium text-[10px] leading-[1.2] line-clamp-1 text-foreground">
                             {event.title}
                           </div>
                           {event.description && (
                             <div className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
                               {event.description}
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                }
                
                const attendees = getAttendeeInfo(event);
                const eventColor = event.color || '#3b82f6'; // Default blue
                
                return (
                  <EventHoverCard
                    key={event.id}
                    event={event}
                    onEdit={(id) => onEventClick?.(id)}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: eventIndex * 0.03, duration: 0.15 }}
                      className="absolute left-1 right-1 rounded-md overflow-hidden pointer-events-auto cursor-pointer group transition-all hover:shadow-md"
                      style={{
                        top: `${style.top}px`,
                        height: `${style.height}px`,
                        zIndex: 10 + eventIndex,
                        backgroundColor: eventColor ? `${eventColor}30` : 'hsl(var(--muted) / 0.3)',
                        borderLeft: `3px solid ${eventColor}`,
                      }}
                      onClick={() => onEventClick?.(event.id)}
                  >
                    <div className="px-2 py-1 h-full flex flex-col justify-center">
                      {/* Title */}
                      <div className="font-medium text-xs leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                        {event.title}
                      </div>
                      
                      {/* Time - compact */}
                      {style.height > 40 && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {TimezoneUtils.formatInTimezone(event.start_time, userTimezone, 'HH:mm')} - {TimezoneUtils.formatInTimezone(event.end_time, userTimezone, 'HH:mm')}
                        </div>
                      )}
                      
                      {/* Location - compact */}
                      {style.height > 60 && event.location && (
                        <div className="flex items-center text-[10px] text-muted-foreground mt-0.5">
                          <MapPin className="h-2.5 w-2.5 mr-0.5 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      
                      {/* Video icon inline */}
                      {style.height > 40 && (event.video_meeting_link || event.video_provider) && (
                        <Video className="h-3 w-3 text-blue-500 mt-0.5" />
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
                      className="absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: eventColor }}
                    />
                    </motion.div>
                  </EventHoverCard>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <UnifiedTaskDialog
      open={!!selectedTask}
      onOpenChange={(open) => !open && setSelectedTask(null)}
      task={selectedTask}
    />
    </>
  );
};
