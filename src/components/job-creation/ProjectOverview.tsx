import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Phone, Mail, User, Building, Plus, Edit } from "lucide-react";
import { useProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useTreatments } from "@/hooks/useTreatments";
import { InteractiveProjectDialog } from "./InteractiveProjectDialog";

interface ProjectOverviewProps {
  project: any;
  onUpdateProject: (data: any) => void;
}

export const ProjectOverview = ({ project, onUpdateProject }: ProjectOverviewProps) => {
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editedProject, setEditedProject] = useState(project);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: clients } = useClients();
  const { data: rooms } = useRooms(project.id);
  const { data: surfaces } = useSurfaces(project.id);
  const { data: treatments } = useTreatments(project.id);

  const client = clients?.find(c => c.id === project.client_id);

  const handleSaveProject = () => {
    onUpdateProject(editedProject);
    setIsEditingProject(false);
  };

  const handleCreateRoom = async (roomData?: { name: string; room_type: string }) => {
    console.log('Creating room:', roomData);
    // Implementation would go here
  };

  const handleCreateSurface = (roomId: string, surfaceType: string) => {
    console.log('Creating surface:', roomId, surfaceType);
    // Implementation would go here
  };

  const handleCreateTreatment = (surfaceId: string, treatmentType: string) => {
    console.log('Creating treatment:', surfaceId, treatmentType);
    // Implementation would go here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <p className="text-muted-foreground">{project.job_number}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditingProject(!isEditingProject)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditingProject ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={editedProject.name}
                    onChange={(e) => setEditedProject({...editedProject, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={editedProject.status} onValueChange={(value) => setEditedProject({...editedProject, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedProject.description}
                  onChange={(e) => setEditedProject({...editedProject, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveProject}>Save</Button>
                <Button variant="outline" onClick={() => setIsEditingProject(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">{project.description}</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <p className="text-sm text-muted-foreground capitalize">{project.priority}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-sm text-muted-foreground">{project.due_date || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Information */}
      {client && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{client.company_name}</p>
                    <p className="text-sm text-muted-foreground">{client.contact_person}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{client.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{client.phone}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">{client.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {client.city}, {client.state} {client.zip_code}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{rooms?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Rooms</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Room
              </Button>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{surfaces?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Surfaces</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Surface
              </Button>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{treatments?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Treatments</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Treatment
              </Button>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">$0</div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Connect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Project Dialog */}
      <InteractiveProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={client}
      />
    </div>
  );
};
