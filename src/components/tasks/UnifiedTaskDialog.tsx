import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, Search } from "lucide-react";
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
  const [clientOpen, setClientOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isEditMode = !!task;

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setSelectedClientId(task.client_id || "");
      setSelectedProjectId(task.project_id || "");
      setDueDate(task.due_date ? parseISO(task.due_date) : undefined);
      setEstimatedHours(task.estimated_hours?.toString() || "");
    } else {
      // Reset form for create mode
      setTitle("");
      setDescription("");
      setPriority("medium");
      setSelectedClientId(clientId || "");
      setSelectedProjectId(projectId || "");
      setDueDate(undefined);
      setEstimatedHours("");
    }
  }, [task, clientId, projectId]);

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    return clients.filter(client =>
      client.name.toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [clients, clientSearch]);

  const filteredProjects = useMemo(() => {
    if (!projectSearch) return projects;
    return projects.filter(project =>
      project.job_number?.toLowerCase().includes(projectSearch.toLowerCase())
    );
  }, [projects, projectSearch]);

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
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[85vh] overflow-y-auto">
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
              <PopoverContent className="w-auto p-0 z-[10000] bg-popover" align="start" sideOffset={5}>
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {!clientId && (
            <div>
              <Label>Client (optional)</Label>
              <Popover open={clientOpen} onOpenChange={setClientOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    {selectedClientId
                      ? clients.find(c => c.id === selectedClientId)?.name
                      : "Select client..."}
                    <Check className={cn("ml-2 h-4 w-4", selectedClientId ? "opacity-100" : "opacity-0")} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[10001]" align="start">
                  <div className="flex flex-col">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search clients..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="pl-8 h-9"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-[200px]">
                      {filteredClients.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          No clients found
                        </div>
                      ) : (
                        filteredClients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setSelectedClientId(client.id);
                              setClientOpen(false);
                              setClientSearch("");
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                          >
                            <Check
                              className={cn(
                                "h-4 w-4",
                                selectedClientId === client.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {client.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {!projectId && (
            <div>
              <Label>Project (optional)</Label>
              <Popover open={projectOpen} onOpenChange={setProjectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    {selectedProjectId
                      ? projects.find(p => p.id === selectedProjectId)?.job_number
                      : "Select project..."}
                    <Check className={cn("ml-2 h-4 w-4", selectedProjectId ? "opacity-100" : "opacity-0")} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[10001]" align="start">
                  <div className="flex flex-col">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search projects..."
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                          className="pl-8 h-9"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-[200px]">
                      {filteredProjects.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          No projects found
                        </div>
                      ) : (
                        filteredProjects.map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => {
                              setSelectedProjectId(project.id);
                              setProjectOpen(false);
                              setProjectSearch("");
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                          >
                            <Check
                              className={cn(
                                "h-4 w-4",
                                selectedProjectId === project.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {project.job_number}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
