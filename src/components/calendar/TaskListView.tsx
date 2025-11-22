import { useState } from "react";
import { useMyTasks, Task } from "@/hooks/useTasks";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Clock, AlertCircle, CalendarDays, Sparkles } from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek, isPast } from "date-fns";
import { useCompleteTask } from "@/hooks/useTasks";
import { UnifiedTaskDialog } from "../tasks/UnifiedTaskDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

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

  const renderTaskGroup = (title: string, tasks: Task[], icon: React.ReactNode, accentColor: string) => {
    if (tasks.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className={`p-2 rounded-lg ${accentColor}`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="ml-auto">
            <Badge variant="secondary" className="rounded-full px-3">
              {tasks.length}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div
                  className={`
                    relative overflow-hidden rounded-xl border bg-card p-4 cursor-pointer
                    transition-all duration-200 hover:shadow-md hover:scale-[1.01]
                    ${task.status === 'completed' ? 'opacity-60' : ''}
                  `}
                  onClick={() => setSelectedTask(task)}
                >
                  {/* Priority accent bar */}
                  <div className={`
                    absolute left-0 top-0 bottom-0 w-1
                    ${task.priority === 'urgent' ? 'bg-destructive' : ''}
                    ${task.priority === 'high' ? 'bg-orange-500' : ''}
                    ${task.priority === 'medium' ? 'bg-primary' : ''}
                    ${task.priority === 'low' ? 'bg-muted-foreground' : ''}
                  `} />
                  
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={() => completeTask.mutate(task.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start gap-2">
                        <h4 className={`
                          font-semibold text-base flex-1
                          ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}
                        `}>
                          {task.title}
                        </h4>
                        <Badge 
                          variant={getPriorityColor(task.priority)} 
                          className="text-xs font-medium"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {task.due_date && (
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {format(new Date(task.due_date), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto p-8 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-5xl mx-auto space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="space-y-2">
                {[1, 2].map((j) => (
                  <Skeleton key={j} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">My Tasks</h2>
          </div>
          <p className="text-muted-foreground">
            Stay organized and focused on what matters most
          </p>
        </motion.div>

        {/* Task Groups */}
        {renderTaskGroup('Overdue', grouped.overdue, <AlertCircle className="h-5 w-5 text-white" />, 'bg-destructive')}
        {renderTaskGroup('Today', grouped.today, <CheckSquare className="h-5 w-5 text-white" />, 'bg-primary')}
        {renderTaskGroup('Tomorrow', grouped.tomorrow, <Clock className="h-5 w-5 text-white" />, 'bg-orange-500')}
        {renderTaskGroup('This Week', grouped.thisWeek, <CalendarDays className="h-5 w-5 text-white" />, 'bg-blue-500')}
        {renderTaskGroup('Later', grouped.later, <Clock className="h-5 w-5 text-white" />, 'bg-muted-foreground')}

        {/* Empty State */}
        {tasks && tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Create your first task to get started with organizing your work
            </p>
          </motion.div>
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
