
import { useState } from "react";
import { useCreateRoom } from "@/hooks/useRooms";
import { useUpdateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";
import { useAuth } from "@/components/auth/AuthProvider";

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
  const { user } = useAuth();
  const canEditAllJobs = useHasPermission('edit_all_jobs');
  const canEditAssignedJobs = useHasPermission('edit_assigned_jobs');
  // If both permissions are disabled, no job should be editable
  // If both are enabled, all jobs are editable
  // If only "Edit Any Job" is enabled, only jobs created by the user should be editable
  // If only "Edit Assigned Jobs" is enabled, only assigned jobs should be editable
  const canEditJob = (!canEditAllJobs && !canEditAssignedJobs) 
    ? false 
    : (canEditAllJobs && canEditAssignedJobs) 
      ? true 
      : (canEditAllJobs && !canEditAssignedJobs) 
        ? project?.user_id === user?.id 
        : (canEditAssignedJobs && !canEditAllJobs) 
          ? project?.user_id === user?.id 
          : false;

  const handleCreateRoom = async () => {
    // Check permissions
    if (!canEditJob) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this job.",
        variant: "destructive",
      });
      return;
    }

    // Determine the actual project ID
    const projectId = project?.project_id || project?.id;
    if (!projectId) {
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
      console.log("Creating room with project_id:", projectId);
      
      await createRoom.mutateAsync({
        project_id: projectId,
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
    if (!name.trim()) {
      throw new Error("Project name cannot be empty");
    }

    // Check permissions
    if (!canEditJob) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this job.",
        variant: "destructive",
      });
      throw new Error("Permission denied");
    }

    // Determine the actual project ID
    const projectId = project?.project_id || project?.id;
    if (!projectId) {
      throw new Error("No project ID found");
    }

    try {
      console.log("Updating project name:", { id: projectId, name: name.trim() });
      
      const updatedProject = await updateProject.mutateAsync({
        id: projectId,
        name: name.trim()
      });
      
      console.log("Project name updated successfully:", updatedProject);
      
      // Notify parent component of the update
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
