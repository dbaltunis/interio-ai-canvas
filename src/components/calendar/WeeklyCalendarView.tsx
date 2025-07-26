import { format, addDays, startOfWeek, isToday, isSameDay } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useSchedulerSlots } from "@/hooks/useSchedulerSlots";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, DragEndEvent, useDraggable, useDroppable, DragOverlay } from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";

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
  const { data: currentUserProfile } = useCurrentUserProfile();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);
  
  // Event creation state
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventCreationStart, setEventCreationStart] = useState<{ date: Date; timeSlot: number } | null>(null);
  const [eventCreationEnd, setEventCreationEnd] = useState<{ date: Date; timeSlot: number } | null>(null);
  
  // Drag and drop state
  const [activeEvent, setActiveEvent] = useState<any>(null);

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

  // Handle drag and drop
  const handleDragStart = (event: any) => {
    const eventData = displayAppointments?.find(apt => apt.id === event.active.id);
    setActiveEvent(eventData);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveEvent(null);

    if (!over || !active) return;

    const eventId = active.id as string;
    const dropData = over.data.current;
    
    if (!dropData) return;

    const { day, timeSlotIndex } = dropData;
    const eventToUpdate = displayAppointments?.find(apt => apt.id === eventId);
    
    if (!eventToUpdate) return;

    // Calculate new start time
    const originalDuration = new Date(eventToUpdate.end_time).getTime() - new Date(eventToUpdate.start_time).getTime();
    const [hours, minutes] = timeSlots[timeSlotIndex].split(':').map(Number);
    
    const newStartTime = new Date(day);
    newStartTime.setHours(hours, minutes, 0, 0);
    
    const newEndTime = new Date(newStartTime.getTime() + originalDuration);

    // Optimistic update - update cache immediately
    queryClient.setQueryData(['appointments'], (oldData: any) => {
      if (!oldData) return oldData;
      
      return oldData.map((appointment: any) => 
        appointment.id === eventId
          ? {
              ...appointment,
              start_time: newStartTime.toISOString(),
              end_time: newEndTime.toISOString()
            }
          : appointment
      );
    });

    // Update the appointment in Supabase in the background
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          start_time: newStartTime.toISOString(),
          end_time: newEndTime.toISOString()
        })
        .eq('id', eventId);

      if (error) {
        console.error('Error updating appointment:', error);
        // Revert optimistic update on error
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  };

  // Auto-scroll to earliest event or 8 AM (but not during event creation)
  useEffect(() => {
    if (scrollContainerRef.current && displayAppointments && !isCreatingEvent) {
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
        const scrollToHour = Math.max(eventHour - 1, 0); // 1 hour before event
        scrollPosition = (scrollToHour * 60 / 30) * 20; // Each 30-minute slot is 20px
      } else {
        // Default to 8 AM if no events
        scrollPosition = (8 * 60 / 30) * 20;
      }
      
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [showExtendedHours, displayAppointments, weekDays, isCreatingEvent]);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                      {/* Time slot grid with droppable areas */}
                      {timeSlots.map((time, index) => {
                        const DroppableTimeSlot = () => {
                          const { setNodeRef, isOver } = useDroppable({
                            id: `${day.toISOString()}-${index}`,
                            data: { day, timeSlotIndex: index }
                          });

                          return (
                            <div 
                              ref={setNodeRef}
                              className={`h-[20px] hover:bg-accent/50 cursor-pointer transition-colors ${
                                index % 2 === 0 ? 'border-b' : 'border-b border-dashed border-muted/50'
                              } ${isOver ? 'bg-primary/30 border-primary border-2' : ''}`}
                              onMouseDown={(e) => handleMouseDown(day, index, e)}
                              onMouseMove={() => handleMouseMove(day, index)}
                              onClick={() => !isCreatingEvent && onTimeSlotClick?.(day, time)}
                              title={`${format(day, 'MMM d')} at ${time}`}
                            />
                          );
                        };

                        return <DroppableTimeSlot key={time} />;
                      })}

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
                            return `text-white border-l-4 backdrop-blur-sm`;
                          }
                          
                          switch (event.appointment_type) {
                            case 'meeting': return 'bg-blue-500/75 text-white border-blue-400 backdrop-blur-sm';
                            case 'consultation': return 'bg-green-500/75 text-white border-green-400 backdrop-blur-sm';
                            case 'call': return 'bg-purple-500/75 text-white border-purple-400 backdrop-blur-sm';
                            case 'follow-up': return 'bg-orange-500/75 text-white border-orange-400 backdrop-blur-sm';
                            default: return 'bg-primary/75 text-primary-foreground border-primary/60 backdrop-blur-sm';
                          }
                        };
                        
                        // Check if this event belongs to the current user
                        const isUserEvent = currentUserId && event.user_id === currentUserId;
                        
                        const DraggableEvent = () => {
                          const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
                            id: event.id,
                          });

                          const eventStyle = {
                            top: `${style.top}px`,
                            height: `${style.height}px`,
                            width: eventWidth,
                            left: eventLeft,
                            zIndex: 10 + eventIndex,
                            backgroundColor: event.color ? `${event.color}73` : undefined, // 45% opacity for custom colors
                            borderLeftColor: event.color || undefined,
                            borderRadius: '20px 8px 20px 8px', // Water drop asymmetric corners
                            boxShadow: event.color 
                              ? `0 8px 16px -4px ${event.color}40, 0 4px 8px -2px ${event.color}40, inset 0 1px 0 rgba(255,255,255,0.15)` 
                              : '0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -2px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255,255,255,0.15)',
                            transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
                            opacity: isDragging ? 0.5 : 1,
                          };

                          return (
                            <div
                              ref={setNodeRef}
                              className={`absolute p-1.5 text-xs overflow-hidden cursor-pointer group
                                transition-all duration-200 z-10 shadow-lg border border-white/40
                                hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5
                                ${getEventColor(event)}`}
                              style={eventStyle}
                              onClick={() => onEventClick?.(event.id)}
                              title={`${event.title}\n${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}\n${event.description || ''}`}
                            >
                              {/* Drag Handle */}
                              <div 
                                {...listeners}
                                {...attributes}
                                className="absolute top-1 right-1 w-4 h-4 bg-black/20 rounded-sm cursor-move 
                                          opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                          flex items-center justify-center hover:bg-black/30"
                                onClick={(e) => e.stopPropagation()}
                                title="Drag to move"
                              >
                                <div className="w-2 h-2 bg-white/80 rounded-[1px]"></div>
                              </div>

                              <div className="flex items-start gap-1">
                                {/* Show user avatar only for user's own events */}
                                {isUserEvent && currentUserProfile && (
                                  <Avatar className="h-4 w-4 flex-shrink-0 mt-0.5">
                                    {currentUserProfile.avatar_url ? (
                                      <AvatarImage src={currentUserProfile.avatar_url} />
                                    ) : (
                                      <AvatarFallback className="text-[8px] bg-white/20 text-black">
                                        {currentUserProfile.display_name?.charAt(0) || '?'}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                )}
                                <div className="flex-1 min-w-0 pr-6"> {/* Add padding for drag handle */}
                                  <div className="font-semibold truncate text-xs leading-tight mb-0.5 text-black">
                                    {event.title}
                                  </div>
                                  <div className="text-[11px] leading-tight text-black/80">
                                    {format(startTime, 'HH:mm')}
                                  </div>
                                  {style.height > 40 && (
                                    <div className="text-[10px] leading-tight truncate text-black/70">
                                      {event.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        };
                        
                        return <DraggableEvent key={event.id} />;
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <DragOverlay>
        {activeEvent && (
          <div 
            className="p-2 text-xs border border-white/40 shadow-2xl backdrop-blur-sm transform scale-110"
            style={{
              backgroundColor: activeEvent.color ? `${activeEvent.color}90` : 'hsl(var(--primary) / 0.9)', // 90% opacity
              borderRadius: '20px 8px 20px 8px', // Water drop corners
              borderLeftColor: activeEvent.color || 'hsl(var(--primary))',
              borderLeftWidth: '4px',
              boxShadow: activeEvent.color 
                ? `0 20px 40px -8px ${activeEvent.color}60, 0 8px 16px -4px ${activeEvent.color}40, inset 0 1px 0 rgba(255,255,255,0.2)` 
                : '0 20px 40px -8px hsl(var(--primary) / 0.4), 0 8px 16px -4px hsl(var(--primary) / 0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
              color: 'white',
              minWidth: '120px',
              zIndex: 1000
            }}
          >
            <div className="font-semibold text-white text-sm mb-1">
              📅 {activeEvent.title}
            </div>
            <div className="text-white/90 text-xs">
              🕐 {format(new Date(activeEvent.start_time), 'HH:mm')}
            </div>
            <div className="text-white/70 text-xs mt-1">
              ↻ Drop to reschedule
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};