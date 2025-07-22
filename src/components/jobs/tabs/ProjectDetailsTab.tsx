import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, User, Edit, Save, X, Search } from "lucide-react";
import { ClientSearchStep } from "@/components/job-creation/steps/ClientSearchStep";
import { ProductsToOrderSection } from "@/components/jobs/ProductsToOrderSection";

interface ProjectDetailsTabProps {
  project: any;
  onUpdate: (projectData: any) => Promise<void>;
}

export const ProjectDetailsTab = ({ project, onUpdate }: ProjectDetailsTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [formData, setFormData] = useState({
    description: project.description || "",
    status: project.status || "planning",
    priority: project.priority || "medium",
    job_number: project.job_number || "",
    client_id: project.client_id || null,
    start_date: project.start_date || "",
    due_date: project.due_date || "",
  });

  const { data: clients, refetch: refetchClients } = useClients();
  const { toast } = useToast();
  
  const selectedClient = clients?.find(c => c.id === formData.client_id);

  const handleSave = async () => {
    try {
      // Prepare the update data, converting empty strings to null for date fields
      const updateData = { 
        id: project.id, 
        ...formData,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
      };
      
      console.log("Saving project data:", updateData);
      
      await onUpdate(updateData);
      
      // Force refresh of clients data to ensure we have the latest
      await refetchClients();
      
      // Update the project object directly to reflect changes immediately
      Object.assign(project, formData);
      
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      description: project.description || "",
      status: project.status || "planning",
      priority: project.priority || "medium",
      job_number: project.job_number || "",
      client_id: project.client_id || null,
      start_date: project.start_date || "",
      due_date: project.due_date || "",
    });
    setIsEditing(false);
  };

  const updateFormData = (field: string, value: any) => {
    console.log("Updating form field:", field, "with value:", value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Project Details
          </CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Number and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Job Number</Label>
              <div className="mt-1">
                <span className="text-lg font-semibold text-brand-primary">
                  #{formData.job_number}
                </span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <div className="mt-2">
                {isEditing ? (
                  <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusColor(formData.status)}>
                    {formData.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Priority</Label>
              <div className="mt-2">
                {isEditing ? (
                  <Select value={formData.priority} onValueChange={(value) => updateFormData("priority", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getPriorityColor(formData.priority)}>
                    {formData.priority.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Client Section */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Client</Label>
            <div className="mt-2">
              {selectedClient ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">{selectedClient.name}</p>
                      {selectedClient.email && (
                        <p className="text-sm text-green-700">{selectedClient.email}</p>
                      )}
                      {selectedClient.company_name && (
                        <p className="text-sm text-green-600">({selectedClient.company_name})</p>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowClientSearch(true)}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Change
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateFormData("client_id", null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 mb-3">No client assigned</p>
                  {isEditing && (
                    <Button 
                      onClick={() => setShowClientSearch(true)}
                      className="bg-brand-primary hover:bg-brand-accent text-white"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search or Create Client
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date" className="text-sm font-medium text-gray-700">Start Date</Label>
              {isEditing ? (
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateFormData("start_date", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 text-sm text-gray-900">
                  {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : "Not set"}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="due_date" className="text-sm font-medium text-gray-700">Due Date</Label>
              {isEditing ? (
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => updateFormData("due_date", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 text-sm text-gray-900">
                  {formData.due_date ? new Date(formData.due_date).toLocaleDateString() : "Not set"}
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Add project description..."
                className="mt-1"
                rows={3}
              />
            ) : (
              <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md min-h-[80px]">
                {formData.description || "No description added"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products to Order Section */}
      <ProductsToOrderSection 
        projectId={project.id}
        jobNumber={formData.job_number}
        clientName={selectedClient?.name}
      />

      {/* Client Search Modal */}
      {showClientSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Search or Create Client</h2>
              <Button variant="outline" onClick={() => setShowClientSearch(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ClientSearchStep 
              formData={{ client_id: formData.client_id }}
              updateFormData={(field, value) => {
                console.log("Client selected from search:", field, value);
                updateFormData(field, value);
                setShowClientSearch(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "on_hold":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
