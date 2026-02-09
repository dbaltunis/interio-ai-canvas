import { useMemo, useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, isSameMonth, isSameDay, isToday } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useAppointmentBookings } from "@/hooks/useAppointmentBookings";
import { useMyTasks } from "@/hooks/useTasks";
import { supabase } from "@/integrations/supabase/client";
import { EventPill } from "./EventPill";
import { EventDetailPopover } from "./EventDetailPopover";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getAllEventsForDate } from "./utils/calendarHelpers";
import { motion } from "framer-motion";

interface MonthlyCalendarViewProps {
  currentDate: Date;
  filteredAppointments?: any[];
  onEventClick?: (eventId: string) => void;
  onDayClick?: (date: Date) => void;
}

export const MonthlyCalendarView = ({
  currentDate,
  filteredAppointments,
  onEventClick,
  onDayClick,
}: MonthlyCalendarViewProps) => {
  const { data: appointments } = useAppointments();
  const displayAppointments = filteredAppointments || appointments;
  const { data: bookedAppointments } = useAppointmentBookings();
  const { data: tasks } = useMyTasks();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [morePopoverDay, setMorePopoverDay] = useState<Date | null>(null);

  // Get user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  // Generate month grid days
  const { days, weeksCount } = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    const calendarStart = new Date(monthStart);
    calendarStart.setDate(monthStart.getDate() - monthStart.getDay());

    const weeksNeeded = Math.ceil((monthEnd.getDate() + monthStart.getDay()) / 7);
    const daysToShow = Math.min(weeksNeeded * 7, 42);

    const result: Date[] = [];
    for (let i = 0; i < daysToShow; i++) {
      const day = new Date(calendarStart);
      day.setDate(calendarStart.getDate() + i);
      result.push(day);
    }
    return { days: result, weeksCount: Math.ceil(daysToShow / 7) };
  }, [currentDate]);

  // Pre-compute events for all visible days
  const dayEventsMap = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const day of days) {
      const key = format(day, 'yyyy-MM-dd');
      map.set(key, getAllEventsForDate(displayAppointments, bookedAppointments, tasks, day, currentUserId));
    }
    return map;
  }, [days, displayAppointments, bookedAppointments, tasks, currentUserId]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 flex-shrink-0 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        className="flex-1 grid grid-cols-7 min-h-0"
        style={{ gridTemplateRows: `repeat(${weeksCount}, 1fr)` }}
      >
        {days.map(day => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const events = dayEventsMap.get(dayKey) || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const dayIsToday = isToday(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const maxVisible = 3;
          const hasMore = events.length > maxVisible;

          return (
            <div
              key={dayKey}
              className={`border-r border-b border-border/15 cursor-pointer transition-colors p-1.5 flex flex-col min-h-0 ${
                !isCurrentMonth ? 'text-muted-foreground/40' : ''
              } ${isWeekend && isCurrentMonth ? 'bg-muted/[0.03]' : 'bg-background'} hover:bg-accent/20`}
              onClick={() => onDayClick?.(day)}
            >
              {/* Day number */}
              <div className="flex-shrink-0 mb-0.5">
                <div
                  className={`inline-flex items-center justify-center text-xs font-medium ${
                    dayIsToday
                      ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 text-[11px] font-bold'
                      : isCurrentMonth
                        ? 'text-foreground'
                        : ''
                  }`}
                >
                  {format(day, 'd')}
                </div>
              </div>

              {/* Event pills */}
              <div className="flex-1 space-y-0.5 overflow-hidden">
                {events.slice(0, maxVisible).map((event, idx) => (
                  <EventDetailPopover
                    key={event.id}
                    event={event}
                    onEdit={(id) => onEventClick?.(id)}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.15 }}
                    >
                      <EventPill
                        event={event}
                        variant="month"
                        onClick={() => {}}
                      />
                    </motion.div>
                  </EventDetailPopover>
                ))}

                {/* "+N more" popover */}
                {hasMore && (
                  <Popover
                    open={morePopoverDay !== null && isSameDay(morePopoverDay, day)}
                    onOpenChange={(open) => setMorePopoverDay(open ? day : null)}
                  >
                    <PopoverTrigger asChild>
                      <button
                        className="text-[10px] text-primary font-medium px-1.5 cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMorePopoverDay(day);
                        }}
                      >
                        +{events.length - maxVisible} more
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 max-h-64 overflow-y-auto" side="right" align="start">
                      <div className="text-xs font-semibold text-muted-foreground mb-2">
                        {format(day, 'EEEE, MMMM d')}
                      </div>
                      <div className="space-y-1">
                        {events.map(event => (
                          <EventDetailPopover
                            key={event.id}
                            event={event}
                            onEdit={(id) => onEventClick?.(id)}
                          >
                            <div>
                              <EventPill
                                event={event}
                                variant="month"
                                onClick={() => {}}
                              />
                            </div>
                          </EventDetailPopover>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
