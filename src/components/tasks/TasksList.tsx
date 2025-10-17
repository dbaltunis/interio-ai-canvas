import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckCircle2, Clock, Calendar, Trash2, AlertCircle,
  Sparkles
} from "lucide-react";
import { useClientTasks, useCompleteTask, useDeleteTask, Task, TaskPriority } from "@/hooks/useTasks";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { QuickAddTask } from "./QuickAddTask";
import { cn } from "@/lib/utils";

interface TasksListProps {
  clientId?: string;
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

export const TasksList = ({ clientId }: TasksListProps) => {
  const { data: tasks, isLoading } = useClientTasks(clientId);
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();

  const handleComplete = async (taskId: string) => {
    await completeTask.mutateAsync(taskId);
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm("Delete this task?")) {
      await deleteTask.mutateAsync(taskId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  const pendingTasks = tasks?.filter(t => t.status === "pending" || t.status === "in_progress") || [];
  const hasTasks = pendingTasks.length > 0;

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
          <div className="space-y-3">
            {pendingTasks.map((task) => {
              const priorityInfo = priorityConfig[task.priority];
              
              return (
                <div
                  key={task.id}
                  className="group flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all"
                >
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => handleComplete(task.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm leading-none mb-1">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="outline" className={cn("text-xs", priorityInfo.color)}>
                        {priorityInfo.icon} {priorityInfo.label}
                      </Badge>
                      
                      {task.due_date && (
                        <span className={cn("flex items-center gap-1", getDueDateColor(task.due_date))}>
                          <Calendar className="h-3 w-3" />
                          {getDueDateLabel(task.due_date)}
                        </span>
                      )}
                      
                      {task.estimated_hours && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.estimated_hours}h
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
