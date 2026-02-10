import { format, addDays, startOfWeek, isToday, isSameDay } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useAppointmentBookings } from "@/hooks/useAppointmentBookings";
import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, DragEndEvent, useDraggable, useDroppable, DragOverlay } from "@dnd-kit/core";
import { Video, CheckCheck } from "lucide-react";
import { useUpdateAppointment } from "@/hooks/useAppointments";
import { BookedAppointmentDialog } from "./BookedAppointmentDialog";
import { EventDetailPopover } from "./EventDetailPopover";
import { useMyTasks, Task, useUpdateTask } from "@/hooks/useTasks";
import { UnifiedTaskDialog } from "@/components/tasks/UnifiedTaskDialog";
import {
  SLOT_HEIGHT, PX_PER_MINUTE, ALL_TIME_SLOTS, WORKING_HOURS_SLOTS,
  getAllEventsForDate, calculateEventPosition, calculateOverlapLayout,
  getEventStyling, isTimeSlotOccupied,
} from "./utils/calendarHelpers";

// --- Module-level memoized sub-components (NOT inside render loops) ---

interface DroppableSlotProps {
  id: string;
  day: Date;
  timeSlotIndex: number;
  time: string;
  isBusinessHour: boolean;
  isOccupied: boolean;
  onMouseDown: (date: Date, idx: number, e: React.MouseEvent) => void;
  onMouseMove: (date: Date, idx: number) => void;
  onClick: (date: Date, time: string, e?: React.MouseEvent) => void;
  isCreating: boolean;
}

const DroppableSlot = memo(({ id, day, timeSlotIndex, time, isBusinessHour, isOccupied, onMouseDown, onMouseMove, onClick, isCreating }: DroppableSlotProps) => {
  const { setNodeRef, isOver } = useDroppable({ id, data: { day, timeSlotIndex } });
  return (
    <div
      ref={setNodeRef}
      className={`transition-colors relative ${
        isOver ? 'bg-primary/20 ring-1 ring-primary/40 ring-inset' : ''
      } ${
        isOccupied ? 'cursor-default'
          : isBusinessHour ? 'hover:bg-accent/40 cursor-pointer'
          : 'hover:bg-accent/20 cursor-pointer'
      }`}
      style={{ height: `${SLOT_HEIGHT}px` }}
      onMouseDown={(e) => !isOccupied && onMouseDown(day, timeSlotIndex, e)}
      onMouseMove={() => !isOccupied && onMouseMove(day, timeSlotIndex)}
      onClick={(e) => !isCreating && !isOccupied && onClick(day, time, e)}
    />
  );
});
DroppableSlot.displayName = 'DroppableSlot';

interface DraggableEventCardProps {
  event: any;
  style: { top: number; height: number };
  eventWidth: string;
  eventLeft: string;
  eventIndex: number;
  styling: ReturnType<typeof getEventStyling>;
  onEventClick?: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onBookingClick: (event: any) => void;
  updateTask: any;
}

