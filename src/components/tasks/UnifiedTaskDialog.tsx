import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Check, Search } from "lucide-react";
import { format } from "date-fns";
import { useCreateTask } from "@/hooks/useTasks";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";

interface UnifiedTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  projectId?: string;
}

export const UnifiedTaskDialog = ({ open, onOpenChange, clientId, projectId }: UnifiedTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [selectedClientId, setSelectedClientId] = useState(clientId || "");
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  const [dueDate, setDueDate] = useState<Date>();
  const [estimatedHours, setEstimatedHours] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [clientExpanded, setClientExpanded] = useState(false);
  const [projectExpanded, setProjectExpanded] = useState(false);

  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();

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
    
    await createTask.mutateAsync({
      title,
      description,
      priority,
      client_id: selectedClientId || undefined,
      project_id: selectedProjectId || undefined,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setSelectedClientId(clientId || "");
    setSelectedProjectId(projectId || "");
    setDueDate(undefined);
    setEstimatedHours("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
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
            <div className="space-y-2">
              <Label>Client (optional)</Label>
              {!clientExpanded ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setClientExpanded(true)}
                >
                  {selectedClientId ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {clients.find(c => c.id === selectedClientId)?.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select client...</span>
                  )}
                </Button>
              ) : (
                <div className="space-y-2 border rounded-md p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clients..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-1">
                      {filteredClients.length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          No clients found.
                        </div>
                      ) : (
                        filteredClients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setSelectedClientId(client.id);
                              setClientSearch("");
                              setClientExpanded(false);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-sm hover:bg-accent transition-colors flex items-center gap-2",
                              selectedClientId === client.id && "bg-accent"
                            )}
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
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setClientExpanded(false);
                        setClientSearch("");
                      }}
                    >
                      Close
                    </Button>
                    {selectedClientId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClientId("");
                          setClientSearch("");
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!projectId && (
            <div className="space-y-2">
              <Label>Project (optional)</Label>
              {!projectExpanded ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setProjectExpanded(true)}
                >
                  {selectedProjectId ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {projects.find(p => p.id === selectedProjectId)?.job_number}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select project...</span>
                  )}
                </Button>
              ) : (
                <div className="space-y-2 border rounded-md p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-1">
                      {filteredProjects.length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          No projects found.
                        </div>
                      ) : (
                        filteredProjects.map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => {
                              setSelectedProjectId(project.id);
                              setProjectSearch("");
                              setProjectExpanded(false);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-sm hover:bg-accent transition-colors flex items-center gap-2",
                              selectedProjectId === project.id && "bg-accent"
                            )}
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
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setProjectExpanded(false);
                        setProjectSearch("");
                      }}
                    >
                      Close
                    </Button>
                    {selectedProjectId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProjectId("");
                          setProjectSearch("");
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title || createTask.isPending}>
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
