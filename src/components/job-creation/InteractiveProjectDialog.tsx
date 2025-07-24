
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Home, Square, Save, X } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useCreateProject } from "@/hooks/useProjects";
import { useRooms, useCreateRoom } from "@/hooks/useRooms";
import { useSurfaces, useCreateSurface } from "@/hooks/useSurfaces";
import { WindowsCanvasInterface } from "./WindowsCanvasInterface";

interface InteractiveProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectId: string) => void;
}

export const InteractiveProjectDialog = ({ 
  isOpen, 
  onClose, 
  onProjectCreated 
}: InteractiveProjectDialogProps) => {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    name: "",
    client_id: "",
    description: "",
    status: "active",
    priority: "medium",
    funnel_stage: "lead"
  });

  const { data: clients } = useClients();
  const createProject = useCreateProject();
  const { data: rooms } = useRooms(projectData.client_id);
  const { data: surfaces } = useSurfaces();
  const createRoom = useCreateRoom();
  const createSurface = useCreateSurface();

  const handleNext = () => {
    if (step === 1) {
      // Create project first
      createProject.mutate(projectData, {
        onSuccess: (project) => {
          setProjectData(prev => ({ ...prev, id: project.id }));
          setStep(2);
        }
      });
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFinish = () => {
    if (projectData.id) {
      onProjectCreated(projectData.id);
    }
    onClose();
  };

  const handleCreateSurface = async (roomId: string, surfaceType: string) => {
    const surfaceNumber = surfaces?.filter(s => s.room_id === roomId).length || 0;
    await createSurface.mutateAsync({
      project_id: projectData.id,
      room_id: roomId,
      name: `${surfaceType} ${surfaceNumber + 1}`,
      surface_type: surfaceType.toLowerCase()
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="project_name">Project Name</Label>
              <Input
                id="project_name"
                value={projectData.name}
                onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter project name"
              />
            </div>
            <div>
              <Label htmlFor="client_select">Client</Label>
              <Select value={projectData.client_id} onValueChange={(value) => setProjectData(prev => ({ ...prev, client_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={projectData.description}
                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {projectData.id && (
              <WindowsCanvasInterface
                projectId={projectData.id}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <span>
              {step === 1 ? 'Create New Project' : 'Room & Surface Setup'}
            </span>
            <Badge variant="outline">Step {step} of 2</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <div className="space-x-2">
            {step === 2 && (
              <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Complete Setup
              </Button>
            )}
            {step === 1 && (
              <Button 
                onClick={handleNext} 
                disabled={!projectData.name || !projectData.client_id || createProject.isPending}
              >
                Create Project & Continue
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
