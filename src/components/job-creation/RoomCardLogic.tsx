
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
    console.log(`Room ID: ${room.id}`);
    console.log(`Project ID: ${projectId}`);
    console.log(`Client ID: ${clientId}`);
    
    let total = 0;
    
    // Sum up all treatment total_price values
    const treatmentTotal = roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
    console.log(`Treatment total: ${treatmentTotal}`);
    console.log(`Room treatments:`, roomTreatments);
    
    // Only use treatment totals if they exist, otherwise fall back to worksheet calculations
    if (treatmentTotal > 0) {
      total = treatmentTotal;
      console.log(`Using treatment total: ${total}`);
    } else if (clientMeasurements) {
      console.log(`All client measurements:`, clientMeasurements);
      
      // Get measurements for this specific room using room_id
      const roomMeasurements = clientMeasurements.filter(measurement => 
        measurement.project_id === projectId && 
        measurement.room_id === room.id
      );
      
      console.log(`Filtered room measurements for room ${room.id}:`, roomMeasurements);
      
      // Calculate total from worksheet measurements
      roomMeasurements.forEach(measurement => {
        console.log(`Processing measurement ${measurement.id}:`, measurement);
        
        if (measurement.measurements) {
          const measurements = measurement.measurements as Record<string, any>;
          console.log(`Measurement data:`, measurements);
          
          // Look for actual cost fields that might exist in the measurement data
          const fabricCost = Number(measurements.fabric_total_cost || measurements.fabric_cost || measurements.fabric_price || 0);
          const liningCost = Number(measurements.lining_total_cost || measurements.lining_cost || measurements.lining_price || 0);
          const manufacturingCost = Number(measurements.manufacturing_total_cost || measurements.manufacturing_cost || measurements.labor_cost || 0);
          const totalCost = Number(measurements.total_cost || measurements.total_price || 0);
          
          console.log(`Cost breakdown:`, { 
            fabricCost, 
            liningCost, 
            manufacturingCost, 
            totalCost
          });
          
          // Use total cost if available, otherwise sum individual components
          if (totalCost > 0) {
            total += totalCost;
            console.log(`Added total cost: ${totalCost}, running total: ${total}`);
          } else if (fabricCost > 0 || liningCost > 0 || manufacturingCost > 0) {
            const componentTotal = fabricCost + liningCost + manufacturingCost;
            total += componentTotal;
            console.log(`Added component total: ${componentTotal}, running total: ${total}`);
          } else {
            // If no cost data, try to calculate a basic estimate based on dimensions
            const railWidth = Number(measurements.rail_width || 0);
            const drop = Number(measurements.drop || 0);
            console.log(`No cost data found, using dimensions: rail_width=${railWidth}, drop=${drop}`);
            
            if (railWidth > 0 && drop > 0) {
              // Very basic estimate: $10 per square foot
              const squareFeet = (railWidth * drop) / 144; // convert inches to sq ft
              const estimatedCost = squareFeet * 10;
              total += estimatedCost;
              console.log(`Using estimated cost: $${estimatedCost.toFixed(2)}, running total: ${total}`);
            }
          }
        }
      });
    } else {
      console.log(`No client measurements found`);
    }
    
    console.log(`=== FINAL ROOM TOTAL FOR ${room.name}: ${total} ===`);
    return total;
  }, [roomTreatments, roomSurfaces, clientMeasurements, projectId, room.id, room.name]);

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
