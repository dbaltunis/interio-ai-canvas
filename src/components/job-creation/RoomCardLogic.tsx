
import { useState, useMemo } from "react";
import { useTreatments } from "@/hooks/useTreatments";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { useRoomProducts } from "@/hooks/useRoomProducts";

export const useRoomCardLogic = (room: any, projectId: string, _clientId?: string, onCreateTreatment?: (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => void) => {
  const { data: allTreatments } = useTreatments(projectId);
  const { data: allSurfaces, isLoading: surfacesLoading } = useSurfaces(projectId);
  const { data: projectSummaries } = useProjectWindowSummaries(projectId);
  const { data: roomProducts = [] } = useRoomProducts(room.id);
  
  const [pricingFormOpen, setPricingFormOpen] = useState(false);
  const [calculatorDialogOpen, setCalculatorDialogOpen] = useState(false);
  
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
  
  // DISPLAY-ONLY ARCHITECTURE: Sum saved totals, no recalculations
  const roomTotal = useMemo(() => {
    console.log(`📊 [DISPLAY-ONLY] Room total for ${room.name}`);
    
    let total = 0;

    // Sum all window summaries for this room using saved values only
    const windowSummariesForRoom = (projectSummaries?.windows || [])
      .filter((w) => w.room_id === room.id);
    
    const summaryRoomTotal = windowSummariesForRoom.reduce((sum, w) => {
      if (!w.summary) return sum;
      
      // Use saved total_cost directly - no breakdown recalculation
      const windowTotal = Number(w.summary.total_cost || 0);
      console.log(`  Window ${w.window_id}: ${windowTotal}`);
      return sum + windowTotal;
    }, 0);

    total = summaryRoomTotal;

    // Add room products/services total (these are also saved values)
    const roomProductsTotal = roomProducts.reduce((sum, p) => sum + (p.total_price || 0), 0);
    if (roomProductsTotal > 0) {
      console.log(`  Products/services: ${roomProductsTotal}`);
      total += roomProductsTotal;
    }

    console.log(`📊 [DISPLAY-ONLY] Final room total: ${total}`);
    return total;
  }, [projectSummaries, room.id, room.name, roomProducts]);

  // DISPLAY-ONLY: Sum saved total_cost values directly
  const projectTotal = useMemo(() => {
    if (!projectSummaries?.windows) return 0;
    
    return projectSummaries.windows.reduce((sum, w) => {
      if (!w.summary) return sum;
      return sum + Number(w.summary.total_cost || 0);
    }, 0);
  }, [projectSummaries]);

  // Remove surface creation logic from here - it will be handled by parent

  const handleAddTreatment = (surfaceId: string, treatmentType: string, treatmentData?: any) => {
    if (treatmentData && onCreateTreatment) {
      // Direct treatment creation with data from WindowManagementDialog
      onCreateTreatment(room.id, surfaceId, treatmentType, treatmentData);
    } else {
      // Legacy flow for opening pricing form
      const surface = roomSurfaces.find(s => s.id === surfaceId);
      
      const formData = {
        treatmentType,
        surfaceId,
        surfaceType: surface?.surface_type || 'window',
        windowCovering: treatmentData
      };
      
      setCurrentFormData(formData);
      
      if (treatmentData?.making_cost_id) {
        setCalculatorDialogOpen(true);
      } else {
        setPricingFormOpen(true);
      }
    }
  };

  return {
    allSurfaces,
    allTreatments,
    surfacesLoading,
    roomSurfaces,
    roomTreatments,
    roomTotal,
    projectTotal,
    pricingFormOpen,
    setPricingFormOpen,
    calculatorDialogOpen,
    setCalculatorDialogOpen,
    currentFormData,
    handleAddTreatment
  };
};
