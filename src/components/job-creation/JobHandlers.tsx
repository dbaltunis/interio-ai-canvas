
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useSurfaces, useCreateSurface, useUpdateSurface, useDeleteSurface } from "@/hooks/useSurfaces";
import { useTreatments, useCreateTreatment } from "@/hooks/useTreatments";

export const useJobHandlers = (project: any) => {
  // Handle case where project might be a quote object with project_id
  const actualProjectId = project.project_id || project.id;
  console.log("JobHandlers - project object:", project);
  console.log("JobHandlers - using project ID:", actualProjectId);

  const { data: rooms, isLoading: roomsLoading } = useRooms(actualProjectId);
  const { data: allSurfaces } = useSurfaces(actualProjectId);
  const { data: allTreatments } = useTreatments(actualProjectId);
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const createSurface = useCreateSurface();
  const updateSurface = useUpdateSurface();
  const deleteSurface = useDeleteSurface();
  const createTreatment = useCreateTreatment();

  const handleCreateRoom = async () => {
    try {
      const roomNumber = (rooms?.length || 0) + 1;
      console.log("Creating room with project_id:", actualProjectId);
      const newRoom = await createRoom.mutateAsync({
        project_id: actualProjectId,
        name: `Room ${roomNumber}`,
        room_type: "living_room"
      });
      console.log("Room created successfully:", newRoom);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const handleRenameRoom = async (roomId: string, newName: string) => {
    if (newName.trim()) {
      try {
        await updateRoom.mutateAsync({ id: roomId, name: newName.trim() });
      } catch (error) {
        console.error("Failed to rename room:", error);
      }
    }
  };

  const handleChangeRoomType = async (roomId: string, roomType: string) => {
    try {
      await updateRoom.mutateAsync({ id: roomId, room_type: roomType });
    } catch (error) {
      console.error("Failed to change room type:", error);
    }
  };

  const handleCreateSurface = async (roomId: string, surfaceType: string) => {
    try {
      const roomSurfaces = allSurfaces?.filter(s => s.room_id === roomId) || [];
      const surfaceNumber = roomSurfaces.length + 1;
      const surfaceName = surfaceType === 'wall' ? `Wall ${surfaceNumber}` : `Window ${surfaceNumber}`;
      
      const surfaceData = {
        room_id: roomId,
        project_id: actualProjectId,
        name: surfaceName,
        surface_type: surfaceType,
        width: surfaceType === 'wall' ? 120 : 60,
        height: surfaceType === 'wall' ? 96 : 48,
        surface_width: surfaceType === 'wall' ? 120 : 60,
        surface_height: surfaceType === 'wall' ? 96 : 48
      };

      console.log("Creating surface with data:", surfaceData);
      const result = await createSurface.mutateAsync(surfaceData);
      console.log("Surface created successfully:", result);
    } catch (error) {
      console.error("Failed to create surface:", error);
    }
  };

  const handleUpdateSurface = async (surfaceId: string, updates: any) => {
    try {
      console.log("Updating surface:", surfaceId, "with:", updates);
      await updateSurface.mutateAsync({ id: surfaceId, ...updates });
      console.log("Surface updated successfully");
    } catch (error) {
      console.error("Failed to update surface:", error);
    }
  };

  const handleDeleteSurface = async (surfaceId: string) => {
    if (confirm("Delete this surface and all its treatments?")) {
      try {
        await deleteSurface.mutateAsync(surfaceId);
        console.log("Surface deleted successfully");
      } catch (error) {
        console.error("Failed to delete surface:", error);
      }
    }
  };

  const handleCopyRoom = async (room: any) => {
    try {
      const roomSurfaces = allSurfaces?.filter(s => s.room_id === room.id) || [];
      const roomTreatments = allTreatments?.filter(t => t.room_id === room.id) || [];
      
      // Create a copy of the room
      const roomNumber = (rooms?.length || 0) + 1;
      const newRoom = await createRoom.mutateAsync({
        project_id: actualProjectId,
        name: `${room.name} (Copy)`,
        room_type: room.room_type
      });

      // Copy all surfaces
      for (const surface of roomSurfaces) {
        const newSurface = await createSurface.mutateAsync({
          room_id: newRoom.id,
          project_id: actualProjectId,
          name: surface.name,
          surface_type: surface.surface_type,
          width: surface.width,
          height: surface.height,
          surface_width: surface.surface_width,
          surface_height: surface.surface_height
        });

        // Copy treatments for this surface
        const surfaceTreatments = roomTreatments.filter(t => t.window_id === surface.id);
        for (const treatment of surfaceTreatments) {
          await createTreatment.mutateAsync({
            window_id: newSurface.id,
            room_id: newRoom.id,
            project_id: actualProjectId,
            treatment_type: treatment.treatment_type,
            product_name: treatment.product_name,
            material_cost: treatment.material_cost,
            labor_cost: treatment.labor_cost,
            total_price: treatment.total_price,
            status: treatment.status
          });
        }
      }
      
      console.log("Room copied successfully:", newRoom);
    } catch (error) {
      console.error("Failed to copy room:", error);
    }
  };

  const handlePasteRoom = async (copiedRoom: any) => {
    if (!copiedRoom) return;

    try {
      const roomNumber = (rooms?.length || 0) + 1;
      const newRoom = await createRoom.mutateAsync({
        project_id: actualProjectId,
        name: `${copiedRoom.room.name} (Copy ${roomNumber})`,
        room_type: copiedRoom.room.room_type
      });

      for (const surface of copiedRoom.surfaces) {
        const newSurface = await createSurface.mutateAsync({
          room_id: newRoom.id,
          project_id: actualProjectId,
          name: surface.name,
          surface_type: surface.surface_type,
          width: surface.width,
          height: surface.height,
          surface_width: surface.surface_width,
          surface_height: surface.surface_height
        });

        const surfaceTreatments = copiedRoom.treatments.filter((t: any) => t.window_id === surface.id);
        for (const treatment of surfaceTreatments) {
          await createTreatment.mutateAsync({
            window_id: newSurface.id,
            room_id: newRoom.id,
            project_id: actualProjectId,
            treatment_type: treatment.treatment_type,
            product_name: treatment.product_name,
            material_cost: treatment.material_cost,
            labor_cost: treatment.labor_cost,
            total_price: treatment.total_price,
            status: treatment.status
          });
        }
      }
    } catch (error) {
      console.error("Failed to paste room:", error);
    }
  };

  const handleCreateTreatment = async (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => {
    try {
      console.log("Creating treatment with data:", {
        roomId,
        surfaceId,
        treatmentType,
        treatmentData,
        actualProjectId
      });

      let finalSurfaceId = surfaceId;
      
      // If no surfaceId provided or invalid, create a default window surface
      if (!surfaceId || surfaceId === "") {
        console.log("No surface provided, creating default window for treatment");
        
        const roomSurfaces = allSurfaces?.filter(s => s.room_id === roomId) || [];
        const surfaceNumber = roomSurfaces.length + 1;
        
        const defaultSurface = await createSurface.mutateAsync({
          room_id: roomId,
          project_id: actualProjectId,
          name: `Window ${surfaceNumber}`,
          surface_type: 'window',
          width: 60,
          height: 48,
          surface_width: 60,
          surface_height: 48
        });
        
        finalSurfaceId = defaultSurface.id;
        console.log("Created default surface:", defaultSurface);
      }

      const treatmentPayload = {
        window_id: finalSurfaceId,
        room_id: roomId,
        project_id: actualProjectId,
        treatment_type: treatmentType,
        status: "planned",
        product_name: treatmentData?.product_name || treatmentType,
        material_cost: treatmentData?.material_cost || 0,
        labor_cost: treatmentData?.labor_cost || 0,
        total_price: treatmentData?.total_price || 0,
        unit_price: treatmentData?.unit_price || 0,
        quantity: treatmentData?.quantity || 1,
        fabric_type: treatmentData?.fabric_details?.fabricName,
        color: treatmentData?.color,
        pattern: treatmentData?.pattern,
        hardware: treatmentData?.hardware,
        mounting_type: treatmentData?.treatment_details?.mounting,
        notes: treatmentData?.notes,
        // Store additional structured data as JSON
        ...(treatmentData?.measurements && {
          measurements: JSON.stringify(treatmentData.measurements)
        }),
        ...(treatmentData?.fabric_details && {
          fabric_details: JSON.stringify(treatmentData.fabric_details)
        }),
        ...(treatmentData?.treatment_details && {
          treatment_details: JSON.stringify(treatmentData.treatment_details)
        }),
        ...(treatmentData?.calculation_details && {
          calculation_details: JSON.stringify(treatmentData.calculation_details)
        })
      };

      console.log("Final treatment payload:", treatmentPayload);
      
      // Validate required fields
      if (!finalSurfaceId) {
        throw new Error("Surface ID is required for treatment creation");
      }
      if (!roomId) {
        throw new Error("Room ID is required for treatment creation");
      }
      if (!actualProjectId) {
        throw new Error("Project ID is required for treatment creation");
      }
      
      const result = await createTreatment.mutateAsync(treatmentPayload);
      console.log("Treatment created successfully:", result);
      
      // Force refetch to ensure UI updates
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      return result;
    } catch (error) {
      console.error("Failed to create treatment:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        roomId,
        surfaceId,
        actualProjectId
      });
      throw error;
    }
  };

  return {
    rooms,
    roomsLoading,
    allSurfaces,
    allTreatments,
    createRoom,
    updateRoom,
    deleteRoom,
    handleCreateRoom,
    handleRenameRoom,
    handleCreateSurface,
    handleUpdateSurface,
    handleDeleteSurface,
    handleCopyRoom,
    handlePasteRoom,
    handleCreateTreatment,
    handleChangeRoomType
  };
};
