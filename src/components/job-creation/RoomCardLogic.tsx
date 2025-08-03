
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
      
      // Sum up all window treatment costs in this room
      roomMeasurements.forEach(measurement => {
        if (measurement.measurements) {
          const measurements = measurement.measurements as Record<string, any>;
          
          // Calculate total from all cost components
          const fabricTotal = Number(measurements.fabric_total_cost || measurements.fabric_total_price || 0);
          const liningCost = Number(measurements.lining_cost || measurements.lining_price || 0);
          const manufacturingCost = Number(measurements.manufacturing_cost || measurements.labor_cost || 0);
          const explicitTotal = Number(measurements.total_cost || measurements.total_price || 0);
          
          // Use explicit total if available, otherwise calculate from components
          const measurementTotal = explicitTotal > 0 ? explicitTotal : (fabricTotal + liningCost + manufacturingCost);
          
          if (measurementTotal > 0) {
            total += measurementTotal;
            console.log(`Added £${measurementTotal} from measurement ${measurement.id}, running total: £${total}`);
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
