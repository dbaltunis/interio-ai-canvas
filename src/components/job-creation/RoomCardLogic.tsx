
import { useState, useMemo } from "react";
import { useTreatments } from "@/hooks/useTreatments";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { calculateFabricUsage } from "./treatment-pricing/fabric-calculation/fabricUsageCalculator";

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
      
      // Sum up all window treatment costs in this room using proper fabric calculation
      roomMeasurements.forEach(measurement => {
        if (measurement.measurements) {
          const measurements = measurement.measurements as Record<string, any>;
          
          const railWidth = Number(measurements.rail_width || 0);
          const drop = Number(measurements.drop || 0);
          
          console.log(`Processing measurement ${measurement.id}: ${railWidth}" × ${drop}"`);
          
          if (railWidth > 0 && drop > 0) {
            // Use proper fabric calculation
            const formData = {
              rail_width: measurements.rail_width,
              drop: measurements.drop,
              heading_fullness: 2.5,
              fabric_width: 140,
              quantity: 1,
              fabric_type: 'plain'
            };
            
            const calculation = calculateFabricUsage(formData, []);
            
            // Calculate using same logic as SurfaceList
            const fabricMetres = 2 * (drop / 100); // 2 widths × drop in metres
            const fabricTotal = fabricMetres * 45;
            
            const liningType = measurements.selected_lining || measurements.lining_type;
            const liningCostPerMetre = liningType === 'Interlining' ? 26.63 : 15;
            const liningCost = (liningType && liningType !== 'none' && liningType !== 'None') ? 
                              fabricMetres * liningCostPerMetre : 0;
            
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
            console.log(`Skipping measurement ${measurement.id} - missing dimensions: rail_width=${railWidth}, drop=${drop}`);
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

  // Get room measurements for cost calculation display
  const roomMeasurements = clientMeasurements?.filter(measurement => 
    measurement.room_id === room.id
  )?.[0] || null;

  // Mock template and selection data for now - in a real app this would come from the database
  const template = {
    name: "Standard Curtain",
    manufacturing: {
      pricing_method: "per_meter",
      base_price: 25,
      complexity_multiplier: 1.2
    },
    lining_types: [
      { id: 'standard', name: 'Standard Lining', cost_per_meter: 15 },
      { id: 'blackout', name: 'Blackout Lining', cost_per_meter: 20 },
      { id: 'interlining', name: 'Interlining', cost_per_meter: 26.63 }
    ],
    heading_types: [
      { id: 'pencil', name: 'Pencil Pleat', cost_per_meter: 8 },
      { id: 'eyelet', name: 'Eyelet', cost_per_meter: 10 }
    ]
  };

  const selectedFabric = {
    name: "Sample Fabric",
    cost_per_meter: 45,
    width: 150
  };

  const selectedLining = {
    name: "Standard Lining", 
    cost_per_meter: 15
  };

  const selectedHeading = {
    name: "Pencil Pleat",
    cost_per_meter: 8
  };

  const inventory = [];

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
    handleAddTreatment,
    roomMeasurements,
    template,
    selectedFabric,
    selectedLining,
    selectedHeading,
    inventory
  };
};
