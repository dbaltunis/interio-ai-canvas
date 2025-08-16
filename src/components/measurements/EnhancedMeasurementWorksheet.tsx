import { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Save, Upload, Ruler, Package, Calculator } from "lucide-react";
import { useCreateClientMeasurement, useUpdateClientMeasurement } from "@/hooks/useClientMeasurements";
import { useRooms } from "@/hooks/useRooms";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { useInventory } from "@/hooks/useInventory";
import { useWindowCoverings, type WindowCovering } from "@/hooks/useWindowCoverings";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { VisualMeasurementSheet } from "./VisualMeasurementSheet";
import { TreatmentSpecificFields } from "./TreatmentSpecificFields";
import { TreatmentVisualizer } from "./TreatmentVisualizer";
import { HeadingOptionsSection } from "./dynamic-options/HeadingOptionsSection";
import { LiningOptionsSection } from "./dynamic-options/LiningOptionsSection";
import { FabricSelectionSection } from "./dynamic-options/FabricSelectionSection";
import { WindowCoveringSelector } from "./WindowCoveringSelector";

import { CostCalculationSummary } from "./dynamic-options/CostCalculationSummary";
import { useSaveWindowSummary, useWindowSummary } from "@/hooks/useWindowSummary";
import { calculateTreatmentPricing } from "@/utils/pricing/calculateTreatmentPricing";

interface EnhancedMeasurementWorksheetProps {
  clientId?: string; // Optional - measurements can exist without being assigned to a client
  projectId?: string;
  surfaceId?: string; // Add unique surface ID to isolate state
  currentRoomId?: string; // Add current room ID to preselect
  surfaceData?: any; // Add surface data to extract room_id from the surface itself
  existingMeasurement?: any;
  existingTreatments?: any[];
  onSave?: () => void;
  onClose?: () => void;
  onSaveTreatment?: (treatmentData: any) => void;
  readOnly?: boolean;
}

const WINDOW_TYPES = [
  { value: "standard", label: "Standard Window" },
  { value: "bay", label: "Bay Window" },
  { value: "french_doors", label: "French Doors" },
  { value: "sliding_doors", label: "Sliding Doors" },
  { value: "large_window", label: "Large Window" },
  { value: "corner_window", label: "Corner Window" }
];

export const EnhancedMeasurementWorksheet = forwardRef<
  { autoSave: () => Promise<void> },
  EnhancedMeasurementWorksheetProps
