
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
    console.log("Calculating roomTotal for room:", room.id, room.name);
    console.log("roomTreatments:", roomTreatments);
    console.log("roomSurfaces:", roomSurfaces);
    console.log("all clientMeasurements:", clientMeasurements);
    
    let total = 0;
    
    // Sum up all treatment total_price values
    total += roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
    console.log("Total from treatments:", total);
    
    // If no treatments or treatments have no price, include worksheet calculations
    if (total === 0 && clientMeasurements && roomSurfaces.length > 0) {
      // More precise filtering: only get measurements that belong to surfaces in THIS specific room
      const roomMeasurements = clientMeasurements.filter(measurement => {
        // First check if measurement belongs to this project
        if (measurement.project_id !== projectId) return false;
        
        // Check if measurement has a room_id that matches this room
        if (measurement.room_id === room.id) return true;
        
        // Fallback: check if measurement notes mention a surface that belongs to this room
        if (measurement.notes) {
          return roomSurfaces.some(surface => 
            measurement.notes === surface.name || 
            measurement.notes.includes(`${surface.name} -`) ||
            measurement.notes.includes(`- ${surface.name}`)
          );
        }
        
        return false;
      });
      
      console.log("Filtered roomMeasurements for room", room.name, ":", roomMeasurements);
      
      // Calculate total from worksheet measurements
      roomMeasurements.forEach(measurement => {
        if (measurement.measurements) {
          const measurements = measurement.measurements as Record<string, any>;
          
          // Calculate totals from measurement components
          const fabricCost = Number(measurements.fabric_total_cost || measurements.fabric_total_price || 0);
          const liningCost = Number(measurements.lining_cost || measurements.lining_price || 0);
          const manufacturingCost = Number(measurements.manufacturing_cost || measurements.manufacturing_price || 0);
          
          const measurementTotal = fabricCost + liningCost + manufacturingCost;
          console.log("Adding measurement total:", measurementTotal, "from measurement:", measurement.id);
          
          // Add worksheet total to room total
          total += measurementTotal;
        }
      });
    }
    
    console.log("Final roomTotal for", room.name, ":", total);
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
