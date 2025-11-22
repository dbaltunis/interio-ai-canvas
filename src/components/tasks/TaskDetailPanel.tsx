import { useState } from "react";
import { format } from "date-fns";
import { useUpdateTask, useDeleteTask, useCompleteTask } from "@/hooks/useTasks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { X, Edit2, Save, Trash2, Check, Calendar, Clock, User, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/hooks/useTasks";

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
}

export const TaskDetailPanel = ({ task, onClose }: TaskDetailPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const completeTask = useCompleteTask();

  const handleSave = () => {
    updateTask.mutate({
      id: task.id,
      title: editedTask.title,
      description: editedTask.description,
      priority: editedTask.priority,
      status: editedTask.status,
      due_date: editedTask.due_date,
      estimated_hours: editedTask.estimated_hours,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(task.id);
      onClose();
    }
  };

  const handleComplete = () => {
    completeTask.mutate(task.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "pending": return "outline";
      default: return "outline";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b">
        <div className="flex-1">
          {isEditing ? (
            <Input
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="font-semibold"
            />
          ) : (
            <h3 className="font-semibold text-lg">{task.title}</h3>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Status and Priority */}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Select
                value={editedTask.status}
                onValueChange={(value: TaskStatus) => setEditedTask({ ...editedTask, status: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={editedTask.priority}
                onValueChange={(value: TaskPriority) => setEditedTask({ ...editedTask, priority: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
              <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
            </>
          )}
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          {isEditing ? (
            <Textarea
              value={editedTask.description || ""}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              rows={4}
              className="mt-2"
            />
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              {task.description || "No description"}
            </p>
          )}
        </div>

        <Separator />

        {/* Details */}
        <div className="space-y-3">
          {/* Due Date */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label className="w-24">Due Date</Label>
            {isEditing ? (
              <Input
                type="date"
                value={editedTask.due_date ? format(new Date(editedTask.due_date), "yyyy-MM-dd") : ""}
                onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
              />
            ) : (
              <span className="text-sm">
                {task.due_date ? format(new Date(task.due_date), "PPP") : "No due date"}
              </span>
            )}
          </div>

          {/* Estimated Hours */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Label className="w-24">Estimated</Label>
            {isEditing ? (
              <Input
                type="number"
                value={editedTask.estimated_hours || ""}
                onChange={(e) => setEditedTask({ ...editedTask, estimated_hours: parseFloat(e.target.value) })}
                placeholder="Hours"
                className="w-24"
              />
            ) : (
              <span className="text-sm">
                {task.estimated_hours ? `${task.estimated_hours}h` : "Not set"}
              </span>
            )}
          </div>

          {/* Client */}
          {task.clients && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Label className="w-24">Client</Label>
              <Badge variant="outline">{task.clients.name}</Badge>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 text-muted-foreground mt-1" />
              <Label className="w-24">Tags</Label>
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Created {format(new Date(task.created_at), "PPp")}</div>
          {task.completed_at && (
            <div>Completed {format(new Date(task.completed_at), "PPp")}</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        {isEditing ? (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <>
            {task.status !== "completed" && (
              <Button onClick={handleComplete} className="w-full">
                <Check className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(true)} className="flex-1">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
