import { format, addDays, startOfWeek, isToday, isSameDay } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useAppointmentBookings } from "@/hooks/useAppointmentBookings";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, DragEndEvent, useDraggable, useDroppable, DragOverlay } from "@dnd-kit/core";
import { Video, CheckCheck } from "lucide-react";
import { useUpdateAppointment } from "@/hooks/useAppointments";
import { BookedAppointmentDialog } from "./BookedAppointmentDialog";
import { useMyTasks, Task, useUpdateTask, useArchiveCompletedTasks } from "@/hooks/useTasks";
import { UnifiedTaskDialog } from "@/components/tasks/UnifiedTaskDialog";

interface WeeklyCalendarViewProps {
  currentDate: Date;
  onEventClick?: (eventId: string) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  onDayHeaderClick?: (date: Date) => void;
  filteredAppointments?: any[];
}

export const WeeklyCalendarView = ({ currentDate, onEventClick, onTimeSlotClick, onDayHeaderClick, filteredAppointments }: WeeklyCalendarViewProps) => {
  const { data: appointments } = useAppointments();
  const displayAppointments = filteredAppointments || appointments;
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const { data: bookedAppointments, isLoading: bookingsLoading } = useAppointmentBookings();
  const updateAppointment = useUpdateAppointment();
  const { data: tasks } = useMyTasks();
  const updateTask = useUpdateTask();
  const archiveCompletedTasks = useArchiveCompletedTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [bookedAppointmentDialog, setBookedAppointmentDialog] = useState<{ open: boolean; appointment: any }>({ open: false, appointment: null });
  
  // Event creation state
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventCreationStart, setEventCreationStart] = useState<{ date: Date; timeSlot: number } | null>(null);
  const [eventCreationEnd, setEventCreationEnd] = useState<{ date: Date; timeSlot: number } | null>(null);

  // Drag and drop state
  const [activeEvent, setActiveEvent] = useState<any>(null);

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

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Auto-scroll to current time (or 8 AM if not today) on mount
  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      const slotHeight = 32;
      const now = new Date();
      const hasToday = weekDays.some(d => isToday(d));

      // Scroll 1 hour before current time if today is visible, else 8 AM
      const scrollHour = hasToday ? Math.max(0, now.getHours() - 1) : 8;
      const scrollMinutes = hasToday ? now.getMinutes() : 0;
      const scrollPosition = ((scrollHour * 60 + scrollMinutes) * slotHeight) / 30;

      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [currentDate]); // Re-run when navigating weeks

  // Get events for a specific date with date validation
  const getEventsForDate = (date: Date) => {
    if (!displayAppointments) return [];
    return displayAppointments
      .filter(appointment => {
        // Validate dates first
        const startTime = new Date(appointment.start_time);
        const endTime = new Date(appointment.end_time);
        
        // Skip invalid dates or appointments where end time is before start time
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || endTime <= startTime) {
          return false;
        }
        
        return isSameDay(startTime, date);
      });
  };

  // Get booked appointments for a specific date as events
  const getBookedEventsForDate = (date: Date) => {
    if (!bookedAppointments) return [];
    
    return bookedAppointments
      .filter(booking => {
        const bookingDate = new Date(booking.appointment_date);
        return isSameDay(bookingDate, date);
      })
      .map(booking => {
        // Get scheduler info from the booking
        const schedulerInfo = booking.scheduler;
        const duration = schedulerInfo?.duration || 60;
        const schedulerName = schedulerInfo?.name || 'Customer Appointment';
        
        // Convert booking to event format with distinct styling and scheduler context
        const [hours, minutes] = booking.appointment_time.split(':');
        const startTime = new Date(booking.appointment_date);
        startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + duration);
        
        // Validate times
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          return null;
        }
        
        return {
          id: booking.id,
          title: `📅 ${booking.customer_name} • ${schedulerName}`,
          description: `${booking.customer_email}${booking.customer_phone ? '\n' + booking.customer_phone : ''}`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          location: 'Booked Appointment',
          appointment_type: 'consultation',
          color: 'hsl(217 91% 60%)',
          user_id: currentUserId,
          isBooking: true,
          bookingData: booking,
          scheduler_id: booking.scheduler_id,
          scheduler_name: schedulerName,
          scheduler_slug: schedulerInfo?.slug || '',
          video_meeting_link: booking.video_call_link || schedulerInfo?.google_meet_link || ''
        };
      })
      .filter(Boolean); // Remove null values from invalid bookings
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    if (!tasks) return [];
    
    return tasks
      .filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return isSameDay(taskDate, date);
      })
      .map(task => {
        // Use task's due_time or default to 9 AM
        const startTime = new Date(date);
        const [hours, minutes] = (task.due_time || "09:00").split(':').map(Number);
        startTime.setHours(hours, minutes, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30); // 30-min block
        
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

  // Deduplicate events - when Google sync creates a duplicate of a manually-created event,
  // prefer the one with google_event_id (synced version has richer data)
  const deduplicateEvents = (events: any[]) => {
    const seen = new Map<string, any>();
    for (const event of events) {
      // Create a key from title + approximate start time (within 5 min)
      const startTime = new Date(event.start_time);
      const roundedMinutes = Math.round(startTime.getTime() / (5 * 60 * 1000));
      const key = `${(event.title || '').toLowerCase().trim()}_${roundedMinutes}`;

      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, event);
      } else {
        // Keep the one with google_event_id (synced version)
        if (event.google_event_id && !existing.google_event_id) {
          seen.set(key, event);
        }
      }
    }
    return Array.from(seen.values());
  };

  // Combine regular events, booked appointments, and tasks (scheduler slots hidden from main grid)
  const getAllEventsForDate = (date: Date) => {
    const regularEvents = deduplicateEvents(getEventsForDate(date));
    const bookedEvents = getBookedEventsForDate(date);
    const dateTasks = getTasksForDate(date);
    return [...regularEvents, ...bookedEvents, ...dateTasks];
  };

  // Check if a time slot is occupied by booked appointments or events
  const isTimeSlotOccupied = (date: Date, timeString: string) => {
    const allEvents = getAllEventsForDate(date);
    const [hours, minutes] = timeString.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(hours, minutes, 0, 0);
    
    return allEvents.some(event => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      return slotTime >= eventStart && slotTime < eventEnd;
    });
  };

  // Calculate event position and styling with accurate time positioning and validation
  const calculateEventStyle = (startTime: Date, endTime: Date, isExtendedHours: boolean = false) => {
    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    
    // Validate that end time is after start time - default to 1-hour duration
    if (endTime <= startTime) {
      endTime = new Date(startTime.getTime() + (60 * 60 * 1000));
    }
    
    // Calculate position based on 30-minute slots (32px each for better visibility)
    const slotHeight = 32;
    
    // Calculate total minutes from midnight (00:00)
    let totalMinutesFromMidnight = startHour * 60 + startMinutes;
    
    // For working hours view (6 AM to 10 PM), adjust the offset
    if (!isExtendedHours) {
      const workingHoursStartOffset = 6 * 60; // 6 AM in minutes
      totalMinutesFromMidnight -= workingHoursStartOffset;
      // If event starts before 6 AM, position it at the top
      if (totalMinutesFromMidnight < 0) totalMinutesFromMidnight = 0;
    }
    
    // Convert minutes to pixels: each 30-minute slot = 32px
    // So each minute = 32/30 = 1.0667px
    const top = (totalMinutesFromMidnight * 32) / 30;

    // Calculate duration and height with accurate minute conversion
    const durationInMinutes = Math.max((endTime.getTime() - startTime.getTime()) / (1000 * 60), 15);
    const height = Math.max((durationInMinutes * 32) / 30, 24); // Minimum 24px height

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
    
    const slotHeight = 32;
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

    try {
      await updateAppointment.mutateAsync({
        id: eventId,
        start_time: newStartTime.toISOString(),
        end_time: newEndTime.toISOString()
      });
    } catch (error) {
      // Error handled by React Query's onError
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full" onMouseUp={handleMouseUp}>
        {/* Week header - minimal and clean */}
        <div className="flex bg-background flex-shrink-0 sticky top-0 z-10 border-b border-border/20">
          <div className="w-14 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="grid grid-cols-7">
              {weekDays.map(day => {
                const isCurrentDay = isToday(day);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                
                return (
                  <div
                    key={day.toString()}
                    className={`py-1.5 text-center cursor-pointer hover:bg-accent/30 transition-colors ${isWeekend ? 'bg-muted/10' : ''}`}
                    onClick={() => onDayHeaderClick?.(day)}
                  >
                    <div className="text-[9px] font-medium text-muted-foreground">
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-xs font-medium mt-0.5 ${
                      isCurrentDay
                        ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto text-[11px]'
                        : 'text-foreground'
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
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-card pb-32">
          <div className="flex bg-card">
            {/* Time labels - show all hours with better readability */}
            <div className="w-14 bg-card flex-shrink-0">
              {timeSlots.map((time, index) => {
                const [h, m] = time.split(':').map(Number);
                const isBizHour = h >= 9 && h < 17;
                const isHour = m === 0;
                return (
                  <div
                    key={time}
                    className="h-[32px] pr-2 text-right flex items-start justify-end"
                  >
                    {isHour && (
                      <span className={`text-[10px] font-medium -mt-1.5 tabular-nums ${isBizHour ? 'text-foreground/80' : 'text-muted-foreground/40'}`}>
                        {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Day columns */}
            <div className="flex-1 relative bg-card">
              {/* Hour lines - clear at hours, subtle at half-hours */}
              {timeSlots.map((time, index) => {
                const isHour = index % 2 === 0;
                return (
                  <div
                    key={`line-${time}`}
                    className={`absolute left-0 right-0 border-t ${isHour ? 'border-border/30' : 'border-border/8'}`}
                    style={{ top: `${index * 32}px` }}
                  />
                );
              })}
              
              <div className="grid grid-cols-7 h-full bg-card">
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = getAllEventsForDate(day);
                  const isCurrentDay = isToday(day);
                  const previewStyle = getEventCreationPreviewStyle();
                  const showPreview = isCreatingEvent && eventCreationStart && isSameDay(eventCreationStart.date, day);
                  
                  return (
                    <div key={day.toString()} className={`border-r relative bg-card ${
                      isCurrentDay ? 'ring-2 ring-primary/20 ring-inset' : ''
                    }`} style={{ height: `${timeSlots.length * 32}px` }}>
                      {/* Empty time slots - clickable areas (NO availability indicators in internal calendar) */}
                      {timeSlots.map((time, index) => {
                        const isOccupied = isTimeSlotOccupied(day, time);
                        const [slotH] = time.split(':').map(Number);
                        const isBusinessHour = slotH >= 9 && slotH < 17;

                        const DroppableTimeSlot = () => {
                          const { setNodeRef, isOver } = useDroppable({
                            id: `${day.toISOString()}-${index}`,
                            data: { day, timeSlotIndex: index }
                          });

                          return (
                            <div
                              ref={setNodeRef}
                              className={`h-[32px] transition-colors relative ${
                                 index % 2 === 0 ? 'border-b border-muted/30' : 'border-b border-muted'
                              } ${isOver ? 'bg-primary/30 border-primary border-2' : ''} ${
                                isOccupied
                                  ? 'bg-muted/30 cursor-default'
                                  : isBusinessHour
                                    ? 'hover:bg-accent/50 cursor-pointer'
                                    : 'bg-muted/10 hover:bg-accent/30 cursor-pointer'
                              }`}
                              onMouseDown={(e) => !isOccupied && handleMouseDown && handleMouseDown(day, index, e)}
                              onMouseMove={() => !isOccupied && handleMouseMove && handleMouseMove(day, index)}
                              onClick={() => !isCreatingEvent && !isOccupied && onTimeSlotClick?.(day, time)}
                              title={
                                isOccupied 
                                  ? `${format(day, 'MMM d')} at ${time} - Time occupied`
                                  : `${format(day, 'MMM d')} at ${time} - Click to create event`
                              }
                             >
                             </div>
                          );
                        };

                        return <DroppableTimeSlot key={time} />;
                      })}

                      {/* Event creation preview */}
                      {showPreview && previewStyle && (
                        <div
                          className="absolute left-0 right-0 bg-primary/30 border-l-4 border-primary z-15 rounded-r-lg flex items-center px-2"
                          style={{
                            top: `${previewStyle.top}px`,
                            height: `${previewStyle.height}px`
                          }}
                        >
                          <span className="text-xs font-medium">New Event</span>
                        </div>
                      )}
                      
                      {/* Current time indicator with improved accuracy */}
                       {isCurrentDay && (() => {
                         const now = new Date();
                         const currentHour = now.getHours();
                         const currentMinutes = now.getMinutes();
                         
                         // Calculate exact position from start of visible time range
                         let totalMinutesFromMidnight = currentHour * 60 + currentMinutes;
                         if (!showExtendedHours) {
                           totalMinutesFromMidnight -= 6 * 60; // Subtract 6 AM offset for working hours
                           if (totalMinutesFromMidnight < 0) return null; // Don't show if before visible hours
                         }
                         
                          // Each 30-minute slot is 32px, so each minute is 32/30 = 1.0667px
                          const top = (totalMinutesFromMidnight * 32) / 30;
                         
                            return (
                              <div
                                className="absolute left-0 right-0 z-20 pointer-events-none"
                                style={{ top: `${top}px` }}
                              >
                                <div className="h-[2px] bg-red-500 w-full" />
                                <div className="absolute -left-1.5 -top-[5px] w-3 h-3 bg-red-500 rounded-full shadow-sm" />
                              </div>
                            );
                       })()}
                      
                      {/* Events and Appointments with validation */}
                      {dayEvents.map((event, eventIndex) => {
                        const startTime = new Date(event.start_time);
                        const endTime = new Date(event.end_time);
                        
                        // Skip events with completely invalid times
                        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                          return null;
                        }
                        
                        const style = calculateEventStyle(startTime, endTime, showExtendedHours);
                        
                        if (!style.visible) return null;
                        
                        // Calculate overlapping events positioning - FIXED
                        const overlappingEvents = dayEvents.filter(otherEvent => {
                          const otherStart = new Date(otherEvent.start_time);
                          const otherEnd = new Date(otherEvent.end_time);
                          return (
                            (startTime < otherEnd && endTime > otherStart) || 
                            (otherStart < endTime && otherEnd > startTime)
                          );
                        });
                        
                        // Find this event's index within the overlapping group (not the full array)
                        const overlappingIndex = overlappingEvents.findIndex(e => e.id === event.id);
                        
                        // Calculate event width based on overlapping and screen size
                        const eventWidth = overlappingEvents.length > 1 ? `${98 / overlappingEvents.length}%` : '98%';
                        const eventLeft = overlappingEvents.length > 1 ? `${(98 / overlappingEvents.length) * overlappingIndex + 1}%` : '1%';
                        
                        // Detect narrow events for adaptive styling
                        const isNarrowEvent = overlappingEvents.length >= 3;
                        
                        // Clear visual distinction with MORE VISIBLE colors
                        const getEventStyling = (event: any) => {
                          if (event.isTask) {
                            // Completed tasks: green/happy color
                             if (event.status === 'completed') {
                              return {
                                background: 'hsl(142 76% 85% / 0.4)',
                                border: 'hsl(142 76% 36%)',
                                textClass: 'text-foreground',
                                isDashed: false,
                                isCompact: false,
                                minHeight: 32,
                              } as const;
                            }
                            // Active tasks: distinct styling with priority colors
                            const priorityColors = {
                              urgent: { bg: 'hsl(0 84% 60% / 0.15)', border: 'hsl(0 84% 60%)' },
                              high: { bg: 'hsl(25 95% 53% / 0.15)', border: 'hsl(25 95% 53%)' },
                              medium: { bg: 'hsl(45 93% 47% / 0.15)', border: 'hsl(45 93% 47%)' },
                              low: { bg: 'hsl(217 91% 60% / 0.15)', border: 'hsl(217 91% 60%)' }
                            };
                            const colors = priorityColors[event.priority as keyof typeof priorityColors] || priorityColors.medium;
                            return {
                              background: colors.bg,
                              border: colors.border,
                              textClass: 'text-foreground',
                              isDashed: false,
                              isCompact: false,
                              minHeight: 32,
                            } as const;
                          } else if (event.isBooking) {
                            // Booked appointments: blue/purple color
                            return {
                              background: 'hsl(217 91% 60% / 0.2)',
                              border: 'hsl(217 91% 60%)',
                              textClass: 'text-foreground',
                              isDashed: false,
                              isCompact: false,
                              minHeight: 32,
                            } as const;
                          } else {
                            // Personal events: stronger event color visibility
                            const eventColor = event.color;
                            return {
                              background: eventColor ? `${eventColor}50` : 'hsl(var(--muted) / 0.4)',
                              border: eventColor || 'hsl(var(--accent))',
                              textClass: 'text-foreground dark:text-white',
                              isDashed: false,
                              isCompact: false,
                              minHeight: 32,
                            } as const;
                          }
                        };
                        
                        const eventStyling = getEventStyling(event);
                        
                        const DraggableEvent = () => {
                          const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
                            id: event.id,
                            disabled: event.isBooking, // Disable dragging for booked appointments
                          });

                           const finalHeight = event.isBooking
                             ? Math.max(style.height, 40)
                             : Math.max(style.height, eventStyling.minHeight);

                            const eventStyle: React.CSSProperties = {
                             top: `${style.top}px`,
                             height: `${finalHeight}px`,
                             width: event.isBooking || event.isTask ? '96%' : eventWidth,
                             left: event.isBooking || event.isTask ? '2%' : eventLeft,
                             zIndex: event.isBooking ? 15 + eventIndex : event.isTask ? 12 + eventIndex : 10 + eventIndex,
                             background: event.isBooking
                               ? 'hsl(217 91% 60% / 0.9)'
                               : event.isTask
                               ? eventStyling.background
                               : eventStyling.background,
                             borderLeft: `3px solid ${event.isBooking ? 'hsl(217 91% 70%)' : eventStyling.border}`,
                             borderRadius: '4px',
                             transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
                             opacity: isDragging ? 0.85 : 1,
                             cursor: (event.isBooking || event.isTask) ? 'pointer' : 'grab',
                             pointerEvents: 'auto',
                           };

                            return (
                              <div
                                ref={setNodeRef}
                                className={`absolute p-1 px-1.5 text-xs overflow-hidden group
                                  transition-all duration-100
                                  hover:brightness-95 hover:shadow-sm
                                  ${event.isBooking ? 'text-white' : eventStyling.textClass}`}
                                  style={eventStyle}
                                  onClick={(e) => {
                                  e.stopPropagation();
                                  if (event.isTask) {
                                    setSelectedTask(event.taskData as Task);
                                  } else if (event.isBooking) {
                                    setBookedAppointmentDialog({ open: true, appointment: event });
                                  } else {
                                    // Handle personal event click - open edit dialog
                                    onEventClick?.(event.id);
                                  }
                                }}
                                 title={
                                   event.isTask
                                     ? `${event.title}\n${format(startTime, 'H:mm')} · ${event.priority}`
                                     : event.isBooking
                                     ? `${event.bookingData?.customer_name || 'Customer'}\n${event.scheduler_name}\n${format(startTime, 'H:mm')} - ${format(endTime, 'H:mm')}`
                                     : `${event.title}\n${format(startTime, 'H:mm')} - ${format(endTime, 'H:mm')}${event.location ? '\n' + event.location : ''}`
                                 }
                             >
                                {/* Drag Handle - only for personal events, hidden until hover */}
                                {!event.isBooking && !event.isAvailableSlot && !event.isTask && (
                                  <div
                                    {...listeners}
                                    {...attributes}
                                    className="absolute top-0 right-0 w-4 h-4 opacity-0 group-hover:opacity-100 cursor-move z-20 flex items-center justify-center transition-opacity"
                                    title="Drag to move event"
                                  />
                                 )}

                                  <div className="flex flex-col h-full overflow-hidden">
                                   {/* Task content - distinct display */}
                                    {event.isTask && (
                                      <div className="flex items-center gap-1.5 h-full px-2">
                                        {/* Circular checkbox */}
                                        <button
                                          type="button"
                                          className={`
                                            flex-shrink-0 w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2 flex items-center justify-center
                                            transition-all duration-200 cursor-pointer touch-manipulation
                                            ${event.status === 'completed' 
                                              ? "border-primary bg-primary" 
                                              : "border-muted-foreground bg-white hover:border-primary"
                                            }
                                          `}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const newStatus = event.status === 'completed' ? 'in_progress' : 'completed';
                                            updateTask.mutate({
                                              id: event.id,
                                              status: newStatus
                                            });
                                          }}
                                        >
                                          {event.status === 'completed' && (
                                            <CheckCheck className="h-2 w-2 lg:h-2.5 lg:w-2.5 text-white" strokeWidth={3} />
                                          )}
                                        </button>
                                        <div className="font-medium text-[10px] leading-[1.2] break-words flex-1 min-w-0 text-foreground" style={{
                                          textDecoration: event.status === 'completed' ? 'line-through' : 'none',
                                          display: '-webkit-box',
                                          WebkitLineClamp: finalHeight > 60 ? 2 : 1,
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden'
                                        }}>
                                          {event.title}
                                        </div>
                                      </div>
                                    )}
                                   
                                   {/* Event content - for appointments and bookings */}
                                   {!event.isTask && (
                                     <>
                                       <div className="flex items-start justify-between gap-1 mb-0.5">
                                         {/* Title and time - adaptive based on screen size */}
                                         <div className="flex-1 min-w-0">
                                             {/* Event title */}
                                             <div
                                               className={`${event.isBooking ? 'font-semibold text-[11px]' : 'font-medium text-[11px]'} leading-tight ${event.isBooking ? 'text-white' : 'text-foreground dark:text-white'} overflow-hidden`}
                                               style={{
                                                 display: '-webkit-box',
                                                 WebkitLineClamp: finalHeight > 70 ? 3 : finalHeight > 45 ? 2 : 1,
                                                 WebkitBoxOrient: 'vertical',
                                                 lineHeight: '1.3',
                                                 wordBreak: 'break-word',
                                                 overflowWrap: 'break-word',
                                               }}>
                                              {event.isBooking 
                                                ? `${event.bookingData?.customer_name || 'Customer'}` 
                                                : event.title
                                              }
                                             </div>
                                            
                                              {/* Time display */}
                                              <div className={`flex items-center gap-0.5 text-[9px] leading-tight font-normal ${event.isBooking ? 'text-white/90' : 'text-foreground/60 dark:text-white/60'} mt-0.5`}>
                                                <span>{format(startTime, 'H:mm')}</span>
                                                <span>-</span>
                                                <span>{format(endTime, 'H:mm')}</span>
                                                {(event.video_meeting_link || event.video_provider) && (
                                                  <Video className="w-2.5 h-2.5 text-blue-500 ml-0.5" />
                                                )}
                                              </div>
                                         </div>
                                         
                                       </div>
                                       
                                       {/* Location or description for taller events */}
                                       {finalHeight > 55 && (event.location || event.description) && (
                                         <div className="text-[9px] leading-tight text-foreground/50 dark:text-white/50 truncate mt-0.5">
                                           {event.location || event.description}
                                         </div>
                                       )}
                                     </>
                                   )}
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
        {activeEvent && !activeEvent.isBooking && (
          <div 
            className="p-2 text-xs border border-white/40 shadow-2xl backdrop-blur-sm transform scale-110"
            style={{
              backgroundColor: activeEvent.color ? `${activeEvent.color}E6` : 'hsl(var(--primary) / 0.9)',
              borderRadius: '20px 8px 20px 8px',
              borderLeftColor: activeEvent.color || 'hsl(var(--primary))',
              borderLeftWidth: '4px',
              boxShadow: '0 20px 40px -8px hsl(var(--primary) / 0.4), 0 8px 16px -4px hsl(var(--primary) / 0.25)',
              color: 'hsl(var(--foreground))',
              minWidth: '120px',
              zIndex: 1000
            }}
          >
            <div className="font-semibold text-foreground text-sm mb-1">
              {activeEvent.title}
            </div>
            <div className="text-foreground/90 text-xs">
              {format(new Date(activeEvent.start_time), 'HH:mm')}
            </div>
            <div className="text-foreground/70 text-xs mt-1">
              Drop to reschedule
            </div>
          </div>
        )}
      </DragOverlay>
      
      <BookedAppointmentDialog
        open={bookedAppointmentDialog.open}
        onOpenChange={(open) => setBookedAppointmentDialog({ ...bookedAppointmentDialog, open })}
        appointment={bookedAppointmentDialog.appointment}
      />
      
      <UnifiedTaskDialog
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        task={selectedTask}
      />
    </DndContext>
  );
};
