import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ruler, Eye, Package, Calculator, Save } from "lucide-react";

import { WindowTypeSelector } from "../window-types/WindowTypeSelector";
import { TreatmentPreviewEngine } from "../treatment-visualizers/TreatmentPreviewEngine";
import { InventorySelectionPanel } from "../inventory/InventorySelectionPanel";
import { FixedWindowCoveringSelector } from "./FixedWindowCoveringSelector";
import { VisualMeasurementSheet } from "./VisualMeasurementSheet";
import { CostCalculationSummary } from "./dynamic-options/CostCalculationSummary";
import { LayeredTreatmentManager } from "../job-creation/LayeredTreatmentManager";

import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface DynamicWindowWorksheetProps {
  clientId?: string;
  projectId?: string;
  surfaceId?: string;
  surfaceData?: any;
  existingMeasurement?: any;
  existingTreatments?: any[];
  onSave?: () => void;
  onClose?: () => void;
  onSaveTreatment?: (treatmentData: any) => void;
  readOnly?: boolean;
}

export const DynamicWindowWorksheet = forwardRef<
  { autoSave: () => Promise<void> },
  DynamicWindowWorksheetProps
>(({
  clientId,
  projectId,
  surfaceId,
  surfaceData,
  existingMeasurement,
  existingTreatments = [],
  onSave,
  onClose,
  onSaveTreatment,
  readOnly = false
}, ref) => {
  // State management
  const [selectedWindowType, setSelectedWindowType] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedTreatmentType, setSelectedTreatmentType] = useState("curtains");
  const [measurements, setMeasurements] = useState<Record<string, any>>({});
  const [selectedItems, setSelectedItems] = useState<{
    fabric?: any;
    hardware?: any;
    material?: any;
  }>({});
  const [activeTab, setActiveTab] = useState("window-type");
  const [fabricCalculation, setFabricCalculation] = useState<any>(null);
  const [selectedHeading, setSelectedHeading] = useState("standard");
  const [selectedLining, setSelectedLining] = useState("none");
  const [layeredTreatments, setLayeredTreatments] = useState<Array<{
    id: string;
    type: string;
    template?: any;
    selectedItems?: any;
    zIndex: number;
    opacity: number;
    name: string;
  }>>([]);
  const [isLayeredMode, setIsLayeredMode] = useState(false);

  // Hooks
  const { data: curtainTemplates = [] } = useCurtainTemplates();
  const { data: windowCoverings = [] } = useWindowCoverings();
  const { units } = useMeasurementUnits();

  // Load existing data
  useEffect(() => {
    if (existingMeasurement) {
      console.log("Loading existing measurement data:", existingMeasurement);
      
      setMeasurements(existingMeasurement.measurements || {});
      
      // Load window type if saved
      if (existingMeasurement.window_type) {
        setSelectedWindowType(existingMeasurement.window_type);
      }
      
      // Load template if saved
      if (existingMeasurement.template) {
        setSelectedTemplate(existingMeasurement.template);
      }
      
      // Load treatment type if saved
      if (existingMeasurement.treatment_type) {
        setSelectedTreatmentType(existingMeasurement.treatment_type);
      }
      
      // Load selected items if saved
      if (existingMeasurement.selected_items) {
        setSelectedItems(existingMeasurement.selected_items);
      }
    }
  }, [existingMeasurement]);

  // Auto-save implementation
  useImperativeHandle(ref, () => ({
    autoSave: async () => {
      try {
        console.log("Auto-saving dynamic worksheet data for surface:", surfaceId);
        
        // Create comprehensive measurement data
        const measurementData = {
          measurements,
          window_type: selectedWindowType,
          template: selectedTemplate,
          treatment_type: selectedTreatmentType,
          selected_items: selectedItems,
          fabric_calculation: fabricCalculation,
          surface_id: surfaceId,
          client_id: clientId,
          project_id: projectId
        };

        // Save the configuration if we have enough data
        if (Object.keys(measurements).length > 0 && onSave) {
          await onSave();
        }

        console.log("Dynamic worksheet auto-save completed");
      } catch (error) {
        console.error("Dynamic worksheet auto-save failed:", error);
        throw error;
      }
    }
  }));

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemSelect = (category: string, item: any) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: item
    }));
  };

  const handleItemDeselect = (category: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: undefined
    }));
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setSelectedTreatmentType("curtains"); // Templates are typically for curtains
  };

  const canProceedToMeasurements = selectedWindowType && (selectedTemplate || selectedTreatmentType);
  const canShowPreview = canProceedToMeasurements && Object.keys(measurements).length > 0;

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center space-x-4">
        {["window-type", "treatment", "inventory", "measurements", "preview"].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              activeTab === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {index + 1}
            </div>
            {index < 4 && <div className="w-8 h-px bg-border mx-2" />}
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="window-type">
            <Ruler className="h-4 w-4 mr-2" />
            Window Type
          </TabsTrigger>
          <TabsTrigger value="treatment" disabled={!selectedWindowType}>
            <Package className="h-4 w-4 mr-2" />
            Treatment
          </TabsTrigger>
          <TabsTrigger value="inventory" disabled={!canProceedToMeasurements}>
            <Package className="h-4 w-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="measurements" disabled={!canProceedToMeasurements}>
            <Ruler className="h-4 w-4 mr-2" />
            Measurements
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!canShowPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Window Type Selection */}
        <TabsContent value="window-type" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Window Type</CardTitle>
            </CardHeader>
            <CardContent>
              <WindowTypeSelector
                selectedWindowType={selectedWindowType}
                onWindowTypeChange={setSelectedWindowType}
                readOnly={readOnly}
              />
              
              {selectedWindowType && (
                <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-medium mb-2">Selected Window Type</h4>
                  <p className="text-sm">{selectedWindowType.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedWindowType.description}</p>
                  
                  <Button 
                    className="mt-4" 
                    onClick={() => setActiveTab("treatment")}
                  >
                    Continue to Treatment Selection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatment Selection */}
        <TabsContent value="treatment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Treatment & Template</CardTitle>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={!isLayeredMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsLayeredMode(false)}
                >
                  Single Treatment
                </Button>
                <Button
                  variant={isLayeredMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsLayeredMode(true)}
                >
                  Layered Treatments
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLayeredMode ? (
                /* Layered Treatment Manager */
                <LayeredTreatmentManager
                  treatments={layeredTreatments}
                  onTreatmentsChange={setLayeredTreatments}
                />
              ) : (
                /* Single Treatment Configuration */
                <>
                  <FixedWindowCoveringSelector
                    selectedCoveringId={selectedTemplate?.id || ""}
                    onCoveringSelect={(template) => {
                      setSelectedTemplate(template);
                    }}
                    disabled={readOnly}
                  />
                  
                  {selectedTemplate && (
                    <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium mb-2">Selected Template</h4>
                      <p className="text-sm">{selectedTemplate.name}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{selectedTemplate.curtain_type || selectedTemplate.type}</Badge>
                        {selectedTemplate.fullness_ratio && (
                          <Badge variant="outline">Fullness: {selectedTemplate.fullness_ratio}x</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div className="mt-6">
                <Button 
                  onClick={() => setActiveTab("inventory")}
                  disabled={!isLayeredMode && !selectedTemplate}
                >
                  Continue to {isLayeredMode ? "Measurements" : "Inventory Selection"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Selection */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Materials & Hardware</CardTitle>
            </CardHeader>
            <CardContent>
              <InventorySelectionPanel
                treatmentType={selectedTreatmentType}
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
                onItemDeselect={handleItemDeselect}
                measurements={measurements}
              />
              
              <div className="mt-6">
                <Button 
                  onClick={() => setActiveTab("measurements")}
                  disabled={!Object.values(selectedItems).some(item => item)}
                >
                  Continue to Measurements
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Measurements - Full Interactive Visual Experience */}
        <TabsContent value="measurements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Window Measurement Worksheet</CardTitle>
              <p className="text-sm text-muted-foreground">
                Live visual measurement system with dynamic updates - measurements affect the visualization in real-time
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 2xl:grid-cols-5 gap-6">
                {/* Left Side - Live Visual Worksheet */}
                <div className="2xl:col-span-3">
                  <VisualMeasurementSheet
                    measurements={measurements}
                    onMeasurementChange={handleMeasurementChange}
                    windowType={selectedWindowType?.key || "standard"}
                    selectedTemplate={selectedTemplate}
                    selectedFabric={selectedItems.fabric?.id}
                    selectedLining={selectedLining}
                    onLiningChange={setSelectedLining}
                    selectedHeading={selectedHeading}
                    onHeadingChange={setSelectedHeading}
                    onFabricCalculationChange={setFabricCalculation}
                    readOnly={readOnly}
                  />
                </div>

                {/* Right Side - Treatment Options & Cost */}
                <div className="2xl:col-span-2 space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium mb-3">Selected Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Window:</span>
                        <span className="font-medium">{selectedWindowType?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Treatment:</span>
                        <span className="font-medium">{selectedTemplate?.name || selectedTreatmentType}</span>
                      </div>
                      {selectedItems.fabric && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fabric:</span>
                          <span className="font-medium">{selectedItems.fabric.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <CostCalculationSummary
                    template={selectedTemplate}
                    measurements={measurements}
                    selectedFabric={selectedItems.fabric}
                    selectedLining={selectedLining}
                    selectedHeading={selectedHeading}
                    inventory={[]}
                    fabricCalculation={fabricCalculation}
                  />
                  
                  <Button 
                    onClick={() => setActiveTab("preview")}
                    disabled={!measurements.rail_width || !measurements.drop}
                    className="w-full"
                  >
                    Continue to Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Treatment Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <TreatmentPreviewEngine
                  windowType={selectedWindowType?.key || "standard"}
                  treatmentType={selectedTreatmentType}
                  measurements={measurements}
                  template={selectedTemplate}
                  selectedItems={selectedItems}
                  className="min-h-[400px]"
                  layeredTreatments={isLayeredMode ? layeredTreatments : []}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary & Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Configuration Summary</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Window:</strong> {selectedWindowType?.name}</p>
                    <p><strong>Treatment:</strong> {selectedTemplate?.name}</p>
                    <p><strong>Dimensions:</strong> {measurements.rail_width}cm × {measurements.drop}cm</p>
                    {selectedItems.fabric && (
                      <p><strong>Fabric:</strong> {selectedItems.fabric.name}</p>
                    )}
                  </div>
                </div>

                {fabricCalculation && (
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium mb-2">Cost Summary</h4>
                    <div className="text-sm space-y-1">
                      <p>Linear Meters: {fabricCalculation.linearMeters?.toFixed(2)}m</p>
                      <p>Total Cost: ${fabricCalculation.totalCost?.toFixed(2)}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={onSave}
                    disabled={readOnly}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                  
                  {onSaveTreatment && (
                    <Button 
                      variant="outline"
                      onClick={() => onSaveTreatment?.({
                        window_type: selectedWindowType,
                        template: selectedTemplate,
                        measurements,
                        selected_items: selectedItems,
                        fabric_calculation: fabricCalculation
                      })}
                      disabled={readOnly}
                    >
                      Save as Treatment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});