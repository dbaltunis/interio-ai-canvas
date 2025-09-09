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
import { useSharedMeasurementState } from "@/hooks/useSharedMeasurementState";

type SharedMeasurementState = ReturnType<typeof useSharedMeasurementState>[0];
type SharedMeasurementActions = ReturnType<typeof useSharedMeasurementState>[1];

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
  sharedState?: SharedMeasurementState;
  sharedActions?: SharedMeasurementActions;
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
  readOnly = false,
  sharedState,
  sharedActions
}, ref) => {
  // Use shared state consistently
  const [internalSharedState, internalSharedActions] = useSharedMeasurementState(surfaceId);
  
  // Use provided shared state if available, otherwise use internal shared state
  const currentState = sharedState || internalSharedState;
  const currentActions = sharedActions || internalSharedActions;
  
  const [activeTab, setActiveTab] = useState("window-type");
  
  // Use shared state values directly
  const selectedWindowType = currentState.selectedWindowType;
  const selectedTemplate = currentState.selectedTemplate;
  const selectedTreatmentType = currentState.selectedTreatmentType;
  const measurements = currentState.measurements;
  const selectedItems = currentState.selectedItems;
  const fabricCalculation = currentState.fabricCalculation;
  const selectedHeading = currentState.selectedHeading;
  const selectedLining = currentState.selectedLining;
  const layeredTreatments = currentState.layeredTreatments;
  const isLayeredMode = currentState.isLayeredMode;

  // Setters that use shared state actions directly
  const setSelectedWindowType = currentActions.updateWindowType;
  const setSelectedTemplate = currentActions.updateTemplate;
  const setSelectedTreatmentType = currentActions.updateTreatmentType;

  const setMeasurements = (value: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => {
    const newValue = typeof value === 'function' ? value(measurements) : value;
    currentActions.updateMeasurements(newValue);
  };
  const setSelectedItems = currentActions.updateSelectedItems;
  const setFabricCalculation = currentActions.updateFabricCalculation;
  const setSelectedHeading = currentActions.updateHeading;
  const setSelectedLining = currentActions.updateLining;
  const setLayeredTreatments = currentActions.updateLayeredTreatments;
  const setIsLayeredMode = currentActions.updateLayeredMode;

  // Hooks
  const { data: curtainTemplates = [] } = useCurtainTemplates();
  const { data: windowCoverings = [] } = useWindowCoverings();
  const { units } = useMeasurementUnits();

  // Load existing data and sync with Enhanced mode
  useEffect(() => {
    if (existingMeasurement) {
      console.log("Loading existing measurement data:", existingMeasurement);
      
      // Update shared state if available
      if (sharedActions) {
        sharedActions.updateMeasurements(existingMeasurement.measurements || {});
        
        if (existingMeasurement.window_type) {
          sharedActions.updateWindowType(existingMeasurement.window_type);
        }
        
        if (existingMeasurement.template) {
          sharedActions.updateTemplate(existingMeasurement.template);
        }
        
        if (existingMeasurement.treatment_type) {
          sharedActions.updateTreatmentType(existingMeasurement.treatment_type);
        }
        
        if (existingMeasurement.selected_items) {
          sharedActions.updateSelectedItems(existingMeasurement.selected_items);
        }
        
        if (existingMeasurement.selected_heading) {
          sharedActions.updateHeading(existingMeasurement.selected_heading);
        }
        
        if (existingMeasurement.selected_lining) {
          sharedActions.updateLining(existingMeasurement.selected_lining);
        }
        
        if (existingMeasurement.layered_treatments) {
          sharedActions.updateLayeredTreatments(existingMeasurement.layered_treatments);
          sharedActions.updateLayeredMode(existingMeasurement.layered_treatments.length > 0);
        }
        
        if (existingMeasurement.fabric_calculation) {
          sharedActions.updateFabricCalculation(existingMeasurement.fabric_calculation);
        }
      } else {
        // Use shared actions even as fallback
        setMeasurements(existingMeasurement.measurements || {});
        
        if (existingMeasurement.window_type) {
          setSelectedWindowType(existingMeasurement.window_type);
        }
        
        if (existingMeasurement.template) {
          setSelectedTemplate(existingMeasurement.template);
        }
        
        if (existingMeasurement.treatment_type) {
          setSelectedTreatmentType(existingMeasurement.treatment_type);
        }
        
        if (existingMeasurement.selected_items) {
          setSelectedItems(existingMeasurement.selected_items);
        }
        
        if (existingMeasurement.selected_heading) {
          setSelectedHeading(existingMeasurement.selected_heading);
        }
        
        if (existingMeasurement.selected_lining) {
          setSelectedLining(existingMeasurement.selected_lining);
        }
        
        if (existingMeasurement.layered_treatments) {
          setLayeredTreatments(existingMeasurement.layered_treatments);
          setIsLayeredMode(existingMeasurement.layered_treatments.length > 0);
        }
        
        if (existingMeasurement.fabric_calculation) {
          setFabricCalculation(existingMeasurement.fabric_calculation);
        }
      }
    }
    
    // Load from existing treatments for cross-mode compatibility
    if (existingTreatments && existingTreatments.length > 0) {
      const treatment = existingTreatments[0];
      
      // Parse treatment details
      try {
        const details = typeof treatment.treatment_details === 'string' 
          ? JSON.parse(treatment.treatment_details) 
          : treatment.treatment_details;
          
        if (details && sharedActions) {
          if (details.selected_heading) sharedActions.updateHeading(details.selected_heading);
          if (details.selected_lining) sharedActions.updateLining(details.selected_lining);
          if (details.window_covering) sharedActions.updateTemplate(details.window_covering);
        } else if (details) {
          // Use shared actions even as fallback
          if (details.selected_heading) setSelectedHeading(details.selected_heading);
          if (details.selected_lining) setSelectedLining(details.selected_lining);
          if (details.window_covering) setSelectedTemplate(details.window_covering);
        }
      } catch (e) {
        console.warn("Failed to parse treatment details:", e);
      }
    }
  }, [existingMeasurement, existingTreatments, sharedActions]);

  // Enhanced auto-save implementation with cross-mode data
  useImperativeHandle(ref, () => ({
    autoSave: async () => {
      try {
        console.log("Auto-saving dynamic worksheet data for surface:", surfaceId);
        
        // Create comprehensive measurement data including enhanced mode fields
        const measurementData = {
          measurements,
          window_type: selectedWindowType,
          template: selectedTemplate,
          treatment_type: selectedTreatmentType,
          selected_items: selectedItems,
          fabric_calculation: fabricCalculation,
          surface_id: surfaceId,
          client_id: clientId,
          project_id: projectId,
          // Enhanced mode compatibility fields
          selected_heading: selectedHeading,
          selected_lining: selectedLining,
          layered_treatments: layeredTreatments,
          is_layered_mode: isLayeredMode
        };

        // Save the configuration if we have enough data
        if (Object.keys(measurements).length > 0 && onSave) {
          await onSave();
        }

        console.log("Dynamic worksheet auto-save completed with enhanced data");
      } catch (error) {
        console.error("Dynamic worksheet auto-save failed:", error);
        throw error;
      }
    }
  }));

  const handleMeasurementChange = (field: string, value: string) => {
    const newMeasurements = {
      ...measurements,
      [field]: value
    };
    setMeasurements(newMeasurements);
  };

  const handleItemSelect = (category: string, item: any) => {
    const newItems = {
      ...selectedItems,
      [category]: item
    };
    setSelectedItems(newItems);
  };

  const handleItemDeselect = (category: string) => {
    const newItems = {
      ...selectedItems,
      [category]: undefined
    };
    setSelectedItems(newItems);
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setSelectedTreatmentType("curtains"); // Templates are typically for curtains
  };

  const canProceedToMeasurements = selectedWindowType && (selectedTemplate || selectedTreatmentType);
  const canShowPreview = canProceedToMeasurements && Object.keys(measurements).length > 0;

  return (
    <div className="space-y-6">
      {/* Enhanced Progress indicator with clickable navigation */}
      <div className="flex items-center space-x-4">
        {["window-type", "treatment", "inventory", "measurements", "preview"].map((step, index) => {
          const stepNames = ["Window Type", "Treatment", "Inventory", "Measurements", "Preview"];
          const isCompleted = (() => {
            switch(step) {
              case "window-type": return selectedWindowType;
              case "treatment": return selectedTemplate || (isLayeredMode && layeredTreatments.length > 0);
              case "inventory": return Object.values(selectedItems).some(item => item);
              case "measurements": return measurements.rail_width && measurements.drop;
              case "preview": return true;
              default: return false;
            }
          })();
          
          return (
            <div key={step} className="flex items-center">
              <button
                onClick={() => setActiveTab(step)}
                disabled={readOnly}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  activeTab === step 
                    ? 'bg-primary text-primary-foreground' 
                    : isCompleted 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                } ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
                title={`${stepNames[index]} ${isCompleted ? '(Completed)' : ''}`}
              >
                {isCompleted ? '✓' : index + 1}
              </button>
              {index < 4 && <div className="w-8 h-px bg-border mx-2" />}
            </div>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="window-type">
            <Ruler className="h-4 w-4 mr-2" />
            Window Type
            {selectedWindowType && <span className="ml-1 text-xs">✓</span>}
          </TabsTrigger>
          <TabsTrigger value="treatment">
            <Package className="h-4 w-4 mr-2" />
            Treatment
            {(selectedTemplate || (isLayeredMode && layeredTreatments.length > 0)) && <span className="ml-1 text-xs">✓</span>}
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="h-4 w-4 mr-2" />
            Inventory
            {Object.values(selectedItems).some(item => item) && <span className="ml-1 text-xs">✓</span>}
          </TabsTrigger>
          <TabsTrigger value="measurements">
            <Ruler className="h-4 w-4 mr-2" />
            Measurements
            {(measurements.rail_width && measurements.drop) && <span className="ml-1 text-xs">✓</span>}
          </TabsTrigger>
          <TabsTrigger value="preview">
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