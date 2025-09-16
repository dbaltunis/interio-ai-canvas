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
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  // Load existing window summary data to populate the form
  const { data: existingWindowSummary } = useQuery({
    queryKey: ["window-summary", surfaceId],
    queryFn: async () => {
      if (!surfaceId) return null;
      
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from("windows_summary")
        .select("*")
        .eq("window_id", surfaceId)
        .maybeSingle();

      if (error) {
        console.error("Error loading window summary:", error);
        return null;
      }
      
      console.log("✅ Loaded existing window summary:", data);
      return data;
    },
    enabled: !!surfaceId,
  });

  // Load existing data and sync with Enhanced mode
  useEffect(() => {
    console.log("🔄 Loading existing data:", { existingMeasurement, existingWindowSummary, existingTreatments });
    
    // Priority 1: Load from windows_summary table if available
    if (existingWindowSummary) {
      console.log("📊 PRIORITY 1: Loading from windows_summary");
      
      const measurementsDetails = existingWindowSummary.measurements_details as any || {};
      const templateDetails = existingWindowSummary.template_details as any;
      const fabricDetails = existingWindowSummary.fabric_details as any;
      
      // Set measurements from saved summary
      if (measurementsDetails && typeof measurementsDetails === 'object') {
        const loadedMeasurements = {
          rail_width: measurementsDetails.rail_width_cm?.toString() || measurementsDetails.rail_width?.toString() || "",
          drop: measurementsDetails.drop_cm?.toString() || measurementsDetails.drop?.toString() || "",
          ...measurementsDetails
        };
        setMeasurements(loadedMeasurements);
        console.log("📊 Loaded measurements:", loadedMeasurements);
      }
      
      // Set template from saved summary
      if (templateDetails && typeof templateDetails === 'object') {
        setSelectedTemplate(templateDetails);
        setSelectedTreatmentType(templateDetails.curtain_type || "curtains");
        console.log("📊 Loaded template:", templateDetails.name);
      }
      
      // Set fabric from saved summary
      if (fabricDetails && typeof fabricDetails === 'object') {
        setSelectedItems(prev => ({
          ...prev,
          fabric: fabricDetails
        }));
        console.log("📊 Loaded fabric:", fabricDetails.name);
      }
      
      // Set fabric calculation if available
      if (existingWindowSummary.linear_meters && existingWindowSummary.total_cost) {
        setFabricCalculation({
          linearMeters: existingWindowSummary.linear_meters,
          totalCost: existingWindowSummary.total_cost,
          pricePerMeter: existingWindowSummary.price_per_meter,
          widthsRequired: existingWindowSummary.widths_required
        });
        console.log("📊 Loaded fabric calculation");
      }
      
      return; // Exit early if we loaded from windows_summary
    }
    
    // Priority 2: Load from existingMeasurement (legacy support)
    if (existingMeasurement) {
      console.log("📊 PRIORITY 2: Loading from existingMeasurement");
      
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
      
      // Load enhanced mode specific fields
      if (existingMeasurement.selected_heading) {
        setSelectedHeading(existingMeasurement.selected_heading);
      }
      
      if (existingMeasurement.selected_lining) {
        setSelectedLining(existingMeasurement.selected_lining);
      }
      
      // Load layered treatments if they exist
      if (existingMeasurement.layered_treatments) {
        setLayeredTreatments(existingMeasurement.layered_treatments);
        setIsLayeredMode(existingMeasurement.layered_treatments.length > 0);
      }
    }
    
    // Priority 3: Load from existing treatments for cross-mode compatibility
    if (existingTreatments && existingTreatments.length > 0) {
      console.log("📊 PRIORITY 3: Loading from existingTreatments");
      const treatment = existingTreatments[0];
      
      // Parse treatment details
      try {
        const details = typeof treatment.treatment_details === 'string' 
          ? JSON.parse(treatment.treatment_details) 
          : treatment.treatment_details;
          
        if (details) {
          if (details.selected_heading) setSelectedHeading(details.selected_heading);
          if (details.selected_lining) setSelectedLining(details.selected_lining);
          if (details.window_covering) setSelectedTemplate(details.window_covering);
        }
      } catch (e) {
        console.warn("Failed to parse treatment details:", e);
      }
    }
  }, [existingMeasurement, existingTreatments, existingWindowSummary]);

  // Enhanced auto-save implementation with cross-mode data
  useImperativeHandle(ref, () => ({
    autoSave: async () => {
      try {
        console.log("🔄 DynamicWindowWorksheet: Starting auto-save for surface:", surfaceId);
        
        // Only save if we have meaningful data
        if (Object.keys(measurements).length > 0 || selectedWindowType || selectedTemplate) {
          console.log("🔄 DynamicWindowWorksheet: Saving measurement data:", {
            measurements,
            selectedTemplate,
            selectedItems,
            fabricCalculation
          });
          
          // Import supabase and save to windows_summary table (where UI expects it)
          const { supabase } = await import('@/integrations/supabase/client');
          
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error("User not authenticated");
          }

          // Calculate comprehensive costs including all components
          const fabricCost = fabricCalculation?.totalCost || 0;
          
          // Calculate lining cost if selected
          let liningCost = 0;
          if (selectedLining && selectedLining !== 'none' && selectedTemplate && fabricCalculation) {
            const liningTypes = selectedTemplate.lining_types || [];
            const liningOption = liningTypes.find(l => l.type === selectedLining);
            if (liningOption) {
              const liningPricePerMeter = liningOption.material_cost || 0;
              const liningLaborPerMeter = liningOption.labor_cost || 0;
              liningCost = (liningPricePerMeter + liningLaborPerMeter) * fabricCalculation.linearMeters;
            }
          }
          
          // Calculate heading cost if selected
          let headingCost = 0;
          if (selectedHeading && selectedHeading !== 'standard' && selectedTemplate && fabricCalculation) {
            const headingUpchargePerCurtain = selectedTemplate.heading_upcharge_per_curtain || 0;
            const headingUpchargePerMetre = selectedTemplate.heading_upcharge_per_metre || 0;
            headingCost = headingUpchargePerCurtain + (headingUpchargePerMetre * fabricCalculation.linearMeters);
          }
          
          // Calculate manufacturing cost
          let manufacturingCost = 0;
          if (selectedTemplate && fabricCalculation) {
            const manufacturingType = selectedTemplate.manufacturing_type || 'machine';
            const linearMeters = fabricCalculation.linearMeters || 0;
            
            if (manufacturingType === 'machine') {
              manufacturingCost = (selectedTemplate.machine_price_per_metre || 0) * linearMeters;
            } else if (manufacturingType === 'hand') {
              manufacturingCost = (selectedTemplate.hand_price_per_metre || 0) * linearMeters;
            }
          }
          
          // Calculate total cost
          const totalCost = fabricCost + liningCost + headingCost + manufacturingCost;
          
          // Create comprehensive calculation object for display consistency
          const calculation = {
            fabricCost,
            liningCost,
            headingCost,
            manufacturingCost,
            totalCost
          };

          // Create summary data for windows_summary table
          const summaryData = {
            window_id: surfaceId,
            linear_meters: fabricCalculation?.linearMeters || 0,
            widths_required: fabricCalculation?.widthsRequired || 0,
            price_per_meter: fabricCalculation?.pricePerMeter || selectedItems.fabric?.selling_price || 0,
            fabric_cost: fabricCost,
            lining_type: selectedLining || 'none',
            lining_cost: liningCost,
            manufacturing_type: selectedTemplate?.manufacturing_type || 'machine',
            manufacturing_cost: manufacturingCost,
            total_cost: totalCost,
            template_id: selectedTemplate?.id,
            pricing_type: selectedTemplate?.pricing_type || 'per_metre',
            waste_percent: selectedTemplate?.waste_percent || 5,
            currency: 'USD',
            // Detailed breakdown fields
            template_name: selectedTemplate?.name,
            template_details: selectedTemplate,
            fabric_details: {
              ...selectedItems.fabric,
              fabric_id: selectedItems.fabric?.id,
              width_cm: selectedItems.fabric?.fabric_width || 140,
              width: selectedItems.fabric?.fabric_width || 140
            },
            heading_details: {
              heading_name: selectedHeading,
              id: selectedHeading
            },
            measurements_details: {
              ...measurements,
              rail_width_cm: parseFloat(measurements.rail_width) || 0,
              drop_cm: parseFloat(measurements.drop) || 0,
              surface_id: surfaceId,
              surface_name: surfaceData?.name,
              curtain_type: selectedTemplate?.curtain_type || 'single',
              fullness_ratio: selectedTemplate?.fullness_ratio || 2,
              fabric_width_cm: selectedItems.fabric?.fabric_width || 140,
              window_type: selectedWindowType?.name || 'Standard Window'
            }
          };
          
          // Save to windows_summary table
          const { data, error } = await supabase
            .from('windows_summary')
            .upsert(summaryData, {
              onConflict: 'window_id'
            })
            .select()
            .single();

          if (error) {
            console.error("❌ DynamicWindowWorksheet: Database save error:", error);
            throw error;
          }

          // Invalidate cache to refresh UI
          await queryClient.invalidateQueries({ queryKey: ["window-summary", surfaceId] });

          console.log("✅ DynamicWindowWorksheet: Successfully saved to database:", data);
        } else {
          console.log("ℹ️ DynamicWindowWorksheet: No data to save yet");
        }

        console.log("✅ DynamicWindowWorksheet: Auto-save completed successfully");
      } catch (error) {
        console.error("❌ DynamicWindowWorksheet: Auto-save failed:", error);
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

                {(fabricCalculation || selectedItems.fabric || selectedTemplate) && (
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium mb-3">Configuration Summary</h4>
                    <div className="space-y-3">
                      
                      {/* Window Details */}
                      <div className="border-b pb-2">
                        <h5 className="text-sm font-medium text-muted-foreground mb-1">Window Configuration</h5>
                        <div className="text-sm space-y-1">
                          <p><strong>Window Type:</strong> {selectedWindowType?.name || 'Standard Window'}</p>
                          <p><strong>Dimensions:</strong> {measurements.rail_width || 0}cm (W) × {measurements.drop || 0}cm (H)</p>
                          {selectedTemplate && (
                            <p><strong>Treatment:</strong> {selectedTemplate.name} ({selectedTemplate.curtain_type})</p>
                          )}
                        </div>
                      </div>

                      {/* Fabric Details */}
                      {selectedItems.fabric && (
                        <div className="border-b pb-2">
                          <h5 className="text-sm font-medium text-muted-foreground mb-1">Fabric Selection</h5>
                          <div className="text-sm space-y-1">
                            <p><strong>Fabric:</strong> {selectedItems.fabric.name}</p>
                            <p><strong>Width:</strong> {selectedItems.fabric.fabric_width || 140}cm</p>
                            <p><strong>Price per meter:</strong> £{(selectedItems.fabric.selling_price || selectedItems.fabric.unit_price || 0).toFixed(2)}</p>
                            <p><strong>Color:</strong> {selectedItems.fabric.color || 'Not specified'}</p>
                            {selectedItems.fabric.collection_name && (
                              <p><strong>Collection:</strong> {selectedItems.fabric.collection_name}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Treatment Options */}
                      {(selectedHeading !== 'standard' || selectedLining !== 'none') && (
                        <div className="border-b pb-2">
                          <h5 className="text-sm font-medium text-muted-foreground mb-1">Treatment Options</h5>
                          <div className="text-sm space-y-1">
                            <p><strong>Heading Style:</strong> {selectedHeading === 'standard' ? 'Standard' : selectedHeading}</p>
                            <p><strong>Lining:</strong> {selectedLining === 'none' ? 'No lining' : selectedLining}</p>
                            {selectedTemplate?.fullness_ratio && (
                              <p><strong>Fullness Ratio:</strong> {selectedTemplate.fullness_ratio}x</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Cost Breakdown */}
                      {fabricCalculation && (
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-1">Cost Breakdown</h5>
                          <div className="text-sm space-y-1">
                            {/* Measurements */}
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Linear meters required:</span>
                              <span>{fabricCalculation.linearMeters?.toFixed(2)}m</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Widths needed:</span>
                              <span>{fabricCalculation.widthsRequired || 0}</span>
                            </div>
                            
                            {/* Cost Components */}
                            <div className="pt-2 border-t">
                              <div className="flex justify-between">
                                 <span>🧵 Fabric:</span>
                                 <span>{fabricCalculation.linearMeters?.toFixed(2)}m × £{(selectedItems.fabric?.selling_price || 0).toFixed(2)}/m</span>
                                 <span>£{fabricCalculation.totalCost?.toFixed(2) || '0.00'}</span>
                              </div>
                              
                              {selectedLining && selectedLining !== 'none' && selectedTemplate && (() => {
                                const liningTypes = selectedTemplate.lining_types || [];
                                const liningOption = liningTypes.find(l => l.type === selectedLining);
                                const liningCost = liningOption ? (liningOption.material_cost + liningOption.labor_cost) * fabricCalculation.linearMeters : 0;
                                return (
                                   <div className="flex justify-between">
                                     <span>🛡️ Lining:</span>
                                     <span>{selectedLining}</span>
                                     <span>£{isNaN(liningCost) ? '0.00' : liningCost.toFixed(2)}</span>
                                   </div>
                                );
                              })()}
                              
                              {selectedHeading && selectedHeading !== 'standard' && selectedTemplate && (() => {
                                const headingUpchargePerCurtain = selectedTemplate.heading_upcharge_per_curtain || 0;
                                const headingUpchargePerMetre = selectedTemplate.heading_upcharge_per_metre || 0;
                                const headingCost = headingUpchargePerCurtain + (headingUpchargePerMetre * fabricCalculation.linearMeters);
                                return headingCost > 0 ? (
                                   <div className="flex justify-between">
                                     <span>📏 Heading:</span>
                                     <span>{selectedHeading}</span>
                                     <span>£{isNaN(headingCost) ? '0.00' : headingCost.toFixed(2)}</span>
                                   </div>
                                ) : null;
                              })()}
                              
                              {selectedTemplate && (() => {
                                const manufacturingType = selectedTemplate.manufacturing_type || 'machine';
                                const pricePerMetre = manufacturingType === 'machine' 
                                  ? selectedTemplate.machine_price_per_metre || 0
                                  : selectedTemplate.hand_price_per_metre || 0;
                                const manufacturingCost = pricePerMetre * fabricCalculation.linearMeters;
                                return manufacturingCost > 0 ? (
                                   <div className="flex justify-between">
                                     <span>🏭 Manufacturing:</span>
                                     <span>{manufacturingType}</span>
                                     <span>£{isNaN(manufacturingCost) ? '0.00' : manufacturingCost.toFixed(2)}</span>
                                   </div>
                                ) : null;
                              })()}
                            </div>

                            {fabricCalculation.returns && (
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Returns (each side):</span>
                                <span>{fabricCalculation.returns}cm</span>
                              </div>
                            )}
                            {fabricCalculation.wastePercent && (
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Waste allowance:</span>
                                <span>{fabricCalculation.wastePercent}%</span>
                              </div>
                            )}
                            
                            <div className="border-t pt-2 mt-2">
                               <div className="flex justify-between font-medium text-base">
                                 <span>Total Cost:</span>
                                 <span>£{(() => {
                                   const fabricCost = fabricCalculation.totalCost || 0;
                                   let liningCost = 0;
                                   let headingCost = 0;
                                   let manufacturingCost = 0;
                                   
                                   if (selectedLining && selectedLining !== 'none' && selectedTemplate) {
                                     const liningTypes = selectedTemplate.lining_types || [];
                                     const liningOption = liningTypes.find(l => l.type === selectedLining);
                                     if (liningOption) {
                                       liningCost = (liningOption.material_cost + liningOption.labor_cost) * fabricCalculation.linearMeters;
                                     }
                                   }
                                   
                                   if (selectedHeading && selectedHeading !== 'standard' && selectedTemplate) {
                                     const headingUpchargePerCurtain = selectedTemplate.heading_upcharge_per_curtain || 0;
                                     const headingUpchargePerMetre = selectedTemplate.heading_upcharge_per_metre || 0;
                                     headingCost = headingUpchargePerCurtain + (headingUpchargePerMetre * fabricCalculation.linearMeters);
                                   }
                                   
                                   if (selectedTemplate) {
                                     const manufacturingType = selectedTemplate.manufacturing_type || 'machine';
                                     const pricePerMetre = manufacturingType === 'machine' 
                                       ? selectedTemplate.machine_price_per_metre || 0
                                       : selectedTemplate.hand_price_per_metre || 0;
                                     manufacturingCost = pricePerMetre * fabricCalculation.linearMeters;
                                   }
                                   
                                   const totalCost = fabricCost + liningCost + headingCost + manufacturingCost;
                                   return isNaN(totalCost) ? '0.00' : totalCost.toFixed(2);
                                 })()}</span>
                               </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Show message if no calculations available */}
                      {!fabricCalculation && selectedItems.fabric && (
                        <div className="text-sm text-muted-foreground">
                          <p>Complete measurements to see cost calculation</p>
                        </div>
                      )}

                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={async () => {
                      try {
                        console.log("DynamicWorksheet: Starting save process...");
                        console.log("Current measurements:", measurements);
                        console.log("Current selectedItems:", selectedItems);
                        
                        // Use the ref's autoSave method directly
                        const currentRef = ref as React.MutableRefObject<{ autoSave: () => Promise<void> }>;
                        if (currentRef?.current) {
                          await currentRef.current.autoSave();
                          console.log("DynamicWorksheet: AutoSave completed successfully");
                        } else {
                          console.error("DynamicWorksheet: No autoSave ref available!");
                        }
                        
                        const { toast } = await import("@/hooks/use-toast");
                        toast({
                          title: "✅ Configuration Saved",
                          description: "Your window configuration has been saved successfully",
                        });
                        
                        // Close the dialog after successful save
                        setTimeout(() => {
                          console.log("DynamicWorksheet: Closing dialog after save");
                          onClose?.();
                        }, 500);
                      } catch (error) {
                        console.error("DynamicWorksheet: Save failed:", error);
                        const { toast } = await import("@/hooks/use-toast");
                        toast({
                          title: "❌ Save Failed",
                          description: "There was an error saving your configuration. Please try again.",
                          variant: "destructive"
                        });
                      }
                    }}
                    disabled={readOnly}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                  
                  {onSaveTreatment && (
                    <Button 
                      variant="outline"
                      onClick={async () => {
                        try {
                          console.log("DynamicWorksheet: Starting treatment save...");
                          await onSaveTreatment?.({
                            window_type: selectedWindowType,
                            template: selectedTemplate,
                            measurements,
                            selected_items: selectedItems,
                            fabric_calculation: fabricCalculation
                          });
                          console.log("DynamicWorksheet: Treatment saved successfully");
                          
                          setTimeout(() => {
                            console.log("DynamicWorksheet: Closing dialog after treatment save");
                            onClose?.();
                          }, 500);
                        } catch (error) {
                          console.error("DynamicWorksheet: Treatment save failed:", error);
                        }
                      }}
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