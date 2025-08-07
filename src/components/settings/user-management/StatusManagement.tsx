import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useJobStatuses, useCreateJobStatus, useUpdateJobStatus, useDeleteJobStatus } from "@/hooks/useJobStatuses";
import { LoadingFallback } from "@/components/ui/loading-fallback";

interface Status {
  id: number;
  name: string;
  color: string;
  category: string;
  action: string;
  description: string;
}

const colorOptions = [
  { value: "gray", label: "Gray", class: "bg-gray-500" },
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "primary", label: "Primary", class: "bg-primary" },
];

const actionOptions = [
  { value: "editable", label: "Editable", description: "Job can be fully edited" },
  { value: "view_only", label: "View Only", description: "Job can only be viewed" },
  { value: "locked", label: "Locked", description: "Job is locked, requires status change to edit" },
  { value: "progress_only", label: "Progress Only", description: "Only progress updates allowed" },
  { value: "completed", label: "Completed", description: "Job is completed" },
  { value: "requires_reason", label: "Requires Reason", description: "Status change requires reason input" },
];

export const StatusManagement = () => {
  const { data: statuses = [], isLoading } = useJobStatuses();
  const createStatus = useCreateJobStatus();
  const updateStatus = useUpdateJobStatus();
  const deleteStatus = useDeleteJobStatus();
  
  const [editingStatus, setEditingStatus] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditStatus = (status: any) => {
    setEditingStatus({ ...status });
    setIsDialogOpen(true);
  };

  const handleAddStatus = () => {
    const newStatus = {
      name: "New Status",
      color: "blue",
      category: "Quote",
      action: "editable",
      description: "",
      sort_order: statuses.length + 1
    };
    setEditingStatus(newStatus);
    setIsDialogOpen(true);
  };

  const handleSaveStatus = async () => {
    if (editingStatus) {
      try {
        if (editingStatus.id) {
          // Update existing status
          await updateStatus.mutateAsync({
            id: editingStatus.id,
            ...editingStatus
          });
        } else {
          // Create new status
          await createStatus.mutateAsync(editingStatus);
        }
        
        setIsDialogOpen(false);
        setEditingStatus(null);
        
        // Force immediate refresh of job statuses across the app
        window.location.reload();
      } catch (error) {
        console.error("Error saving status:", error);
      }
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    try {
      await deleteStatus.mutateAsync(statusId);
    } catch (error) {
      console.error("Error deleting status:", error);
    }
  };

  if (isLoading) {
    return <LoadingFallback title="Loading job statuses..." rows={3} />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status Management
          </CardTitle>
          <CardDescription>
            Configure project and quote statuses with their behaviors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">System Statuses ({statuses.length})</h4>
              <p className="text-sm text-muted-foreground">Define workflow states and their actions</p>
            </div>
            <Button onClick={handleAddStatus} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Status
            </Button>
          </div>
          
          <div className="space-y-3">
            {statuses.map((status) => (
              <div key={status.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full bg-${status.color}-500`} />
                  <div>
                    <div className="font-medium">{status.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {status.category} • {status.action.replace('_', ' ')}
                    </div>
                    {status.description && (
                      <div className="text-xs text-muted-foreground mt-1">{status.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditStatus(status)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteStatus(status.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStatus?.id ? 'Edit Status' : 'Add New Status'}
            </DialogTitle>
            <DialogDescription>
              Configure the status name, color, and behavior in the application
            </DialogDescription>
          </DialogHeader>
          
          {editingStatus && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status Name</Label>
                <Input 
                  value={editingStatus.name}
                  onChange={(e) => setEditingStatus({...editingStatus, name: e.target.value})}
                  placeholder="Enter status name"
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={editingStatus.color} onValueChange={(value) => setEditingStatus({...editingStatus, color: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${color.class}`} />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editingStatus.category} onValueChange={(value) => setEditingStatus({...editingStatus, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quote">Quote</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Action Behavior</Label>
                <Select value={editingStatus.action} onValueChange={(value) => setEditingStatus({...editingStatus, action: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionOptions.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        <div>
                          <div className="font-medium">{action.label}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={editingStatus.description}
                  onChange={(e) => setEditingStatus({...editingStatus, description: e.target.value})}
                  placeholder="Describe when this status is used"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveStatus}>
                  Save Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};