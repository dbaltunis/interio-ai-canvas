import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useCreateTask, useUpdateTask, Task, TaskPriority } from "@/hooks/useTasks";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";

interface UnifiedTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  projectId?: string;
  task?: Task | null;
}

export const UnifiedTaskDialog = ({ open, onOpenChange, clientId, projectId, task }: UnifiedTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [selectedClientId, setSelectedClientId] = useState(clientId || "");
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  const [dueDate, setDueDate] = useState<Date>();
  const [estimatedHours, setEstimatedHours] = useState("");

  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isEditMode = !!task;

  // Populate form when editing or reset when creating
  useEffect(() => {
    if (open) {
      if (task) {
        // Edit mode - populate with task data
        setTitle(task.title);
        setDescription(task.description || "");
        setPriority(task.priority);
        setSelectedClientId(task.client_id || "");
        setSelectedProjectId(task.project_id || "");
        setDueDate(task.due_date ? parseISO(task.due_date) : undefined);
        setEstimatedHours(task.estimated_hours?.toString() || "");
      } else {
        // Create mode - reset form
        setTitle("");
        setDescription("");
        setPriority("medium");
        setSelectedClientId(clientId || "");
        setSelectedProjectId(projectId || "");
        setDueDate(undefined);
        setEstimatedHours("");
      }
    }
  }, [open, task, clientId, projectId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode) {
      await updateTask.mutateAsync({
        id: task.id,
        title,
        description,
        priority,
        client_id: selectedClientId || undefined,
        project_id: selectedProjectId || undefined,
        due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      });
    } else {
      await createTask.mutateAsync({
        title,
        description,
        priority,
        client_id: selectedClientId || undefined,
        project_id: selectedProjectId || undefined,
        due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[85vh] overflow-y-auto touch-manipulation">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estimated-hours">Estimated Hours</Label>
              <Input
                id="estimated-hours"
                type="number"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[10000] bg-popover border border-border shadow-lg" align="start" sideOffset={8}>
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="pointer-events-auto touch-manipulation"
                />
              </PopoverContent>
            </Popover>
          </div>

          {!clientId && (
            <div>
              <Label htmlFor="client">Client (optional)</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!projectId && (
            <div>
              <Label htmlFor="project">Project (optional)</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.job_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title || createTask.isPending || updateTask.isPending}>
              {createTask.isPending || updateTask.isPending ? "Saving..." : isEditMode ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
