import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
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
  const [clientOpen, setClientOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();

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
            <div>
              <Label>Client</Label>
              <Popover open={clientOpen} onOpenChange={setClientOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientOpen}
                    className="w-full justify-between"
                  >
                    {selectedClientId
                      ? clients.find((client) => client.id === selectedClientId)?.name
                      : "Select client (optional)"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 z-[10000]" align="start">
                  <Command>
                    <CommandInput placeholder="Search clients..." />
                    <CommandList>
                      <CommandEmpty>No client found.</CommandEmpty>
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.name}
                            onSelect={() => {
                              setSelectedClientId(client.id);
                              setClientOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedClientId === client.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {client.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {!projectId && (
            <div>
              <Label>Project</Label>
              <Popover open={projectOpen} onOpenChange={setProjectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={projectOpen}
                    className="w-full justify-between"
                  >
                    {selectedProjectId
                      ? projects.find((project) => project.id === selectedProjectId)?.job_number
                      : "Select project (optional)"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 z-[10000]" align="start">
                  <Command>
                    <CommandInput placeholder="Search projects..." />
                    <CommandList>
                      <CommandEmpty>No project found.</CommandEmpty>
                      <CommandGroup>
                        {projects.map((project) => (
                          <CommandItem
                            key={project.id}
                            value={project.job_number}
                            onSelect={() => {
                              setSelectedProjectId(project.id);
                              setProjectOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProjectId === project.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {project.job_number}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
