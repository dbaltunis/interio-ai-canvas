import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useSurfaces, useCreateSurface, useUpdateSurface, useDeleteSurface } from "@/hooks/useSurfaces";
import { useTreatments, useCreateTreatment, useUpdateTreatment, useDeleteTreatment } from "@/hooks/useTreatments";
import { useToast } from "@/hooks/use-toast";

export const useJobHandlers = (project: any) => {
  const { toast } = useToast();
  const projectId = project?.project_id || project?.id;
  
  const { data: rooms, isLoading: roomsLoading } = useRooms(projectId);
  const { data: allSurfaces } = useSurfaces(projectId);
  const { data: allTreatments } = useTreatments(projectId);
  
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const createSurface = useCreateSurface();
  const updateSurface = useUpdateSurface();
  const deleteSurface = useDeleteSurface();
  const createTreatment = useCreateTreatment();
  const updateTreatment = useUpdateTreatment();
  const deleteTreatment = useDeleteTreatment();

  const handleCreateRoom = async () => {
    if (!projectId) return;
    
    try {
      const roomNumber = (rooms?.length || 0) + 1;
      const newRoom = await createRoom.mutateAsync({
        project_id: projectId,
        name: `Room ${roomNumber}`,
        room_type: "living_room"
      });

      // Create a default window for the new room
      if (newRoom) {
        await createSurface.mutateAsync({
          room_id: newRoom.id,
          project_id: projectId,
          name: "Window 1",
          surface_type: 'window',
          width: 60,
          height: 48
        });
      }

      toast({
        title: "Success",
        description: `Room created with default window`,
      });
    } catch (error) {
      console.error("Failed to create room:", error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRenameRoom = async (roomId: string, newName: string) => {
    try {
      await updateRoom.mutateAsync({ id: roomId, name: newName });
      toast({
        title: "Success",
        description: "Room name updated successfully",
      });
    } catch (error) {
      console.error("Failed to rename room:", error);
      toast({
        title: "Error",
        description: "Failed to update room name. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChangeRoomType = async (roomId: string, roomType: string) => {
    try {
      await updateRoom.mutateAsync({ id: roomId, room_type: roomType });
      toast({
        title: "Success",
        description: "Room type updated successfully",
      });
    } catch (error) {
      console.error("Failed to change room type:", error);
      toast({
        title: "Error",
        description: "Failed to update room type. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSurface = async (roomId: string, surfaceType: string) => {
    try {
      const roomSurfaces = allSurfaces?.filter(s => s.room_id === roomId) || [];
      const windowNumber = roomSurfaces.filter(s => s.surface_type === 'window').length + 1;
      
      await createSurface.mutateAsync({
        room_id: roomId,
        project_id: projectId,
        name: `Window ${windowNumber}`,
        surface_type: surfaceType,
        width: 60,
        height: 48
      });

      toast({
        title: "Success",
        description: `Window created successfully`,
      });
    } catch (error) {
      console.error("Failed to create surface:", error);
      toast({
        title: "Error",
        description: "Failed to create window. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSurface = async (surfaceId: string, updates: any) => {
    try {
      await updateSurface.mutateAsync({ id: surfaceId, ...updates });
      toast({
        title: "Success",
        description: "Surface updated successfully",
      });
    } catch (error) {
      console.error("Failed to update surface:", error);
      toast({
        title: "Error",
        description: "Failed to update surface. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSurface = async (surfaceId: string) => {
    try {
      await deleteSurface.mutateAsync(surfaceId);
      toast({
        title: "Success",
        description: "Surface deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete surface:", error);
      toast({
        title: "Error",
        description: "Failed to delete surface. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyRoom = async (room: any) => {
    try {
      const newRoom = await createRoom.mutateAsync({
        project_id: projectId,
        name: `${room.name} Copy`,
        room_type: room.room_type
      });

      // Copy surfaces from the original room to the new room
      const roomSurfaces = allSurfaces?.filter(s => s.room_id === room.id) || [];
      for (const surface of roomSurfaces) {
        await createSurface.mutateAsync({
          room_id: newRoom.id,
          project_id: projectId,
          name: surface.name,
          surface_type: surface.surface_type,
          width: surface.width,
          height: surface.height
        });
      }

      // Copy treatments from the original room to the new room
      const roomTreatments = allTreatments?.filter(t => t.room_id === room.id) || [];
      for (const treatment of roomTreatments) {
        await createTreatment.mutateAsync({
          room_id: newRoom.id,
          window_id: treatment.window_id,
          treatment_type: treatment.treatment_type,
          material_cost: treatment.material_cost,
          labor_cost: treatment.labor_cost,
          total_price: treatment.total_price
        });
      }

      toast({
        title: "Success",
        description: "Room copied successfully",
      });
    } catch (error) {
      console.error("Failed to copy room:", error);
      toast({
        title: "Error",
        description: "Failed to copy room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTreatment = async (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => {
    try {
      await createTreatment.mutateAsync({
        room_id: roomId,
        window_id: surfaceId,
        treatment_type: treatmentType,
        ...treatmentData
      });

      toast({
        title: "Success",
        description: "Treatment created successfully",
      });
    } catch (error) {
      console.error("Failed to create treatment:", error);
      toast({
        title: "Error",
        description: "Failed to create treatment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    rooms,
    roomsLoading,
    allSurfaces,
    allTreatments,
    handleCreateRoom,
    handleRenameRoom,
    handleChangeRoomType,
    handleCreateSurface,
    handleUpdateSurface,
    handleDeleteSurface,
    handleCopyRoom,
    handleCreateTreatment,
    createRoom
  };
};
