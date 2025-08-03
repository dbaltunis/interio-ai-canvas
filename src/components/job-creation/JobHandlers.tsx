
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useSurfaces, useCreateSurface, useUpdateSurface, useDeleteSurface } from "@/hooks/useSurfaces";
import { useTreatments, useCreateTreatment, useUpdateTreatment, useDeleteTreatment } from "@/hooks/useTreatments";
import { useClientMeasurements, useCreateClientMeasurement } from "@/hooks/useClientMeasurements";
import { useToast } from "@/hooks/use-toast";

export const useJobHandlers = (project: any) => {
  const { toast } = useToast();
  const projectId = project?.project_id || project?.id;
  const clientId = project?.client_id;
  
  const { data: rooms, isLoading: roomsLoading } = useRooms(projectId);
  const { data: allSurfaces } = useSurfaces(projectId);
  const { data: allTreatments } = useTreatments(projectId);
  const { data: clientMeasurements } = useClientMeasurements(clientId);
  
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const createSurface = useCreateSurface();
  const updateSurface = useUpdateSurface();
  const deleteSurface = useDeleteSurface();
  const createTreatment = useCreateTreatment();
  const updateTreatment = useUpdateTreatment();
  const deleteTreatment = useDeleteTreatment();
  const createClientMeasurement = useCreateClientMeasurement();

  const handleCreateRoom = async () => {
    if (!projectId) return;
    
    try {
      const roomNumber = (rooms?.length || 0) + 1;
      await createRoom.mutateAsync({
        project_id: projectId,
        name: `Room ${roomNumber}`,
        room_type: "living_room"
      });

      toast({
        title: "Success",
        description: `Room created successfully`,
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
      
      // Create surface only - measurement will be created separately when needed
      const surface = await createSurface.mutateAsync({
        room_id: roomId,
        project_id: projectId,
        name: `Window ${windowNumber}`,
        surface_type: surfaceType,
        width: 60,
        height: 48
      });

      // Check if measurement already exists for this surface
      const existingMeasurement = clientMeasurements?.find(m => 
        m.notes?.includes(surface.name) && m.project_id === projectId
      );

      // Only create measurement if one doesn't already exist
      if (!existingMeasurement) {
        await createClientMeasurement.mutateAsync({
          client_id: clientId || null,
          project_id: projectId,
          measurement_type: 'standard_window',
          measurements: {
            measurement_a: 60, // Window width
            measurement_b: 48, // Window height
            measurement_e: 48, // Total height
            measurement_f: 60, // Total width
          },
          photos: [],
          notes: `Measurement worksheet for ${surface.name}`,
          measured_at: new Date().toISOString(),
        });
      }

      toast({
        title: "Success",
        description: `Window added successfully`,
      });
    } catch (error) {
      console.error("Failed to create window:", error);
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
          project_id: projectId,
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
        project_id: projectId,
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
    clientMeasurements,
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
