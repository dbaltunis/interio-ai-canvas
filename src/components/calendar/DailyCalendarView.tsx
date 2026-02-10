import { format, isToday } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useAppointmentBookings } from "@/hooks/useAppointmentBookings";
import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Video, CheckCheck, MapPin } from "lucide-react";
import { useMyTasks, Task, useUpdateTask } from "@/hooks/useTasks";
import { UnifiedTaskDialog } from "@/components/tasks/UnifiedTaskDialog";
import { BookedAppointmentDialog } from "./BookedAppointmentDialog";
import { EventDetailPopover } from "./EventDetailPopover";
import {
  SLOT_HEIGHT, PX_PER_MINUTE, ALL_TIME_SLOTS, WORKING_HOURS_SLOTS,
  getAllEventsForDate, calculateEventPosition, calculateOverlapLayout,
  getEventStyling, isTimeSlotOccupied,
} from "./utils/calendarHelpers";

// --- Current time hook (same as WeeklyCalendarView) ---

const useCurrentTimePosition = (showExtendedHours: boolean) => {
  const [position, setPosition] = useState<number | null>(null);

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const totalMinutes = now.getHours() * 60 + now.getMinutes();
      const offset = showExtendedHours ? 0 : 360;
      const adjusted = totalMinutes - offset;
      if (adjusted < 0) { setPosition(null); return; }
      setPosition(adjusted * PX_PER_MINUTE);
    };
    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [showExtendedHours]);

  return position;
};

// --- Main component ---

interface DailyCalendarViewProps {
  currentDate: Date;
  onEventClick?: (eventId: string) => void;
  onTimeSlotClick?: (date: Date, time: string, event?: React.MouseEvent) => void;
  filteredAppointments?: any[];
  hiddenSources?: Set<string>;
  quickAddOpen?: boolean;
  quickAddStartTime?: string;
  quickAddColor?: string;
}

