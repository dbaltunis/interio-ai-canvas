import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Plus, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { useCreateTask, TaskPriority } from "@/hooks/useTasks";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";

interface SmartTaskCreationProps {
  clientId?: string;
  projectId?: string;
  onSuccess?: () => void;
}

export const SmartTaskCreation = ({ clientId, projectId, onSuccess }: SmartTaskCreationProps) => {
  const [title, setTitle] = useState("");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  // More options state
  const [description, setDescription] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(clientId || "");
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [tags, setTags] = useState("");
  const [addToCalendar, setAddToCalendar] = useState(false);

  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();
  const createAppointment = useCreateAppointment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Create the task
    await createTask.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      client_id: selectedClientId || undefined,
      project_id: selectedProjectId || undefined,
      priority,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
    });

    // Also create calendar appointment if requested
    if (addToCalendar && dueDate) {
      const startTime = time || "09:00";
      const duration = estimatedHours ? parseFloat(estimatedHours) * 60 : 60; // Convert hours to minutes
      const [hours, minutes] = startTime.split(':').map(Number);
      
      const startDateTime = new Date(dueDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + duration);

      await createAppointment.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        client_id: selectedClientId || undefined,
        project_id: selectedProjectId || undefined,
        appointment_type: "reminder",
      });
    }

    // Reset form
    setTitle("");
    setDescription("");
    setSelectedClientId(clientId || "");
    setSelectedProjectId(projectId || "");
    setPriority("medium");
    setDueDate(undefined);
    setTime("");
    setEstimatedHours("");
    setTags("");
    setAddToCalendar(false);
    setShowMoreOptions(false);
    
    onSuccess?.();
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setSelectedClientId(clientId || "");
    setSelectedProjectId(projectId || "");
    setPriority("medium");
    setDueDate(undefined);
    setTime("");
    setEstimatedHours("");
    setTags("");
    setAddToCalendar(false);
    setShowMoreOptions(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-card border rounded-lg p-4">
      {/* Main Row: Title input + Add button + More Options toggle */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !showMoreOptions) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button 
          type="submit" 
          size="sm" 
          disabled={!title.trim() || createTask.isPending}
          className="px-4"
        >
          {createTask.isPending ? "Adding..." : "Add"}
        </Button>
        {title.trim() && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="px-2"
          >
            {showMoreOptions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
        {title.trim() && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expandable More Options */}
      {showMoreOptions && (
        <div className="space-y-3 pt-3 border-t animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-xs">Description</Label>
              <Textarea
                id="description"
                placeholder="Add more details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[60px] text-sm"
                rows={2}
              />
            </div>

            {/* Client */}
            {!clientId && (
              <div>
                <Label htmlFor="client" className="text-xs">Client (optional)</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger id="client" className="text-sm">
                    <SelectValue placeholder="Select client..." />
                  </SelectTrigger>
                  <SelectContent className="z-[10000] bg-popover border shadow-lg">
                    <SelectItem value="none">No client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Project */}
            {!projectId && (
              <div>
                <Label htmlFor="project" className="text-xs">Project (optional)</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger id="project" className="text-sm">
                    <SelectValue placeholder="Select project..." />
                  </SelectTrigger>
                  <SelectContent className="z-[10000] bg-popover border shadow-lg">
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.job_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Priority */}
            <div>
              <Label htmlFor="priority" className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                <SelectTrigger id="priority" className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000] bg-popover border shadow-lg">
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      Low
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                      Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                      High
                    </span>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500"></span>
                      Urgent
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="due-date" className="text-xs">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="due-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal text-sm h-9",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[10000] bg-popover border shadow-lg" align="start">
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

            {/* Time */}
            <div>
              <Label htmlFor="time" className="text-xs">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="text-sm h-9"
              />
            </div>

            {/* Estimated Hours */}
            <div>
              <Label htmlFor="estimated-hours" className="text-xs">Estimated Hours</Label>
              <Input
                id="estimated-hours"
                type="number"
                step="0.5"
                min="0"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="0"
                className="text-sm h-9"
              />
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <Label htmlFor="tags" className="text-xs">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., urgent, follow-up, design"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="text-sm h-9"
              />
            </div>
          </div>

          {/* Calendar Integration Option */}
          {dueDate && (
            <div className="flex items-center gap-2 px-1 py-2 bg-muted/30 rounded-md">
              <Checkbox
                id="add-to-calendar"
                checked={addToCalendar}
                onCheckedChange={(checked) => setAddToCalendar(checked as boolean)}
              />
              <Label htmlFor="add-to-calendar" className="text-sm font-normal cursor-pointer">
                Also add to calendar as appointment
                {time && estimatedHours && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({time} for {estimatedHours}h)
                  </span>
                )}
              </Label>
            </div>
          )}

          {/* Action buttons for expanded form */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Press Enter to create or click Add button
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={!title.trim() || createTask.isPending}
              >
                {createTask.isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick hint when not expanded */}
      {!showMoreOptions && title.trim() && (
        <p className="text-xs text-muted-foreground">
          Click <ChevronDown className="h-3 w-3 inline" /> to add description, client, dates, and more
        </p>
      )}
    </form>
  );
};