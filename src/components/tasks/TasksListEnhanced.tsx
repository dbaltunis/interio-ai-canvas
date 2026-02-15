import { useState } from "react";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckCircle2, Clock, Calendar, Trash2, Filter,
  Sparkles, AlertCircle, ListTodo
} from "lucide-react";
import { useClientTasks, useCompleteTask, useDeleteTask, TaskPriority } from "@/hooks/useTasks";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { QuickAddTask } from "./QuickAddTask";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TasksListEnhancedProps {
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

export const TasksListEnhanced = ({ clientId }: TasksListEnhancedProps) => {
  const { data: tasks, isLoading } = useClientTasks(clientId);
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();
  const confirm = useConfirmDialog();
  const [filter, setFilter] = useState<string>("all");

  const handleComplete = async (taskId: string) => {
    await completeTask.mutateAsync(taskId);
  };

  const handleDelete = async (taskId: string) => {
    const confirmed = await confirm({
      title: "Delete Task",
      description: "Are you sure you want to delete this task? This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (confirmed) {
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
  
  // Filter tasks based on selected filter
  const filteredTasks = pendingTasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "today" && task.due_date) {
      return isToday(new Date(task.due_date));
    }
    if (filter === "overdue" && task.due_date) {
      return isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
    }
    if (filter === "urgent") return task.priority === "urgent" || task.priority === "high";
    return true;
  });

  // Calculate metrics
  const todayTasks = pendingTasks.filter(t => t.due_date && isToday(new Date(t.due_date))).length;
  const overdueTasks = pendingTasks.filter(t => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))).length;
  const urgentTasks = pendingTasks.filter(t => t.priority === "urgent" || t.priority === "high").length;

  return (
    <div className="space-y-4">
      {/* Task Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => setFilter("today")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Due Today</p>
                <p className="text-2xl font-bold">{todayTasks}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => setFilter("overdue")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => setFilter("urgent")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{urgentTasks}</p>
              </div>
              <ListTodo className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tasks List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Tasks {filteredTasks.length > 0 && `(${filteredTasks.length})`}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="today">Due Today</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="urgent">High Priority</SelectItem>
              </SelectContent>
            </Select>
            <QuickAddTask clientId={clientId} />
          </div>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {filter === "all" ? "No tasks yet. Stay organized!" : `No ${filter} tasks found.`}
              </p>
              {filter === "all" && (
                <QuickAddTask 
                  clientId={clientId}
                  trigger={
                    <Button variant="outline">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create First Task
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
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
    </div>
  );
};
