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
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { VisualMeasurementSheet } from "./VisualMeasurementSheet";
import { TreatmentSpecificFields } from "./TreatmentSpecificFields";
import { TreatmentVisualizer } from "./TreatmentVisualizer";
import { HeadingOptionsSection } from "./dynamic-options/HeadingOptionsSection";
import { LiningOptionsSection } from "./dynamic-options/LiningOptionsSection";
import { FabricSelectionSection } from "./dynamic-options/FabricSelectionSection";

import { CostCalculationSummary } from "./dynamic-options/CostCalculationSummary";

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
  const [measurements, setMeasurements] = useState(() => 
    existingMeasurement?.measurements ? { ...existingMeasurement.measurements } : {}
  );
  const [treatmentData, setTreatmentData] = useState<any>(() => 
    existingTreatments?.[0] ? { ...existingTreatments[0] } : {}
  );
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
  
  // Dynamic options state - isolated per window
  const [selectedHeading, setSelectedHeading] = useState(() => 
    existingTreatments?.[0]?.selected_heading || "standard"
  );
  const [selectedLining, setSelectedLining] = useState(() => 
    existingTreatments?.[0]?.selected_lining || "none"
  );
  const [selectedFabric, setSelectedFabric] = useState(() => 
    existingTreatments?.[0]?.fabric_code || ""
  );

  const createMeasurement = useCreateClientMeasurement();
  const updateMeasurement = useUpdateClientMeasurement();
  const { data: rooms = [] } = useRooms(projectId);
  const { data: curtainTemplates = [] } = useCurtainTemplates();
  const { data: inventoryItems = [] } = useInventory();
  const { units } = useMeasurementUnits();

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

  const handleMeasurementChange = (field: string, value: string) => {
    if (readOnly) return;
    
    setMeasurements(prev => {
      const newMeasurements = { ...prev };
      
      if (stringFields.includes(field)) {
        newMeasurements[field] = value;
      } else {
        newMeasurements[field] = parseFloat(value) || 0;
      }
      
      return newMeasurements;
    });
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
      notes,
      measured_by: measuredBy,
      measured_at: new Date().toISOString()
    };

    if (existingMeasurement?.id) {
      await updateMeasurement.mutateAsync({
        id: existingMeasurement.id,
        ...measurementData
      });
    } else {
      await createMeasurement.mutateAsync(measurementData);
    }

    onSave?.();
  };

  const handleSaveTreatmentConfig = () => {
    if (!selectedInventoryItem || !selectedCovering) return;

    const treatmentConfigData = {
      treatment_type: selectedCovering.name.toLowerCase(),
      product_name: selectedCovering.name,
      window_covering: selectedCovering,
      inventory_item: selectedInventoryItem,
      measurements: {
        ...measurements,
        ...treatmentData.measurements
      },
      fabric_details: {
        fabric_id: selectedFabric,
        selected_heading: selectedHeading,
        selected_lining: selectedLining,
        fabric_item: selectedFabric ? inventoryItems.find(item => item.id === selectedFabric) : null,
        ...treatmentData.fabric_details
      },
      material_cost: calculatedCost * 0.6, // Example cost breakdown
      labor_cost: calculatedCost * 0.4,
      total_price: calculatedCost,
      unit_price: calculatedCost,
      quantity: 1,
      treatment_details: {
        ...treatmentData,
        selected_fabric: selectedFabric,
        selected_heading: selectedHeading, 
        selected_lining: selectedLining
      },
      notes: treatmentData.notes || "",
      status: "planned"
    };

    onSaveTreatment?.(treatmentConfigData);
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
      <Card>
        <CardContent className="space-y-6">
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
            <div>
              <Label htmlFor="treatment">Treatment</Label>
              <Select value={selectedWindowCovering} onValueChange={setSelectedWindowCovering} disabled={readOnly}>
                <SelectTrigger>
                  <SelectValue placeholder={curtainTemplates.length > 0 ? "Select treatment" : "No treatments available - Create in Settings"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_covering">No Treatment</SelectItem>
                  {curtainTemplates.length > 0 ? (
                    curtainTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {template.curtain_type} • Fullness: {template.fullness_ratio}x • {template.manufacturing_type}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="create_treatment" disabled>
                      Create treatments in Settings → Window Coverings
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

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
            onFabricChange={setSelectedFabric}
            selectedLining={selectedLining}
            onLiningChange={setSelectedLining}
            selectedHeading={selectedHeading}
            onHeadingChange={setSelectedHeading}
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
                    if (selectedCovering && selectedFabric) {
                      handleSaveTreatmentConfig();
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