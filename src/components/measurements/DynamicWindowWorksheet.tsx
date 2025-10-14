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
import { detectTreatmentType, getTreatmentConfig, TreatmentCategory } from "@/utils/treatmentTypeDetection";
interface DynamicWindowWorksheetProps {
  clientId?: string;
  projectId?: string;
  surfaceId?: string;
  surfaceData?: any;
  visualKey?: string;
  existingMeasurement?: any;
  existingTreatments?: any[];
  onSave?: () => void;
  onClose?: () => void;
  onSaveTreatment?: (treatmentData: any) => void;
  readOnly?: boolean;
}
export const DynamicWindowWorksheet = forwardRef<{
  autoSave: () => Promise<void>;
}, DynamicWindowWorksheetProps>(({
  clientId,
  projectId,
  surfaceId,
  surfaceData,
  visualKey,
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
  const [treatmentCategory, setTreatmentCategory] = useState<TreatmentCategory>('curtains');
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
  const [selectedOptions, setSelectedOptions] = useState<Array<{ name: string; price: number }>>([]);
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
  const {
    data: curtainTemplates = []
  } = useCurtainTemplates();
  const {
    data: windowCoverings = []
  } = useWindowCoverings();
  const {
    units
  } = useMeasurementUnits();
  const {
    data: headingInventory = []
  } = useHeadingInventory();
  const {
    data: headingOptionsFromSettings = []
  } = useHeadingOptions();
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
  const {
    data: existingWindowSummary
  } = useQuery({
    queryKey: ["window-summary", surfaceId],
    queryFn: async () => {
      if (!surfaceId) return null;
      const {
        supabase
      } = await import('@/integrations/supabase/client');
      const {
        data,
        error
      } = await supabase.from("windows_summary").select("*").eq("window_id", surfaceId).maybeSingle();
      if (error) {
        console.error("Error loading window summary:", error);
        return null;
      }
      console.log("✅ Loaded existing window summary:", data);
      return data;
    },
    enabled: !!surfaceId
  });

  // Load existing data and sync with Enhanced mode
  useEffect(() => {
    console.log("🔄 Loading existing data:", {
      existingMeasurement,
      existingWindowSummary,
      existingTreatments
    });

    // Priority 1: Load from windows_summary table if available
    if (existingWindowSummary) {
      console.log("📊 PRIORITY 1: Loading from windows_summary");
      const measurementsDetails = existingWindowSummary.measurements_details as any || {};
      const templateDetails = existingWindowSummary.template_details as any;
      const fabricDetails = existingWindowSummary.fabric_details as any;
      
      // STEP 1: Restore Window Type
      if (existingWindowSummary.window_type_id) {
        const windowTypeData = {
          id: existingWindowSummary.window_type_id,
          name: existingWindowSummary.window_type,
          key: existingWindowSummary.window_type_key,
          visual_key: existingWindowSummary.window_type_key
        };
        setSelectedWindowType(windowTypeData);
        console.log("📊 Restored window type:", windowTypeData);
      }
      
      // STEP 2: Restore Treatment/Template
      if (templateDetails) {
        setSelectedTemplate(templateDetails);
        console.log("📊 Restored template:", templateDetails.name);
      }
      if (existingWindowSummary.treatment_type) {
        setSelectedTreatmentType(existingWindowSummary.treatment_type);
      }
      if (existingWindowSummary.treatment_category) {
        setTreatmentCategory(existingWindowSummary.treatment_category as TreatmentCategory);
      }
      
      // STEP 3: Restore Inventory Selections
      const restoredItems: any = {};
      
      // Restore fabric selection - set both full object AND id
      if (fabricDetails && (fabricDetails.fabric_id || fabricDetails.id)) {
        restoredItems.fabric = {
          id: fabricDetails.fabric_id || fabricDetails.id,
          ...fabricDetails
        };
        console.log("📊 Restored fabric with ID:", fabricDetails.fabric_id || fabricDetails.id, fabricDetails.name);
      } else if (existingWindowSummary.selected_fabric_id && fabricDetails) {
        // Fallback: try using selected_fabric_id
        restoredItems.fabric = {
          id: existingWindowSummary.selected_fabric_id,
          ...fabricDetails
        };
        console.log("📊 Restored fabric using selected_fabric_id:", existingWindowSummary.selected_fabric_id);
      }
      
      // Restore hardware selection
      if (existingWindowSummary.hardware_details && typeof existingWindowSummary.hardware_details === 'object') {
        const hardwareDetails = existingWindowSummary.hardware_details as any;
        restoredItems.hardware = {
          id: existingWindowSummary.selected_hardware_id || hardwareDetails.id,
          ...hardwareDetails
        };
        console.log("📊 Restored hardware:", restoredItems.hardware.id, restoredItems.hardware.name);
      }
      
      // Restore material selection
      if (existingWindowSummary.material_details && typeof existingWindowSummary.material_details === 'object') {
        const materialDetails = existingWindowSummary.material_details as any;
        restoredItems.material = {
          id: existingWindowSummary.selected_material_id || materialDetails.id,
          ...materialDetails
        };
        console.log("📊 Restored material:", restoredItems.material.id, restoredItems.material.name);
      }
      
      if (Object.keys(restoredItems).length > 0) {
        console.log("📊 Setting restored items:", restoredItems);
        setSelectedItems(restoredItems);
      }
      
      // Restore heading and lining
      if (existingWindowSummary.selected_heading_id) {
        setSelectedHeading(existingWindowSummary.selected_heading_id);
        console.log("📊 Restored heading:", existingWindowSummary.selected_heading_id);
      }
      if (existingWindowSummary.selected_lining_type) {
        setSelectedLining(existingWindowSummary.selected_lining_type);
        console.log("📊 Restored lining:", existingWindowSummary.selected_lining_type);
      }
      
      // STEP 4: Restore Measurements
      if (measurementsDetails) {
        setMeasurements(measurementsDetails);
        console.log("📊 Restored measurements:", measurementsDetails);
      }
      
      
      // Set fabric calculation if available
      if (existingWindowSummary.linear_meters && existingWindowSummary.fabric_cost) {
        setFabricCalculation({
          linearMeters: existingWindowSummary.linear_meters,
          totalCost: existingWindowSummary.fabric_cost,
          pricePerMeter: existingWindowSummary.price_per_meter,
          widthsRequired: existingWindowSummary.widths_required
        });
        console.log("📊 Loaded fabric calculation:", {
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
        const details = typeof treatment.treatment_details === 'string' ? JSON.parse(treatment.treatment_details) : treatment.treatment_details;
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

  // Detect treatment type when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const detectedType = detectTreatmentType(selectedTemplate);
      const previousCategory = treatmentCategory;
      setTreatmentCategory(detectedType);
      console.log('🎯 Treatment type detected:', detectedType, 'for template:', selectedTemplate.name);
      
      // Clear selected items if treatment category changed (e.g., switching from roller blinds to curtains)
      if (previousCategory !== detectedType) {
        console.log('🔄 Treatment category changed from', previousCategory, 'to', detectedType, '- clearing selected items');
        setSelectedItems({});
      }
    }
  }, [selectedTemplate]);

  // Enhanced auto-save implementation with cross-mode data
  useImperativeHandle(ref, () => ({
    autoSave: async () => {
      try {
          console.log("🔄 DynamicWindowWorksheet: Starting auto-save for surface:", surfaceId);
          
          // Log fabric selection state for debugging
          console.log("📦 Fabric selection state:", {
            hasFabric: !!selectedItems.fabric,
            fabricId: selectedItems.fabric?.id,
            fabricName: selectedItems.fabric?.name,
            fabricCategory: selectedItems.fabric?.category
          });

          // Only save if we have meaningful data
          if (Object.keys(measurements).length > 0 || selectedWindowType || selectedTemplate) {
          console.log("🔄 DynamicWindowWorksheet: Saving measurement data:", {
            measurements,
            selectedTemplate,
            selectedItems,
            fabricCalculation
          });

          // Import supabase and save to windows_summary table (where UI expects it)
          const {
            supabase
          } = await import('@/integrations/supabase/client');

          // Get current user
          const {
            data: {
              user
            }
          } = await supabase.auth.getUser();
          if (!user) {
            throw new Error("User not authenticated");
          }

          // Detect the specific treatment type early for calculations
          const specificTreatmentType = detectTreatmentType(selectedTemplate);
          const generalCategory = specificTreatmentType.includes('blind') 
            ? 'blinds' 
            : specificTreatmentType.includes('shutter') 
            ? 'shutters' 
            : specificTreatmentType === 'wallpaper'
            ? 'wallpaper'
            : 'curtains';
          
          // Calculate comprehensive costs including all components
          let fabricCost = 0;
          let totalCost = 0;
          let linearMeters = 0;
          let manufacturingCost = 0;
          let wallpaperDetails = null;
          
          // Handle wallpaper calculations
          if (treatmentCategory === 'wallpaper') {
            const wallWidth = parseFloat(measurements.wall_width || '0');
            const wallHeight = parseFloat(measurements.wall_height || '0');
            
            if (wallWidth > 0 && wallHeight > 0 && selectedItems.fabric) {
              // Get wallpaper specs
              const rollWidth = selectedItems.fabric.wallpaper_roll_width || 53;
              const rollLength = selectedItems.fabric.wallpaper_roll_length || 10;
              const patternRepeat = selectedItems.fabric.pattern_repeat_vertical || 0;
              const matchType = selectedItems.fabric.wallpaper_match_type || 'straight';
              
              // Calculate length per strip based on pattern matching
              let lengthPerStripCm = wallHeight;
              if (patternRepeat > 0 && matchType !== 'none' && matchType !== 'random') {
                lengthPerStripCm = wallHeight + patternRepeat;
              }
              const lengthPerStripM = lengthPerStripCm / 100;
              
              // Calculate strips needed
              const stripsNeeded = Math.ceil(wallWidth / rollWidth);
              
              // Calculate total meters needed
              const totalMeters = stripsNeeded * lengthPerStripM;
              
              // Calculate rolls needed
              const stripsPerRoll = Math.floor(rollLength / lengthPerStripM);
              const rollsNeeded = stripsPerRoll > 0 ? Math.ceil(stripsNeeded / stripsPerRoll) : 0;
              
              const pricePerUnit = selectedItems.fabric.unit_price || selectedItems.fabric.selling_price || selectedItems.fabric.price_per_meter || 0;
              const soldBy = selectedItems.fabric.wallpaper_sold_by || 'per_meter';
              
              let quantity = totalMeters;
              let unitLabel = 'meter';
              
              if (soldBy === 'per_roll') {
                quantity = rollsNeeded;
                unitLabel = 'roll';
              } else if (soldBy === 'per_sqm') {
                const wallWidthM = wallWidth / 100;
                const wallHeightM = wallHeight / 100;
                quantity = wallWidthM * wallHeightM;
                unitLabel = 'm²';
              }
              
              fabricCost = quantity * pricePerUnit;
              totalCost = fabricCost;
              linearMeters = totalMeters;
              
              wallpaperDetails = {
                wall_width: wallWidth,
                wall_height: wallHeight,
                roll_width: rollWidth,
                roll_length: rollLength,
                pattern_repeat: patternRepeat,
                match_type: matchType,
                length_per_strip_m: lengthPerStripM,
                strips_needed: stripsNeeded,
                total_meters: totalMeters,
                rolls_needed: rollsNeeded,
                sold_by: soldBy,
                quantity: quantity,
                unit_label: unitLabel,
                price_per_unit: pricePerUnit,
                wallpaper_cost: fabricCost
              };
              
              console.log("💰 Wallpaper autoSave calculation:", wallpaperDetails);
            }
          } else if (generalCategory === 'blinds' || generalCategory === 'shutters') {
            // BLIND/SHUTTER CALCULATIONS
            const width = parseFloat(measurements.rail_width) || 0;
            const height = parseFloat(measurements.drop) || 0;
            
            // Import blind calculation utility
            const { calculateBlindCost, calculateShutterCost } = await import('@/utils/blindCostCalculations');
            
            // Use material or template for pricing
            const materialForCalc = selectedItems.material || (selectedTemplate ? {
              unit_price: selectedTemplate.unit_price || 0,
              selling_price: selectedTemplate.unit_price || 0
            } : null);
            
            console.log('🎯 Calculating blind cost:', {
              width,
              height,
              template: selectedTemplate?.name,
              material: materialForCalc,
              category: generalCategory
            });
            
            const blindCalc = generalCategory === 'shutters' 
              ? calculateShutterCost(width, height, selectedTemplate, materialForCalc, selectedOptions || [])
              : calculateBlindCost(width, height, selectedTemplate, materialForCalc, selectedOptions || []);
            
            fabricCost = blindCalc.fabricCost;
            manufacturingCost = blindCalc.manufacturingCost;
            linearMeters = blindCalc.linearMeters;
            totalCost = blindCalc.totalCost;
            
            console.log('💰 Blind calculation result:', blindCalc);
          } else {
            // Original curtain calculations  
            fabricCost = fabricCalculation?.totalCost || 0;
            linearMeters = fabricCalculation?.linearMeters || 0;
          }

          // Calculate lining cost (for curtains only)
          let liningCost = 0;
          if (treatmentCategory !== 'wallpaper' && selectedLining && selectedLining !== 'none' && selectedTemplate && fabricCalculation) {
            const liningTypes = selectedTemplate.lining_types || [];
            const liningOption = liningTypes.find(l => l.type === selectedLining);
            if (liningOption) {
              const liningPricePerMeter = liningOption.price_per_metre || 0;
              const liningLaborPerCurtain = liningOption.labour_per_curtain || 0;
              liningCost = liningPricePerMeter * fabricCalculation.linearMeters + liningLaborPerCurtain;
            }
          }

          // Calculate heading cost (for curtains only)
          let headingCost = 0;
          let headingName = 'Standard';
          if (treatmentCategory !== 'wallpaper') {
            console.log("🎯 AutoSave heading calculation:", {
              selectedHeading,
              headingOptionsFromSettings: headingOptionsFromSettings.length,
              headingInventory: headingInventory?.length,
              railWidth: measurements.rail_width
            });
            if (selectedHeading && selectedHeading !== 'standard' && selectedTemplate && fabricCalculation) {
              const headingUpchargePerCurtain = selectedTemplate.heading_upcharge_per_curtain || 0;
              const headingUpchargePerMetre = selectedTemplate.heading_upcharge_per_metre || 0;
              headingCost = headingUpchargePerCurtain + headingUpchargePerMetre * fabricCalculation.linearMeters;

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
              console.log("🎯 Final heading calculation:", {
                headingCost,
                headingName,
                selectedHeading
              });
            }
          }

          // Calculate manufacturing cost (for curtains only - blinds already calculated)
          if (generalCategory === 'curtains' && selectedTemplate && fabricCalculation) {
            const manufacturingType = selectedTemplate.manufacturing_type || 'machine';
            const linearMetersForManufacturing = fabricCalculation.linearMeters || 0;
            if (manufacturingType === 'machine') {
              manufacturingCost = (selectedTemplate.machine_price_per_metre || 0) * linearMetersForManufacturing;
            } else if (manufacturingType === 'hand') {
              manufacturingCost = (selectedTemplate.hand_price_per_metre || 0) * linearMetersForManufacturing;
            }
          }

          // Calculate total cost (blinds already have totalCost calculated)
          if (treatmentCategory === 'wallpaper') {
            totalCost = fabricCost; // Already calculated above for wallpaper
          } else if (generalCategory === 'blinds' || generalCategory === 'shutters') {
            // Don't recalculate - blind totalCost already includes everything
            // totalCost already set from blindCalc.totalCost above
          } else {
            // Curtains
            totalCost = fabricCost + liningCost + headingCost + manufacturingCost;
          }

          // Create comprehensive calculation object for display consistency
          const calculation = {
            fabricCost,
            liningCost,
            headingCost,
            manufacturingCost,
            totalCost,
            wallpaperDetails
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
          console.log("🎯 Creating heading details:", {
            selectedHeading,
            headingName,
            finalHeadingCost
          });
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

          // Create summary data for windows_summary table - Save ALL 4 steps
          // Note: specificTreatmentType and generalCategory already declared earlier
          
          console.log('🎯 DynamicWorksheet treatment type detection for save:', {
            specificTreatmentType,
            generalCategory,
            templateName: selectedTemplate?.name,
            curtainType: selectedTemplate?.curtain_type,
            treatmentCategory
          });
          
          const summaryData = {
            window_id: surfaceId,
            linear_meters: linearMeters,
            widths_required: fabricCalculation?.widthsRequired || 0,
            price_per_meter: fabricCalculation?.pricePerMeter || selectedItems.fabric?.selling_price || selectedItems.fabric?.unit_price || 0,
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
            
            // STEP 1: Window Type Selection
            window_type: selectedWindowType?.name || 'Standard Window',
            window_type_key: selectedWindowType?.key || 'standard',
            window_type_id: selectedWindowType?.id,
            
            // STEP 2: Treatment/Template Selection
            template_name: selectedTemplate?.name,
            template_details: selectedTemplate,
            treatment_type: specificTreatmentType, // CRITICAL: Save specific type like 'venetian_blinds'
            treatment_category: generalCategory, // Save general category like 'blinds'
            
            // STEP 3: Inventory Selections (Fabric, Hardware, Materials)
            fabric_details: selectedItems.fabric ? {
              ...selectedItems.fabric,
              fabric_id: selectedItems.fabric.id,
              width_cm: selectedItems.fabric.fabric_width || selectedItems.fabric.wallpaper_roll_width || 140,
              width: selectedItems.fabric.fabric_width || selectedItems.fabric.wallpaper_roll_width || 140,
              category: selectedItems.fabric.category, // Include fabric category for detection
              image_url: selectedItems.fabric.image_url // Include image for display
            } : null,
            selected_fabric_id: selectedItems.fabric?.id || null,
            selected_hardware_id: selectedItems.hardware?.id || null,
            selected_material_id: selectedItems.material?.id || null,
            hardware_details: selectedItems.hardware || null,
            // For blinds/shutters: Use template data as material if no material selected
            material_details: selectedItems.material || (
              (generalCategory === 'blinds' || generalCategory === 'shutters') && selectedTemplate
                ? {
                    id: selectedTemplate.id,
                    name: selectedTemplate.name,
                    description: selectedTemplate.description,
                    image_url: selectedTemplate.image_url,
                    category: treatmentCategory,
                    treatment_type: specificTreatmentType,
                    template_based: true, // Flag to indicate this is from template
                    pricing_type: selectedTemplate.pricing_type,
                    unit_price: selectedTemplate.unit_price || 0
                  }
                : null
            ),
            
            heading_details: headingDetails,
            selected_heading_id: selectedHeading,
            selected_lining_type: selectedLining,
            
            // Add wallpaper-specific details if applicable
            wallpaper_details: wallpaperDetails,
            
            // STEP 4: Measurements - Store both raw and converted values INCLUDING selected_options
            measurements_details: {
              ...measurements,
              // CRITICAL: Store selected options for blinds/shutters inside measurements_details
              selected_options: selectedOptions,
              // Convert user input to centimeters for storage (always store in cm)
              rail_width_cm: measurements.rail_width ? convertLength(parseFloat(measurements.rail_width), units.length, 'cm') : 0,
              drop_cm: measurements.drop ? convertLength(parseFloat(measurements.drop), units.length, 'cm') : 0,
              wall_width_cm: measurements.wall_width ? parseFloat(measurements.wall_width) : 0,
              wall_height_cm: measurements.wall_height ? parseFloat(measurements.wall_height) : 0,
              // Store original values with unit for reference
              rail_width: measurements.rail_width,
              drop: measurements.drop,
              wall_width: measurements.wall_width,
              wall_height: measurements.wall_height,
              unit: units.length,
              surface_id: surfaceId,
              surface_name: surfaceData?.name,
              curtain_type: selectedTemplate?.curtain_type || (treatmentCategory === 'wallpaper' ? 'wallpaper' : 'single'),
              fullness_ratio: selectedTemplate?.fullness_ratio || (treatmentCategory === 'wallpaper' ? 1 : 2),
              fabric_width_cm: selectedItems.fabric?.fabric_width || selectedItems.fabric?.wallpaper_roll_width || 140,
              window_type: selectedWindowType?.name || 'Room Wall',
              selected_heading: selectedHeading,
              selected_lining: selectedLining
            }
          };

          // Debug: Log what we're about to save
          console.log("💾 About to save summary data:", {
            window_id: summaryData.window_id,
            selected_fabric_id: summaryData.selected_fabric_id,
            fabric_details_exists: !!summaryData.fabric_details,
            fabric_details: summaryData.fabric_details
          });

          // Save to windows_summary table
          const {
            data,
            error
          } = await supabase.from('windows_summary').upsert(summaryData, {
            onConflict: 'window_id'
          }).select().maybeSingle();
          
          if (error) {
            console.error("❌ DynamicWindowWorksheet: Database save error:", error);
            throw error;
          }
          
          if (!data) {
            console.error("❌ DynamicWindowWorksheet: No data returned after save");
            throw new Error("Failed to save window summary - no data returned");
          }

          // Invalidate cache to refresh UI
          await queryClient.invalidateQueries({
            queryKey: ["window-summary", surfaceId]
          });
          await queryClient.invalidateQueries({
            queryKey: ["project-window-summaries"]
          });
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
    
    // Auto-detect treatment type from fabric category
    if (category === 'fabric' && item?.category) {
      const fabricCat = item.category.toLowerCase();
      if (fabricCat.includes('wallcover') || fabricCat.includes('wallpaper')) {
        setSelectedTreatmentType('wallpaper');
        setTreatmentCategory('wallpaper');
      } else if (fabricCat.includes('blind')) {
        setSelectedTreatmentType('blinds');
        setTreatmentCategory('roller_blinds');
      }
    }
  };
  const handleItemDeselect = (category: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: undefined
    }));
  };
  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    // Set treatment type based on template category
    const category = template?.treatment_category || 'curtains';
    setSelectedTreatmentType(category === 'wallpaper' ? 'wallpaper' : category);
    setTreatmentCategory(category);
  };
  const canProceedToMeasurements = selectedWindowType && (selectedTemplate || selectedTreatmentType);
  const canShowPreview = canProceedToMeasurements && Object.keys(measurements).length > 0;
  return <div className="space-y-6">
      {/* Enhanced Progress indicator with clickable navigation */}
      <div className="flex items-center space-x-4">
        {["window-type", "treatment", "inventory", "measurements"].map((step, index) => {
        const stepNames = ["Window Type", "Treatment", "Inventory", "Measurements"];
        const isCompleted = (() => {
          switch (step) {
            case "window-type":
              return selectedWindowType;
            case "treatment":
              return selectedTemplate || isLayeredMode && layeredTreatments.length > 0;
            case "inventory":
              return Object.values(selectedItems).some(item => item);
            case "measurements":
              return measurements.rail_width && measurements.drop;
            default:
              return false;
          }
        })();
        return <div key={step} className="flex items-center">
              <button onClick={() => setActiveTab(step)} disabled={readOnly} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${activeTab === step ? 'bg-primary text-primary-foreground' : isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200 animate-scale-in' : 'bg-muted text-muted-foreground hover:bg-muted/80'} ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`} title={`${stepNames[index]} ${isCompleted ? '(Completed)' : ''}`}>
                {isCompleted ? <span className="animate-fade-in">✓</span> : index + 1}
              </button>
              {index < 3 && <div className="w-8 h-px bg-border mx-2" />}
            </div>;
      })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="window-type">
            <Ruler className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Select Type</span>
            {selectedWindowType && <span className="ml-1 text-xs">✓</span>}
          </TabsTrigger>
          <TabsTrigger value="treatment">
            <Package className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Treatment</span>
            {(selectedTemplate || isLayeredMode && layeredTreatments.length > 0) && <span className="ml-1 text-xs">✓</span>}
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Inventory</span>
            {Object.values(selectedItems).some(item => item) && <span className="ml-1 text-xs">✓</span>}
          </TabsTrigger>
          <TabsTrigger value="measurements">
            <Ruler className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Measurements</span>
            {measurements.rail_width && measurements.drop && <span className="ml-1 text-xs">✓</span>}
          </TabsTrigger>
        </TabsList>

        {/* Window Type Selection */}
        <TabsContent value="window-type" className="space-y-4">
          <Card>
            <CardContent className="pt-6 min-h-[500px] flex flex-col">
              <WindowTypeSelector selectedWindowType={selectedWindowType} onWindowTypeChange={setSelectedWindowType} readOnly={readOnly} />
              
              <div className="mt-auto space-y-3">
                {selectedWindowType && <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 animate-fade-in">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Selected: {selectedWindowType.name}
                  </h4>
                </div>}
                
                <Button className="w-full" onClick={() => setActiveTab("treatment")} disabled={!selectedWindowType}>
                  Continue to Treatment Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatment Selection */}
        <TabsContent value="treatment" className="space-y-4">
          <Card>
            <CardContent className="pt-6 min-h-[500px] flex flex-col">
              <ImprovedTreatmentSelector 
                selectedCoveringId={selectedTemplate?.id || ""} 
                onCoveringSelect={template => {
                  setSelectedTemplate(template);
                }} 
                disabled={readOnly}
                visualKey={selectedWindowType?.visual_key}
              />
              
              <div className="mt-auto space-y-3">
                {selectedTemplate && <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 animate-fade-in">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Selected: {selectedTemplate.name}
                  </h4>
                </div>}
                
                <Button onClick={() => setActiveTab("inventory")} disabled={!selectedTemplate} className="w-full">
                  Continue to Inventory Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Selection */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardContent className="pt-6 min-h-[500px] flex flex-col">
              <InventorySelectionPanel treatmentType={selectedTreatmentType} selectedItems={selectedItems} onItemSelect={handleItemSelect} onItemDeselect={handleItemDeselect} measurements={measurements} treatmentCategory={treatmentCategory} />
              
              <div className="mt-auto space-y-3">
                {Object.values(selectedItems).some(item => item) && <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 animate-fade-in">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {Object.entries(selectedItems).map(([category, item]) => item && (
                      <span key={category} className="text-xs">
                        <span className="font-medium capitalize">{category}:</span> {item.name}
                      </span>
                    )).filter(Boolean).reduce((prev, curr) => [prev, ' • ', curr] as any)}
                  </div>
                </div>}
                
                {!Object.values(selectedItems).some(item => item) && <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    No inventory selection required for this treatment. Click continue to proceed to measurements.
                  </p>
                </div>}
                
                <Button 
                  onClick={() => {
                    console.log("📍 Navigating to measurements tab with items:", selectedItems);
                    setActiveTab("measurements");
                  }} 
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
                    treatmentCategory={treatmentCategory}
                    selectedOptions={selectedOptions}
                    onSelectedOptionsChange={setSelectedOptions}
                  />
                </div>

                {/* Bottom Section - Configuration & Cost */}
                <div className="space-y-4">
                  

                  <CostCalculationSummary 
                    template={selectedTemplate} 
                    measurements={measurements} 
                    selectedFabric={selectedItems.fabric} 
                    selectedLining={selectedLining} 
                    selectedHeading={selectedHeading} 
                    inventory={[]} 
                    fabricCalculation={fabricCalculation}
                    selectedOptions={selectedOptions}
                  />
                  
                  <Button onClick={async () => {
                  try {
                    console.log("DynamicWorksheet: Starting save from measurements tab...");
                    const currentRef = ref as React.MutableRefObject<{
                      autoSave: () => Promise<void>;
                    }>;
                    if (currentRef?.current) {
                      await currentRef.current.autoSave();
                    }
                    const {
                      toast
                    } = await import("@/hooks/use-toast");
                    toast({
                      title: "✅ Configuration Saved",
                      description: "Your window configuration has been saved successfully"
                    });
                    
                    // Wait a bit longer before closing to ensure state updates complete
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    // Close dialog
                    onClose?.();
                  } catch (error) {
                    console.error("Save failed:", error);
                    const {
                      toast
                    } = await import("@/hooks/use-toast");
                    toast({
                      title: "❌ Save Failed",
                      description: error instanceof Error ? error.message : "There was an error saving your configuration.",
                      variant: "destructive"
                    });
                  }
                }} disabled={
                  // For wallpaper, check wall_width and wall_height
                  treatmentCategory === 'wallpaper' 
                    ? (!measurements.wall_width || !measurements.wall_height)
                    : (!measurements.rail_width || !measurements.drop)
                } className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
});