const DraggableEventCard = memo(({ event, style, eventWidth, eventLeft, eventIndex, styling, onEventClick, onTaskClick, onBookingClick, updateTask }: DraggableEventCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    disabled: event.isBooking || event.isTask,
  });

  const finalHeight = Math.max(style.height, styling.minHeight);
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);

  const eventStyle: React.CSSProperties = {
    top: `${style.top}px`,
    height: `${finalHeight}px`,
    width: (event.isBooking || event.isTask) ? '96%' : eventWidth,
    left: (event.isBooking || event.isTask) ? '2%' : eventLeft,
    zIndex: event.isBooking ? 15 + eventIndex : event.isTask ? 12 + eventIndex : 10 + eventIndex,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.8 : 1,
    cursor: (event.isBooking || event.isTask) ? 'pointer' : 'grab',
    pointerEvents: 'auto',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.isTask) onTaskClick(event.taskData as Task);
    else if (event.isBooking) onBookingClick(event);
    // Regular events: handled by EventDetailPopover wrapper
  };

  const cardContent = (
    <div
      ref={setNodeRef}
      className="absolute rounded-lg overflow-hidden group transition-all duration-150 hover:shadow-md hover:brightness-[0.97]"
      style={eventStyle}
      onClick={handleClick}
      title={event.title}
    >
      {/* Left color accent bar */}
      <div
        className="absolute left-0 top-1 bottom-1 w-1 rounded-full"
        style={{ backgroundColor: styling.border }}
      />

      {/* Background fill */}
      <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: styling.background }} />

      {/* Content */}
      <div className="relative pl-3 pr-1.5 py-1 h-full flex flex-col overflow-hidden">
        {/* Drag handle for personal events */}
        {!event.isBooking && !event.isTask && (
          <div
            {...listeners}
            {...attributes}
            className="absolute top-0 right-0 w-5 h-5 opacity-0 group-hover:opacity-60 cursor-move z-20 flex items-center justify-center transition-opacity"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" className="text-current opacity-50">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
              <circle cx="6" cy="2" r="1" fill="currentColor" />
              <circle cx="2" cy="6" r="1" fill="currentColor" />
              <circle cx="6" cy="6" r="1" fill="currentColor" />
            </svg>
          </div>
        )}

        {event.isTask ? (
          <div className="flex items-center gap-2 h-full">
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
        ) : (
          <>
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
              {event.isBooking ? (event.bookingData?.customer_name || 'Customer') : event.title}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
              <span className="tabular-nums">{format(startTime, 'H:mm')}</span>
              <span className="opacity-50">–</span>
              <span className="tabular-nums">{format(endTime, 'H:mm')}</span>
              {(event.video_meeting_link || event.video_provider) && (
                <Video className="w-2.5 h-2.5 text-blue-500 ml-0.5" />
              )}
            </div>
            {finalHeight > 65 && (event.location || event.description) && (
              <div className="text-[10px] text-muted-foreground/70 truncate mt-0.5">
                {event.location || event.description}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Wrap regular events in EventDetailPopover for card-style view
  if (!event.isBooking && !event.isTask) {
    return (
      <EventDetailPopover
        event={event}
        onEdit={(id) => onEventClick?.(id)}
      >
        {cardContent}
      </EventDetailPopover>
    );
  }

  return cardContent;
});
DraggableEventCard.displayName = 'DraggableEventCard';

// --- Current time hook (updates every 60s, not every render) ---

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

interface WeeklyCalendarViewProps {
  currentDate: Date;
  onEventClick?: (eventId: string) => void;
  onTimeSlotClick?: (date: Date, time: string, event?: React.MouseEvent) => void;
  onDayHeaderClick?: (date: Date) => void;
  filteredAppointments?: any[];
  hiddenSources?: Set<string>;
}

export const WeeklyCalendarView = ({ currentDate, onEventClick, onTimeSlotClick, onDayHeaderClick, filteredAppointments, hiddenSources }: WeeklyCalendarViewProps) => {
  const { data: appointments } = useAppointments();
  const displayAppointments = filteredAppointments || appointments;
  const { data: bookedAppointments } = useAppointmentBookings();
  const displayBookings = hiddenSources?.has('bookings') ? undefined : bookedAppointments;
  const updateAppointment = useUpdateAppointment();
  const { data: tasks } = useMyTasks();
  const updateTask = useUpdateTask();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [bookedAppointmentDialog, setBookedAppointmentDialog] = useState<{ open: boolean; appointment: any }>({ open: false, appointment: null });

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventCreationStart, setEventCreationStart] = useState<{ date: Date; timeSlot: number } | null>(null);
  const [eventCreationEnd, setEventCreationEnd] = useState<{ date: Date; timeSlot: number } | null>(null);
  const [activeEvent, setActiveEvent] = useState<any>(null);

  const [showExtendedHours] = useState(true);
  const timeSlots = useMemo(() => showExtendedHours ? ALL_TIME_SLOTS : WORKING_HOURS_SLOTS, [showExtendedHours]);
  const currentTimePosition = useCurrentTimePosition(showExtendedHours);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data?.user?.id || null));
  }, []);

  // Auto-scroll to current time
  useLayoutEffect(() => {
    if (!scrollContainerRef.current) return;
    const now = new Date();
    const hasToday = weekDays.some(d => isToday(d));
    const scrollHour = hasToday ? Math.max(0, now.getHours() - 1) : 8;
    const scrollMinutes = hasToday ? now.getMinutes() : 0;
    scrollContainerRef.current.scrollTop = (scrollHour * 60 + scrollMinutes) * PX_PER_MINUTE;
  }, [currentDate, weekDays]);

  // Memoize events per day
  const dayEventsMap = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const day of weekDays) {
      map.set(day.toISOString(), getAllEventsForDate(displayAppointments, displayBookings, tasks, day, currentUserId));
    }
    return map;
  }, [weekDays, displayAppointments, displayBookings, tasks, currentUserId]);

  // Memoize overlap layouts
  const overlapLayouts = useMemo(() => {
    const layouts = new Map<string, Map<string, { column: number; totalColumns: number }>>();
    for (const [key, events] of dayEventsMap) {
      layouts.set(key, calculateOverlapLayout(events));
    }
    return layouts;
  }, [dayEventsMap]);

  // Event creation handlers
  const handleMouseDown = useCallback((date: Date, timeSlotIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsCreatingEvent(true);
    setEventCreationStart({ date, timeSlot: timeSlotIndex });
    setEventCreationEnd({ date, timeSlot: timeSlotIndex });
  }, []);

  const handleMouseMove = useCallback((date: Date, timeSlotIndex: number) => {
    if (isCreatingEvent && eventCreationStart) {
      setEventCreationEnd({ date, timeSlot: timeSlotIndex });
    }
  }, [isCreatingEvent, eventCreationStart]);

  const handleMouseUp = useCallback(() => {
    if (isCreatingEvent && eventCreationStart && eventCreationEnd) {
      if (isSameDay(eventCreationStart.date, eventCreationEnd.date)) {
        const minSlot = Math.min(eventCreationStart.timeSlot, eventCreationEnd.timeSlot);
        const maxSlot = Math.max(eventCreationStart.timeSlot, eventCreationEnd.timeSlot);
        onTimeSlotClick?.(eventCreationStart.date, `${timeSlots[minSlot]}-${timeSlots[Math.min(maxSlot + 1, timeSlots.length - 1)]}`);
      }
    }
    setIsCreatingEvent(false);
    setEventCreationStart(null);
    setEventCreationEnd(null);
  }, [isCreatingEvent, eventCreationStart, eventCreationEnd, timeSlots, onTimeSlotClick]);

  const handleSlotClick = useCallback((date: Date, time: string, e?: React.MouseEvent) => {
    onTimeSlotClick?.(date, time, e);
  }, [onTimeSlotClick]);

  // Drag and drop
  const handleDragStart = useCallback((event: any) => {
    setActiveEvent(displayAppointments?.find(apt => apt.id === event.active.id) || null);
  }, [displayAppointments]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveEvent(null);
    const { active, over } = event;
    if (!over || !active) return;
    const dropData = over.data.current;
    if (!dropData) return;
    const eventToUpdate = displayAppointments?.find(apt => apt.id === (active.id as string));
    if (!eventToUpdate) return;
    const duration = new Date(eventToUpdate.end_time).getTime() - new Date(eventToUpdate.start_time).getTime();
    const [h, m] = timeSlots[dropData.timeSlotIndex].split(':').map(Number);
    const newStart = new Date(dropData.day);
    newStart.setHours(h, m, 0, 0);
    try {
      await updateAppointment.mutateAsync({
        id: active.id as string,
        start_time: newStart.toISOString(),
        end_time: new Date(newStart.getTime() + duration).toISOString(),
      });
    } catch { /* handled by React Query */ }
  }, [displayAppointments, timeSlots, updateAppointment]);

  // Creation preview
  const previewStyle = useMemo(() => {
    if (!isCreatingEvent || !eventCreationStart || !eventCreationEnd) return null;
    const minSlot = Math.min(eventCreationStart.timeSlot, eventCreationEnd.timeSlot);
    const maxSlot = Math.max(eventCreationStart.timeSlot, eventCreationEnd.timeSlot);
    return { top: minSlot * SLOT_HEIGHT, height: (maxSlot - minSlot + 1) * SLOT_HEIGHT };
  }, [isCreatingEvent, eventCreationStart, eventCreationEnd]);

  const gridHeight = timeSlots.length * SLOT_HEIGHT;
  const offsetMinutes = showExtendedHours ? 0 : 360;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full" onMouseUp={handleMouseUp}>
        {/* Apple-style week header */}
        <div className="flex bg-background flex-shrink-0 sticky top-0 z-10 border-b">
          <div className="w-16 flex-shrink-0" />
          <div className="flex-1">
            <div className="grid grid-cols-7">
              {weekDays.map(day => {
                const isCurrent = isToday(day);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <div
                    key={day.toString()}
                    className={`py-2.5 text-center cursor-pointer hover:bg-accent/30 transition-colors ${isWeekend ? 'bg-muted/5' : ''}`}
                    onClick={() => onDayHeaderClick?.(day)}
                  >
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-sm font-medium mt-1 ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto font-semibold'
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

            {/* Day columns */}
            <div className="flex-1 relative">
              {/* Grid lines */}
              {timeSlots.map((time, index) => (
                <div
                  key={`line-${time}`}
                  className={`absolute left-0 right-0 ${index % 2 === 0 ? 'border-t border-border/30' : 'border-t border-border/10 border-dashed'}`}
                  style={{ top: `${index * SLOT_HEIGHT}px` }}
                />
              ))}

              <div className="grid grid-cols-7 h-full">
                {weekDays.map((day) => {
                  const dayKey = day.toISOString();
                  const dayEvents = dayEventsMap.get(dayKey) || [];
                  const overlapLayout = overlapLayouts.get(dayKey) || new Map();
                  const isCurrentDay = isToday(day);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const showPreview = isCreatingEvent && eventCreationStart && isSameDay(eventCreationStart.date, day);

                  return (
                    <div
                      key={dayKey}
                      className={`border-r border-border/15 relative ${
                        isCurrentDay ? 'bg-primary/[0.02]' : isWeekend ? 'bg-muted/[0.03]' : ''
                      }`}
                      style={{ height: `${gridHeight}px` }}
                    >
                      {timeSlots.map((time, index) => {
                        const [slotH] = time.split(':').map(Number);
                        return (
                          <DroppableSlot
                            key={time}
                            id={`${dayKey}-${index}`}
                            day={day}
                            timeSlotIndex={index}
                            time={time}
                            isBusinessHour={slotH >= 9 && slotH < 17}
                            isOccupied={isTimeSlotOccupied(dayEvents, time, day)}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onClick={handleSlotClick}
                            isCreating={isCreatingEvent}
                          />
                        );
                      })}

                      {showPreview && previewStyle && (
                        <div
                          className="absolute left-1 right-1 bg-primary/15 border border-primary/30 z-[16] rounded-lg flex items-center px-3"
                          style={{ top: `${previewStyle.top}px`, height: `${previewStyle.height}px` }}
                        >
                          <span className="text-xs font-medium text-primary">New Event</span>
                        </div>
                      )}

                      {isCurrentDay && currentTimePosition !== null && (
                        <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${currentTimePosition}px` }}>
                          <div className="h-[2px] bg-red-500 w-full opacity-80" />
                          <div className="absolute -left-1.5 -top-[4px] w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-red-500/20" />
                        </div>
                      )}

                      {dayEvents.map((event, eventIndex) => {
                        const startTime = new Date(event.start_time);
                        const endTime = new Date(event.end_time);
                        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return null;
                        const pos = calculateEventPosition(startTime, endTime, offsetMinutes);
                        if (!pos.visible) return null;
                        const layout = overlapLayout.get(event.id) || { column: 0, totalColumns: 1 };
                        const eventWidth = layout.totalColumns > 1 ? `${96 / layout.totalColumns}%` : '96%';
                        const eventLeft = layout.totalColumns > 1 ? `${(96 / layout.totalColumns) * layout.column + 2}%` : '2%';

                        return (
                          <DraggableEventCard
                            key={event.id}
                            event={event}
                            style={pos}
                            eventWidth={eventWidth}
                            eventLeft={eventLeft}
                            eventIndex={eventIndex}
                            styling={getEventStyling(event)}
                            onEventClick={onEventClick}
                            onTaskClick={setSelectedTask}
                            onBookingClick={(e) => setBookedAppointmentDialog({ open: true, appointment: e })}
                            updateTask={updateTask}
                          />
                        );
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
            className="p-3 text-sm rounded-xl shadow-2xl backdrop-blur-sm"
            style={{
              backgroundColor: activeEvent.color ? `${activeEvent.color}E6` : 'hsl(var(--primary) / 0.9)',
              borderLeft: `4px solid ${activeEvent.color || 'hsl(var(--primary))'}`,
              color: 'hsl(var(--foreground))',
              minWidth: '140px',
              zIndex: 1000,
            }}
          >
            <div className="font-semibold">{activeEvent.title}</div>
            <div className="text-xs opacity-80 mt-1">{format(new Date(activeEvent.start_time), 'HH:mm')}</div>
            <div className="text-xs opacity-60 mt-1">Drop to reschedule</div>
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