>(({ 
  clientId, 
  projectId,
  surfaceId,
  currentRoomId,
  surfaceData, 
  existingMeasurement, 
  existingTreatments = [],
  onSave,
  onClose,
  onSaveTreatment,
  readOnly = false
}, ref) => {
  // Create state keys that include surfaceId to isolate state per window
  const stateKey = surfaceId || 'default';
  
  // Load exact saved treatment data if editing an existing treatment
  const { data: savedSummary } = useWindowSummary(
    existingMeasurement?.use_saved_summary ? surfaceId : undefined
  );
  
  // Determine if we should use saved summary data
  const shouldUseSavedData = existingMeasurement?.use_saved_summary && savedSummary;
  
  console.log(`🔍 EnhancedMeasurementWorksheet for ${surfaceId}:`, {
    shouldUseSavedData,
    hasSavedSummary: !!savedSummary,
    useSavedSummaryFlag: existingMeasurement?.use_saved_summary
  });
  
  const [windowType, setWindowType] = useState(() => 
    existingMeasurement?.measurement_type || "standard"
  );
  const [selectedRoom, setSelectedRoom] = useState(() => 
    existingMeasurement?.room_id || surfaceData?.room_id || currentRoomId || "no_room"
  );
  const [selectedWindowCovering, setSelectedWindowCovering] = useState(() => 
    existingMeasurement?.window_covering_id || "no_covering"
  );
  
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [measurements, setMeasurements] = useState(() => {
    if (shouldUseSavedData && savedSummary) {
      console.log(`✅ Loading EXACT saved data for treatment ${surfaceId}`);
      // Load the exact saved measurements from the window summary
      return {
        rail_width: savedSummary.measurements_details?.rail_width,
        drop: savedSummary.measurements_details?.drop,
        window_width: savedSummary.measurements_details?.window_width,
        window_height: savedSummary.measurements_details?.window_height,
        selected_fabric: savedSummary.fabric_details?.fabric_id,
        fabric_width: savedSummary.fabric_details?.fabric_width,
        price_per_meter: savedSummary.price_per_meter,
        surface_id: surfaceId,
        surface_name: surfaceData?.name
      };
    }
    return existingMeasurement?.measurements ? { ...existingMeasurement.measurements } : {};
  });
  const [treatmentData, setTreatmentData] = useState<any>(() => {
    if (shouldUseSavedData && savedSummary) {
      console.log(`✅ Loading EXACT saved treatment data for ${surfaceId}`);
      return {
        treatment_type: savedSummary.template_details?.curtain_type || "curtains",
        fabric_details: savedSummary.fabric_details,
        lining_type: savedSummary.lining_type,
        manufacturing_type: savedSummary.manufacturing_type,
        selected_heading: savedSummary.heading_details?.heading_name,
        selected_lining: savedSummary.lining_type,
        total_cost: savedSummary.total_cost,
        pricing_breakdown: savedSummary.cost_breakdown
      };
    }
    return existingTreatments?.[0] ? { ...existingTreatments[0] } : {};
  });
  const [notes, setNotes] = useState(() => 
    existingMeasurement?.notes || ""
  );
  const [measuredBy, setMeasuredBy] = useState(() => 
    existingMeasurement?.measured_by || ""
  );
  const [photos, setPhotos] = useState<string[]>(() => 
    existingMeasurement?.photos || []
  );
  const [activeTab, setActiveTab] = useState("measurements");
  const [calculatedCost, setCalculatedCost] = useState(0);
  const [fabricCalculation, setFabricCalculation] = useState(null);
  
  // Dynamic options state - isolated per window
  const [selectedHeading, setSelectedHeading] = useState(() => {
    if (shouldUseSavedData && savedSummary) {
      return savedSummary.heading_details?.heading_name || "standard";
    }
    return existingTreatments?.[0]?.selected_heading || "standard";
  });
  const [selectedLining, setSelectedLining] = useState(() => {
    if (shouldUseSavedData && savedSummary) {
      return savedSummary.lining_type || "none";
    }
    return existingTreatments?.[0]?.selected_lining || "none";
  });
  const [selectedFabric, setSelectedFabric] = useState(() => {
    if (shouldUseSavedData && savedSummary) {
      return savedSummary.fabric_details?.fabric_id || "";
    }
    return existingTreatments?.[0]?.fabric_details?.fabric_id || 
           existingMeasurement?.measurements?.selected_fabric || 
           "";
  });

  const createMeasurement = useCreateClientMeasurement();
  const updateMeasurement = useUpdateClientMeasurement();
  const { data: rooms = [] } = useRooms(projectId);
  const { data: curtainTemplates = [] } = useCurtainTemplates();
  const { data: inventoryItems = [] } = useInventory();
  const { data: windowCoverings = [] } = useWindowCoverings();
  const { units } = useMeasurementUnits();
  const saveWindowSummary = useSaveWindowSummary();

  // Reset state when surface changes to ensure each window has independent state
  useEffect(() => {
    if (surfaceId) {
      console.log("EnhancedMeasurementWorksheet: Setting room selection", {
        existingMeasurementRoomId: existingMeasurement?.room_id,
        surfaceRoomId: surfaceData?.room_id,
        currentRoomId,
        finalSelection: existingMeasurement?.room_id || surfaceData?.room_id || currentRoomId || "no_room"
      });
      setWindowType(existingMeasurement?.measurement_type || "standard");
      setSelectedRoom(existingMeasurement?.room_id || surfaceData?.room_id || currentRoomId || "no_room");
      setSelectedWindowCovering(existingMeasurement?.window_covering_id || "no_covering");
      setSelectedInventoryItem(null);
      setMeasurements(existingMeasurement?.measurements ? { ...existingMeasurement.measurements } : {});
      setTreatmentData(existingTreatments?.[0] ? { ...existingTreatments[0] } : {});
      setNotes(existingMeasurement?.notes || "");
      setMeasuredBy(existingMeasurement?.measured_by || "");
      setPhotos(existingMeasurement?.photos || []);
      
      // Load fabric selections from saved data
      setSelectedHeading(
        existingTreatments?.[0]?.treatment_details?.selected_heading || 
        existingTreatments?.[0]?.selected_heading || 
        existingMeasurement?.measurements?.selected_heading || 
        "standard"
      );
      setSelectedLining(
        existingTreatments?.[0]?.treatment_details?.selected_lining || 
        existingTreatments?.[0]?.selected_lining || 
        existingMeasurement?.measurements?.selected_lining || 
        "none"
      );
      setSelectedFabric(
        existingTreatments?.[0]?.treatment_details?.selected_fabric || 
        existingTreatments?.[0]?.fabric_details?.fabric_id || 
        existingMeasurement?.measurements?.selected_fabric || 
        ""
      );
      setCalculatedCost(0);
    }
  }, [surfaceId, currentRoomId]); // Reset when surfaceId or currentRoomId changes

  // Get selected curtain template details
  const selectedCovering = curtainTemplates.find(c => c.id === selectedWindowCovering);

  // Filter inventory based on selected covering category
  const getInventoryForCovering = (covering: any) => {
    if (!covering) return [];
    
    const categoryMap = {
      fabric: "Fabric",
      hard: "Hardware"
    };
    
    return inventoryItems.filter(item => 
      item.category === categoryMap[covering.category as keyof typeof categoryMap]
    );
  };

  // Define which fields are string-based (not numeric)
  const stringFields = ['curtain_type', 'curtain_side', 'hardware_type', 'pooling_option', 'heading_type', 'mounting_type'];

  const handleMeasurementChange = (field: string, value: string | number) => {
    if (readOnly) return;
    
    setMeasurements(prev => {
      const newMeasurements = { ...prev };
      
      if (stringFields.includes(field)) {
        newMeasurements[field] = value;
      } else {
        newMeasurements[field] = parseFloat(String(value)) || 0;
      }
      
      return newMeasurements;
    });
    
    // Sync fabric selection state when measurement changes
    if (field === 'selected_fabric') {
      setSelectedFabric(String(value));
    }
  };

  const handleTreatmentDataChange = (field: string, value: any) => {
    setTreatmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInventorySelect = (item: any) => {
    setSelectedInventoryItem(item);
    // Calculate preliminary cost based on measurements and item pricing
    const width = measurements.measurement_a || measurements.rail_width || (units.length === 'cm' ? 150 : 60);
    const height = measurements.measurement_b || measurements.drop || (units.length === 'cm' ? 120 : 48);
    const area = units.length === 'cm' ? (width * height) / 10000 : (width * height) / 144; // sq m or sq ft
    const estimatedCost = area * (item.selling_price || item.unit_price || 0);
    setCalculatedCost(estimatedCost);
  };

  const handleSaveMeasurements = async () => {
    if (readOnly) return;
    
    // Ensure notes include surface name for proper linking
    const surfaceName = surfaceData?.name || "Unknown Surface";
    const measurementNotes = notes || `Measurement worksheet for ${surfaceName}`;
    
    console.log("Saving measurement with room_id:", selectedRoom);
    console.log("Surface data:", surfaceData);
    console.log("Notes:", measurementNotes);
    
    const measurementData = {
      client_id: clientId || null, // Allow null for measurements without clients
      project_id: projectId,
      room_id: selectedRoom === "no_room" ? null : selectedRoom,
      window_covering_id: selectedWindowCovering === "no_covering" ? null : selectedWindowCovering,
      measurement_type: windowType,
      measurements: {
        ...measurements,
        // Include fabric selection in measurements
        selected_fabric: selectedFabric,
        selected_heading: selectedHeading,
        selected_lining: selectedLining
      },
      photos,
      notes: measurementNotes,
      measured_by: measuredBy,
      measured_at: new Date().toISOString()
    };

    try {
      if (existingMeasurement?.id) {
        console.log("Updating existing measurement:", existingMeasurement.id);
        await updateMeasurement.mutateAsync({
          id: existingMeasurement.id,
          ...measurementData
        });
      } else {
        console.log("Creating new measurement");
        await createMeasurement.mutateAsync(measurementData);
      }
      
      console.log("Measurement saved successfully");
      onSave?.();
    } catch (error) {
      console.error("Error saving measurement:", error);
    }
  };

  const handleSaveTreatmentConfig = async () => {
    if (!selectedCovering) return;

    // Resolve selected fabric item from state or saved measurements
    let fabricItem = selectedFabric
      ? inventoryItems.find((item) => item.id === selectedFabric)
      : inventoryItems.find((item) => item.id === (measurements as any)?.selected_fabric);

    // Allow calculation without explicit fabric by using sensible fallbacks
    if (!fabricItem) {
      console.warn("No fabric item found from any source, trying fallback...");
      fabricItem = {
        id: null,
        name: "Fabric (default)",
        fabric_width: (measurements as any)?.fabric_width || 140,
        price_per_meter: (measurements as any)?.fabric_price_per_meter || 45,
        unit_price: (measurements as any)?.fabric_price_per_meter || 45,
        selling_price: (measurements as any)?.fabric_price_per_meter || 45,
      } as any;
      console.log("Using fallback fabric pricing:", {
        fabricId: (fabricItem as any).id,
        fallbackPrice: (fabricItem as any).price_per_meter || (fabricItem as any).unit_price || (fabricItem as any).selling_price,
      });
    }

    // Centralized pricing
    const {
      linearMeters,
      widthsRequired,
      pricePerMeter,
      fabricCost,
      liningCost,
      manufacturingCost,
      totalCost,
      liningDetails,
      calculation_details,
    } = calculateTreatmentPricing({
      template: selectedCovering,
      measurements,
      fabricItem,
      selectedHeading,
      selectedLining,
      unitsCurrency: units.currency,
    });

    const treatmentConfigData = {
      treatment_type: selectedCovering.name.toLowerCase(),
      product_name: selectedCovering.name,
      window_covering: selectedCovering,
      inventory_item: fabricItem,
      measurements: {
        ...measurements,
        ...treatmentData.measurements
      },
      fabric_details: {
        fabric_id: fabricItem.id,
        name: fabricItem.name,
        price_per_meter: pricePerMeter,
        selected_heading: selectedHeading,
        selected_lining: selectedLining,
        fabric_item: fabricItem,
        ...treatmentData.fabric_details
      },
      material_cost: fabricCost + liningCost,
      labor_cost: manufacturingCost,
      total_price: totalCost,
      unit_price: totalCost,
      quantity: 1,
      treatment_details: {
        ...treatmentData,
        selected_fabric: fabricItem.id,
        selected_heading: selectedHeading,
        selected_lining: selectedLining
      },
      calculation_details,
      notes: treatmentData.notes || "",
      status: "planned"
    };

    // Create/update treatment only when a real fabric is selected
    if ((fabricItem as any)?.id) {
      onSaveTreatment?.(treatmentConfigData);
    }

    // Upsert window summary for card/quotation views
    try {
      if (surfaceId) {
        await saveWindowSummary.mutateAsync({
          window_id: surfaceId,
          linear_meters: linearMeters,
          widths_required: widthsRequired,
          price_per_meter: pricePerMeter,
          fabric_cost: fabricCost,
          lining_cost: liningCost,
          manufacturing_cost: manufacturingCost,
          total_cost: totalCost,
          template_id: selectedCovering.id,
          pricing_type: selectedCovering.pricing_type,
          waste_percent: selectedCovering.waste_percent || 0,
          manufacturing_type: selectedCovering.manufacturing_type,
          currency: units.currency,
          template_name: selectedCovering.name,
          template_details: selectedCovering as any,
          fabric_details: { 
            id: fabricItem.id, 
            name: fabricItem.name, 
            price_per_meter: pricePerMeter,
            width: (fabricItem as any).fabric_width,
            width_cm: (fabricItem as any).fabric_width,
            fabric_width: (fabricItem as any).fabric_width,
            pattern_repeat_vertical: (fabricItem as any).pattern_repeat_vertical,
            pattern_repeat_horizontal: (fabricItem as any).pattern_repeat_horizontal
          },
          lining_details: liningDetails,
          heading_details: { id: selectedHeading },
          extras_details: [],
          cost_breakdown: calculation_details.breakdown,
          measurements_details: measurements
        } as any);
      }
    } catch (e) {
      console.error('Failed to save window summary:', e);
    }
  };

  const canConfigureTreatment = selectedWindowCovering !== "no_covering" && 
                                Object.keys(measurements).length > 0;

  const hasTreatmentConfiguration = selectedInventoryItem && selectedCovering;

  // Auto-save functionality with debouncing
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  
  const autoSave = useCallback(async () => {
    if (readOnly) return;
    
    try {
      // Silent save without notifications
      const measurementData = {
        client_id: clientId || null,
        project_id: projectId,
        room_id: selectedRoom === "no_room" ? null : selectedRoom,
        window_covering_id: selectedWindowCovering === "no_covering" ? null : selectedWindowCovering,
        measurement_type: windowType,
        measurements: {
          ...measurements,
          fabric_type: selectedFabric ? inventoryItems.find(item => item.id === selectedFabric)?.name : undefined,
          fabric_id: selectedFabric,
          heading_type: selectedHeading,
          lining_type: selectedLining
        },
        notes,
        measured_by: measuredBy,
        measured_at: new Date().toISOString(),
        photos
      };

      // Silent update - no toast notifications for auto-save
      if (existingMeasurement?.id) {
        // Use direct mutation without toast notifications
        const mutation = updateMeasurement.mutateAsync({
          id: existingMeasurement.id,
          ...measurementData
        });
        await mutation;
      } else {
        // Use direct mutation without toast notifications  
        const mutation = createMeasurement.mutateAsync(measurementData);
        await mutation;
      }
      
      console.log("Auto-save completed silently");
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [readOnly, clientId, projectId, selectedRoom, selectedWindowCovering, windowType, measurements, notes, measuredBy, photos, selectedFabric, selectedHeading, selectedLining, inventoryItems, existingMeasurement, updateMeasurement, createMeasurement]);

  // Debounced auto-save on changes
  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      autoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [autoSave]);

  // Auto-save when key data changes - DISABLED to prevent notification spam
  // useEffect(() => {
  //   if (!readOnly && (Object.keys(measurements).length > 0 || selectedFabric || selectedHeading || selectedLining)) {
  //     debouncedAutoSave();
  //   }
  //   return () => {
  //     if (autoSaveTimerRef.current) {
  //       clearTimeout(autoSaveTimerRef.current);
  //     }
  //   };
  // }, [measurements, selectedFabric, selectedHeading, selectedLining, notes, measuredBy, debouncedAutoSave, readOnly]);

  // Expose autoSave function to parent via ref
  useImperativeHandle(ref, () => ({
    autoSave
  }), [autoSave]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card className="bg-card border-border shadow-lg">
        <CardContent className="space-y-6 p-6 bg-card">
          {/* Basic Setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="windowType">Window Type</Label>
              <Select value={windowType} onValueChange={setWindowType} disabled={readOnly}>
                <SelectTrigger>
                  <SelectValue placeholder="Select window type" />
                </SelectTrigger>
                <SelectContent>
                  {WINDOW_TYPES.map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value}
                      disabled={type.value !== "standard"}
                    >
                      {type.value === "standard" ? type.label : `${type.label} - Coming Soon`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Remove the old treatment select - using WindowCoveringSelector instead */}

            {projectId && (
              <div>
                <Label htmlFor="room">Room</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={readOnly}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_room">No Room Selected</SelectItem>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Window Covering Selector */}
            <div>
              <Label htmlFor="windowCovering">Window Covering</Label>
              <WindowCoveringSelector
                selectedCoveringId={selectedWindowCovering !== "no_covering" ? selectedWindowCovering : undefined}
                onCoveringSelect={(covering) => {
                  // Connect to the existing working system
                  setSelectedWindowCovering(covering?.id || "no_covering");
                }}
                disabled={readOnly}
              />
            </div>

            <div>
              <Label htmlFor="measuredBy">Measured By</Label>
              <Input
                id="measuredBy"
                value={measuredBy}
                onChange={(e) => setMeasuredBy(e.target.value)}
                placeholder="Enter name"
                readOnly={readOnly}
              />
            </div>
          </div>

          {/* Visual Measurement Sheet */}
          <VisualMeasurementSheet
            measurements={measurements}
            onMeasurementChange={handleMeasurementChange}
            readOnly={readOnly}
            windowType={windowType}
            selectedTemplate={selectedCovering}
            selectedFabric={selectedFabric}
            onFabricChange={(fabricId) => {
              setSelectedFabric(fabricId);
              handleMeasurementChange('selected_fabric', fabricId);
            }}
            selectedLining={selectedLining}
            onLiningChange={(liningType) => {
              setSelectedLining(liningType);
              handleMeasurementChange('selected_lining', liningType);
            }}
            selectedHeading={selectedHeading}
            onHeadingChange={(headingId) => {
              setSelectedHeading(headingId);
              handleMeasurementChange('selected_heading', headingId);
            }}
            onFabricCalculationChange={setFabricCalculation}
          />

          {/* Treatment-Specific Sections - Only show when treatment is selected */}
          {selectedCovering && (
            <div className="space-y-6">


              {/* Cost Calculation Summary */}
              <CostCalculationSummary
                template={selectedCovering}
                measurements={measurements}
                selectedFabric={selectedFabric ? inventoryItems.find(item => item.id === selectedFabric) : 
                              inventoryItems.find(item => item.id === measurements.selected_fabric)}
                selectedHeading={selectedHeading}
                selectedLining={selectedLining}
                inventory={inventoryItems}
                fabricCalculation={fabricCalculation}
              />
            </div>
          )}

          {/* Notes Section */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about the measurements..."
              rows={3}
              readOnly={readOnly}
            />
          </div>

          {/* Action Buttons */}
          {!readOnly && (
            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Add Photos
              </Button>
              
              <div className="flex gap-3">
                <Button 
                  onClick={async () => {
                    await handleSaveMeasurements();
                    if (selectedCovering) {
                      await handleSaveTreatmentConfig();
                    }
                    onClose?.();
                  }}
                  disabled={createMeasurement.isPending || updateMeasurement.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

EnhancedMeasurementWorksheet.displayName = 'EnhancedMeasurementWorksheet';