import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    status: project.status || "planning",
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
        status: formData.status,
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
      status: project.status || "planning",
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

  const getClientDisplayName = (client: any) => {
    if (!client) return null;
    
    if (client.client_type === 'B2B' && client.company_name) {
      return client.company_name;
    }
    
    return client.name;
  };

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/20 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-1.5 rounded">
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Job #{formData.job_number || 'Unassigned'}</h2>
            <p className="text-xs text-muted-foreground">Project Details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(formData.status)}>
            {jobStatuses.find(s => s.name.toLowerCase() === formData.status.toLowerCase())?.name || 
             formData.status.charAt(0).toUpperCase() + formData.status.slice(1).replace('_', ' ')}
          </Badge>
          
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={updateProject.isPending}
              >
                <Save className="h-3 w-3 mr-1" />
                {updateProject.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Compact Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Timeline Section */}
        <div className="space-y-3">
          <div className="bg-card rounded-lg border p-3">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Timeline</h3>
            </div>
            
            {/* Status and Dates in single row when not editing */}
            {!isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant="secondary" className={getStatusColor(formData.status)}>
                    {jobStatuses.find(s => s.name.toLowerCase() === formData.status.toLowerCase())?.name || 
                     formData.status.charAt(0).toUpperCase() + formData.status.slice(1).replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Start</span>
                  <span className="text-xs font-medium">
                    {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : "Not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Due</span>
                  <span className="text-xs font-medium">
                    {formData.due_date ? new Date(formData.due_date).toLocaleDateString() : "Not set"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                    <SelectTrigger className="h-8 mt-1">
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
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => updateFormData("start_date", e.target.value)}
                      className="h-8 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Due Date</Label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => updateFormData("due_date", e.target.value)}
                      className="h-8 mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Client Section */}
        <div className="space-y-3">
          <div className="bg-card rounded-lg border p-3">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Client</h3>
            </div>
            
            {selectedClient ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {getClientDisplayName(selectedClient)}
                    </p>
                    {selectedClient.email && (
                      <p className="text-xs text-muted-foreground truncate">{selectedClient.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowClientSearch(true)}
                    className="flex-1 h-7 text-xs"
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
                    className="flex-1 h-7 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="bg-muted/50 p-2 rounded-full w-fit mx-auto mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mb-2">No client assigned</p>
                <Button 
                  onClick={() => setShowClientSearch(true)}
                  size="sm"
                  className="w-full h-7 text-xs"
                >
                  <Search className="h-3 w-3 mr-1" />
                  Add Client
                </Button>
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