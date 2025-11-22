import { useState } from "react";
import { useMyTasks, Task } from "@/hooks/useTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Clock, AlertCircle } from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek, isPast } from "date-fns";
import { useCompleteTask } from "@/hooks/useTasks";
import { UnifiedTaskDialog } from "../tasks/UnifiedTaskDialog";
import { Skeleton } from "@/components/ui/skeleton";

export const TaskListView = () => {
  const { data: tasks, isLoading } = useMyTasks();
  const completeTask = useCompleteTask();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const groupTasksByDate = () => {
    if (!tasks) return { overdue: [], today: [], tomorrow: [], thisWeek: [], later: [] };

    return tasks.reduce((acc, task) => {
      if (!task.due_date) {
        acc.later.push(task);
        return acc;
      }

      const dueDate = new Date(task.due_date);
      
      if (isPast(dueDate) && !isToday(dueDate)) {
        acc.overdue.push(task);
      } else if (isToday(dueDate)) {
        acc.today.push(task);
      } else if (isTomorrow(dueDate)) {
        acc.tomorrow.push(task);
      } else if (isThisWeek(dueDate)) {
        acc.thisWeek.push(task);
      } else {
        acc.later.push(task);
      }
      
      return acc;
    }, {
      overdue: [] as Task[],
      today: [] as Task[],
      tomorrow: [] as Task[],
      thisWeek: [] as Task[],
      later: [] as Task[]
    });
  };

  const grouped = groupTasksByDate();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const renderTaskGroup = (title: string, tasks: Task[], icon: React.ReactNode, variant: 'default' | 'destructive' = 'default') => {
    if (tasks.length === 0) return null;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {icon}
            <span>{title}</span>
            <Badge variant={variant} className="ml-auto">{tasks.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => setSelectedTask(task)}
            >
              <Checkbox
                checked={task.status === 'completed'}
                onCheckedChange={(checked) => {
                  completeTask.mutate(task.id);
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h4>
                  <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                    {task.priority}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                )}
                {task.due_date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(task.due_date), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2].map((j) => (
                <Skeleton key={j} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        {renderTaskGroup('Overdue', grouped.overdue, <AlertCircle className="h-5 w-5 text-destructive" />, 'destructive')}
        {renderTaskGroup('Today', grouped.today, <CheckSquare className="h-5 w-5 text-primary" />)}
        {renderTaskGroup('Tomorrow', grouped.tomorrow, <Clock className="h-5 w-5" />)}
        {renderTaskGroup('This Week', grouped.thisWeek, <Clock className="h-5 w-5" />)}
        {renderTaskGroup('Later', grouped.later, <Clock className="h-5 w-5" />)}

        {tasks && tasks.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first task to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedTask && (
        <UnifiedTaskDialog
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          task={selectedTask}
        />
      )}
    </div>
  );
};
