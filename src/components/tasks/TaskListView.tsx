import { useState, useMemo } from "react";
import { useMyTasks, useCreateTask, useCompleteTask, Task } from "@/hooks/useTasks";
import { TaskEditDialog } from "./TaskEditDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  Tag,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronRight,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, isToday, isTomorrow, isThisWeek, isPast, parseISO } from "date-fns";

type FilterType = "all" | "pending" | "in_progress" | "completed";
type SortType = "due_date" | "priority" | "created_at";

export const TaskListView = () => {
  const { data: tasks = [], isLoading } = useMyTasks();
  const createTask = useCreateTask();
  const completeTask = useCompleteTask();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("due_date");
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "due_date") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else if (sortBy === "priority") {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [tasks, searchQuery, filterStatus, sortBy]);

  // Group tasks by time period
  const groupedTasks = useMemo(() => {
    const groups = {
      overdue: [] as Task[],
      today: [] as Task[],
      tomorrow: [] as Task[],
      thisWeek: [] as Task[],
      later: [] as Task[],
    };

    filteredTasks.forEach((task) => {
      if (!task.due_date) {
        groups.later.push(task);
        return;
      }

      const dueDate = parseISO(task.due_date);
      if (isPast(dueDate) && !isToday(dueDate)) {
        groups.overdue.push(task);
      } else if (isToday(dueDate)) {
        groups.today.push(task);
      } else if (isTomorrow(dueDate)) {
        groups.tomorrow.push(task);
      } else if (isThisWeek(dueDate)) {
        groups.thisWeek.push(task);
      } else {
        groups.later.push(task);
      }
    });

    return groups;
  }, [filteredTasks]);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    await createTask.mutateAsync({
      title: newTaskTitle,
      priority: "medium",
    });
    setNewTaskTitle("");
    setShowNewTask(false);
  };

  const handleToggleComplete = async (task: Task) => {
    await completeTask.mutateAsync(task.id);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowEditDialog(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "hsl(0 84% 60%)";
      case "high":
        return "hsl(25 95% 53%)";
      case "medium":
        return "hsl(45 93% 47%)";
      default:
        return "hsl(217 91% 60%)";
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === "urgent") return <AlertCircle className="h-4 w-4" />;
    return <Circle className="h-4 w-4" />;
  };

  const TaskItem = ({ task }: { task: Task }) => (
    <Card
      className="group p-4 hover:shadow-md transition-all duration-200 border-l-4 cursor-pointer"
      style={{ borderLeftColor: getPriorityColor(task.priority) }}
      onClick={() => handleTaskClick(task)}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.status === "completed"}
          onCheckedChange={() => handleToggleComplete(task)}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h4
              className={`font-medium text-foreground flex-1 ${
                task.status === "completed" ? "line-through text-muted-foreground" : ""
              }`}
            >
              {task.title}
            </h4>
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            {task.due_date && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {format(parseISO(task.due_date), "MMM d")}
              </Badge>
            )}

            <Badge
              variant="outline"
              className="text-xs"
              style={{ borderColor: getPriorityColor(task.priority) }}
            >
              {getPriorityIcon(task.priority)}
              <span className="ml-1 capitalize">{task.priority}</span>
            </Badge>

            {task.estimated_hours && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {task.estimated_hours}h
              </Badge>
            )}

            {task.tags && task.tags.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {task.tags[0]}
              </Badge>
            )}

            {task.clients && (
              <Badge variant="secondary" className="text-xs">
                {task.clients.name}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const TaskGroup = ({ title, tasks, icon }: { title: string; tasks: Task[]; icon: React.ReactNode }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (tasks.length === 0) return null;

    return (
      <div className="mb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 mb-3 w-full group hover:bg-accent/50 rounded-lg p-2 -ml-2 transition-colors"
        >
          <ChevronRight
            className={`h-5 w-5 text-muted-foreground transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
          <div className="flex items-center gap-2 flex-1">
            {icon}
            <h3 className="font-semibold text-lg text-foreground">{title}</h3>
            <Badge variant="secondary" className="ml-auto">
              {tasks.length}
            </Badge>
          </div>
        </button>

        {isExpanded && (
          <div className="space-y-3 ml-7">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <TaskEditDialog task={selectedTask} open={showEditDialog} onOpenChange={setShowEditDialog} />
      
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-7 w-7 text-primary" />
                My Tasks
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Stay organized and focused on what matters most
              </p>
            </div>
            <Button onClick={() => setShowNewTask(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={(value: FilterType) => setFilterStatus(value)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: SortType) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due_date">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="created_at">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-6">
        {showNewTask && (
          <Card className="p-4 mb-6 border-2 border-primary/20 bg-primary/5">
            <div className="flex gap-2">
              <Input
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateTask();
                  if (e.key === "Escape") {
                    setShowNewTask(false);
                    setNewTaskTitle("");
                  }
                }}
                autoFocus
              />
              <Button onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
                Add
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowNewTask(false);
                  setNewTaskTitle("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your filters"
                : "Create a new task to get started"}
            </p>
            {!showNewTask && (
              <Button onClick={() => setShowNewTask(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Task
              </Button>
            )}
          </div>
        ) : (
          <div>
            <TaskGroup
              title="Overdue"
              tasks={groupedTasks.overdue}
              icon={<AlertCircle className="h-5 w-5 text-destructive" />}
            />
            <TaskGroup
              title="Today"
              tasks={groupedTasks.today}
              icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
            />
            <TaskGroup
              title="Tomorrow"
              tasks={groupedTasks.tomorrow}
              icon={<Calendar className="h-5 w-5 text-blue-500" />}
            />
            <TaskGroup
              title="This Week"
              tasks={groupedTasks.thisWeek}
              icon={<Clock className="h-5 w-5 text-amber-500" />}
            />
            <TaskGroup
              title="Later"
              tasks={groupedTasks.later}
              icon={<Circle className="h-5 w-5 text-muted-foreground" />}
            />
          </div>
        )}
      </div>
    </div>
    </>
  );
};
