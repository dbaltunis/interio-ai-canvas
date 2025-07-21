
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

interface ProjectDetailsTabProps {
  project: any;
  onUpdate: (updates: any) => Promise<any>;
}

export const ProjectDetailsTab = ({ project, onUpdate }: ProjectDetailsTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name || "",
    note: project.description || "",
    status: project.status || "planning",
    priority: project.priority || "medium",
    job_number: project.job_number || "",
    client_id: project.client_id || "no_client",
    start_date: project.start_date || "",
    due_date: project.due_date || "",
  });

  const { data: clients } = useClients();
  const { toast } = useToast();

  const selectedClient = clients?.find(c => c.id === formData.client_id);

  const handleSave = async () => {
    try {
      const updateData = { 
        id: project.id, 
        ...formData, 
        description: formData.note,
        client_id: formData.client_id === "no_client" ? null : formData.client_id
      };
      await onUpdate(updateData);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Project details updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project details",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: project.name || "",
      note: project.description || "",
      status: project.status || "planning",
      priority: project.priority || "medium",
      job_number: project.job_number || "",
      client_id: project.client_id || "no_client",
      start_date: project.start_date || "",
      due_date: project.due_date || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Project Details</h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} size="sm">
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm">
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              Edit Project
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="job_number">Job Number</Label>
              <Input
                id="job_number"
                value={formData.job_number}
                disabled={true}
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
            </div>

            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                disabled={!isEditing}
                rows={3}
                placeholder="Add notes about this job..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Status & Timing */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                  disabled={!isEditing}
                >
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
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div>
                <Label htmlFor="client_id">Select Client</Label>
                <Select 
                  value={formData.client_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_client">No client assigned</SelectItem>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} {client.company_name && `(${client.company_name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : selectedClient ? (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">{selectedClient.name}</span>
                  {selectedClient.company_name && (
                    <div className="text-sm text-gray-500">{selectedClient.company_name}</div>
                  )}
                </div>
                {selectedClient.email && (
                  <div className="text-sm text-gray-600">{selectedClient.email}</div>
                )}
                {selectedClient.phone && (
                  <div className="text-sm text-gray-600">{selectedClient.phone}</div>
                )}
                {selectedClient.address && (
                  <div className="text-sm text-gray-600">
                    {selectedClient.address}
                    {selectedClient.city && `, ${selectedClient.city}`}
                    {selectedClient.state && `, ${selectedClient.state}`}
                    {selectedClient.zip_code && ` ${selectedClient.zip_code}`}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 italic">No client assigned</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
