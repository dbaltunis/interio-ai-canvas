
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
    console.log("=== ROOM TOTAL CALCULATION ===");
    console.log("Room:", room.id, room.name);
    console.log("roomTreatments:", roomTreatments);
    console.log("roomSurfaces:", roomSurfaces);
    
    let total = 0;
    
    // Sum up all treatment total_price values
    const treatmentTotal = roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
    total += treatmentTotal;
    console.log("Treatment total:", treatmentTotal);
    
    // If no treatments have prices, try to get from worksheet calculations
    if (treatmentTotal === 0 && clientMeasurements && roomSurfaces.length > 0) {
      console.log("No treatment prices, checking worksheets...");
      
      // Get measurements that belong specifically to this room's surfaces
      const roomMeasurements = clientMeasurements.filter(measurement => {
        // Direct room association
        if (measurement.room_id === room.id) {
          console.log("Found measurement by room_id:", measurement.id);
          return true;
        }
        
        // Check if measurement is associated with surfaces in this room
        if (measurement.notes && roomSurfaces.length > 0) {
          const belongsToThisRoom = roomSurfaces.some(surface => {
            const matches = measurement.notes === surface.name ||
                          measurement.notes.includes(`${surface.name} -`) ||
                          measurement.notes.includes(`- ${surface.name}`);
            if (matches) {
              console.log("Found measurement by surface name match:", measurement.id, "for surface:", surface.name);
            }
            return matches;
          });
          return belongsToThisRoom;
        }
        
        return false;
      });
      
      console.log("Filtered measurements for this room:", roomMeasurements);
      
      // Calculate total from worksheet measurements
      roomMeasurements.forEach(measurement => {
        if (measurement.measurements) {
          const measurements = measurement.measurements as Record<string, any>;
          
          // Calculate totals from measurement components (use actual values, not hardcoded)
          const fabricCost = Number(measurements.fabric_total_cost || measurements.fabric_total_price || 0);
          const liningCost = Number(measurements.lining_cost || measurements.lining_price || 0);
          const manufacturingCost = Number(measurements.manufacturing_cost || measurements.manufacturing_price || 0);
          
          const measurementTotal = fabricCost + liningCost + manufacturingCost;
          console.log("Measurement total:", measurementTotal, "from measurement:", measurement.id);
          console.log("  - Fabric:", fabricCost, "Lining:", liningCost, "Manufacturing:", manufacturingCost);
          
          total += measurementTotal;
        }
      });
    }
    
    console.log("=== FINAL ROOM TOTAL:", total, "for room:", room.name, "===");
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
