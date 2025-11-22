import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { useMyTasks } from "@/hooks/useTasks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskDetailPanel } from "./TaskDetailPanel";
import type { Task } from "@/hooks/useTasks";

interface TasksCalendarProps {
  highlightToday?: boolean;
  highlightOverdue?: boolean;
}

export const TasksCalendar = ({ highlightToday, highlightOverdue }: TasksCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { data: tasks } = useMyTasks();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getTasksForDay = (day: Date) => {
    return (tasks || []).filter(task => 
      task.due_date && isSameDay(new Date(task.due_date), day)
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1">
        <Card className="p-6 h-full flex flex-col">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 grid grid-cols-7 gap-2">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground pb-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {daysInMonth.map((day, index) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentDay = isToday(day);
              
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-24 p-2 border rounded-lg hover:bg-accent/50 transition-colors",
                    !isSameMonth(day, currentDate) && "opacity-40",
                    isCurrentDay && "bg-primary/5 border-primary"
                  )}
                >
                  <div className="text-sm font-semibold mb-1">
                    {format(day, "d")}
                  </div>
                  
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={cn(
                          "text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity",
                          "truncate",
                          getPriorityColor(task.priority),
                          "text-white"
                        )}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t text-xs">
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded", getPriorityColor("urgent"))} />
              <span>Urgent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded", getPriorityColor("high"))} />
              <span>High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded", getPriorityColor("medium"))} />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded", getPriorityColor("low"))} />
              <span>Low</span>
            </div>
          </div>
        </Card>
      </div>

      {selectedTask && (
        <div className="w-96 shrink-0">
          <TaskDetailPanel
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        </div>
      )}
    </div>
  );
};
