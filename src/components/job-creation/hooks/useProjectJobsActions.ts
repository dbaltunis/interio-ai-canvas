
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
      toast({
        title: "Error",
        description: "No project selected",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingRoom(true);
    try {
      const roomNumber = (rooms?.length || 0) + 1;
      console.log("Creating room with project_id:", project.id);
      
      await createRoom.mutateAsync({
        project_id: project.id,
        name: `Room ${roomNumber}`,
        room_type: "living_room"
      });
      
      console.log("Room created successfully");
    } catch (error) {
      console.error("Failed to create room:", error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleUpdateProjectName = async (name: string) => {
    if (!project?.id || !name.trim()) {
      throw new Error("Project name cannot be empty");
    }

    try {
      console.log("Updating project name:", { id: project.id, name: name.trim() });
      
      const updatedProject = await updateProject.mutateAsync({
        id: project.id,
        name: name.trim()
      });
      
      console.log("Project name updated successfully:", updatedProject);
      
      // Notify parent component of the update immediately
      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }
      
      return updatedProject;
    } catch (error) {
      console.error("Failed to update project name:", error);
      throw error;
    }
  };

  return {
    isCreatingRoom,
    handleCreateRoom,
    handleUpdateProjectName
  };
};
