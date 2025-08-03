
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
    console.log(`=== ROOM TOTAL CALCULATION FOR ${room.name} ===`);
    let total = 0;
    
    // First check if we have any treatments with pricing
    const treatmentTotal = roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
    
    if (treatmentTotal > 0) {
      console.log(`Using treatment total: £${treatmentTotal}`);
      total = treatmentTotal;
    } else if (clientMeasurements) {
      // Get measurements for this specific room
      const roomMeasurements = clientMeasurements.filter(measurement => 
        measurement.project_id === projectId && 
        measurement.room_id === room.id
      );
      
      console.log(`Found ${roomMeasurements.length} measurements for room ${room.name}`);
      
      // Sum up all window treatment costs in this room using same calculation as SurfaceList
      roomMeasurements.forEach(measurement => {
        if (measurement.measurements) {
          const measurements = measurement.measurements as Record<string, any>;
          
          const railWidth = Number(measurements.rail_width || 0);
          const drop = Number(measurements.drop || 0);
          
          if (railWidth > 0 && drop > 0) {
            const squareFeet = (railWidth * drop) / 144;
            
            // Use the same calculation as in SurfaceList for consistency
            const fabricTotal = squareFeet * 8; // £8 per sq ft for fabric
            const liningType = measurements.selected_lining || measurements.lining_type;
            const liningCost = (liningType && liningType !== 'none' && liningType !== 'None') ? squareFeet * 3 : 0;
            const manufacturingCost = squareFeet * 4; // £4 per sq ft for manufacturing
            
            const measurementTotal = fabricTotal + liningCost + manufacturingCost;
            total += measurementTotal;
            console.log(`Added £${measurementTotal.toFixed(2)} from measurement ${measurement.id}, running total: £${total.toFixed(2)}`);
          }
        }
      });
    }
    
    console.log(`=== FINAL ROOM TOTAL FOR ${room.name}: £${total} ===`);
    return total;
  }, [roomTreatments, clientMeasurements, projectId, room.id, room.name]);

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
