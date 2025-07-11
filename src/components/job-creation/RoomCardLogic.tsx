
import { useState, useMemo } from "react";
import { useTreatments } from "@/hooks/useTreatments";
import { useSurfaces } from "@/hooks/useSurfaces";

export const useRoomCardLogic = (room: any, projectId: string) => {
  const { data: allTreatments } = useTreatments(projectId);
  const { data: allSurfaces, isLoading: surfacesLoading } = useSurfaces(projectId);
  
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
  
  const roomTotal = useMemo(() => 
    roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0),
    [roomTreatments]
  );

  // Remove surface creation logic from here - it will be handled by parent

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
    currentFormData,
    handleAddTreatment
  };
};
