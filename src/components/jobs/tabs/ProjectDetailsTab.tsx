import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/useClients";
import { useUpdateProject } from "@/hooks/useProjects";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, User, Edit, Save, X, Search } from "lucide-react";
import { ClientSearchStep } from "@/components/job-creation/steps/ClientSearchStep";
import { ProductsToOrderSection } from "@/components/jobs/ProductsToOrderSection";
import { ProjectNotesCard } from "../ProjectNotesCard";

interface ProjectDetailsTabProps {
  project: any;
  onUpdate?: (projectData: any) => Promise<void>;
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
  const { data: jobStatuses = [] } = useJobStatuses();
  const updateProject = useUpdateProject();
  const { toast } = useToast();
  
  const selectedClient = clients?.find(c => c.id === formData.client_id);

  const handleSave = async () => {
    try {
      console.log("Saving project details...", formData);
      
      const updateData = {
        id: project.id,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        client_id: formData.client_id,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
      };

      console.log("Sending update with data:", updateData);
      const updatedProject = await updateProject.mutateAsync(updateData);

      console.log("Project updated successfully:", updatedProject);
      
      // Force refresh of clients data to ensure we have the latest
      await refetchClients();
      
      // Update the project object directly to reflect changes immediately
      Object.assign(project, {
        ...formData,
        updated_at: new Date().toISOString()
      });
      
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Project updated successfully",
      });

      // Call the optional onUpdate callback if provided
      if (onUpdate) {
        try {
          await onUpdate(updatedProject);
        } catch (error) {
          console.log("Optional onUpdate callback failed:", error);
          // Don't throw here since the main update succeeded
        }
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
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

  const handleClientSelection = (clientId: string) => {
    console.log("Client selected from search:", clientId);
    updateFormData("client_id", clientId);
    setShowClientSearch(false);
    
    // Immediately save the client selection
    const updateData = {
      id: project.id,
      client_id: clientId,
    };
    
    updateProject.mutateAsync(updateData).then(() => {
      // Update the project object immediately
      project.client_id = clientId;
      toast({
        title: "Success",
        description: "Client assigned to project",
      });
    }).catch((error) => {
      console.error("Failed to assign client:", error);
      toast({
        title: "Error",
        description: "Failed to assign client. Please try again.",
        variant: "destructive",
      });
    });
  };

  const getStatusColor = (statusName: string) => {
    const statusDetails = jobStatuses.find(
      s => s.name.toLowerCase() === statusName.toLowerCase()
    );
    
    if (statusDetails) {
      const colorMap: Record<string, string> = {
        'gray': 'bg-gray-100 text-gray-800 border-gray-200',
        'blue': 'bg-blue-100 text-blue-800 border-blue-200', 
        'green': 'bg-green-100 text-green-800 border-green-200',
        'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'orange': 'bg-orange-100 text-orange-800 border-orange-200',
        'red': 'bg-red-100 text-red-800 border-red-200',
        'purple': 'bg-primary/10 text-primary border-primary/20',
      };
      return colorMap[statusDetails.color] || 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getClientDisplayName = (client: any) => {
    if (!client) return null;
    
    if (client.client_type === 'B2B' && client.company_name) {
      return client.company_name;
    }
    
    return client.name;
  };

  return (
    <div className="space-y-4">
      {/* Main Project Details */}
      <div className="bg-card rounded-lg border shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b bg-muted/30">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <div className="bg-primary/10 p-2 rounded-lg">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Project Details</h2>
              <p className="text-sm text-muted-foreground">
                Job #{formData.job_number || 'Unassigned'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(formData.status)}>
              {jobStatuses.find(s => s.name.toLowerCase() === formData.status.toLowerCase())?.name || 
               formData.status.charAt(0).toUpperCase() + formData.status.slice(1).replace('_', ' ')}
            </Badge>
            
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={updateProject.isPending}
                >
                  <Save className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{updateProject.isPending ? "Saving..." : "Save"}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Essential Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status & Dates */}
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Timeline
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</Label>
                    <div className="mt-1">
                      {isEditing ? (
                        <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {jobStatuses.map(status => (
                              <SelectItem key={status.id} value={status.name.toLowerCase()}>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full bg-${status.color}-500`} />
                                  <span>{status.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary" className={getStatusColor(formData.status)}>
                          {jobStatuses.find(s => s.name.toLowerCase() === formData.status.toLowerCase())?.name || 
                           formData.status.charAt(0).toUpperCase() + formData.status.slice(1).replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</Label>
                    <div className="mt-1">
                      {isEditing ? (
                        <Select value={formData.priority} onValueChange={(value) => updateFormData("priority", value)}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={getPriorityColor(formData.priority)}>
                          {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Start Date</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => updateFormData("start_date", e.target.value)}
                        className="mt-1 h-9"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Due Date</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => updateFormData("due_date", e.target.value)}
                        className="mt-1 h-9"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {formData.due_date ? new Date(formData.due_date).toLocaleDateString() : "Not set"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Client
                </h3>
                
                {selectedClient ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="bg-primary/10 p-2 rounded-full shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">
                            {getClientDisplayName(selectedClient)}
                          </p>
                          {selectedClient.email && (
                            <p className="text-sm text-muted-foreground truncate">{selectedClient.email}</p>
                          )}
                          {selectedClient.client_type === 'B2B' && selectedClient.name && selectedClient.company_name && (
                            <p className="text-xs text-muted-foreground">Contact: {selectedClient.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowClientSearch(true)}
                        className="flex-1 sm:flex-none"
                      >
                        <Search className="h-3 w-3 mr-1" />
                        Change
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          updateFormData("client_id", null);
                          updateProject.mutateAsync({
                            id: project.id,
                            client_id: null,
                          }).then(() => {
                            project.client_id = null;
                            toast({
                              title: "Success",
                              description: "Client removed from project",
                            });
                          });
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="bg-muted/50 p-3 rounded-full w-fit mx-auto mb-3">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">No client assigned</p>
                    <Button 
                      onClick={() => setShowClientSearch(true)}
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-muted/30 rounded-lg p-4">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-3">
              Project Description
            </Label>
            {isEditing ? (
              <Textarea
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Add project description..."
                className="min-h-[80px] resize-none"
                rows={3}
              />
            ) : (
              <div className="text-sm text-foreground bg-background border rounded-md p-3 min-h-[80px] flex items-center">
                {formData.description || (
                  <span className="text-muted-foreground italic">No description added</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Notes */}
      <ProjectNotesCard projectId={project.id} />

      {/* Products to Order Section */}
      <ProductsToOrderSection 
        projectId={project.id}
        jobNumber={formData.job_number}
        clientName={getClientDisplayName(selectedClient)}
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
                if (field === "client_id") {
                  handleClientSelection(value);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
