
import { useState } from "react";
import { useCreateRoom } from "@/hooks/useRooms";
import { useUpdateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";

interface UseProjectJobsActionsProps {
  project: any;
  rooms: any[];
  onProjectUpdate?: (updatedProject: any) => void;
}

export const useProjectJobsActions = ({ 
  project, 
  rooms, 
  onProjectUpdate 
}: UseProjectJobsActionsProps) => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  
  const createRoom = useCreateRoom();
  const updateProject = useUpdateProject();
  const { toast } = useToast();

  const handleCreateRoom = async () => {
    if (!project?.id) {
      console.error("No project ID available for room creation");
      toast({
        title: "Error",
        description: "Project not found. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreatingRoom(true);
    try {
      console.log("Creating room for project:", project.id);
      await createRoom.mutateAsync({
        name: `Room ${rooms.length + 1}`,
        project_id: project.id,
        description: "",
        room_type: "living_room"
      });
      
      toast({
        title: "Room Created",
        description: "New room has been added to your project"
      });
    } catch (error) {
      console.error("Failed to create room:", error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleUpdateProjectName = async (name: string) => {
    if (!project?.id || !name.trim()) return;
    
    try {
      console.log("Updating project name from:", project.name, "to:", name.trim());
      
      const updatedProject = await updateProject.mutateAsync({
        id: project.id,
        name: name.trim()
      });
      
      console.log("Project name updated successfully:", updatedProject);
      
      // Notify parent component of the update
      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }
      
      toast({
        title: "Project Updated",
        description: "Project name has been updated successfully"
      });
    } catch (error) {
      console.error("Failed to update project name:", error);
      toast({
        title: "Error",
        description: "Failed to update project name. Please try again.",
        variant: "destructive"
      });
      throw error; // Re-throw to handle in component
    }
  };

  return {
    isCreatingRoom,
    handleCreateRoom,
    handleUpdateProjectName
  };
};
