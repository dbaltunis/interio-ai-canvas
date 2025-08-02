import { useState, useEffect } from "react";
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
import { DynamicTreatmentVisualizer } from "./dynamic-options/DynamicTreatmentVisualizer";
import { CostCalculationSummary } from "./dynamic-options/CostCalculationSummary";

interface EnhancedMeasurementWorksheetProps {
  clientId: string;
  projectId?: string;
  existingMeasurement?: any;
  existingTreatments?: any[];
  onSave?: () => void;
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

export const EnhancedMeasurementWorksheet = ({ 
  clientId, 
  projectId, 
  existingMeasurement, 
  existingTreatments = [],
  onSave,
  onSaveTreatment,
  readOnly = false
}: EnhancedMeasurementWorksheetProps) => {
  const [windowType, setWindowType] = useState(existingMeasurement?.measurement_type || "standard");
  const [selectedRoom, setSelectedRoom] = useState(existingMeasurement?.room_id || "no_room");
  const [selectedWindowCovering, setSelectedWindowCovering] = useState(existingMeasurement?.window_covering_id || "no_covering");
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [measurements, setMeasurements] = useState(() => 
    existingMeasurement?.measurements ? { ...existingMeasurement.measurements } : {}
  );
  const [treatmentData, setTreatmentData] = useState<any>(() => 
    existingTreatments?.[0] ? { ...existingTreatments[0] } : {}
  );
  const [notes, setNotes] = useState(existingMeasurement?.notes || "");
  const [measuredBy, setMeasuredBy] = useState(existingMeasurement?.measured_by || "");
  const [photos, setPhotos] = useState<string[]>(existingMeasurement?.photos || []);
  const [activeTab, setActiveTab] = useState("measurements");
  const [calculatedCost, setCalculatedCost] = useState(0);
  
  // Dynamic options state
  const [selectedHeading, setSelectedHeading] = useState("standard");
  const [selectedLining, setSelectedLining] = useState("none");
  const [selectedFabric, setSelectedFabric] = useState("");

  const createMeasurement = useCreateClientMeasurement();
  const updateMeasurement = useUpdateClientMeasurement();
  const { data: rooms = [] } = useRooms(projectId);
  const { data: curtainTemplates = [] } = useCurtainTemplates();
  const { data: inventoryItems = [] } = useInventory();
  const { units } = useMeasurementUnits();

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
      client_id: clientId,
      project_id: projectId,
      room_id: selectedRoom === "no_room" ? null : selectedRoom,
      window_covering_id: selectedWindowCovering === "no_covering" ? null : selectedWindowCovering,
      measurement_type: windowType,
      measurements,
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
      fabric_details: treatmentData.fabric_details || {},
      material_cost: calculatedCost * 0.6, // Example cost breakdown
      labor_cost: calculatedCost * 0.4,
      total_price: calculatedCost,
      unit_price: calculatedCost,
      quantity: 1,
      treatment_details: treatmentData,
      notes: treatmentData.notes || "",
      status: "planned"
    };

