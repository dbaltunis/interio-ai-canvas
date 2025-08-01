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
    
    console.log('Available slots for', format(date, 'yyyy-MM-dd'), ':', availableSlots.length);
    return availableSlots;
  };

  // Combine regular events, booked appointments, and available slots
  const getAllEventsForDate = (date: Date) => {
    const regularEvents = getEventsForDate(date);
    const bookedEvents = getBookedEventsForDate(date);
    const availableSlots = getAvailableSlotsForDate(date);
    console.log('All events for', format(date, 'yyyy-MM-dd'), ':', { 
      regularEvents: regularEvents.length, 
      bookedEvents: bookedEvents.length,
      availableSlots: availableSlots.length 
    });
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
    
    // Calculate position based on 30-minute slots (20px each)
    const slotHeight = 20;
    
    // Calculate total minutes from midnight (00:00)
    let totalMinutesFromMidnight = startHour * 60 + startMinutes;
    
    // For working hours view (6 AM to 10 PM), adjust the offset
    if (!isExtendedHours) {
      const workingHoursStartOffset = 6 * 60; // 6 AM in minutes
      totalMinutesFromMidnight -= workingHoursStartOffset;
      // If event starts before 6 AM, position it at the top
      if (totalMinutesFromMidnight < 0) totalMinutesFromMidnight = 0;
    }
    
    // Convert minutes to pixels: each 30-minute slot = 20px
    // So each minute = 20/30 = 0.6667px
    const top = (totalMinutesFromMidnight * 20) / 30;

    // Calculate duration and height with accurate minute conversion
    const durationInMinutes = Math.max((endTime.getTime() - startTime.getTime()) / (1000 * 60), 15);
    const height = Math.max((durationInMinutes * 20) / 30, 15); // Minimum 15px height

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
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex">
            {/* Fixed time labels column */}
            <div className="w-16 border-r bg-muted/20 flex-shrink-0">
              {timeSlots.map((time, index) => (
                <div 
                  key={time} 
                className={`h-[20px] px-2 text-xs text-muted-foreground flex items-center justify-end ${
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
            <div className="flex-1 relative">
              {/* Hour separation lines */}
              {timeSlots.map((time, index) => {
                if (index % 2 === 0) { // Only on full hours
                  return (
                    <div
                      key={`hour-line-${index}`}
                      className="absolute left-0 right-0 border-t border-muted/10 pointer-events-none z-5"
                      style={{ top: `${index * 20}px` }}
                    />
                  );
                }
                return null;
              })}
              
              <div className="grid grid-cols-7 h-full">
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = getAllEventsForDate(day);
                  const isCurrentDay = isToday(day);
                  const previewStyle = getEventCreationPreviewStyle();
                  const showPreview = isCreatingEvent && eventCreationStart && isSameDay(eventCreationStart.date, day);
                  
                  return (
                    <div key={day.toString()} className={`border-r relative ${
                      isCurrentDay ? 'bg-primary/5' : ''
                    }`} style={{ height: `${timeSlots.length * 20}px` }}>
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
                              className={`h-[20px] transition-colors relative ${
                                 index % 2 === 0 ? 'border-b border-muted/30' : 'border-b border-muted'
                               } ${isOver ? 'bg-primary/30 border-primary border-2' : ''} ${
                                isOccupied 
                                  ? 'bg-red-50 hover:bg-red-100 cursor-help border-red-200' 
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
                         
                         // Each 30-minute slot is 20px, so each minute is 20/30 = 0.6667px
                         const top = (totalMinutesFromMidnight * 20) / 30;
                         
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
                             className="absolute left-0 right-0 h-0.5 bg-red-500 z-20"
                             style={{ top: `${top}px` }}
                           >
                             <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                             <div className="absolute right-2 -top-2 text-[10px] text-red-500 font-medium bg-white px-1 rounded">
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
                        
                        // Clear visual distinction between events, bookings, and available slots
                        const getEventStyling = (event: any) => {
                          if (event.isAvailableSlot) {
                            // AVAILABLE APPOINTMENT SLOTS: Compact Google Calendar style
                            return {
                              backgroundColor: 'rgba(59, 130, 246, 0.08)', // Very subtle blue
                              borderColor: '#3B82F6', // Blue-500
                              textColor: 'text-blue-600',
                              icon: <Share2 className="h-3 w-3" />,
                              label: 'Available',
                              borderRadius: '4px',
                              pattern: 'dashed',
                              isDashed: true,
                              isCompact: true,
                              minHeight: 24 // Minimum compact height
                            };
                          } else if (event.isBooking) {
                            // BOOKED APPOINTMENTS: Green, solid, professional
                            return {
                              backgroundColor: '#10B981', // Emerald-500
                              borderColor: '#047857', // Emerald-700
                              textColor: 'text-white',
                              icon: <UserCheck className="h-3 w-3" />,
                              label: 'Booked',
                              borderRadius: '6px',
                              pattern: 'solid'
                            };
                          } else {
                            // PERSONAL EVENTS: Blue, gradient, rounded
                            const color = event.color || '#3B82F6';
                            return {
                              backgroundColor: `${color}90`, // 90% opacity
                              borderColor: color,
                              textColor: 'text-white',
                              icon: <CalendarCheck className="h-3 w-3" />,
                              label: 'Event',
                              borderRadius: '6px',
                              pattern: 'gradient'
                            };
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
                         const finalHeight = Math.max(style.height, 32); // Minimum 32px height for all events

                          const eventStyle = {
                            top: `${style.top}px`,
                            height: `${finalHeight}px`,
                            width: eventWidth,
                            left: eventLeft,
                            zIndex: event.isAvailableSlot ? 5 + eventIndex : 10 + eventIndex,
                            backgroundColor: eventStyling.backgroundColor,
                            borderLeftColor: eventStyling.borderColor,
                            borderRadius: eventStyling.borderRadius,
                            borderStyle: eventStyling.isDashed ? 'dashed' : 'solid',
                            borderWidth: eventStyling.isDashed ? '1px' : '1px 1px 1px 4px',
                            boxShadow: event.isAvailableSlot
                              ? '0 1px 2px rgba(59, 130, 246, 0.1)'
                              : event.isBooking
                              ? '0 4px 12px -2px rgba(16, 185, 129, 0.3), 0 2px 6px -1px rgba(16, 185, 129, 0.2)'
                              : '0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -2px rgba(0, 0, 0, 0.06)',
                            transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
                            opacity: isDragging ? 0.5 : (event.isAvailableSlot ? 0.9 : 1),
                            cursor: (event.isBooking || event.isAvailableSlot) ? 'pointer' : 'grab',
                          };

                           return (
                              <div
                                ref={setNodeRef}
                                className={`absolute ${event.isAvailableSlot ? 'p-1' : 'p-2'} text-xs overflow-hidden group
                                  transition-all duration-200 z-10 border
                                  ${event.isAvailableSlot ? 'border-blue-300' : 'border-white/40'}
                                  ${event.isBooking || event.isAvailableSlot ? '' : 'hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5'}
                                  ${event.isAvailableSlot ? 'hover:bg-blue-50/30 hover:border-blue-400' : ''}
                                  ${!event.isBooking && !event.isAvailableSlot ? 'hover:ring-2 hover:ring-primary/50' : ''}
                                  ${eventStyling.textColor}`}
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

                                  <div className="flex flex-col h-full pr-1 pb-1">
                                   {/* Event content - compact layout */}
                                   <div className="flex items-start justify-between gap-1">
                                     {/* Left side: Title and time */}
                                     <div className="flex-1 min-w-0">
                                       {/* Event title - compact */}
                                       <div className="font-normal text-[12px] leading-tight text-foreground dark:text-white break-words overflow-hidden" 
                                            style={{ 
                                              display: '-webkit-box',
                                              WebkitLineClamp: 1,
                                              WebkitBoxOrient: 'vertical',
                                              lineHeight: '1.2'
                                            }}>
                                         {event.isAvailableSlot 
                                           ? event.schedulerName 
                                           : event.isBooking 
                                           ? event.customer_name 
                                           : event.title
                                         }
                                       </div>
                                       
                                       {/* Time display with notification bell */}
                                       <div className="flex items-center gap-1 text-[9px] leading-tight opacity-80 font-normal text-foreground dark:text-white/80 mt-0.5">
                                         <span>{format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}</span>
                                         {!event.isAvailableSlot && event.notification_enabled && (
                                           <Bell className="w-2.5 h-2.5 text-yellow-400" />
                                         )}
                                       </div>
                                     </div>
                                     
                                     {/* User avatar - positioned to not overlap drag handle */}
                                     {!event.isAvailableSlot && (
                                       <div className="flex-shrink-0 mr-5">
                                         <Avatar className="h-4 w-4">
                                           <AvatarImage src="" alt="" />
                                           <AvatarFallback className="text-[7px] bg-background/50 text-foreground">
                                             {event.isBooking 
                                               ? event.customer_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'C'
                                               : currentUserProfile?.display_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'ME'
                                             }
                                           </AvatarFallback>
                                         </Avatar>
                                       </div>
                                     )}
                                   </div>
                                  
                                  {/* Notification and additional info for taller events */}
                                  {finalHeight > 45 && (
                                    <div className="flex items-center justify-between mt-1">
                                      {/* Notification indicator */}
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Email reminder set"></div>
                                        <span className="text-[8px] text-foreground/60 dark:text-white/60">Reminder</span>
                                      </div>
                                      
                                      {/* Additional event info */}
                                      {finalHeight > 60 && (
                                        <div className="text-[9px] leading-tight truncate opacity-60 text-foreground dark:text-white/60">
                                          {event.isBooking 
                                            ? event.scheduler_name 
                                            : (event.location || event.description)
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
              backgroundColor: activeEvent.color ? `${activeEvent.color}90` : 'hsl(var(--primary) / 0.9)',
              borderRadius: '20px 8px 20px 8px',
              borderLeftColor: activeEvent.color || 'hsl(var(--primary))',
              borderLeftWidth: '4px',
              boxShadow: '0 20px 40px -8px hsl(var(--primary) / 0.4), 0 8px 16px -4px hsl(var(--primary) / 0.25)',
              color: 'white',
              minWidth: '120px',
              zIndex: 1000
            }}
          >
                            <div className="font-semibold text-white text-sm mb-1">
              {activeEvent.title}
            </div>
                            <div className="text-white/90 text-xs">
              {format(new Date(activeEvent.start_time), 'HH:mm')}
            </div>
                            <div className="text-white/70 text-xs mt-1">
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
