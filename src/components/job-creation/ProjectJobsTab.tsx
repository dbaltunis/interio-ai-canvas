
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRooms } from "@/hooks/useRooms";
import { ProjectJobsContent } from "./ProjectJobsContent";
import { useProjectJobsActions } from "./hooks/useProjectJobsActions";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Edit2, Plus } from "lucide-react";

interface ProjectJobsTabProps {
  project: any;
  onProjectUpdate?: (updatedProject: any) => void;
}

export const ProjectJobsTab = ({ project, onProjectUpdate }: ProjectJobsTabProps) => {
  const { data: rooms } = useRooms(project?.project_id || project?.id);
  const { toast } = useToast();
  const [projectName, setProjectName] = useState(project?.name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  
  // Room editing state
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState("");

  const {
    isCreatingRoom,
    handleCreateRoom,
    handleUpdateProjectName
  } = useProjectJobsActions({
    project,
    rooms: rooms || [],
    onProjectUpdate
  });

  // Update local state when project prop changes
  useEffect(() => {
    if (project?.name && project.name !== projectName) {
      setProjectName(project.name);
    }
  }, [project?.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  const handleSaveName = async () => {
    if (projectName.trim() !== project?.name && projectName.trim() !== '') {
      setIsUpdatingName(true);
      try {
        await handleUpdateProjectName(projectName.trim());
        setIsEditingName(false);
        toast({
          title: "Success",
          description: "Project name updated successfully",
        });
      } catch (error) {
        console.error('Failed to update project name:', error);
        setProjectName(project?.name || "");
        toast({
          title: "Error",
          description: "Failed to update project name. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUpdatingName(false);
      }
    } else {
      setIsEditingName(false);
      setProjectName(project?.name || "");
    }
  };

  const handleCancelEdit = () => {
    setProjectName(project?.name || "");
    setIsEditingName(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Info Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
          <div className="text-sm text-gray-500">
            Job #{project?.job_number}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <div className="flex items-center space-x-2">
              {isEditingName ? (
                <>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={handleNameChange}
                    onKeyDown={handleKeyPress}
                    placeholder="Enter project name..."
                    disabled={isUpdatingName}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveName}
                    disabled={isUpdatingName || !projectName.trim()}
                  >
                    {isUpdatingName ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isUpdatingName}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex-1 px-3 py-2 bg-gray-50 rounded-md border">
                    {project?.name || "Untitled Project"}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Section - Simplified */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Rooms & Products</h3>
            <p className="text-sm text-gray-600">Add rooms and select window treatments, wallpapers, and services for each space</p>
          </div>
          <Button onClick={handleCreateRoom} disabled={isCreatingRoom}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreatingRoom ? "Adding..." : "Add Room"}
          </Button>
        </div>
        
        <ProjectJobsContent 
          rooms={rooms || []} 
          project={project}
          onCreateRoom={handleCreateRoom}
          isCreatingRoom={isCreatingRoom}
          editingRoomId={editingRoomId}
          setEditingRoomId={setEditingRoomId}
          editingRoomName={editingRoomName}
          setEditingRoomName={setEditingRoomName}
        />
      </div>
    </div>
  );
};
