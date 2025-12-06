
import { useState, useMemo } from "react";
import { useTreatments } from "@/hooks/useTreatments";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { calculateFabricUsage } from "./treatment-pricing/fabric-calculation/fabricUsageCalculator";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { useRoomProducts } from "@/hooks/useRoomProducts";

export const useRoomCardLogic = (room: any, projectId: string, clientId?: string, onCreateTreatment?: (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => void) => {
  const { data: allTreatments } = useTreatments(projectId);
  const { data: allSurfaces, isLoading: surfacesLoading } = useSurfaces(projectId);
  const { data: clientMeasurements } = useClientMeasurements(clientId);
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
  
  const roomTotal = useMemo(() => {
    console.log(`=== ROOM TOTAL CALCULATION FOR ${room.name} ===`);
    
    let total = 0;

    // First priority: Sum all window summaries for this room (most accurate)
    const windowSummariesForRoom = (projectSummaries?.windows || [])
      .filter((w) => w.room_id === room.id);
    
    // CRITICAL: Calculate from cost_breakdown items (matching WindowSummaryCard displayTotal logic)
    const summaryRoomTotal = windowSummariesForRoom.reduce((sum, w) => {
      if (!w.summary) return sum;
      
      console.log(`🔍 Window ${w.window_id}:`, {
        has_breakdown: Array.isArray(w.summary.cost_breakdown),
        breakdown_length: w.summary.cost_breakdown?.length,
        stored_total_cost: w.summary.total_cost,
        breakdown_items: w.summary.cost_breakdown
      });
      
      // If cost_breakdown exists, sum all breakdown items (same as displayTotal)
      if (Array.isArray(w.summary.cost_breakdown) && w.summary.cost_breakdown.length > 0) {
        const breakdownTotal = w.summary.cost_breakdown.reduce((itemSum: number, item: any) => {
          const cost = Number(item.total_cost) || 0;
          console.log(`  - ${item.name}: ${cost}`);
          return itemSum + cost;
        }, 0);
        console.log(`  ✅ Using breakdown total: ${breakdownTotal}`);
        return sum + breakdownTotal;
      }
      
      // Fallback to stored total_cost if no breakdown
      console.log(`  ⚠️ No breakdown, using stored total_cost: ${w.summary.total_cost}`);
      return sum + Number(w.summary.total_cost || 0);
    }, 0);

    if (summaryRoomTotal > 0) {
      console.log(`Found ${windowSummariesForRoom.length} window summaries with costs`);
      console.log(`Window summaries total: £${summaryRoomTotal.toFixed(2)}`);
      total = summaryRoomTotal;
    } else {
      // Second priority: Sum all treatment totals for this room if no window summaries
      const treatmentTotal = roomTreatments.reduce((sum, t) => {
        const treatmentCost = Number(t.total_price || 0);
        console.log(`Treatment ${t.id}: £${treatmentCost.toFixed(2)}`);
        return sum + treatmentCost;
      }, 0);
      
      if (treatmentTotal > 0) {
        console.log(`Found ${roomTreatments.length} treatments`);
        console.log(`Treatment total: £${treatmentTotal.toFixed(2)}`);
        total = treatmentTotal;
      } else {
        // Third priority: Use legacy measurement calculations as fallback
        if (clientMeasurements) {
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
      }
    }

    // Add room products/services total
    const roomProductsTotal = roomProducts.reduce((sum, p) => sum + (p.total_price || 0), 0);
    if (roomProductsTotal > 0) {
      console.log(`Room products/services total: £${roomProductsTotal.toFixed(2)}`);
      total += roomProductsTotal;
    }

    console.log(`=== FINAL ROOM TOTAL FOR ${room.name}: £${total.toFixed(2)} ===`);
    return total;
  }, [projectSummaries, roomTreatments, clientMeasurements, projectId, room.id, room.name, roomProducts]);

  // Calculate project-wide total (sum of all windows across all rooms)
  const projectTotal = useMemo(() => {
    if (!projectSummaries?.windows) return 0;
    
    return projectSummaries.windows.reduce((sum, w) => {
      if (!w.summary) return sum;
      
      // Use cost_breakdown if available (most accurate)
      if (Array.isArray(w.summary.cost_breakdown) && w.summary.cost_breakdown.length > 0) {
        const breakdownTotal = w.summary.cost_breakdown.reduce((itemSum: number, item: any) => {
          return itemSum + (Number(item.total_cost) || 0);
        }, 0);
        return sum + breakdownTotal;
      }
      
      // Fallback to stored total_cost
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