export const DailyCalendarView = ({ currentDate, onEventClick, onTimeSlotClick, filteredAppointments, hiddenSources, quickAddOpen, quickAddStartTime, quickAddColor }: DailyCalendarViewProps) => {
  const { data: appointments } = useAppointments();
  const displayAppointments = filteredAppointments || appointments;
  const { data: bookedAppointments } = useAppointmentBookings();
  const displayBookings = hiddenSources?.has('bookings') ? undefined : bookedAppointments;
  const { data: tasks } = useMyTasks();
  const updateTask = useUpdateTask();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [bookedAppointmentDialog, setBookedAppointmentDialog] = useState<{ open: boolean; appointment: any }>({ open: false, appointment: null });

  // Drag-to-create state
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventCreationStart, setEventCreationStart] = useState<number | null>(null);
  const [eventCreationEnd, setEventCreationEnd] = useState<number | null>(null);

  const [showExtendedHours] = useState(true);
  const timeSlots = useMemo(() => showExtendedHours ? ALL_TIME_SLOTS : WORKING_HOURS_SLOTS, [showExtendedHours]);
  const currentTimePosition = useCurrentTimePosition(showExtendedHours);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data?.user?.id || null));
  }, []);

  // Auto-scroll to current time
  useLayoutEffect(() => {
    if (!scrollContainerRef.current) return;
    const hasToday = isToday(currentDate);
    const now = new Date();
    const scrollHour = hasToday ? Math.max(0, now.getHours() - 1) : 8;
    const scrollMinutes = hasToday ? now.getMinutes() : 0;
    scrollContainerRef.current.scrollTop = (scrollHour * 60 + scrollMinutes) * PX_PER_MINUTE;
  }, [currentDate]);

  // Memoized events for the day
  const dayEvents = useMemo(() => {
    return getAllEventsForDate(displayAppointments, displayBookings, tasks, currentDate, currentUserId);
  }, [displayAppointments, displayBookings, tasks, currentDate, currentUserId]);

  // Overlap layout
  const overlapLayout = useMemo(() => calculateOverlapLayout(dayEvents), [dayEvents]);

  // Creation handlers
  const handleMouseDown = useCallback((idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsCreatingEvent(true);
    setEventCreationStart(idx);
    setEventCreationEnd(idx);
  }, []);

  const handleMouseMove = useCallback((idx: number) => {
    if (isCreatingEvent && eventCreationStart !== null) {
      setEventCreationEnd(idx);
    }
  }, [isCreatingEvent, eventCreationStart]);

  const handleMouseUp = useCallback((e?: React.MouseEvent) => {
    if (isCreatingEvent && eventCreationStart !== null && eventCreationEnd !== null) {
      const minSlot = Math.min(eventCreationStart, eventCreationEnd);
      const maxSlot = Math.max(eventCreationStart, eventCreationEnd);
      onTimeSlotClick?.(currentDate, `${timeSlots[minSlot]}-${timeSlots[Math.min(maxSlot + 1, timeSlots.length - 1)]}`, e);
    }
    setIsCreatingEvent(false);
    setEventCreationStart(null);
    setEventCreationEnd(null);
  }, [isCreatingEvent, eventCreationStart, eventCreationEnd, timeSlots, currentDate, onTimeSlotClick]);

  // Preview style for drag-to-create
  const previewStyle = useMemo(() => {
    if (!isCreatingEvent || eventCreationStart === null || eventCreationEnd === null) return null;
    const minSlot = Math.min(eventCreationStart, eventCreationEnd);
    const maxSlot = Math.max(eventCreationStart, eventCreationEnd);
    return { top: minSlot * SLOT_HEIGHT, height: (maxSlot - minSlot + 1) * SLOT_HEIGHT };
  }, [isCreatingEvent, eventCreationStart, eventCreationEnd]);

  const gridHeight = timeSlots.length * SLOT_HEIGHT;
  const offsetMinutes = showExtendedHours ? 0 : 360;

  return (
    <>
      <div className="h-full flex flex-col" onMouseUp={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('[class*="z-[10000]"]')) return;
        handleMouseUp(e);
      }}>
        {/* Day header — Apple style */}
        <div className="border-b bg-background sticky top-0 z-10 py-2.5 px-4 flex items-center justify-center gap-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            {format(currentDate, 'EEEE')}
          </div>
          <div className={`text-lg font-semibold ${
            isToday(currentDate)
              ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center'
              : ''
          }`}>
            {format(currentDate, 'd')}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(currentDate, 'MMMM yyyy')}
          </div>
        </div>

        {/* Scrollable time grid */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth pb-20"
          style={{ overscrollBehavior: 'contain' }}
        >
          <div className="flex">
            {/* Time labels */}
            <div className="w-16 flex-shrink-0">
              {timeSlots.map((time) => {
                const [h, m] = time.split(':').map(Number);
                const isBiz = h >= 9 && h < 17;
                return (
                  <div key={time} className="flex items-start justify-end pr-3" style={{ height: `${SLOT_HEIGHT}px` }}>
                    {m === 0 && (
                      <span className={`text-[11px] font-medium -mt-2 tabular-nums ${isBiz ? 'text-foreground/70' : 'text-muted-foreground/40'}`}>
                        {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Content column */}
            <div className="flex-1 relative">
              {/* Grid lines */}
              {timeSlots.map((time, index) => {
                const [, m] = time.split(':').map(Number);
                const lineClass = m === 0
                  ? 'border-t border-border/30'
                  : m === 30
                    ? 'border-t border-border/15'
                    : 'border-t border-border/[0.06]';
                return (
                  <div
                    key={`line-${time}`}
                    className={`absolute left-0 right-0 ${lineClass}`}
                    style={{ top: `${index * SLOT_HEIGHT}px` }}
                  />
                );
              })}

              {/* Clickable time slots */}
              <div className="relative" style={{ height: `${gridHeight}px` }}>
                {timeSlots.map((time, index) => {
                  const [slotH] = time.split(':').map(Number);
                  const isBusinessHour = slotH >= 9 && slotH < 17;
                  const occupied = isTimeSlotOccupied(dayEvents, time, currentDate);

                  return (
                    <div
                      key={time}
                      className={`absolute left-0 right-0 transition-colors ${
                        occupied ? 'cursor-default'
                          : isBusinessHour ? 'hover:bg-accent/40 cursor-pointer'
                          : 'hover:bg-accent/20 cursor-pointer'
                      }`}
                      style={{ top: `${index * SLOT_HEIGHT}px`, height: `${SLOT_HEIGHT}px` }}
                      onMouseDown={(e) => !occupied && handleMouseDown(index, e)}
                      onMouseMove={() => !occupied && handleMouseMove(index)}
                      onClick={(e) => !isCreatingEvent && !occupied && onTimeSlotClick?.(currentDate, time, e)}
                    />
                  );
                })}

                {/* Drag-to-create preview */}
                {previewStyle && (
                  <div
                    className="absolute left-2 right-2 bg-primary/15 border border-primary/30 z-[16] rounded-lg flex items-center px-3"
                    style={{ top: `${previewStyle.top}px`, height: `${previewStyle.height}px` }}
                  >
                    <span className="text-xs font-medium text-primary">New Event</span>
                  </div>
                )}

                {/* Ghost event preview when QuickAddPopover is open */}
                {!isCreatingEvent && quickAddOpen && quickAddStartTime && (() => {
                  const ghostSlotIndex = timeSlots.findIndex(t => t === quickAddStartTime);
                  if (ghostSlotIndex < 0) return null;
                  const ghostTop = ghostSlotIndex * SLOT_HEIGHT;
                  const ghostHeight = 2 * SLOT_HEIGHT;
                  return (
                    <div
                      className="absolute left-2 right-2 rounded-lg flex items-center px-3 z-[15] border border-dashed pointer-events-none animate-pulse"
                      style={{
                        top: `${ghostTop}px`,
                        height: `${ghostHeight}px`,
                        backgroundColor: `${quickAddColor || '#6366F1'}15`,
                        borderColor: `${quickAddColor || '#6366F1'}40`,
                      }}
                    >
                      <span className="text-xs font-medium" style={{ color: quickAddColor || '#6366F1' }}>New Event</span>
                    </div>
                  );
                })()}

                {/* Current time indicator */}
                {isToday(currentDate) && currentTimePosition !== null && (
                  <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${currentTimePosition}px` }}>
                    <div className="h-[2px] bg-red-500 w-full opacity-80" />
                    <div className="absolute -left-1.5 -top-[4px] w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-red-500/20" />
                  </div>
                )}

                {/* Events */}
                {dayEvents.map((event, eventIndex) => {
                  const startTime = new Date(event.start_time);
                  const endTime = new Date(event.end_time);
                  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return null;
                  const pos = calculateEventPosition(startTime, endTime, offsetMinutes);
                  if (!pos.visible) return null;
                  const layout = overlapLayout.get(event.id) || { column: 0, totalColumns: 1 };
                  const styling = getEventStyling(event);
                  const finalHeight = Math.max(pos.height, styling.minHeight);

                  const eventWidth = layout.totalColumns > 1 ? `${96 / layout.totalColumns}%` : '96%';
                  const eventLeft = layout.totalColumns > 1 ? `${(96 / layout.totalColumns) * layout.column + 2}%` : '2%';

                  const handleClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (event.isTask) setSelectedTask(event.taskData as Task);
                    else if (event.isBooking) setBookedAppointmentDialog({ open: true, appointment: event });
                    else onEventClick?.(event.id);
                  };

                  // Task rendering
                  if (event.isTask) {
                    return (
                      <div
                        key={event.id}
                        className="absolute rounded-lg overflow-hidden cursor-pointer transition-all duration-150 hover:shadow-md"
                        style={{
                          top: `${pos.top}px`,
                          height: `${finalHeight}px`,
                          width: eventWidth,
                          left: eventLeft,
                          zIndex: 12 + eventIndex,
                          backgroundColor: styling.background,
                          pointerEvents: 'auto',
                        }}
                        onClick={handleClick}
                      >
                        <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full" style={{ backgroundColor: styling.border }} />
                        <div className="flex items-center gap-2 h-full pl-3 pr-2">
                          <button
                            type="button"
                            className={`flex-shrink-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                              event.status === 'completed'
                                ? "border-green-500 bg-green-500"
                                : "border-muted-foreground/40 hover:border-primary"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTask.mutate({ id: event.id, status: event.status === 'completed' ? 'in_progress' : 'completed' });
                            }}
                          >
                            {event.status === 'completed' && <CheckCheck className="h-2 w-2 text-white" strokeWidth={3} />}
                          </button>
                          <span
                            className="text-[11px] font-medium text-foreground leading-tight truncate"
                            style={{ textDecoration: event.status === 'completed' ? 'line-through' : 'none' }}
                          >
                            {event.title}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Event pill — Apple style with EventDetailPopover
                  const title = event.isBooking ? (event.bookingData?.customer_name || 'Customer') : event.title;

                  return (
                    <EventDetailPopover
                      key={event.id}
                      event={event}
                      onEdit={(id) => onEventClick?.(id)}
                      disabled={event.isBooking}
                    >
                      <div
                        className="absolute rounded-lg overflow-hidden group transition-all duration-150 hover:shadow-md hover:brightness-[0.97] cursor-pointer"
                        style={{
                          top: `${pos.top}px`,
                          height: `${finalHeight}px`,
                          width: eventWidth,
                          left: eventLeft,
                          zIndex: event.isBooking ? 15 + eventIndex : 10 + eventIndex,
                          pointerEvents: 'auto',
                        }}
                        onClick={event.isBooking ? handleClick : undefined}
                      >
                        <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full" style={{ backgroundColor: styling.border }} />
                        <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: styling.background }} />
                        <div className="relative pl-3 pr-1.5 py-1 h-full flex flex-col overflow-hidden">
                          <div
                            className="text-[11px] font-semibold text-foreground leading-tight overflow-hidden"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: finalHeight > 70 ? 3 : finalHeight > 45 ? 2 : 1,
                              WebkitBoxOrient: 'vertical',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                            }}
                          >
                            {title}
                          </div>
                          {finalHeight > 28 && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                              <span className="tabular-nums">{format(startTime, 'H:mm')}</span>
                              <span className="opacity-50">&ndash;</span>
                              <span className="tabular-nums">{format(endTime, 'H:mm')}</span>
                              {(event.video_meeting_link || event.video_provider) && (
                                <Video className="w-2.5 h-2.5 text-blue-500 ml-0.5" />
                              )}
                            </div>
                          )}
                          {finalHeight > 65 && (event.location || event.description) && (
                            <div className="text-[10px] text-muted-foreground/70 truncate mt-0.5 flex items-center gap-0.5">
                              {event.location && <MapPin className="w-2.5 h-2.5 flex-shrink-0" />}
                              {event.location || event.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </EventDetailPopover>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
};
