
import { useCreateSurface } from "@/hooks/useSurfaces";
import { useToast } from "@/hooks/use-toast";

export const useSurfaceCreation = () => {
  const createSurface = useCreateSurface();
  const { toast } = useToast();

  const handleCreateSurface = async (
    room: any,
    projectId: string,
    surfaceType: 'window' | 'wall',
    roomSurfaces: any[]
  ) => {
    console.log("Creating surface with:", { room_id: room.id, project_id: projectId, surface_type: surfaceType });
    console.log("Room project_id:", room.project_id);
    
    if (!room.id || !projectId) {
      toast({
        title: "Error",
        description: "Missing room or project information",
        variant: "destructive",
      });
      return;
    }

    try {
      const surfaceCount = roomSurfaces.filter(s => s.surface_type === surfaceType).length;
      const surfaceName = surfaceType === 'window' 
        ? `Window ${surfaceCount + 1}`
        : `Wall ${surfaceCount + 1}`;

      // Use the room's project_id which should be the correct one
      const actualProjectId = room.project_id || projectId;
      
      const surfaceData = {
        room_id: room.id,
        project_id: actualProjectId,
        name: surfaceName,
        surface_type: surfaceType,
        width: surfaceType === 'window' ? 36 : 120,
        height: surfaceType === 'window' ? 60 : 96,
        surface_width: surfaceType === 'window' ? 36 : 120,
        surface_height: surfaceType === 'window' ? 60 : 96
      };

      console.log("Surface data being sent:", surfaceData);

      await createSurface.mutateAsync(surfaceData);

      toast({
        title: "Success",
        description: `${surfaceType === 'window' ? 'Window' : 'Wall'} added successfully`,
      });
    } catch (error) {
      console.error("Error creating surface:", error);
      toast({
        title: "Error",
        description: `Failed to add ${surfaceType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return {
    handleCreateSurface,
    isCreating: createSurface.isPending
  };
};
