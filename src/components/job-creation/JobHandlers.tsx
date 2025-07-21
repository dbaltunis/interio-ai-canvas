
import { useState } from "react";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useSurfaces, useCreateSurface, useUpdateSurface, useDeleteSurface } from "@/hooks/useSurfaces";
import { useTreatments, useCreateTreatment } from "@/hooks/useTreatments";
import { useToast } from "@/hooks/use-toast";

export const useJobHandlers = (project: any) => {
  const { toast } = useToast();
  const projectId = project?.id;
  
  // Room management
  const { data: rooms, isLoading: roomsLoading } = useRooms(projectId);
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  
  // Surface management
  const { data: allSurfaces } = useSurfaces(projectId);
  const createSurface = useCreateSurface();
  const updateSurface = useUpdateSurface();
  const deleteSurface = useDeleteSurface();
  
  // Treatment management
  const { data: allTreatments } = useTreatments(projectId);
  const createTreatment = useCreateTreatment();

  const handleCreateRoom = async () => {
    if (!projectId) return;
    
    try {
      const roomCount = rooms?.length || 0;
      await createRoom.mutateAsync({
        project_id: projectId,
        name: `Room ${roomCount + 1}`,
        room_type: 'living_room'
      });
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const handleRenameRoom = async (roomId: string, newName: string) => {
    try {
      await updateRoom.mutateAsync({
        id: roomId,
        name: newName
      });
    } catch (error) {
      console.error("Failed to rename room:", error);
    }
  };

  const handleChangeRoomType = async (roomId: string, roomType: string) => {
    try {
      await updateRoom.mutateAsync({
        id: roomId,
        room_type: roomType
      });
    } catch (error) {
      console.error("Failed to change room type:", error);
    }
  };

  const handleCreateSurface = async (roomId: string, surfaceType: string) => {
    try {
      const surfaceCount = allSurfaces?.filter(s => s.room_id === roomId)?.length || 0;
      await createSurface.mutateAsync({
        project_id: projectId,
        room_id: roomId,
        name: `${surfaceType} ${surfaceCount + 1}`,
        surface_type: surfaceType
      });
    } catch (error) {
      console.error("Failed to create surface:", error);
      throw error;
    }
  };

  const handleUpdateSurface = async (surfaceId: string, updates: any) => {
    try {
      await updateSurface.mutateAsync({
        id: surfaceId,
        ...updates
      });
    } catch (error) {
      console.error("Failed to update surface:", error);
    }
  };

  const handleDeleteSurface = async (surfaceId: string) => {
    try {
      await deleteSurface.mutateAsync(surfaceId);
    } catch (error) {
      console.error("Failed to delete surface:", error);
    }
  };

  const handleCopyRoom = async (room: any) => {
    try {
      const newRoom = await createRoom.mutateAsync({
        project_id: projectId,
        name: `${room.name} (Copy)`,
        room_type: room.room_type,
        description: room.description,
        notes: room.notes
      });

      // Copy surfaces from original room
      const roomSurfaces = allSurfaces?.filter(s => s.room_id === room.id) || [];
      for (const surface of roomSurfaces) {
        await createSurface.mutateAsync({
          project_id: projectId,
          room_id: newRoom.id,
          name: surface.name,
          surface_type: surface.surface_type,
          width: surface.width,
          height: surface.height
        });
      }

      toast({
        title: "Room copied successfully",
        description: `Created ${newRoom.name} with all surfaces`,
      });
    } catch (error) {
      console.error("Failed to copy room:", error);
      toast({
        title: "Error",
        description: "Failed to copy room",
        variant: "destructive",
      });
    }
  };

  const handleCreateTreatment = async (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => {
    try {
      const windowId = surfaceId; // In our schema, window_id maps to surface_id
      
      await createTreatment.mutateAsync({
        project_id: projectId,
        room_id: roomId,
        window_id: windowId,
        treatment_type: treatmentType,
        product_name: treatmentData?.product_name || treatmentType,
        measurements: treatmentData?.measurements || {},
        fabric_details: treatmentData?.fabric_details || {},
        treatment_details: treatmentData?.treatment_details || {},
        calculation_details: treatmentData?.calculation_details || {},
        total_price: treatmentData?.total_price || 0,
        material_cost: treatmentData?.material_cost || 0,
        labor_cost: treatmentData?.labor_cost || 0,
        unit_price: treatmentData?.unit_price || 0,
        quantity: treatmentData?.quantity || 1,
        status: 'planned'
      });

      toast({
        title: "Treatment added successfully",
        description: `Added ${treatmentType} treatment`,
      });
    } catch (error) {
      console.error("Failed to create treatment:", error);
      toast({
        title: "Error",
        description: "Failed to add treatment",
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
    createRoom,
    updateRoom,
    deleteRoom
  };
};
