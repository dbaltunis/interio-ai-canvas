import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Clock, Search, Filter, Plus, Calendar as CalendarIcon, AlertCircle, Flame } from "lucide-react";
import { useMyTasks, useCompleteTask, Task } from "@/hooks/useTasks";
import { format, isToday, isTomorrow, isPast, isThisWeek, isFuture, parseISO } from "date-fns";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";
import { UnifiedTaskDialog } from "@/components/tasks/UnifiedTaskDialog";

type FilterType = 'all' | 'today' | 'overdue' | 'this-week' | 'upcoming';
type GroupByType = 'none' | 'client' | 'project' | 'priority' | 'due-date';
type SortByType = 'due-date' | 'priority' | 'created' | 'title';

export const MyTasksPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [groupBy, setGroupBy] = useState<GroupByType>('due-date');
  const [sortBy, setSortBy] = useState<SortByType>('due-date');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const { data: tasks = [] } = useMyTasks();
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const completeTask = useCompleteTask();

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => 
      task.status === 'pending' || task.status === 'in_progress'
    );

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search)
      );
    }

    // Apply filter type
    if (filterType !== 'all') {
      filtered = filtered.filter(task => {
        if (!task.due_date) return false;
        const dueDate = parseISO(task.due_date);
        
        switch (filterType) {
          case 'today':
            return isToday(dueDate);
          case 'overdue':
            return isPast(dueDate) && !isToday(dueDate);
          case 'this-week':
            return isThisWeek(dueDate);
          case 'upcoming':
            return isFuture(dueDate) && !isToday(dueDate);
          default:
            return true;
        }
      });
    }

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'due-date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, searchTerm, filterType, sortBy]);

  // Group tasks
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Tasks': filteredTasks };
    }

    const groups: Record<string, Task[]> = {};

    filteredTasks.forEach(task => {
      let groupKey = 'Other';

      switch (groupBy) {
        case 'client':
          const client = clients.find(c => c.id === task.client_id);
          groupKey = client?.name || 'No Client';
          break;
        case 'project':
          const project = projects.find(p => p.id === task.project_id);
          groupKey = project?.job_number || 'No Project';
          break;
        case 'priority':
          groupKey = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
          break;
        case 'due-date':
          if (!task.due_date) {
            groupKey = 'No Due Date';
          } else {
            const dueDate = parseISO(task.due_date);
            if (isPast(dueDate) && !isToday(dueDate)) {
              groupKey = 'Overdue';
            } else if (isToday(dueDate)) {
              groupKey = 'Today';
            } else if (isTomorrow(dueDate)) {
              groupKey = 'Tomorrow';
            } else if (isThisWeek(dueDate)) {
              groupKey = 'This Week';
            } else {
              groupKey = 'Upcoming';
            }
          }
          break;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
    });

    return groups;
  }, [filteredTasks, groupBy, clients, projects]);

  // Quick stats
  const stats = useMemo(() => {
    const today = tasks.filter(t => t.due_date && isToday(parseISO(t.due_date)) && (t.status === 'pending' || t.status === 'in_progress')).length;
    const overdue = tasks.filter(t => t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)) && (t.status === 'pending' || t.status === 'in_progress')).length;
    const highPriority = tasks.filter(t => t.priority === 'high' && (t.status === 'pending' || t.status === 'in_progress')).length;
    
    return { today, overdue, highPriority };
  }, [tasks]);

  const getDueDateBadge = (dueDate: string) => {
    const date = parseISO(dueDate);
    if (isPast(date) && !isToday(date)) {
      return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
    }
    if (isToday(date)) {
      return <Badge className="text-xs bg-orange-500 hover:bg-orange-600">Today</Badge>;
    }
    if (isTomorrow(date)) {
      return <Badge variant="outline" className="text-xs">Tomorrow</Badge>;
    }
    return <Badge variant="outline" className="text-xs">{format(date, 'MMM dd')}</Badge>;
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <Flame className="h-4 w-4 text-destructive" />;
    if (priority === 'medium') return <AlertCircle className="h-4 w-4 text-orange-500" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">Manage all your tasks in one place</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            filterType === 'today' && "ring-2 ring-primary"
          )}
          onClick={() => setFilterType(filterType === 'today' ? 'all' : 'today')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due Today</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            filterType === 'overdue' && "ring-2 ring-destructive"
          )}
          onClick={() => setFilterType(filterType === 'overdue' ? 'all' : 'overdue')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">{stats.highPriority}</p>
              </div>
              <Flame className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="today">Due Today</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>

            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupByType)}>
              <SelectTrigger>
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="due-date">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="project">Project</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortByType)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due-date">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="created">Recently Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{groupName}</span>
                <Badge variant="secondary">{groupTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groupTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tasks in this group</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {groupTasks.map((task) => {
                    const client = clients.find(c => c.id === task.client_id);
                    const project = projects.find(p => p.id === task.project_id);
                    const projectName = project?.job_number || 'Unknown Project';
                    
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => setSelectedTask(task)}
                        className="w-full flex items-start gap-2 p-2 rounded-lg border hover:bg-accent/10 hover:border-accent transition-colors text-left cursor-pointer"
                      >
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => completeTask.mutateAsync(task.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                {getPriorityIcon(task.priority)}
                                <p className="font-medium text-sm">{task.title}</p>
                              </div>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            {task.due_date && getDueDateBadge(task.due_date)}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {client && (
                              <span className="flex items-center gap-1">
                                👤 {client.name}
                              </span>
                            )}
                            {project && (
                              <span className="flex items-center gap-1">
                                📁 {projectName}
                              </span>
                            )}
                            {task.estimated_hours && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.estimated_hours}h
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search or filters" : "You're all caught up!"}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          </CardContent>
        </Card>
      )}

      <UnifiedTaskDialog 
        open={showCreateDialog || !!selectedTask} 
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
};
