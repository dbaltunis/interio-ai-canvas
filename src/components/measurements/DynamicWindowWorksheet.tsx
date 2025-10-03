import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ruler, Package, Calculator, Save } from "lucide-react";

import { WindowTypeSelector } from "../window-types/WindowTypeSelector";
import { TreatmentPreviewEngine } from "../treatment-visualizers/TreatmentPreviewEngine";
import { InventorySelectionPanel } from "../inventory/InventorySelectionPanel";
import { ImprovedTreatmentSelector } from "./treatment-selection/ImprovedTreatmentSelector";
import { VisualMeasurementSheet } from "./VisualMeasurementSheet";
import { CostCalculationSummary } from "./dynamic-options/CostCalculationSummary";
import { LayeredTreatmentManager } from "../job-creation/LayeredTreatmentManager";

import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { useHeadingInventory } from "@/hooks/useHeadingInventory";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { convertLength } from "@/hooks/useBusinessSettings";
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
  const { data: headingInventory = [] } = useHeadingInventory();
  const { data: headingOptionsFromSettings = [] } = useHeadingOptions();
  const queryClient = useQueryClient();

  // Helper function to get heading name from ID
  const getHeadingName = (headingId: string) => {
    if (headingId === 'standard') return 'Standard';
    if (headingId === 'no-heading') return 'No heading';
    
    // Try heading options from settings first
    const settingsHeading = headingOptionsFromSettings.find(h => h.id === headingId);
    if (settingsHeading) return settingsHeading.name;
    
    // Try heading inventory
    const inventoryHeading = headingInventory.find(h => h.id === headingId);
    if (inventoryHeading) return inventoryHeading.name;
    
    // Fallback to the ID if not found
    return headingId;
  };

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
          // Convert stored cm values back to user's preferred unit
          rail_width: measurementsDetails.rail_width_cm 
            ? convertLength(measurementsDetails.rail_width_cm, 'cm', units.length).toString()
            : measurementsDetails.rail_width?.toString() || "",
          drop: measurementsDetails.drop_cm 
            ? convertLength(measurementsDetails.drop_cm, 'cm', units.length).toString()
            : measurementsDetails.drop?.toString() || "",
          ...measurementsDetails
        };
        setMeasurements(loadedMeasurements);
        console.log("📊 Loaded measurements (converted to user units):", loadedMeasurements);
        
        // Load heading and lining selections from measurements_details
        if (measurementsDetails.selected_heading) {
          setSelectedHeading(measurementsDetails.selected_heading);
          console.log("📊 Loaded heading:", measurementsDetails.selected_heading);
        }
        if (measurementsDetails.selected_lining) {
          setSelectedLining(measurementsDetails.selected_lining);
          console.log("📊 Loaded lining:", measurementsDetails.selected_lining);
        }
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
      if (existingWindowSummary.linear_meters && existingWindowSummary.fabric_cost) {
        setFabricCalculation({
          linearMeters: existingWindowSummary.linear_meters,
          totalCost: existingWindowSummary.fabric_cost, // Use fabric_cost, not total_cost!
          pricePerMeter: existingWindowSummary.price_per_meter,
          widthsRequired: existingWindowSummary.widths_required
        });
        console.log("📊 Loaded fabric calculation with correct fabric cost:", {
          linearMeters: existingWindowSummary.linear_meters,
          fabricCost: existingWindowSummary.fabric_cost,
          totalCost: existingWindowSummary.total_cost
        });
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
              const liningPricePerMeter = liningOption.price_per_metre || 0;
              const liningLaborPerCurtain = liningOption.labour_per_curtain || 0;
              liningCost = (liningPricePerMeter * fabricCalculation.linearMeters) + liningLaborPerCurtain;
            }
          }
          
          // Calculate heading cost if selected
          let headingCost = 0;
          let headingName = 'Standard';
          
          console.log("🎯 AutoSave heading calculation:", {
            selectedHeading,
            headingOptionsFromSettings: headingOptionsFromSettings.length,
            headingInventory: headingInventory?.length,
            railWidth: measurements.rail_width
          });
          
          if (selectedHeading && selectedHeading !== 'standard' && selectedTemplate && fabricCalculation) {
            const headingUpchargePerCurtain = selectedTemplate.heading_upcharge_per_curtain || 0;
            const headingUpchargePerMetre = selectedTemplate.heading_upcharge_per_metre || 0;
            headingCost = headingUpchargePerCurtain + (headingUpchargePerMetre * fabricCalculation.linearMeters);
            
            // Add additional heading costs from settings/inventory
            const headingOptionFromSettings = headingOptionsFromSettings.find(h => h.id === selectedHeading);
            console.log("🎯 Found heading in settings:", headingOptionFromSettings);
            
            if (headingOptionFromSettings) {
              const width = parseFloat(measurements.rail_width) || 0;
              const additionalCost = headingOptionFromSettings.price * width / 100; // Convert cm to m
              headingCost += additionalCost;
              headingName = headingOptionFromSettings.name;
              console.log("🎯 Settings heading cost:", additionalCost, "name:", headingName);
            } else {
              const headingItem = headingInventory?.find(item => item.id === selectedHeading);
              console.log("🎯 Found heading in inventory:", headingItem);
              
              if (headingItem) {
                const width = parseFloat(measurements.rail_width) || 0;
                const additionalCost = (headingItem.price_per_meter || headingItem.selling_price || 0) * width / 100;
                headingCost += additionalCost;
                headingName = headingItem.name;
                console.log("🎯 Inventory heading cost:", additionalCost, "name:", headingName);
              } else {
                // Use getHeadingName helper as fallback
                headingName = getHeadingName(selectedHeading);
                console.log("🎯 Fallback heading name:", headingName);
              }
            }
            
            console.log("🎯 Final heading calculation:", { headingCost, headingName, selectedHeading });
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

          // Use existing calculated costs and add proper details storage
          const finalLiningCost = liningCost; // Already calculated above
          let liningDetails = {};
          if (selectedLining && selectedLining !== 'none' && selectedTemplate) {
            const liningTypes = selectedTemplate.lining_types || [];
            const liningOption = liningTypes.find(l => l.type === selectedLining);
            if (liningOption) {
              liningDetails = liningOption;
            }
          }

          // Create proper heading details with correct name and cost
          const finalHeadingCost = headingCost;
          let headingDetails = {};
          
          console.log("🎯 Creating heading details:", { selectedHeading, headingName, finalHeadingCost });
          
          if (selectedHeading && selectedHeading !== 'standard') {
            headingDetails = {
              heading_name: headingName,
              id: selectedHeading,
              cost: finalHeadingCost
            };
          } else {
            headingDetails = {
              heading_name: 'Standard',
              id: 'standard',
              cost: 0
            };
          }
          
          console.log("🎯 Final heading details for save:", headingDetails);

          // Recalculate total cost with proper lining and heading costs
          const finalTotalCost = fabricCost + finalLiningCost + finalHeadingCost + manufacturingCost;

          // Create summary data for windows_summary table
          const summaryData = {
            window_id: surfaceId,
            linear_meters: fabricCalculation?.linearMeters || 0,
            widths_required: fabricCalculation?.widthsRequired || 0,
            price_per_meter: fabricCalculation?.pricePerMeter || selectedItems.fabric?.selling_price || 0,
            fabric_cost: fabricCost,
            lining_type: selectedLining || 'none',
            lining_cost: finalLiningCost,
            lining_details: liningDetails,
            manufacturing_type: selectedTemplate?.manufacturing_type || 'machine',
            manufacturing_cost: manufacturingCost,
            total_cost: finalTotalCost,
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
            heading_details: headingDetails,
            measurements_details: {
              ...measurements,
              // Convert user input to centimeters for storage (always store in cm)
              rail_width_cm: measurements.rail_width ? convertLength(parseFloat(measurements.rail_width), units.length, 'cm') : 0,
              drop_cm: measurements.drop ? convertLength(parseFloat(measurements.drop), units.length, 'cm') : 0,
              // Store original values with unit for reference
              rail_width: measurements.rail_width,
              drop: measurements.drop,
              unit: units.length,
              surface_id: surfaceId,
              surface_name: surfaceData?.name,
              curtain_type: selectedTemplate?.curtain_type || 'single',
              fullness_ratio: selectedTemplate?.fullness_ratio || 2,
              fabric_width_cm: selectedItems.fabric?.fabric_width || 140,
              window_type: selectedWindowType?.name || 'Standard Window',
              selected_heading: selectedHeading,
              selected_lining: selectedLining
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
        {["window-type", "treatment", "inventory", "measurements"].map((step, index) => {
          const stepNames = ["Window Type", "Treatment", "Inventory", "Measurements"];
          const isCompleted = (() => {
            switch(step) {
              case "window-type": return selectedWindowType;
              case "treatment": return selectedTemplate || (isLayeredMode && layeredTreatments.length > 0);
              case "inventory": return Object.values(selectedItems).some(item => item);
              case "measurements": return measurements.rail_width && measurements.drop;
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
              {index < 3 && <div className="w-8 h-px bg-border mx-2" />}
            </div>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
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
        </TabsList>

        {/* Window Type Selection */}
        <TabsContent value="window-type" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <WindowTypeSelector
                selectedWindowType={selectedWindowType}
                onWindowTypeChange={setSelectedWindowType}
                readOnly={readOnly}
              />
              
              {selectedWindowType && (
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Selected: {selectedWindowType.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">{selectedWindowType.description}</p>
                  
                  <Button 
                    className="w-full" 
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
            <CardContent className="pt-6">
              <ImprovedTreatmentSelector
                selectedCoveringId={selectedTemplate?.id || ""}
                onCoveringSelect={(template) => {
                  setSelectedTemplate(template);
                }}
                disabled={readOnly}
              />
              
              <div className="mt-4">
                <Button 
                  onClick={() => setActiveTab("inventory")}
                  disabled={!selectedTemplate}
                  className="w-full"
                >
                  Continue to Inventory Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Selection */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
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
                  className="w-full"
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
            <CardContent className="p-0">
              <div className="space-y-6">
                {/* Full Width Visual Worksheet */}
                <div className="w-full">
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

                {/* Bottom Section - Configuration & Cost */}
                <div className="px-6 pb-6 space-y-4">
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
                    onClick={async () => {
                      try {
                        console.log("DynamicWorksheet: Starting save from measurements tab...");
                        const currentRef = ref as React.MutableRefObject<{ autoSave: () => Promise<void> }>;
                        if (currentRef?.current) {
                          await currentRef.current.autoSave();
                        }
                        
                        const { toast } = await import("@/hooks/use-toast");
                        toast({
                          title: "✅ Configuration Saved",
                          description: "Your window configuration has been saved successfully",
                        });
                        
                        setTimeout(() => {
                          onClose?.();
                        }, 500);
                      } catch (error) {
                        console.error("Save failed:", error);
                        const { toast } = await import("@/hooks/use-toast");
                        toast({
                          title: "❌ Save Failed",
                          description: "There was an error saving your configuration.",
                          variant: "destructive"
                        });
                      }
                    }}
                    disabled={!measurements.rail_width || !measurements.drop}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});