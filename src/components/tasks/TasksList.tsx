import { useState } from "react";
import { format, isToday, isTomorrow, isPast, isThisWeek, startOfDay } from "date-fns";
import { useMyTasks, useClientTasks, useCompleteTask, useUpdateTask, useDeleteTask, Task, TaskPriority } from "@/hooks/useTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar, Trash2, User, Edit2, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { QuickAddTask } from "./QuickAddTask";

interface TasksListProps {
  filter?: "all" | "today" | "week" | "overdue";
  clientId?: string;
  projectId?: string;
  compact?: boolean;
}

const priorityConfig: Record<TaskPriority, { color: string; icon: string; label: string }> = {
  low: { color: "bg-blue-100 text-blue-700 border-blue-300", icon: "🟦", label: "Low" },
  medium: { color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: "🟨", label: "Medium" },
  high: { color: "bg-orange-100 text-orange-700 border-orange-300", icon: "🟧", label: "High" },
  urgent: { color: "bg-red-100 text-red-700 border-red-300", icon: "🟥", label: "Urgent" },
};

const getDueDateLabel = (dueDate: string) => {
  const date = new Date(dueDate);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isPast(date)) return "Overdue";
  return format(date, "MMM dd");
};

const getDueDateColor = (dueDate: string) => {
  const date = new Date(dueDate);
  if (isPast(date) && !isToday(date)) return "text-red-600 font-semibold";
  if (isToday(date)) return "text-orange-600 font-semibold";
  if (isTomorrow(date)) return "text-yellow-600 font-medium";
  return "text-muted-foreground";
};

export const TasksList = ({ filter = "all", clientId, projectId, compact = false }: TasksListProps) => {
  const { data: clientTasks } = useClientTasks(clientId);
  const { data: myTasks, isLoading } = useMyTasks();
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Use client tasks if clientId is provided, otherwise use my tasks
  const tasks = clientId ? clientTasks : myTasks;

  const handleComplete = async (taskId: string) => {
    await completeTask.mutateAsync(taskId);
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm("Delete this task?")) {
      await deleteTask.mutateAsync(taskId);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-muted-foreground line-through";
      case "in_progress": return "text-primary";
      case "pending": return "text-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getDueDateBadge = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = startOfDay(new Date());
    const taskDate = startOfDay(date);
    
    if (taskDate < today) {
      return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
    } else if (isToday(date)) {
      return <Badge variant="default" className="text-xs">Today</Badge>;
    } else if (isTomorrow(date)) {
      return <Badge variant="secondary" className="text-xs">Tomorrow</Badge>;
    }
    return <Badge variant="outline" className="text-xs">{format(date, "MMM d")}</Badge>;
  };

  const filterTasks = (tasks: Task[]) => {
    let filtered = tasks || [];

    if (clientId) {
      filtered = filtered.filter(task => task.client_id === clientId);
    }
    if (projectId) {
      filtered = filtered.filter(task => task.project_id === projectId);
    }

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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  const filteredTasks = filterTasks(tasks || []);
  const pendingTasks = filteredTasks.filter(t => t.status === "pending" || t.status === "in_progress");
  const hasTasks = pendingTasks.length > 0;
  const displayTasks = compact ? pendingTasks.slice(0, 3) : filteredTasks;

  if (compact) {
    return (
      <div className="space-y-2">
        {!hasTasks ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">No active tasks</p>
          </div>
        ) : (
          <>
            {displayTasks.map((task) => {
              const priorityInfo = priorityConfig[task.priority];
              
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-2 p-2 rounded border bg-card text-xs"
                >
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => handleComplete(task.id)}
                    className="h-3 w-3"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] px-1 py-0", priorityInfo.color)}>
                    {priorityInfo.icon}
                  </Badge>
                </div>
              );
            })}
            {pendingTasks.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{pendingTasks.length - 3} more tasks
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  if (!compact) {
    if (displayTasks.length === 0) {
      return (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No tasks found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new task to get started
          </p>
        </Card>
      );
    }

    return (
      <div className="flex gap-4 h-full">
        <ScrollArea className="flex-1">
          <div className="space-y-3 pr-4">
            {displayTasks.map((task) => (
              <Card
                key={task.id}
                className={cn(
                  "p-4 hover:shadow-md transition-all cursor-pointer",
                  selectedTask?.id === task.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={() => completeTask.mutate(task.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className={cn("font-medium", getStatusColor(task.status))}>
                        {task.title}
                      </h3>
                      <Badge variant={getPriorityColor(task.priority)} className="shrink-0">
                        {task.priority}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {getDueDateBadge(task.due_date)}
                        </div>
                      )}
                      {task.estimated_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimated_hours}h
                        </div>
                      )}
                      {task.assigned_to && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Assigned
                        </div>
                      )}
                      {task.clients && (
                        <Badge variant="outline" className="text-xs">
                          {task.clients.name}
                        </Badge>
                      )}
                    </div>

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

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
  }

  // Compact view for widgets
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Tasks {hasTasks && `(${pendingTasks.length})`}
        </CardTitle>
        <QuickAddTask clientId={clientId} />
      </CardHeader>
      <CardContent>
        {!hasTasks ? (
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No tasks yet. Stay organized!</p>
            <QuickAddTask 
              clientId={clientId}
              trigger={
                <Button variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create First Task
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-2">
            {displayTasks.map((task) => {
              const priorityInfo = priorityConfig[task.priority];
              
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-2 p-2 rounded border bg-card text-xs"
                >
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => handleComplete(task.id)}
                    className="h-3 w-3"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] px-1 py-0", priorityInfo.color)}>
                    {priorityInfo.icon}
                  </Badge>
                </div>
              );
            })}
            {pendingTasks.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{pendingTasks.length - 3} more tasks
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
