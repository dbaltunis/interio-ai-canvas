import { useState } from "react";
import { format, isToday, isPast, isThisWeek } from "date-fns";
import { useMyTasks, useUpdateTask } from "@/hooks/useTasks";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskDetailPanel } from "./TaskDetailPanel";
import type { Task, TaskStatus } from "@/hooks/useTasks";

interface TasksBoardProps {
  filter?: "all" | "today" | "week" | "overdue";
}

const columns: { status: TaskStatus; label: string; color: string }[] = [
  { status: "pending", label: "To Do", color: "bg-slate-100 dark:bg-slate-900" },
  { status: "in_progress", label: "In Progress", color: "bg-blue-50 dark:bg-blue-950" },
  { status: "completed", label: "Done", color: "bg-green-50 dark:bg-green-950" },
];

export const TasksBoard = ({ filter = "all" }: TasksBoardProps) => {
  const { data: tasks, isLoading } = useMyTasks();
  const updateTask = useUpdateTask();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const filterTasks = (tasks: Task[]) => {
    let filtered = tasks || [];

    switch (filter) {
      case "today":
        return filtered.filter(task => 
          task.due_date && isToday(new Date(task.due_date))
        );
      case "week":
        return filtered.filter(task => 
          task.due_date && isThisWeek(new Date(task.due_date))
        );
      case "overdue":
        return filtered.filter(task => 
          task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date))
        );
      default:
        return filtered;
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask && draggedTask.status !== status) {
      updateTask.mutate({
        id: draggedTask.id,
        status,
        ...(status === "completed" && { completed_at: new Date().toISOString() }),
      });
    }
    setDraggedTask(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4 h-full">
        {columns.map(col => (
          <Card key={col.status} className="p-4">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-3">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const filteredTasks = filterTasks(tasks || []);

  return (
    <div className="flex gap-4 h-full">
      <div className="grid grid-cols-3 gap-4 flex-1">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter(task => task.status === column.status);
          
          return (
            <div
              key={column.status}
              className="flex flex-col"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.status)}
            >
              <div className={cn("p-3 rounded-t-lg", column.color)}>
                <h3 className="font-semibold flex items-center justify-between">
                  {column.label}
                  <Badge variant="secondary" className="ml-2">
                    {columnTasks.length}
                  </Badge>
                </h3>
              </div>
              
              <ScrollArea className="flex-1 border border-t-0 rounded-b-lg">
                <div className="p-3 space-y-3">
                  {columnTasks.map((task) => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onClick={() => setSelectedTask(task)}
                      className={cn(
                        "p-3 cursor-move hover:shadow-md transition-all",
                        draggedTask?.id === task.id && "opacity-50",
                        selectedTask?.id === task.id && "ring-2 ring-primary"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {task.title}
                        </h4>
                        <Badge variant={getPriorityColor(task.priority)} className="shrink-0 text-xs">
                          {task.priority}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(task.due_date), "MMM d")}
                          </div>
                        )}
                        {task.estimated_hours && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimated_hours}h
                          </div>
                        )}
                      </div>

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {task.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{task.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      No tasks
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
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
