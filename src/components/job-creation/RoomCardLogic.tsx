
import { useState, useMemo } from "react";
import { useTreatments } from "@/hooks/useTreatments";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { calculateFabricUsage } from "./treatment-pricing/fabric-calculation/fabricUsageCalculator";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";

export const useRoomCardLogic = (room: any, projectId: string, clientId?: string, onCreateTreatment?: (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => void) => {
  const { data: allTreatments } = useTreatments(projectId);
  const { data: allSurfaces, isLoading: surfacesLoading } = useSurfaces(projectId);
  const { data: clientMeasurements } = useClientMeasurements(clientId);
  const { data: projectSummaries } = useProjectWindowSummaries(projectId);
  
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

    // First priority: Sum all window summaries for this room
    const summaryRoomTotal = (projectSummaries?.windows || [])
      .filter((w) => w.room_id === room.id)
      .reduce((sum, w) => sum + Number(w.summary?.total_cost || 0), 0);

    if (summaryRoomTotal > 0) {
      console.log(`Found ${(projectSummaries?.windows || []).filter((w) => w.room_id === room.id).length} window summaries`);
      console.log(`Window summaries total: £${summaryRoomTotal.toFixed(2)}`);
      total += summaryRoomTotal;
    }

    // Second priority: Add all treatment totals for this room
    const treatmentTotal = roomTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
    if (treatmentTotal > 0) {
      console.log(`Found ${roomTreatments.length} treatments`);
      console.log(`Treatment total: £${treatmentTotal.toFixed(2)}`);
      total += treatmentTotal;
    }

    // Third priority: If no summaries or treatments, use legacy measurement calculations
    if (total === 0 && clientMeasurements) {
      const roomMeasurements = clientMeasurements.filter(
        (measurement) => measurement.project_id === projectId && measurement.room_id === room.id
      );

      console.log(`Found ${roomMeasurements.length} measurements for room ${room.name}`);

      roomMeasurements.forEach((measurement) => {
        if (measurement.measurements) {
          const measurements = measurement.measurements as Record<string, any>;

          const railWidth = Number(measurements.rail_width || 0);
          const drop = Number(measurements.drop || 0);

          console.log(`Processing measurement ${measurement.id}: ${railWidth}" × ${drop}"`);

          if (railWidth > 0 && drop > 0) {
            // Use proper fabric calculation (kept for compatibility)
            const formData = {
              rail_width: measurements.rail_width,
              drop: measurements.drop,
              heading_fullness: 2.5,
              fabric_width: 140,
              quantity: 1,
              fabric_type: 'plain',
            };

            const calculation = calculateFabricUsage(formData, []);

            // Legacy rough costs
            const fabricMetres = 2 * (drop / 100); // 2 widths × drop in metres
            const fabricTotal = fabricMetres * 45;

            const liningType = measurements.selected_lining || measurements.lining_type;
            const liningCostPerMetre = liningType === 'Interlining' ? 26.63 : 15;
            const liningCost =
              liningType && liningType !== 'none' && liningType !== 'None' ? fabricMetres * liningCostPerMetre : 0;

            const areaSqM = (railWidth * drop) / 10000;
            const manufacturingCost = areaSqM * 20;

            const measurementTotal = fabricTotal + liningCost + manufacturingCost;
            total += measurementTotal;

            console.log(`ROOM CALC using exact worksheet total:`);
            console.log(`  Measurement ID: ${measurement.id}`);
            console.log(`  Dimensions: ${railWidth}" × ${drop}"`);
            console.log(`  Window Total: £${measurementTotal.toFixed(2)} (from worksheet)`);
            console.log(`  Running Room Total: £${total.toFixed(2)}`);
          } else {
            console.log(
              `Skipping measurement ${measurement.id} - missing dimensions: rail_width=${railWidth}, drop=${drop}`
            );
          }
        }
      });
    }

    console.log(`=== FINAL ROOM TOTAL FOR ${room.name}: £${total.toFixed(2)} ===`);
    return total;
  }, [projectSummaries, roomTreatments, clientMeasurements, projectId, room.id, room.name]);

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
