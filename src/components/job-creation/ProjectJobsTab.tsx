
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRooms } from "@/hooks/useRooms";
import { ProjectJobsContent } from "./ProjectJobsContent";
import { useProjectJobsActions } from "./hooks/useProjectJobsActions";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        // Revert to original name on error
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
      {/* Project Name Section */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    className={`flex-1 ${isUpdatingName ? "opacity-50" : ""}`}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveName}
                    disabled={isUpdatingName || !projectName.trim()}
                    className="px-3"
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
                    className="px-3"
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
                    className="px-3"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            {isUpdatingName && (
              <p className="text-sm text-blue-600 flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Updating project name...</span>
              </p>
            )}
          </div>
          
          {project?.description && (
            <div className="space-y-2">
              <Label>Description</Label>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rooms Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Rooms</h3>
        </div>
        
        <ProjectJobsContent 
          rooms={rooms || []} 
          project={project}
          onCreateRoom={handleCreateRoom}
          isCreatingRoom={isCreatingRoom}
        />
      </div>
    </div>
  );
};
