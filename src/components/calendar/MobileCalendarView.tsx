import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  MoreHorizontal,
  Video,
  CheckSquare,
  Plus,
  Sun,
  Sunset,
  Moon
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, isToday, addWeeks, subWeeks, isPast } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { deduplicateEvents } from "./utils/calendarHelpers";
import { cn } from "@/lib/utils";
import { UnifiedAppointmentDialog } from "./UnifiedAppointmentDialog";
import { AppointmentSchedulerSlider } from "./AppointmentSchedulerSlider";
import { useMyTasks, Task } from "@/hooks/useTasks";
import { UnifiedTaskDialog } from "@/components/tasks/UnifiedTaskDialog";
import { motion, AnimatePresence } from "framer-motion";

export const MobileCalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSchedulerSlider, setShowSchedulerSlider] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: appointments = [] } = useAppointments();
  const { data: tasks } = useMyTasks();

  // Get current week
  const startDate = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Filter appointments for selected date, deduplicate, and sort by time
  const dayAppointments = deduplicateEvents(
    appointments
      .filter(apt => {
        if (!apt.start_time || !apt.end_time) return false;
        const startTime = new Date(apt.start_time);
        const endTime = new Date(apt.end_time);
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || endTime <= startTime) return false;
        return isSameDay(startTime, selectedDate);
      })
  ).sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Filter tasks for selected date
  const dayTasks = (tasks || []).filter(task => {
    if (!task.due_date) return false;
    const taskDate = new Date(task.due_date);
    if (isNaN(taskDate.getTime())) return false;
    return isSameDay(taskDate, selectedDate);
  }).map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    start_time: new Date(new Date(selectedDate).setHours(9, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date(selectedDate).setHours(9, 30, 0, 0)).toISOString(),
    isTask: true,
    taskData: task,
    priority: task.priority,
    status: task.status
  }));

  // Combine and sort all events by time
  const allEvents = [...dayAppointments, ...dayTasks].sort((a: any, b: any) => {
    const aTime = new Date(a.start_time).getTime();
    const bTime = new Date(b.start_time).getTime();
    return aTime - bTime;
  });

  // Group events by time period
  const getTimePeriod = (date: Date) => {
    const hour = date.getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const groupedEvents = allEvents.reduce((groups: Record<string, any[]>, event: any) => {
    const period = getTimePeriod(new Date(event.start_time));
    if (!groups[period]) groups[period] = [];
    groups[period].push(event);
    return groups;
  }, {} as Record<string, any[]>);

  const periodConfig = {
    morning: { label: 'Morning', icon: Sun, color: 'text-amber-500' },
    afternoon: { label: 'Afternoon', icon: Sunset, color: 'text-orange-500' },
    evening: { label: 'Evening', icon: Moon, color: 'text-indigo-500' },
  };

  const handlePrevWeek = () => setSelectedDate(subWeeks(selectedDate, 1));
  const handleNextWeek = () => setSelectedDate(addWeeks(selectedDate, 1));

  const handleEventClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowEditDialog(true);
  };

  const priorityColors: Record<string, string> = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#3b82f6',
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Hidden button for programmatic trigger from CreateActionDialog */}
      <button
        data-create-event
        className="hidden"
        onClick={() => setShowCreateDialog(true)}
        aria-hidden="true"
      />

      {/* Header - clean and minimal */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            {format(selectedDate, 'MMMM yyyy')}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMM d')}
            {allEvents.length > 0 && ` \u00B7 ${allEvents.length} event${allEvents.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!isToday(selectedDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="h-8 px-3 text-xs font-medium"
            >
              Today
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <Popover open={showCalendarPicker} onOpenChange={setShowCalendarPicker}>
                <PopoverTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Jump to Date
                  </DropdownMenuItem>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" side="left" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setShowCalendarPicker(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <DropdownMenuItem onClick={() => setShowCreateDialog(true)} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSchedulerSlider(true)} className="cursor-pointer">
                <Clock className="h-4 w-4 mr-2" />
                Booking Links
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Week strip - compact, no card wrapper */}
      <div className="flex items-center px-1 pb-3 shrink-0 border-b border-border/40">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevWeek}
          className="h-8 w-8 shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 grid grid-cols-7 gap-0.5">
          {weekDays.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            const today = isToday(day);
            const hasEvents = appointments.some(apt =>
              apt.start_time && isSameDay(new Date(apt.start_time), day)
            );
            const hasTasks = (tasks || []).some(task =>
              task.due_date && isSameDay(new Date(task.due_date), day)
            );

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "flex flex-col items-center py-1.5 rounded-xl transition-all relative min-h-[48px] justify-center",
                  isSelected && "bg-primary text-primary-foreground shadow-sm",
                  !isSelected && today && "bg-primary/10",
                  !isSelected && !today && "active:bg-muted"
                )}
              >
                <span className={cn(
                  "text-[10px] font-medium leading-none",
                  !isSelected && "text-muted-foreground"
                )}>
                  {format(day, 'EEEEE')}
                </span>
                <span className={cn(
                  "text-sm font-semibold mt-0.5 leading-none",
                  !isSelected && today && "text-primary"
                )}>
                  {format(day, 'd')}
                </span>
                {(hasEvents || hasTasks) && !isSelected && (
                  <div className="flex gap-0.5 mt-1">
                    {hasEvents && <div className="w-1 h-1 rounded-full bg-primary" />}
                    {hasTasks && <div className="w-1 h-1 rounded-full bg-amber-500" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextWeek}
          className="h-8 w-8 shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Events timeline - scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {allEvents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center justify-center py-16 px-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <CalendarIcon className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No events scheduled</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {isToday(selectedDate) ? 'Your day is clear' : format(selectedDate, 'EEEE, MMM d')}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateDialog(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add event
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="py-3 pb-24"
            >
              {(['morning', 'afternoon', 'evening'] as const).map(period => {
                const events = groupedEvents[period];
                if (!events || events.length === 0) return null;
                const config = periodConfig[period];
                const PeriodIcon = config.icon;

                return (
                  <div key={period} className="mb-4">
                    {/* Period header */}
                    <div className="flex items-center gap-2 px-4 mb-2">
                      <PeriodIcon className={cn("h-3.5 w-3.5", config.color)} />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {config.label}
                      </span>
                      <div className="flex-1 h-px bg-border/40" />
                    </div>

                    {/* Events in this period */}
                    <div className="space-y-1.5 px-3">
                      {events.map((event: any, index: number) => {
                        const isTask = event.isTask;
                        const startTime = new Date(event.start_time);
                        const endTime = event.end_time ? new Date(event.end_time) : null;
                        const eventColor = isTask
                          ? priorityColors[event.priority as string] || '#eab308'
                          : event.color || '#3b82f6';
                        const eventIsPast = isPast(endTime || startTime);

                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03, duration: 0.15 }}
                            className={cn(
                              "flex gap-3 active:scale-[0.98] transition-transform",
                              eventIsPast && "opacity-50"
                            )}
                            onClick={() => isTask ? setSelectedTask(event.taskData) : handleEventClick(event)}
                          >
                            {/* Time column */}
                            <div className="w-14 pt-2.5 text-right shrink-0">
                              <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                                {format(startTime, 'h:mm')}
                              </span>
                              <span className="text-[10px] text-muted-foreground/70 ml-0.5">
                                {format(startTime, 'a')}
                              </span>
                            </div>

                            {/* Event card */}
                            <div
                              className="flex-1 rounded-xl p-3 border border-border/50 cursor-pointer min-h-[52px]"
                              style={{
                                borderLeftWidth: '3px',
                                borderLeftColor: eventColor,
                                backgroundColor: `${eventColor}08`,
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  {/* Title row */}
                                  <div className="flex items-center gap-1.5">
                                    {isTask && (
                                      <CheckSquare className="h-3.5 w-3.5 shrink-0" style={{ color: eventColor }} />
                                    )}
                                    <span className="font-semibold text-sm leading-tight line-clamp-1">
                                      {event.title}
                                    </span>
                                  </div>

                                  {/* Time range */}
                                  {!isTask && endTime && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3 shrink-0" />
                                      <span>
                                        {format(startTime, 'h:mm a')} – {format(endTime, 'h:mm a')}
                                      </span>
                                    </div>
                                  )}

                                  {/* Location */}
                                  {!isTask && event.location && (
                                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                                      <MapPin className="h-3 w-3 shrink-0" />
                                      <span className="truncate">{event.location}</span>
                                    </div>
                                  )}

                                  {/* Description for tasks */}
                                  {isTask && event.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                      {event.description}
                                    </p>
                                  )}
                                </div>

                                {/* Right indicator */}
                                {!isTask && (event.video_meeting_link || event.video_provider) && (
                                  <Video className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dialogs */}
      <UnifiedAppointmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        appointment={null}
        selectedDate={selectedDate}
      />

      <UnifiedAppointmentDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        appointment={selectedAppointment}
        selectedDate={selectedDate}
      />

      <AppointmentSchedulerSlider
        isOpen={showSchedulerSlider}
        onClose={() => setShowSchedulerSlider(false)}
      />

      <UnifiedTaskDialog
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        task={selectedTask}
      />
    </div>
  );
};
