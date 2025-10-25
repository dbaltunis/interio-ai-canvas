import { format, addDays, startOfWeek, isToday, isSameDay } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useSchedulerSlots } from "@/hooks/useSchedulerSlots";
import { useAppointmentBookings } from "@/hooks/useAppointmentBookings";
import { useAppointmentSchedulers } from "@/hooks/useAppointmentSchedulers";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, DragEndEvent, useDraggable, useDroppable, DragOverlay } from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, User, CalendarCheck, UserCheck, Share2, Bell } from "lucide-react";
import { useUpdateAppointment } from "@/hooks/useAppointments";
import { AvailableSlotDialog } from "./AvailableSlotDialog";

interface WeeklyCalendarViewProps {
  currentDate: Date;
  onEventClick?: (eventId: string) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  filteredAppointments?: any[];
}

export const WeeklyCalendarView = ({ currentDate, onEventClick, onTimeSlotClick, filteredAppointments }: WeeklyCalendarViewProps) => {
  const { data: appointments } = useAppointments();
  const displayAppointments = filteredAppointments || appointments;
  const { data: schedulerSlots, isLoading: slotsLoading } = useSchedulerSlots(); 
  const { data: bookedAppointments, isLoading: bookingsLoading } = useAppointmentBookings(); 
  const { data: schedulers, isLoading: schedulersLoading } = useAppointmentSchedulers();
  const updateAppointment = useUpdateAppointment();
  
  // Debug logging for data fetching
  console.log('Calendar data status:', { 
    appointments: displayAppointments?.length, 
    schedulerSlots: schedulerSlots?.length, 
    bookedAppointments: bookedAppointments?.length,
    schedulers: schedulers?.length,
    loading: { slotsLoading, bookingsLoading, schedulersLoading }
  });
  
  // Removed excessive debug logging to prevent infinite re-renders
  const { data: currentUserProfile } = useCurrentUserProfile();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Available slot dialog state
  const [selectedSlot, setSelectedSlot] = useState<{
    id: string;
    schedulerName: string;
    schedulerSlug?: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
  } | null>(null);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  
  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Auto-scroll to 7 AM on mount for better UX
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Each time slot is 32px high, and slots are every 30 minutes
      // 7 AM = 7 hours from midnight = 14 slots (00:00, 00:30, 01:00... 07:00)
      const slotHeight = 32;
      const sevenAMSlotIndex = 14; // 7:00 AM is the 14th slot (0-indexed: slot 14)
      const scrollPosition = sevenAMSlotIndex * slotHeight;
      
      // Smooth scroll to 7 AM
      scrollContainerRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, []); // Empty dependency array = only run on mount
  
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
          console.warn('Invalid appointment dates detected:', appointment);
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
        // Find the scheduler to get duration
        const scheduler = schedulers?.find(s => s.id === booking.scheduler_id);
        const duration = scheduler?.duration || 60; // Default to 60 minutes if not found
        
        // Convert booking to event format with distinct styling
        const appointmentDateTime = new Date(`${booking.appointment_date}T${booking.appointment_time}:00`);
        
        // Validate the appointment date
        if (isNaN(appointmentDateTime.getTime())) {
          console.warn('Invalid booking date detected:', booking);
          return null; // Skip invalid bookings
        }
        
        const endDateTime = new Date(appointmentDateTime.getTime() + (duration * 60 * 1000));
        
        return {
          id: `booking-${booking.id}`,
          title: `${booking.customer_name}`, // Clear customer name only
          description: scheduler?.name || 'Appointment', // Scheduler name as description
          start_time: appointmentDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          appointment_type: 'booked_appointment',
          status: booking.status,
          location: booking.location_type || 'TBD',
          color: '#059669', // Emerald-600 for confirmed bookings
          user_id: null, // System booking
          isBooking: true,
          bookingData: booking,
          customer_name: booking.customer_name,
          scheduler_name: scheduler?.name || 'Unknown'
        };
      })
      .filter(Boolean); // Remove null values from invalid bookings
  };

  // Get available appointment slots for a specific date
  const getAvailableSlotsForDate = (date: Date) => {
    if (!schedulerSlots?.length) {
      console.log('No scheduler slots available for date:', format(date, 'yyyy-MM-dd'));
      return [];
    }
    
    const availableSlots = schedulerSlots
      .filter(slot => isSameDay(slot.date, date) && !slot.isBooked)
      .map(slot => {
        // Calculate accurate end time based on duration
        const startDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${slot.startTime}:00`);
        const endDateTime = new Date(startDateTime.getTime() + (slot.duration * 60 * 1000));
        
        return {
          id: slot.id,
          title: `Available: ${slot.schedulerName}`,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          date: format(date, 'yyyy-MM-dd'),
          isAvailableSlot: true,
          schedulerName: slot.schedulerName,
          schedulerSlug: schedulers?.find(s => s.id === slot.schedulerId)?.slug,
          duration: slot.duration,
          color: '#6B7280', // Gray-500
          user_id: null
        };
      });
    
    return availableSlots;
  };

  // Combine regular events, booked appointments, and available slots
  const getAllEventsForDate = (date: Date) => {
    const regularEvents = getEventsForDate(date);
    const bookedEvents = getBookedEventsForDate(date);
    const availableSlots = getAvailableSlotsForDate(date);
    return [...regularEvents, ...bookedEvents, ...availableSlots];
  };

  const getSchedulerSlotsForDate = (date: Date) => {
    if (!schedulerSlots) return [];
    return schedulerSlots.filter(slot => 
      isSameDay(slot.date, date)
    );
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
    
    // CRITICAL FIX: Validate that end time is after start time
    if (endTime <= startTime) {
      console.warn('Invalid appointment: end time before start time', { 
        start: startTime.toISOString(), 
        end: endTime.toISOString() 
      });
      // Default to 1-hour duration for invalid appointments
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
    
    console.log('Drag end:', { active: active?.id, over: over?.id, overData: over?.data?.current });

    if (!over || !active) {
      console.log('No drop target or active element');
      return;
    }

    const eventId = active.id as string;
    const dropData = over.data.current;
    
    if (!dropData) {
      console.log('No drop data found');
      return;
    }

    const { day, timeSlotIndex } = dropData;
    const eventToUpdate = displayAppointments?.find(apt => apt.id === eventId);
    
    if (!eventToUpdate) {
      console.log('Event to update not found:', eventId);
      return;
    }

    console.log('Updating event:', eventId, 'to day:', day, 'timeSlot:', timeSlotIndex);

    // Calculate new start time
    const originalDuration = new Date(eventToUpdate.end_time).getTime() - new Date(eventToUpdate.start_time).getTime();
    const [hours, minutes] = timeSlots[timeSlotIndex].split(':').map(Number);
    
    const newStartTime = new Date(day);
    newStartTime.setHours(hours, minutes, 0, 0);
    
    const newEndTime = new Date(newStartTime.getTime() + originalDuration);

    console.log('Calling updateAppointment.mutateAsync with:', {
      id: eventId,
      start_time: newStartTime.toISOString(),
      end_time: newEndTime.toISOString()
    });

    // Use the proper React Query mutation
    try {
      await updateAppointment.mutateAsync({
        id: eventId,
        start_time: newStartTime.toISOString(),
        end_time: newEndTime.toISOString()
      });
      console.log('Successfully updated appointment via mutation');
    } catch (error) {
      console.error('Failed to update appointment via mutation:', error);
    }
  };

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
                const dayEvents = getAllEventsForDate(day);
                const hasBookings = dayEvents.some(event => event.isBooking);
                const hasRegularEvents = dayEvents.some(event => !event.isBooking);
                
                return (
                  <div key={day.toString()} className="p-2 text-center border-r relative">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-lg font-semibold relative ${
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
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-card">
          <div className="flex bg-card">
            {/* Fixed time labels column */}
            <div className="w-16 border-r bg-card flex-shrink-0">
              {timeSlots.map((time, index) => (
                <div 
                  key={time} 
                className={`h-[32px] px-2 text-xs text-muted-foreground flex items-center justify-end ${
                  index % 2 === 0 ? 'border-b border-muted/30' : 'border-b border-muted'
                }`}
                >
                  {index % 2 === 0 && (
                    <span className="font-medium text-[10px]">{time}</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Day columns */}
            <div className="flex-1 relative bg-card">
              {/* Hour separation lines */}
              {timeSlots.map((time, index) => {
                if (index % 2 === 0) { // Only on full hours
                  return (
                    <div 
                      key={time} 
                      className="absolute left-0 right-0 border-t border-border/30" 
                      style={{ top: `${index * 32}px` }}
                    />
                  );
                }
                return null;
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
                      {/* Empty time slots - clickable areas */}
                      {timeSlots.map((time, index) => {
                        const isOccupied = isTimeSlotOccupied(day, time);
                        
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
                                  ? 'bg-destructive/10 hover:bg-destructive/20 cursor-help border-destructive/30' 
                                  : 'hover:bg-accent/50 cursor-pointer'
                              }`}
                              onMouseDown={(e) => !isOccupied && handleMouseDown && handleMouseDown(day, index, e)}
                              onMouseMove={() => !isOccupied && handleMouseMove && handleMouseMove(day, index)}
                              onClick={() => !isCreatingEvent && onTimeSlotClick?.(day, time)}
                              title={
                                isOccupied 
                                  ? `${format(day, 'MMM d')} at ${time} - Time occupied by appointment`
                                  : `${format(day, 'MMM d')} at ${time} - Click to create personal event`
                              }
                             >
                               {/* Remove the occupied slot indicator dots */}
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
                         
                         // Debug logging
                         console.log('Current time debug:', {
                           hour: currentHour,
                           minutes: currentMinutes,
                           totalMinutesFromMidnight,
                           calculatedTop: top,
                           showExtendedHours
                         });
                         
                           return (
                             <div 
                               className="absolute left-0 right-0 h-0.5 bg-destructive z-20"
                               style={{ top: `${top}px` }}
                             >
                               <div className="absolute -left-1 -top-1 w-2 h-2 bg-destructive rounded-full"></div>
                               <div className="absolute right-2 -top-2 text-[10px] text-destructive font-medium bg-background px-1 rounded">
                                 {format(now, 'HH:mm')}
                               </div>
                             </div>
                           );
                      })()}
                      
                      {/* Events and Appointments with validation */}
                      {dayEvents.map((event, eventIndex) => {
                        const startTime = new Date(event.start_time);
                        const endTime = new Date(event.end_time);
                        
                        // Skip events with completely invalid times
                        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                          console.warn('Skipping event with invalid date:', event);
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
                          if (event.isAvailableSlot) {
                            // Available appointment slots: more visible accent color
                            return {
                              background: 'hsl(var(--accent) / 0.25)',
                              border: 'hsl(var(--accent))',
                              textClass: 'text-foreground',
                              isDashed: true,
                              isCompact: true,
                              minHeight: 24,
                            } as const;
                          } else if (event.isBooking) {
                            // Booked appointments: stronger primary color
                            return {
                              background: 'hsl(var(--primary) / 0.35)',
                              border: 'hsl(var(--primary))',
                              textClass: 'text-foreground dark:text-white',
                              isDashed: false,
                              isCompact: false,
                              minHeight: 32,
                            } as const;
                          } else {
                            // Personal events: stronger event color visibility
                            const eventColor = event.color;
                            return {
                              background: eventColor ? `${eventColor}40` : 'hsl(var(--muted) / 0.35)',
                              border: eventColor || 'hsl(var(--accent))',
                              textClass: 'text-foreground dark:text-white',
                              isDashed: false,
                              isCompact: false,
                              minHeight: 32,
                            } as const;
                          }
                        };
                        
                        const eventStyling = getEventStyling(event);
                        const isUserEvent = currentUserId && event.user_id === currentUserId;
                        
                        const DraggableEvent = () => {
                          const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
                            id: event.id,
                            disabled: event.isBooking || event.isAvailableSlot, // Disable dragging for booked appointments and available slots
                          });

                         // Apply minimum height for all events to ensure visibility
                          const finalHeight = Math.max(style.height, eventStyling.minHeight);

                          const eventStyle: React.CSSProperties = {
                            top: `${style.top}px`,
                            height: `${finalHeight}px`,
                            width: eventWidth,
                            left: eventLeft,
                            zIndex: event.isAvailableSlot ? 5 + eventIndex : 10 + eventIndex,
                            background: eventStyling.background,
                            borderLeftColor: eventStyling.border,
                            borderColor: event.isAvailableSlot ? 'hsl(var(--accent) / 0.4)' : 'hsl(var(--border))',
                            borderRadius: '8px',
                            borderStyle: eventStyling.isDashed ? 'dashed' : 'solid',
                            borderWidth: eventStyling.isDashed ? '1px' : '1px 1px 1px 4px',
                            boxShadow: event.isAvailableSlot
                              ? '0 1px 2px hsl(var(--accent) / 0.15)'
                              : event.isBooking
                              ? '0 4px 12px -2px hsl(var(--primary) / 0.3), 0 2px 6px -1px hsl(var(--primary) / 0.25)'
                              : '0 8px 16px -4px hsl(var(--background) / 0.25), 0 4px 8px -2px hsl(var(--background) / 0.2)',
                            transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
                            opacity: isDragging ? 0.85 : (event.isAvailableSlot ? 0.95 : 1),
                            cursor: (event.isBooking || event.isAvailableSlot) ? 'pointer' : 'grab',
                          };

                           return (
                              <div
                                ref={setNodeRef}
                                className={`absolute ${event.isAvailableSlot ? 'p-1' : 'p-2'} text-xs overflow-hidden group
                                  transition-all duration-200 z-10 border
                                  ${event.isAvailableSlot ? '' : ''}
                                  ${event.isBooking || event.isAvailableSlot ? '' : 'hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5'}
                                  ${event.isAvailableSlot ? 'hover:bg-accent/20' : ''}
                                  ${!event.isBooking && !event.isAvailableSlot ? 'hover:ring-2 hover:ring-primary/40' : ''}
                                  ${eventStyling.textClass}`}
                                 style={eventStyle}
                                onClick={() => {
                                 if (event.isAvailableSlot) {
                                   // Handle available slot click - open booking dialog
                                   setSelectedSlot({
                                     id: event.id,
                                     schedulerName: event.schedulerName,
                                     schedulerSlug: event.schedulerSlug,
                                     date: format(day, 'yyyy-MM-dd'),
                                     startTime: format(startTime, 'HH:mm'),
                                     endTime: format(endTime, 'HH:mm'),
                                     duration: event.duration
                                   });
                                   setShowSlotDialog(true);
                                 } else if (event.isBooking) {
                                   // Handle customer booking click - show booking details (read-only)
                                   console.log('Customer booking clicked:', event);
                                 } else {
                                   // Handle personal event click - open edit dialog
                                   console.log('Personal event clicked:', event.id);
                                   onEventClick?.(event.id);
                                 }
                               }}
                                title={
                                   event.isAvailableSlot
                                     ? `📅 SHAREABLE APPOINTMENT SLOT\n${event.schedulerName}\n🕐 ${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')} (${event.duration} min)\n📤 Click to get booking link and share with clients`
                                     : event.isBooking 
                                     ? `👤 CUSTOMER BOOKING\n${event.customer_name}\n📋 ${event.scheduler_name}\n🕐 ${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}\n📞 Click to view contact details`
                                     : `📝 PERSONAL EVENT\n${event.title}\n🕐 ${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}\n${event.description || ''}\n✏️ Click to edit or move`
                                }
                             >
                                {/* Drag Handle - only for personal events */}
                                {!event.isBooking && !event.isAvailableSlot && (
                                  <div 
                                    {...listeners}
                                    {...attributes}
                                    className="absolute top-1 right-1 w-4 h-4 bg-black/20 rounded hover:bg-black/30 cursor-move z-20 flex items-center justify-center"
                                    title="Drag to move event"
                                  >
                                    <div className="flex flex-col gap-[1px]">
                                      <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                                      <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                                      <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                                    </div>
                                  </div>
                                 )}

                                  <div className="flex flex-col h-full pr-1 pb-1 overflow-hidden">
                                   {/* Event content - responsive to screen size and event width */}
                                   <div className="flex items-start justify-between gap-1 mb-0.5">
                                     {/* Title and time - adaptive based on screen size */}
                                     <div className="flex-1 min-w-0">
                                       {/* Event title - non-bold, smaller font on all screens */}
                                       <div 
                                         className={`${isNarrowEvent ? 'font-normal text-[10px]' : 'font-normal text-[11px]'} leading-tight text-foreground dark:text-white break-words overflow-hidden`}
                                         style={{ 
                                           display: '-webkit-box',
                                           WebkitLineClamp: finalHeight > 100 ? 4 : finalHeight > 70 ? 3 : finalHeight > 45 ? 2 : 1,
                                           WebkitBoxOrient: 'vertical',
                                           lineHeight: '1.3'
                                         }}>
                                        {event.isAvailableSlot 
                                          ? event.schedulerName 
                                          : event.isBooking 
                                          ? event.customer_name 
                                          : event.title
                                        }
                                       </div>
                                       
                                       {/* Time display - compact */}
                                       <div className={`flex items-center gap-0.5 ${isNarrowEvent ? 'text-[8px]' : 'text-[9px] md:text-[10px]'} leading-tight font-normal text-foreground/70 dark:text-white/70 mt-0.5`}>
                                         <span>{format(startTime, 'HH:mm')}</span>
                                         {!isNarrowEvent && (
                                           <>
                                             <span>-</span>
                                             <span>{format(endTime, 'HH:mm')}</span>
                                           </>
                                         )}
                                         {!event.isAvailableSlot && event.notification_enabled && !isNarrowEvent && finalHeight > 40 && (
                                           <Bell className="w-2.5 h-2.5 text-yellow-400 ml-0.5 hidden md:block" />
                                         )}
                                       </div>
                                     </div>
                                     
                                     {/* User avatar - hide on tablet and narrow events, only show on desktop */}
                                     {!event.isAvailableSlot && !isNarrowEvent && finalHeight > 35 && (
                                       <div className="hidden lg:flex flex-shrink-0 mr-5">
                                         <Avatar className="h-5 w-5">
                                           <AvatarImage src="" alt="" />
                                           <AvatarFallback className="text-[8px] bg-background/50 text-foreground font-medium">
                                             {event.isBooking 
                                               ? event.customer_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'C'
                                               : currentUserProfile?.display_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'ME'
                                             }
                                           </AvatarFallback>
                                         </Avatar>
                                       </div>
                                     )}
                                   </div>
                                  
                                  {/* Additional info - only for taller and wider events */}
                                  {finalHeight > 50 && !isNarrowEvent && (
                                    <div className="mt-1 space-y-1 flex-1 overflow-hidden">
                                      {/* Secondary info line */}
                                      <div className="text-[10px] leading-tight text-foreground/70 dark:text-white/70 truncate">
                                        {event.isBooking 
                                          ? event.scheduler_name 
                                          : event.isAvailableSlot
                                          ? `${event.duration} min slot`
                                          : event.location
                                        }
                                      </div>
                                      
                                      {/* Description for even taller events - multiline */}
                                      {finalHeight > 80 && (event.description || event.customer_phone) && (
                                        <div className="text-[9px] leading-relaxed text-foreground/60 dark:text-white/60 break-words overflow-hidden"
                                             style={{ 
                                               display: '-webkit-box',
                                               WebkitLineClamp: finalHeight > 120 ? 4 : 2,
                                               WebkitBoxOrient: 'vertical',
                                               lineHeight: '1.4'
                                             }}>
                                          {event.isBooking 
                                            ? event.customer_phone 
                                            : event.description
                                          }
                                        </div>
                                      )}
                                    </div>
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
      
      {/* Available Slot Sharing Dialog */}
      <AvailableSlotDialog
        isOpen={showSlotDialog}
        onClose={() => {
          setShowSlotDialog(false);
          setSelectedSlot(null);
        }}
        slot={selectedSlot}
      />
    </DndContext>
  );
};
