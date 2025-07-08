
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRooms } from "@/hooks/useRooms";
import { ProjectJobsContent } from "./ProjectJobsContent";
import { useProjectJobsActions } from "./hooks/useProjectJobsActions";
import { useToast } from "@/hooks/use-toast";

interface ProjectJobsTabProps {
  project: any;
  onProjectUpdate?: (updatedProject: any) => void;
}

export const ProjectJobsTab = ({ project, onProjectUpdate }: ProjectJobsTabProps) => {
  const { data: rooms } = useRooms(project.id);
  const { toast } = useToast();
  const [projectName, setProjectName] = useState(project?.name || "");
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

  const handleNameBlur = async () => {
    if (projectName.trim() !== project?.name && projectName.trim() !== '') {
      setIsUpdatingName(true);
      try {
        await handleUpdateProjectName(projectName.trim());
        console.log('Project name updated successfully');
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
    }
  };

  const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
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
            <Input
              id="project-name"
              value={projectName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyPress={handleNameKeyPress}
              placeholder="Enter project name..."
              disabled={isUpdatingName}
              className={isUpdatingName ? "opacity-50" : ""}
            />
            {isUpdatingName && (
              <p className="text-sm text-muted-foreground">Updating project name...</p>
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
