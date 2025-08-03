
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
    const treatmentTotal = roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
    
    // Only use treatment totals if they exist, otherwise fall back to worksheet calculations
    if (treatmentTotal > 0) {
      total = treatmentTotal;
    } else if (clientMeasurements) {
      // Get measurements for this specific room using room_id
      const roomMeasurements = clientMeasurements.filter(measurement => 
        measurement.project_id === projectId && 
        measurement.room_id === room.id
      );
      
      console.log(`Room ${room.name} measurements:`, roomMeasurements);
      
      // Calculate total from worksheet measurements
      roomMeasurements.forEach(measurement => {
        if (measurement.measurements) {
          const measurements = measurement.measurements as Record<string, any>;
          
          // Look for actual cost fields that might exist in the measurement data
          const fabricCost = Number(measurements.fabric_total_cost || measurements.fabric_cost || measurements.fabric_price || 0);
          const liningCost = Number(measurements.lining_total_cost || measurements.lining_cost || measurements.lining_price || 0);
          const manufacturingCost = Number(measurements.manufacturing_total_cost || measurements.manufacturing_cost || measurements.labor_cost || 0);
          const totalCost = Number(measurements.total_cost || measurements.total_price || 0);
          
          console.log(`Measurement ${measurement.id} costs:`, { 
            fabricCost, 
            liningCost, 
            manufacturingCost, 
            totalCost,
            allMeasurements: measurements 
          });
          
          // Use total cost if available, otherwise sum individual components
          if (totalCost > 0) {
            total += totalCost;
          } else if (fabricCost > 0 || liningCost > 0 || manufacturingCost > 0) {
            total += fabricCost + liningCost + manufacturingCost;
          } else {
            // If no cost data, try to calculate a basic estimate based on dimensions
            const railWidth = Number(measurements.rail_width || 0);
            const drop = Number(measurements.drop || 0);
            if (railWidth > 0 && drop > 0) {
              // Very basic estimate: $10 per square foot
              const squareFeet = (railWidth * drop) / 144; // convert inches to sq ft
              const estimatedCost = squareFeet * 10;
              total += estimatedCost;
              console.log(`Using estimated cost for measurement ${measurement.id}: $${estimatedCost.toFixed(2)}`);
            }
          }
        }
      });
    }
    
    console.log(`Room ${room.name} total: ${total}`);
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