    onSaveTreatment?.(treatmentConfigData);
  };

  const canConfigureTreatment = selectedWindowCovering !== "no_covering" && 
                                Object.keys(measurements).length > 0;

  const hasTreatmentConfiguration = selectedInventoryItem && selectedCovering;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Enhanced Measurement & Treatment Worksheet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="measurements" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Measurements
                {Object.keys(measurements).length > 0 && <Badge variant="secondary">✓</Badge>}
              </TabsTrigger>
              <TabsTrigger value="treatment" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Treatment Setup
                {selectedWindowCovering !== "no_covering" && <Badge variant="secondary">✓</Badge>}
              </TabsTrigger>
              <TabsTrigger value="configure" className="flex items-center gap-2" disabled={!canConfigureTreatment}>
                <Calculator className="h-4 w-4" />
                Configure & Price
                {hasTreatmentConfiguration && <Badge variant="secondary">{units.currency}{calculatedCost.toFixed(2)}</Badge>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="measurements" className="space-y-6">
              {/* Basic Measurement Setup */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="windowType">Window Type</Label>
                  <Select value={windowType} onValueChange={setWindowType} disabled={readOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select window type" />
                    </SelectTrigger>
                    <SelectContent>
                      {WINDOW_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              />

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

              {!readOnly && (
                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Add Photos
                  </Button>
                  
                  <Button 
                    onClick={handleSaveMeasurements}
                    disabled={createMeasurement.isPending || updateMeasurement.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save & Continue to Treatment
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="treatment" className="space-y-6">
              {Object.keys(measurements).length === 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-yellow-800">
                      Please complete measurements first before selecting a treatment.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Window Covering Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Window Covering Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={selectedWindowCovering} 
                    onValueChange={setSelectedWindowCovering} 
                    disabled={readOnly || Object.keys(measurements).length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select window covering" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_covering">Not Selected</SelectItem>
                      {curtainTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{template.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {template.curtain_type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Dynamic Treatment Visualizer */}
              {selectedCovering && (
                <DynamicTreatmentVisualizer
                  template={selectedCovering}
                  measurements={measurements}
                  selectedFabric={selectedFabric ? inventoryItems.find(item => item.id === selectedFabric) : undefined}
                  selectedLining={selectedLining}
                />
              )}

              {/* Fabric Selection */}
              {selectedCovering && (
                <FabricSelectionSection
                  selectedFabric={selectedFabric}
                  onFabricChange={setSelectedFabric}
                  inventory={inventoryItems}
                  readOnly={readOnly}
                />
              )}

              {/* Heading Options */}
              {selectedCovering && (
                <HeadingOptionsSection
                  template={selectedCovering}
                  selectedHeading={selectedHeading}
                  onHeadingChange={setSelectedHeading}
                  inventory={inventoryItems}
                  readOnly={readOnly}
                />
              )}

              {/* Lining Options */}
              {selectedCovering && selectedCovering.lining_types && selectedCovering.lining_types.length > 0 && (
                <LiningOptionsSection
                  template={selectedCovering}
                  selectedLining={selectedLining}
                  onLiningChange={setSelectedLining}
                  readOnly={readOnly}
                />
              )}

              {/* Cost Calculation Summary */}
              {selectedCovering && (
                <CostCalculationSummary
                  template={selectedCovering}
                  measurements={measurements}
                  selectedFabric={selectedFabric ? inventoryItems.find(item => item.id === selectedFabric) : undefined}
                  selectedLining={selectedLining}
                  selectedHeading={selectedHeading}
                  inventory={inventoryItems}
                />
              )}

              {selectedCovering && (
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setActiveTab("configure")}
                    disabled={!canConfigureTreatment}
                  >
                    Continue to Configure & Price
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="configure" className="space-y-6">
              {/* Inventory Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Materials from Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedInventoryItem?.id || ""} onValueChange={(value) => {
                    const item = inventoryItems.find(i => i.id === value);
                    if (item) handleInventorySelect(item);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${selectedCovering?.name.toLowerCase()} materials`} />
                    </SelectTrigger>
                    <SelectContent>
                      {getInventoryForCovering(selectedCovering).map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{item.name}</span>
                            <span className="text-sm text-muted-foreground ml-4">
                              {units.currency}{item.selling_price || item.unit_price || 0}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedInventoryItem && (
                    <Card className="p-4 bg-muted/50">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{selectedInventoryItem.name}</span>
                          <span>{units.currency}{selectedInventoryItem.selling_price || selectedInventoryItem.unit_price || 0}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedInventoryItem.description}</p>
                      </div>
                    </Card>
                  )}
                </CardContent>
              </Card>

              {/* Cost Summary */}
              {hasTreatmentConfiguration && (
                <Card>
                  <CardHeader>
                    <CardTitle>Treatment Summary & Pricing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Treatment Details</h4>
                        <div className="space-y-1 text-sm">
                          <div>Type: {selectedCovering.name}</div>
                          <div>Material: {selectedInventoryItem.name}</div>
                          <div>Width: {measurements.measurement_a || measurements.rail_width || 0}"</div>
                          <div>Height: {measurements.measurement_b || measurements.drop || 0}"</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Cost Breakdown</h4>
                        <div className="space-y-1 text-sm">
                          <div>Material: {units.currency}{(calculatedCost * 0.6).toFixed(2)}</div>
                          <div>Labor: {units.currency}{(calculatedCost * 0.4).toFixed(2)}</div>
                          <div className="border-t pt-1 font-medium">Total: {units.currency}{calculatedCost.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSaveTreatmentConfig}
                      className="w-full"
                      size="lg"
                    >
                      Save Treatment Configuration
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};