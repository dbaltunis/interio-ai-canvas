
import { useState, useMemo } from "react";
import { useTreatments } from "@/hooks/useTreatments";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";

export const useRoomCardLogic = (room: any, projectId: string, clientId?: string, onCreateTreatment?: (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => void) => {
  const { data: allTreatments } = useTreatments(projectId);
  const { data: allSurfaces, isLoading: surfacesLoading } = useSurfaces(projectId);
  const { data: clientMeasurements } = useClientMeasurements(clientId);
  
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
  
  const roomTotal = useMemo(() => {
    let total = 0;
    
    // Sum up all treatment total_price values
    total += roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
    
    // If no treatments or treatments have no price, include worksheet calculations
    if (total === 0 && clientMeasurements) {
      // Get measurements for surfaces in this room
      const roomSurfaceIds = roomSurfaces.map(s => s.id);
      const roomMeasurements = clientMeasurements.filter(measurement => 
        measurement.project_id === projectId && 
        roomSurfaces.some(surface => 
          measurement.notes?.includes(surface.name) || 
          surface.room_id === room.id
        )
      );
      
      // Calculate total from worksheet measurements
      roomMeasurements.forEach(measurement => {
        if (measurement.measurements) {
          const measurements = measurement.measurements as Record<string, any>;
          
          // Calculate totals from measurement components
          const fabricCost = Number(measurements.fabric_total_cost || measurements.fabric_total_price || 756);
          const liningCost = Number(measurements.lining_cost || measurements.lining_price || 277);
          const manufacturingCost = Number(measurements.manufacturing_cost || measurements.manufacturing_price || 336);
          
          // Add worksheet total to room total
          total += fabricCost + liningCost + manufacturingCost;
        }
      });
    }
    
    return total;
  }, [roomTreatments, roomSurfaces, clientMeasurements, projectId, room.id]);

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
    pricingFormOpen,
    setPricingFormOpen,
    calculatorDialogOpen,
    setCalculatorDialogOpen,
    currentFormData,
    handleAddTreatment
  };
};
