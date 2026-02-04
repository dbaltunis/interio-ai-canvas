import { useQueryClient } from "@tanstack/react-query";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/useRooms";
import { useSurfaces, useCreateSurface, useUpdateSurface, useDeleteSurface } from "@/hooks/useSurfaces";
import { useTreatments, useCreateTreatment, useUpdateTreatment, useDeleteTreatment } from "@/hooks/useTreatments";
import { useClientMeasurements, useCreateClientMeasurement } from "@/hooks/useClientMeasurements";
import { useFriendlyToast } from "@/hooks/use-friendly-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCanEditJob } from "@/hooks/useJobEditPermissions";

export const useJobHandlers = (project: any) => {
  const { showError, showSuccess, showInfo } = useFriendlyToast();
  const queryClient = useQueryClient();
  const projectId = project?.project_id || project?.id;
  const clientId = project?.client_id;
  // Use explicit permissions hook for edit checks
  const { canEditJob } = useCanEditJob(project);
  
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
    if (!canEditJob) {
      showError(new Error("permission denied"), { context: 'edit this job' });
      return;
    }
    
    if (!projectId) return;
    
    try {
      const roomNumber = (rooms?.length || 0) + 1;
      await createRoom.mutateAsync({
        project_id: projectId,
        name: `Room ${roomNumber}`,
        room_type: "living_room"
      });
    } catch (error) {
      // Error already handled in mutation onError
      console.error("Failed to create room:", error);
    }
  };

  const handleRenameRoom = async (roomId: string, newName: string) => {
    if (!canEditJob) {
      showError(new Error("permission denied"), { context: 'edit this job' });
      return;
    }
    
    try {
      await updateRoom.mutateAsync({ id: roomId, name: newName });
      showSuccess("Room updated", "Room name updated successfully");
    } catch (error) {
      // Error already handled in mutation onError
      console.error("Failed to rename room:", error);
    }
  };

  const handleChangeRoomType = async (roomId: string, roomType: string) => {
    if (!canEditJob) {
      showError(new Error("permission denied"), { context: 'edit this job' });
      return;
    }
    
    try {
      await updateRoom.mutateAsync({ id: roomId, room_type: roomType });
      showSuccess("Room updated", "Room type updated successfully");
    } catch (error) {
      // Error already handled in mutation onError
      console.error("Failed to change room type:", error);
    }
  };

  const handleCreateSurface = async (roomId: string, surfaceType: string) => {
    if (!canEditJob) {
      showError(new Error("permission denied"), { context: 'edit this job' });
      return;
    }
    
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

      return surface; // Return the created surface
    } catch (error) {
      // Error already handled in mutation onError
      console.error("Failed to create window:", error);
      throw error; // Re-throw so calling code can handle the error
    }
  };

  const handleUpdateSurface = async (surfaceId: string, updates: any) => {
    if (!canEditJob) {
      showError(new Error("permission denied"), { context: 'edit this job' });
      return;
    }
    
    try {
      await updateSurface.mutateAsync({ id: surfaceId, ...updates });
      showSuccess("Surface updated", "Surface updated successfully");
    } catch (error) {
      // Error already handled in mutation onError
      console.error("Failed to update surface:", error);
    }
  };

  const handleDeleteSurface = async (surfaceId: string) => {
    if (!canEditJob) {
      showError(new Error("permission denied"), { context: 'edit this job' });
      return;
    }
    
    try {
      await deleteSurface.mutateAsync(surfaceId);
      showSuccess("Surface deleted", "Surface deleted successfully");
    } catch (error) {
      // Error already handled in mutation onError
      console.error("Failed to delete surface:", error);
    }
  };

  const handleCopyRoom = async (room: any) => {
    if (!canEditJob) {
      showError(new Error("permission denied"), { context: 'edit this job' });
      return;
    }
    
    // Prevent duplicate copies if already in progress
    if (createRoom.isPending) {
      console.log("Room copy already in progress, ignoring duplicate request");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      showInfo("Copying room...", "Please wait while we duplicate the room and its contents");

      const newRoom = await createRoom.mutateAsync({
        project_id: projectId,
        name: `${room.name} Copy`,
        room_type: room.room_type
      });

      // Copy surfaces from the original room to the new room and build an ID map
      const roomSurfaces = allSurfaces?.filter(s => s.room_id === room.id) || [];
      const surfaceIdMap: Record<string, string> = {};
      for (const surface of roomSurfaces) {
        const newSurface = await createSurface.mutateAsync({
          room_id: newRoom.id,
          project_id: projectId,
          name: surface.name,
          surface_type: surface.surface_type,
          width: surface.width,
          height: surface.height,
          surface_width: surface.surface_width,
          surface_height: surface.surface_height,
          notes: surface.notes
        });
        surfaceIdMap[surface.id] = newSurface.id;
      }

      // Copy windows_summary data for each surface
      for (const [oldSurfaceId, newSurfaceId] of Object.entries(surfaceIdMap)) {
        const { data: oldSummary } = await supabase
          .from("windows_summary")
          .select("*")
          .eq("window_id", oldSurfaceId)
          .maybeSingle();

        if (oldSummary) {
          const { window_id, updated_at, ...summaryData } = oldSummary;
          await supabase
            .from("windows_summary")
            .upsert({
              ...summaryData,
              window_id: newSurfaceId
            });
        }
      }

      // Copy treatments and re-link to the newly created surfaces
      const roomTreatments = allTreatments?.filter(t => t.room_id === room.id) || [];
      for (const treatment of roomTreatments) {
        // If treatment has a window_id, map it to the new surface
        // If treatment has no window_id (room-level treatment), use null
        const mappedWindowId = treatment.window_id 
          ? surfaceIdMap[treatment.window_id] 
          : null;
        
        // Only skip if window_id existed but wasn't found in map
        if (treatment.window_id && !mappedWindowId) continue;
        
        await createTreatment.mutateAsync({
          project_id: projectId,
          room_id: newRoom.id,
          window_id: mappedWindowId,
          treatment_type: treatment.treatment_type,
          treatment_name: treatment.treatment_name,
          material_cost: treatment.material_cost,
          labor_cost: treatment.labor_cost,
          total_price: treatment.total_price,
          unit_price: treatment.unit_price,
          quantity: treatment.quantity,
          measurements: treatment.measurements,
          fabric_details: treatment.fabric_details,
          treatment_details: treatment.treatment_details,
          calculation_details: treatment.calculation_details,
          color: treatment.color,
          fabric_type: treatment.fabric_type,
          hardware: treatment.hardware,
          mounting_type: treatment.mounting_type,
          notes: treatment.notes,
          pattern: treatment.pattern,
          product_name: treatment.product_name,
          status: treatment.status
        });
      }

      // Copy room products from the original room to the new room
      const { data: roomProducts } = await supabase
        .from("room_products")
        .select("*")
        .eq("room_id", room.id);

      if (roomProducts && roomProducts.length > 0) {
        for (const product of roomProducts) {
          const { id, room_id, created_at, updated_at, ...productData } = product;
          await supabase
            .from("room_products")
            .insert({
              ...productData,
              room_id: newRoom.id,
              user_id: user.id
            });
        }
      }

      // Comprehensive query invalidations to refresh UI
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["rooms", projectId] });
      queryClient.invalidateQueries({ queryKey: ["surfaces"] });
      queryClient.invalidateQueries({ queryKey: ["surfaces", projectId] });
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      queryClient.invalidateQueries({ queryKey: ["treatments", projectId] });
      queryClient.invalidateQueries({ queryKey: ["window-summary"] });
      queryClient.invalidateQueries({ queryKey: ["project-window-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["project-window-summaries", projectId] });
      queryClient.invalidateQueries({ queryKey: ["room-products"] });
      queryClient.invalidateQueries({ queryKey: ["project-room-products"] });
      queryClient.invalidateQueries({ queryKey: ["project-room-products", projectId] });
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      
      // Invalidate specific window-summary queries for each new surface
      for (const newSurfaceId of Object.values(surfaceIdMap)) {
        queryClient.invalidateQueries({ queryKey: ["window-summary", newSurfaceId] });
      }

      showSuccess("Room copied", "Room copied successfully");
    } catch (error) {
      console.error("Failed to copy room:", error);
      showError(error, { context: 'copy room' });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!canEditJob) {
      showError(new Error("permission denied"), { context: 'edit this job' });
      return;
    }
    
    try {
      await deleteRoom.mutateAsync(roomId);
      showSuccess("Room deleted", "Room deleted successfully");
    } catch (error) {
      // Error already handled in mutation onError
      console.error("Failed to delete room:", error);
    }
  };

  const handleCreateTreatment = async (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => {
    if (!canEditJob) {
      showError(new Error("permission denied"), { context: 'edit this job' });
      return;
    }
    
    try {
      const payload: any = {
        project_id: projectId,
        room_id: roomId,
        window_id: surfaceId,
        treatment_type: treatmentType,
      };

      if (treatmentData) {
        payload.measurements = treatmentData.measurements || {};
        payload.fabric_details = treatmentData.fabric_details || {};
        payload.treatment_details = treatmentData.treatment_details || {};
        payload.calculation_details = treatmentData.calculation_details || {};
        payload.material_cost = treatmentData.material_cost ?? 0;
        payload.labor_cost = treatmentData.labor_cost ?? 0;
        payload.total_price = treatmentData.total_price ?? treatmentData.unit_price ?? 0;
        payload.unit_price = treatmentData.unit_price ?? treatmentData.total_price ?? 0;
        payload.quantity = treatmentData.quantity ?? 1;
      }

      await createTreatment.mutateAsync(payload);

      showSuccess("Treatment created", "Treatment created successfully");
    } catch (error) {
      // Error already handled in mutation onError
      console.error("Failed to create treatment:", error);
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
    handleDeleteRoom,
    handleCreateSurface,
    handleUpdateSurface,
    handleDeleteSurface,
    handleCopyRoom,
    handleCreateTreatment,
    createRoom
  };
};
