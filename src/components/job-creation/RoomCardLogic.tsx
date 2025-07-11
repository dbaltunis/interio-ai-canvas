
import { useState, useMemo } from "react";
import { useTreatments } from "@/hooks/useTreatments";
import { useSurfaces, useCreateSurface } from "@/hooks/useSurfaces";

export const useRoomCardLogic = (room: any, projectId: string) => {
  const { data: allTreatments } = useTreatments(projectId);
  const { data: allSurfaces, isLoading: surfacesLoading, refetch: refetchSurfaces } = useSurfaces(projectId);
  const createSurface = useCreateSurface();
  
  const [pricingFormOpen, setPricingFormOpen] = useState(false);
  const [calculatorDialogOpen, setCalculatorDialogOpen] = useState(false);
  const [isCreatingSurface, setIsCreatingSurface] = useState(false);
  
  const [currentFormData, setCurrentFormData] = useState({
    treatmentType: "",
    surfaceId: "",
    surfaceType: "",
    windowCovering: null as any
  });

  const roomSurfaces = useMemo(() => 
    allSurfaces?.filter(s => s.room_id === room.id) || [], 
    [allSurfaces, room.id]
  );
  
  const roomTreatments = useMemo(() => 
    allTreatments?.filter(t => t.room_id === room.id) || [], 
    [allTreatments, room.id]
  );
  
  const roomTotal = useMemo(() => 
    roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0),
    [roomTreatments]
  );

  const handleSurfaceCreation = async (surfaceType: 'window' | 'wall') => {
    console.log("=== SURFACE CREATION DEBUG ===");
    console.log("Surface type:", surfaceType);
    console.log("Room ID:", room.id);
    console.log("Project ID:", projectId);
    console.log("Current room surfaces:", roomSurfaces);
    
    if (!surfaceType) {
      console.error("No surface type provided");
      return;
    }
    
    if (!room.id) {
      console.error("No room ID available");
      return;
    }
    
    if (!projectId) {
      console.error("No project ID available");
      return;
    }
    
    setIsCreatingSurface(true);
    
    try {
      const surfaceNumber = roomSurfaces.length + 1;
      const surfaceName = surfaceType === 'wall' ? `Wall ${surfaceNumber}` : `Window ${surfaceNumber}`;
      
      const surfaceData = {
        room_id: room.id,
        project_id: projectId,
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
      
      setTimeout(() => {
        console.log("Refetching surfaces...");
        refetchSurfaces();
      }, 100);
      
    } catch (error) {
      console.error("Failed to create surface:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
    } finally {
      setIsCreatingSurface(false);
    }
  };

  const handleAddTreatment = (surfaceId: string, treatmentType: string, windowCovering?: any) => {
    const surface = roomSurfaces.find(s => s.id === surfaceId);
    
    const formData = {
      treatmentType,
      surfaceId,
      surfaceType: surface?.surface_type || 'window',
      windowCovering
    };
    
    setCurrentFormData(formData);
    
    if (windowCovering?.making_cost_id) {
      setCalculatorDialogOpen(true);
    } else {
      setPricingFormOpen(true);
    }
  };

  return {
    allSurfaces,
    allTreatments,
    surfacesLoading,
    roomSurfaces,
    roomTreatments,
    roomTotal,
    pricingFormOpen,
    setPricingFormOpen,
    calculatorDialogOpen,
    setCalculatorDialogOpen,
    isCreatingSurface,
    currentFormData,
    handleSurfaceCreation,
    handleAddTreatment
  };
};
