import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { useMyTasks, useCompleteTask } from "@/hooks/useTasks";
import { format, isToday, isTomorrow, isPast } from "date-fns";

export const CRMUpcomingTasks = () => {
  const { data: tasks } = useMyTasks();
  const completeTask = useCompleteTask();

  const upcomingTasks = tasks
    ?.filter(t => t.status === 'pending' || t.status === 'in_progress')
    ?.filter(t => t.due_date)
    ?.sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    ?.slice(0, 5) || [];

  const getDueDateBadge = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) {
      return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
    }
    if (isToday(date)) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs">Today</Badge>;
    }
    if (isTomorrow(date)) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">Tomorrow</Badge>;
    }
    return <Badge variant="outline" className="text-xs">{format(date, 'MMM dd')}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Upcoming Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-2 p-2 rounded-lg border hover:bg-accent/5 transition-colors"
              >
                <Checkbox
                  checked={false}
                  onCheckedChange={() => completeTask.mutateAsync(task.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {task.due_date && getDueDateBadge(task.due_date)}
                    {task.estimated_hours && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.estimated_hours}h
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
