import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ruler, Package, Calculator, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { saveQueueService } from "@/services/saveQueueService";
import { draftService } from "@/services/draftService";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
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
import { calculateWallpaperCost } from "@/utils/wallpaperCalculations";
import { MeasurementWorksheetSkeleton } from "./skeleton/MeasurementWorksheetSkeleton";
import { ColorSelector } from "./ColorSelector";

/**
 * CRITICAL MEASUREMENT UNIT STANDARD
 * ===================================
 * ALL measurements in windows_summary table are stored in MILLIMETERS (MM).
 * This is the universal internal standard across the entire application.
 * 
 * CONVERSION FLOW:
 * 1. INPUT: User enters measurement in their preferred unit (mm/cm/inches/feet)
 * 2. SAVE: Convert from user unit → MM, store in database
 * 3. LOAD: Read MM from database → convert to user's preferred unit for display
 * 4. DISPLAY: All components receive MM values and convert to display unit
 * 
 * VALIDATION:
 * - Typical window dimensions: 500-3000mm (width/height)
 * - Values < 100mm trigger warnings (likely unit conversion error)
 * - Values stored as null for zero/empty inputs
 * 
 * See: src/types/measurements.ts for type definitions and conversion utilities
 * See: UNIT_STANDARD.md for comprehensive documentation
 */

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
  
  // Clear treatment selection when window type changes
  useEffect(() => {
    if (selectedWindowType?.visualKey && selectedWindowType.visualKey !== visualKey) {
      console.log('🔄 Window type changed, clearing treatment selection');
      setSelectedTemplate(null);
      setTreatmentCategory('curtains');
      setSelectedTreatmentType('curtains');
    }
  }, [selectedWindowType, visualKey]);
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
  const [selectedOptions, setSelectedOptions] = useState<Array<{ name: string; price: number; pricingMethod?: string; pricingGridData?: any }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // ✅ SINGLE SOURCE OF TRUTH: Calculated costs stored once, used everywhere
  const [calculatedCosts, setCalculatedCosts] = useState({
    fabricLinearMeters: 0,
    fabricTotalMeters: 0,
    fabricCostPerMeter: 0,
    fabricTotalCost: 0,
    liningCost: 0,
    manufacturingCost: 0,
    headingCost: 0,
    optionsCost: 0,
    totalCost: 0,
    // Metadata for display
    horizontalPiecesNeeded: 1,
    fabricOrientation: 'vertical' as 'horizontal' | 'vertical',
    seamsRequired: 0,
    widthsRequired: 0
  });
  
  const [layeredTreatments, setLayeredTreatments] = useState<Array<{
    id: string;
    type: string;
    template?: any;
    selectedItems?: any;
    zIndex: number;
    opacity: number;
    name: string;
  }>>([]);
  const [isLayeredMode, setIsLayeredMode] = useState(false); // DISABLED: No multiple treatments per window
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const lastSavedState = useRef<any>(null);
  
  // PHASE 1: Prevent continuous state resets from polling
  const hasLoadedInitialData = useRef(false);
  const latestSummaryRef = useRef<any>(null);
  
  // PHASE 4: Track user editing to prevent data reload during typing
  const isUserEditing = useRef(false);

  // Reset the loaded flag when surfaceId changes (new window being edited)
  useEffect(() => {
    hasLoadedInitialData.current = false;
    isUserEditing.current = false;
    console.log('🔄 Surface changed, resetting load flag for surfaceId:', surfaceId);
  }, [surfaceId]);

  // Hooks with loading states
  const {
    data: windowCoverings = [],
    isLoading: windowCoveringsLoading
  } = useWindowCoverings();
  const {
    units
  } = useMeasurementUnits();
  const {
    data: headingInventory = [],
    isLoading: headingInventoryLoading
  } = useHeadingInventory();
  const {
    data: headingOptionsFromSettings = [],
    isLoading: headingOptionsLoading
  } = useHeadingOptions();
  const queryClient = useQueryClient();

  // Combined loading state
  const isInitialLoading = windowCoveringsLoading || headingInventoryLoading || headingOptionsLoading;

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
      console.log('📊 Loaded existing window summary:', data);
      return data;
    },
    enabled: !!surfaceId,
    refetchOnMount: true, // Always refetch when component mounts to ensure fresh data
    staleTime: 0 // Consider data immediately stale to ensure fresh data when editing
  });

  // Keep latestSummaryRef updated but don't trigger state resets
  useEffect(() => {
    latestSummaryRef.current = existingWindowSummary;
  }, [existingWindowSummary]);

  // Load existing data and sync with Enhanced mode - ONLY RUN ONCE ON MOUNT
  useEffect(() => {
    // CRITICAL: Only load data once on mount, never again (prevents polling resets)
    if (hasLoadedInitialData.current || isUserEditing.current) {
      console.log('⏭️ Skipping data load - already loaded or user is editing');
      return;
    }
    
    // Async function to handle data loading
    const loadData = async () => {
      // Priority 1: Load from windows_summary table if available
      if (existingWindowSummary) {
        const measurementsDetails = existingWindowSummary.measurements_details as any || {};
        const templateDetails = existingWindowSummary.template_details as any;
        const fabricDetails = existingWindowSummary.fabric_details as any;
        
        // STEP 1: Restore Window Type (only when editing existing)
        if (existingWindowSummary.window_type_id) {
          const windowTypeData = {
            id: existingWindowSummary.window_type_id,
            name: existingWindowSummary.window_type || 'Standard Window',
            key: existingWindowSummary.window_type_key || 'standard',
            visual_key: existingWindowSummary.window_type_key || 'standard'
          };
          setSelectedWindowType(windowTypeData);
          console.log('✅ Restored window type:', windowTypeData);
        }
        
        // STEP 2: Restore Treatment/Template
        let detectedCategory: TreatmentCategory = 'curtains';
        if (templateDetails) {
          setSelectedTemplate(templateDetails);
          
          // Detect treatment category from template (prioritize curtain_type for wallpaper)
          detectedCategory = detectTreatmentType(templateDetails);
          setTreatmentCategory(detectedCategory);
          setSelectedTreatmentType(detectedCategory);
        }
        if (existingWindowSummary.treatment_type && !templateDetails) {
          setSelectedTreatmentType(existingWindowSummary.treatment_type);
        }
        if (existingWindowSummary.treatment_category && !templateDetails) {
          setTreatmentCategory(existingWindowSummary.treatment_category as TreatmentCategory);
        }
        
        // STEP 3: Restore Inventory Selections
        const restoredItems: any = {};
        
        // Restore fabric selection - for wallpaper, fetch fresh from inventory to get all properties
        if (fabricDetails && (fabricDetails.fabric_id || fabricDetails.id)) {
          const fabricId = fabricDetails.fabric_id || fabricDetails.id;
          
          // For wallpaper, fetch complete item from inventory to ensure all properties are loaded
          if (detectedCategory === 'wallpaper') {
            try {
              const { data: freshWallpaper } = await supabase
                .from('enhanced_inventory_items')
                .select('*')
                .eq('id', fabricId)
                .single();
              
              if (freshWallpaper) {
                restoredItems.fabric = freshWallpaper;
                console.log('✅ Restored fresh wallpaper with all properties:', {
                  id: freshWallpaper.id,
                  name: freshWallpaper.name,
                  roll_width: freshWallpaper.wallpaper_roll_width,
                  roll_length: freshWallpaper.wallpaper_roll_length,
                  pattern_repeat: freshWallpaper.pattern_repeat_vertical,
                  match_type: freshWallpaper.wallpaper_match_type
                });
              } else {
                // Fallback to saved details if fetch fails
                restoredItems.fabric = {
                  ...fabricDetails,
                  id: fabricId,
                  fabric_id: fabricId
                };
              }
            } catch (error) {
              console.error('Error fetching fresh wallpaper:', error);
              // Fallback to saved details
              restoredItems.fabric = {
                ...fabricDetails,
                id: fabricId,
                fabric_id: fabricId
              };
            }
          } else {
            // For non-wallpaper, use saved details
            restoredItems.fabric = {
              ...fabricDetails,
              id: fabricId,
              fabric_id: fabricId
            };
          }
        } else if (existingWindowSummary.selected_fabric_id && fabricDetails) {
          restoredItems.fabric = {
            ...fabricDetails,
            id: existingWindowSummary.selected_fabric_id,
            fabric_id: existingWindowSummary.selected_fabric_id
          };
        }
        
        // Restore hardware selection
        if (existingWindowSummary.selected_hardware_id && existingWindowSummary.hardware_details && typeof existingWindowSummary.hardware_details === 'object') {
          const hardwareDetails = existingWindowSummary.hardware_details as any;
          restoredItems.hardware = {
            id: existingWindowSummary.selected_hardware_id,
            ...hardwareDetails
          };
        }
        
        // Restore material selection
        if (existingWindowSummary.selected_material_id && existingWindowSummary.material_details && typeof existingWindowSummary.material_details === 'object') {
          const materialDetails = existingWindowSummary.material_details as any;
          restoredItems.material = {
            id: existingWindowSummary.selected_material_id,
            ...materialDetails
          };
        }
        
        if (Object.keys(restoredItems).length > 0) {
          setSelectedItems(restoredItems);
        }
        
        // Restore heading and lining
        if (existingWindowSummary.selected_heading_id) {
          setSelectedHeading(existingWindowSummary.selected_heading_id);
        }
        if (existingWindowSummary.selected_lining_type) {
          setSelectedLining(existingWindowSummary.selected_lining_type);
        }
        
        // CRITICAL: Restore selected options for blinds/shutters/etc
        if (measurementsDetails?.selected_options || existingWindowSummary.selected_options) {
          const savedOptions = measurementsDetails?.selected_options || existingWindowSummary.selected_options;
          if (Array.isArray(savedOptions) && savedOptions.length > 0) {
            setSelectedOptions(savedOptions);
            console.log('✅ Restored selected options:', savedOptions);
          }
        }
        
        // STEP 4: Restore Measurements - Convert from stored cm to display units
        if (measurementsDetails) {
          const restoredMeasurements = { ...measurementsDetails };
          
          // CRITICAL: Explicitly restore heading and lining selections into measurements object
          // Priority: measurements_details > summary columns
          restoredMeasurements.selected_heading = measurementsDetails.selected_heading || existingWindowSummary.selected_heading_id || '';
          restoredMeasurements.selected_lining = measurementsDetails.selected_lining || existingWindowSummary.selected_lining_type || 'none';
          
          // CRITICAL: Also update parent state immediately for dropdowns
          if (restoredMeasurements.selected_heading) {
            setSelectedHeading(restoredMeasurements.selected_heading);
          }
          if (restoredMeasurements.selected_lining && restoredMeasurements.selected_lining !== 'none') {
            setSelectedLining(restoredMeasurements.selected_lining);
          }
          
          console.log('🔄 Restoring dropdown values:', {
            selected_heading: restoredMeasurements.selected_heading,
            selected_lining: restoredMeasurements.selected_lining,
            from_measurements: !!measurementsDetails.selected_heading,
            from_summary: !!existingWindowSummary.selected_heading_id,
            updated_parent_state: true
          });
          
          // CRITICAL: Restore ALL treatment option keys (hardware, track_types, mounting_type, etc.)
          // These are stored with keys like 'hardware', 'track_types', etc. in measurements_details
          // but DynamicCurtainOptions looks for them with 'treatment_option_' prefix
          Object.keys(measurementsDetails).forEach(key => {
            // If it looks like a treatment option but doesn't have the prefix, ensure it's accessible both ways
            if (!key.startsWith('treatment_option_') && 
                !key.startsWith('selected_') && 
                !['rail_width', 'drop', 'header_hem', 'bottom_hem', 'side_hems', 'seam_hems', 
                  'return_left', 'return_right', 'waste_percent', 'pooling_amount', 
                  'manufacturing_type', 'heading_fullness', 'curtain_type', 'curtain_side',
                  'pooling_option', 'fabric_rotated', 'surface_id', 'surface_name', 
                  'window_type', 'unit', 'fabric_width_cm', 'wall_width_cm', 'wall_height_cm',
                  'fullness_ratio', 'horizontal_pieces_needed', 'fabric_orientation'].includes(key)) {
              // Also store with treatment_option_ prefix for DynamicCurtainOptions to find
              restoredMeasurements[`treatment_option_${key}`] = measurementsDetails[key];
            }
          });
          
          // PHASE 2: Better zero/null handling - show empty strings instead of "0"
          // Try measurements_details first, then fall back to top-level columns
          const storedRailWidth = measurementsDetails.rail_width || existingWindowSummary.rail_width;
          const storedDrop = measurementsDetails.drop || existingWindowSummary.drop;
          
          // Only convert and display if value exists and is > 0
          // CRITICAL: Database stores in MM, convert from MM to user's preferred unit
          if (storedRailWidth && storedRailWidth > 0) {
            restoredMeasurements.rail_width = convertLength(
              storedRailWidth, 
              'mm', 
              units.length
            ).toString();
          } else {
            restoredMeasurements.rail_width = ""; // Empty string for null/zero
          }
          
          if (storedDrop && storedDrop > 0) {
            restoredMeasurements.drop = convertLength(
              storedDrop, 
              'mm', 
              units.length
            ).toString();
          } else {
            restoredMeasurements.drop = ""; // Empty string for null/zero
          }
          
          // Apply template defaults for missing hem/return/seam values (NOT for saved values)
          // CRITICAL FIX: Also apply defaults when values are explicitly 0
          const templateToUse = existingWindowSummary.template_details || selectedTemplate;
          if (templateToUse) {
            // Apply defaults if values don't exist OR are 0
            const safeValue = (saved: any, ...fallbacks: any[]) => {
              if (saved !== null && saved !== undefined && saved !== 0 && saved !== '0') return saved;
              for (const fb of fallbacks) {
                if (fb !== null && fb !== undefined && fb !== 0 && fb !== '0') return fb;
              }
              return fallbacks[fallbacks.length - 1];
            };
            
            restoredMeasurements.header_hem = safeValue(
              restoredMeasurements.header_hem,
              restoredMeasurements.header_allowance,
              templateToUse.header_hem,
              templateToUse.header_allowance,
              8
            );
            restoredMeasurements.bottom_hem = safeValue(
              restoredMeasurements.bottom_hem,
              restoredMeasurements.bottom_allowance,
              templateToUse.bottom_hem,
              templateToUse.bottom_allowance,
              15
            );
            restoredMeasurements.side_hems = safeValue(
              restoredMeasurements.side_hems,
              restoredMeasurements.side_hem,
              templateToUse.side_hems,
              templateToUse.side_hem,
              7.5
            );
            restoredMeasurements.seam_hems = safeValue(
              restoredMeasurements.seam_hems,
              restoredMeasurements.seam_hem,
              templateToUse.seam_hems,
              templateToUse.seam_allowance,
              1.5
            );
            restoredMeasurements.return_left = safeValue(
              restoredMeasurements.return_left,
              templateToUse.return_left,
              0
            );
            restoredMeasurements.return_right = safeValue(
              restoredMeasurements.return_right,
              templateToUse.return_right,
              0
            );
            restoredMeasurements.waste_percent = safeValue(
              restoredMeasurements.waste_percent,
              templateToUse.waste_percent,
              5
            );
          }
          
          // CRITICAL: Ensure all hem/return/seam values are preserved from saved data
          // These should NOT be overwritten by template defaults later
          console.log('✅ DynamicWorksheet: Restoring ALL saved measurement values:', {
            stored_rail_width_cm: storedRailWidth,
            displayed_rail_width: restoredMeasurements.rail_width || '(empty)',
            stored_drop_cm: storedDrop,
            displayed_drop: restoredMeasurements.drop || '(empty)',
            selected_heading: restoredMeasurements.selected_heading,
            selected_lining: restoredMeasurements.selected_lining,
            header_hem: restoredMeasurements.header_hem,
            bottom_hem: restoredMeasurements.bottom_hem,
            side_hems: restoredMeasurements.side_hems,
            seam_hems: restoredMeasurements.seam_hems,
            return_left: restoredMeasurements.return_left,
            return_right: restoredMeasurements.return_right,
            waste_percent: restoredMeasurements.waste_percent,
            manufacturing_type: restoredMeasurements.manufacturing_type,
            selected_pricing_method: restoredMeasurements.selected_pricing_method
          });
          
          setMeasurements(restoredMeasurements);
        }
        
        // PHASE 1: Mark as loaded to prevent future reloads
        hasLoadedInitialData.current = true;
        console.log('✅ Initial data load complete - will not reload again');
        
        // Set fabric calculation if available - CRITICAL: Include hems and returns
        if (existingWindowSummary.linear_meters && existingWindowSummary.fabric_cost) {
          const md = existingWindowSummary.measurements_details as any || {};
          setFabricCalculation({
            linearMeters: existingWindowSummary.linear_meters,
            totalCost: existingWindowSummary.fabric_cost,
            pricePerMeter: existingWindowSummary.price_per_meter,
            widthsRequired: existingWindowSummary.widths_required,
            // CRITICAL: Restore hems and returns from measurements_details
            returns: (md.return_left || 0) + (md.return_right || 0),
            totalSideHems: (md.side_hems || 0) * 2 * ((md.curtain_type === 'pair') ? 2 : 1),
            returnLeft: md.return_left || 0,
            returnRight: md.return_right || 0,
            sideHems: md.side_hems || 0,
            fullnessRatio: md.heading_fullness || md.fullness_ratio || 0
          });
        }
        return;
      }
    };

    // Call the async function
    loadData();
  }, []); // CRITICAL: Empty dependency array - only run on mount

  // Priority 2: Load from existingMeasurement (legacy support) - separate effect
  useEffect(() => {
    if (hasLoadedInitialData.current || !existingMeasurement) return;
    
    if (existingMeasurement) {
      setMeasurements(existingMeasurement.measurements || {});

      // Window type not auto-loaded to allow manual selection

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

      // DISABLED: No layered treatments allowed - only ONE treatment per window
      // Load layered treatments if they exist
      // if (existingMeasurement.layered_treatments) {
      //   setLayeredTreatments(existingMeasurement.layered_treatments);
      //   setIsLayeredMode(existingMeasurement.layered_treatments.length > 0);
      // }
      
      hasLoadedInitialData.current = true;
    }
  }, [existingMeasurement]);

  // Priority 3: Load from existing treatments for cross-mode compatibility - separate effect
  useEffect(() => {
    if (hasLoadedInitialData.current || !existingTreatments || existingTreatments.length === 0) return;
    
    if (existingTreatments && existingTreatments.length > 0) {
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
      
      hasLoadedInitialData.current = true;
    }
  }, [existingTreatments]);

  // Detect treatment type when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const detectedType = detectTreatmentType(selectedTemplate);
      const previousCategory = treatmentCategory;
      setTreatmentCategory(detectedType);
      
      // Clear selected items if treatment category changed
      if (previousCategory !== detectedType) {
        setSelectedItems({});
      }
    }
  }, [selectedTemplate]);

  // Load draft on mount
  useEffect(() => {
    if (!surfaceId || existingWindowSummary) return;

    const draft = draftService.loadDraft(surfaceId);
    if (draft) {
      const age = draftService.getDraftAge(surfaceId);
      toast.info(`Draft found from ${age} minutes ago`, {
        description: "Would you like to restore it?",
        action: {
          label: "Restore",
          onClick: () => {
            if (draft.templateId) {
              // Template will be loaded from windows_summary instead
              setSelectedTemplate(draft.templateId);
            }
            if (draft.measurements) setMeasurements(draft.measurements);
            if (draft.selectedOptions) setSelectedOptions(draft.selectedOptions);
            if (draft.selectedHeading) setSelectedHeading(draft.selectedHeading);
            if (draft.selectedLining) setSelectedLining(draft.selectedLining);
            if (draft.windowType) setSelectedWindowType(draft.windowType);
            toast.success("Draft restored");
          }
        },
        duration: 10000
      });
    }
    draftService.clearExpiredDrafts();
  }, [surfaceId, existingWindowSummary]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!surfaceId || !hasUnsavedChanges) return;

    const autoSaveInterval = setInterval(() => {
      draftService.saveDraft(surfaceId, {
        windowId: surfaceId,
        templateId: selectedTemplate?.id,
        fabricId: selectedItems.fabric?.id,
        hardwareId: selectedItems.hardware?.id,
        materialId: selectedItems.material?.id,
        measurements,
        selectedOptions,
        selectedHeading,
        selectedLining,
        windowType: selectedWindowType
      });
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [
    surfaceId,
    hasUnsavedChanges,
    selectedTemplate,
    selectedItems,
    measurements,
    selectedOptions,
    selectedHeading,
    selectedLining,
    selectedWindowType
  ]);

  // Track unsaved changes - compare with last saved state
  useEffect(() => {
    const currentState = {
      templateId: selectedTemplate?.id,
      fabricId: selectedItems.fabric?.id,
      hardwareId: selectedItems.hardware?.id,
      materialId: selectedItems.material?.id,
      measurements: JSON.stringify(measurements),
      heading: selectedHeading,
      lining: selectedLining
    };
    
    // If we have a last saved state, compare with it
    const hasChanges = lastSavedState.current 
      ? JSON.stringify(currentState) !== JSON.stringify(lastSavedState.current)
      : !!(selectedTemplate || selectedItems.fabric || selectedItems.hardware || Object.keys(measurements).length > 0);

    setHasUnsavedChanges(hasChanges);
  }, [selectedTemplate, selectedItems, measurements, selectedHeading, selectedLining]);

  // Enhanced auto-save implementation with cross-mode data
  useImperativeHandle(ref, () => ({
    autoSave: async () => {
      try {
          // Import supabase
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

          // Detect the specific treatment type early for calculations - KEEP SPECIFIC TYPE
          const specificTreatmentType = detectTreatmentType(selectedTemplate);
          
          // Display category for UI grouping only - DO NOT use for database storage
          const displayCategory = specificTreatmentType.includes('blind') 
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
          let hardwareCost = 0;
          let blindOptionsCost = 0;
          let wallpaperDetails = null;
          
          // Handle wallpaper calculations
          if (treatmentCategory === 'wallpaper') {
            const wallWidth = parseFloat(measurements.wall_width || '0');
            const wallHeight = parseFloat(measurements.wall_height || '0');
            
            if (wallWidth > 0 && wallHeight > 0 && selectedItems.fabric) {
              const wallpaperCalc = calculateWallpaperCost(wallWidth, wallHeight, selectedItems.fabric);
              
              if (wallpaperCalc) {
                fabricCost = wallpaperCalc.totalCost;
                totalCost = fabricCost;
                linearMeters = wallpaperCalc.totalMeters;
                
                wallpaperDetails = {
                  wall_width: wallWidth,
                  wall_height: wallHeight,
                  roll_width: selectedItems.fabric.wallpaper_roll_width || 53,
                  roll_length: selectedItems.fabric.wallpaper_roll_length || 10,
                  pattern_repeat: selectedItems.fabric.pattern_repeat_vertical || 0,
                  match_type: selectedItems.fabric.wallpaper_match_type || 'straight',
                  length_per_strip_m: wallpaperCalc.lengthPerStripM,
                  strips_needed: wallpaperCalc.stripsNeeded,
                  total_meters: wallpaperCalc.totalMeters,
                  rolls_needed: wallpaperCalc.rollsNeeded,
                  sold_by: wallpaperCalc.soldBy,
                  quantity: wallpaperCalc.quantity,
                  unit_label: wallpaperCalc.unitLabel,
                  price_per_unit: wallpaperCalc.pricePerUnit,
                  wallpaper_cost: wallpaperCalc.totalCost,
                  total_cost: wallpaperCalc.totalCost
                };
                
                console.log("💰 Wallpaper autoSave calculation:", wallpaperDetails);
              }
            }
          } else if (displayCategory === 'blinds' || displayCategory === 'shutters') {
            // BLIND/SHUTTER CALCULATIONS
            // CRITICAL FIX: Convert MM to CM before passing to calculator
            const width = (parseFloat(measurements.rail_width) || 0) / 10;
            const height = (parseFloat(measurements.drop) || 0) / 10;
            
            // Import blind calculation utility - UNIFIED TO SINGLE CALCULATOR
            const { calculateBlindCosts, isBlindCategory } = await import('@/components/measurements/dynamic-options/utils/blindCostCalculator');
            
            // CRITICAL: Use fabric first (with pricing grid data), then fall back to material or template
            const materialForCalc = selectedItems.fabric || selectedItems.material || (selectedTemplate ? {
              unit_price: selectedTemplate.unit_price || 0,
              selling_price: selectedTemplate.unit_price || 0
            } : null);
            
            console.log('🎯 Calculating blind cost:', {
              width,
              height,
              template: selectedTemplate?.name,
              templateMachinePrice: selectedTemplate?.machine_price_per_metre,
              templateUnitPrice: selectedTemplate?.unit_price,
              material: materialForCalc,
              hasPricingGrid: !!(materialForCalc?.pricing_grid_data),
              category: displayCategory,
              selectedOptions
            });
            
            // Use unified calculator with full measurements data
            const blindCalc = calculateBlindCosts(width, height, selectedTemplate, materialForCalc, selectedOptions || [], measurements);
            
            fabricCost = blindCalc.fabricCost;
            manufacturingCost = blindCalc.manufacturingCost;
            linearMeters = blindCalc.squareMeters; // Use sqm for blinds
            hardwareCost = 0; // Hardware included in options
            
            // CRITICAL: Preserve options cost from blind calculation
            blindOptionsCost = blindCalc.optionsCost || 0;
            totalCost = blindCalc.totalCost; // Already includes options
            
            console.log('💰 Blind calculation result:', {
              fabricCost: blindCalc.fabricCost,
              manufacturingCost: blindCalc.manufacturingCost,
              optionsCost: blindOptionsCost,
              squareMeters: blindCalc.squareMeters,
              totalCost: blindCalc.totalCost
            });
            
            console.log('💰 Blind calculation result:', {
              fabricCost: blindCalc.fabricCost,
              manufacturingCost: blindCalc.manufacturingCost,
              optionsCost: blindOptionsCost,
              squareMeters: blindCalc.squareMeters,
              totalCost: blindCalc.totalCost
            });
          } else {
            // Original curtain calculations
            linearMeters = fabricCalculation?.linearMeters || 0;
            
            // CRITICAL FIX: Calculate fabric cost with horizontal pieces
            const horizontalPiecesNeeded = fabricCalculation?.horizontalPiecesNeeded || 1;
            const totalMetersOrdered = horizontalPiecesNeeded > 1 
              ? linearMeters * horizontalPiecesNeeded  // Horizontal: multiply by pieces
              : (fabricCalculation?.orderedLinearMeters || linearMeters); // Vertical: use ordered or actual
            
            const pricePerMeter = fabricCalculation?.pricePerMeter || 0;
            fabricCost = totalMetersOrdered * pricePerMeter;
            
            console.log('💰 [SAVE] Using fabric calculation:', {
              linearMeters,
              horizontalPiecesNeeded,
              totalMetersOrdered,
              pricePerMeter,
              fabricCost,
              widthsRequired: fabricCalculation?.widthsRequired
            });
          }

          // Calculate lining cost (for curtains only)
          let liningCost = 0;
          if (treatmentCategory !== 'wallpaper' && selectedLining && selectedLining !== 'none' && selectedTemplate && fabricCalculation) {
            const liningTypes = selectedTemplate.lining_types || [];
            const liningOption = liningTypes.find(l => l.type === selectedLining);
            if (liningOption) {
              const liningPricePerMeter = liningOption.price_per_metre || 0;
              const liningLaborPerCurtain = liningOption.labour_per_curtain || 0;
              const curtainCount = fabricCalculation.curtainCount || 1;
              // Material cost: price per meter × linear meters used
              // Labor cost: price per curtain × number of curtains
              liningCost = (liningPricePerMeter * fabricCalculation.linearMeters) + (liningLaborPerCurtain * curtainCount);
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

          // ✅ Calculate manufacturing cost dynamically using selected pricing method
          if (displayCategory === 'curtains' && selectedTemplate && fabricCalculation) {
            // Get the selected pricing method (from user's dropdown selection)
            const selectedPricingMethod = measurements.selected_pricing_method 
              ? selectedTemplate.pricing_methods?.find((m: any) => m.id === measurements.selected_pricing_method)
              : selectedTemplate.pricing_methods?.[0]; // Default to first method
            
            const manufacturingType = measurements.manufacturing_type || selectedTemplate.manufacturing_type || 'machine';
            // ✅ FIX: Get pricing type from selected pricing method, not template
            const pricingType = selectedPricingMethod?.pricing_type || selectedTemplate.pricing_type || selectedTemplate.makeup_pricing_method || 'per_metre';
            
            console.log('💰 [SAVE] Manufacturing cost calculation:', {
              selectedPricingMethodId: measurements.selected_pricing_method,
              selectedMethod: selectedPricingMethod?.name,
              manufacturingType,
              pricingType,
              fabricCalc: {
                linearMeters: fabricCalculation.linearMeters,
                curtainCount: fabricCalculation.curtainCount,
                widthsRequired: fabricCalculation.widthsRequired
              }
            });
            
            // Calculate using selected pricing method prices
            let pricePerUnit = 0;
            if (pricingType === 'per_panel') {
              pricePerUnit = manufacturingType === 'hand' 
                ? (selectedPricingMethod?.hand_price_per_panel ?? selectedTemplate.hand_price_per_panel ?? 0)
                : (selectedPricingMethod?.machine_price_per_panel ?? selectedTemplate.machine_price_per_panel ?? 0);
              manufacturingCost = pricePerUnit * (fabricCalculation.curtainCount || 1);
            } else if (pricingType === 'per_drop') {
              pricePerUnit = manufacturingType === 'hand'
                ? (selectedPricingMethod?.hand_price_per_drop ?? selectedTemplate.hand_price_per_drop ?? 0)
                : (selectedPricingMethod?.machine_price_per_drop ?? selectedTemplate.machine_price_per_drop ?? 0);
              manufacturingCost = pricePerUnit * (fabricCalculation.widthsRequired || 1);
            } else if (pricingType === 'per_metre') {
              // ✅ FIX: For per_metre, calculate width after fullness + side hems + returns + waste
              // This is the MANUFACTURING width to sew, not fabric usage
              const railWidthCm = parseFloat(measurements.rail_width || '0');
              const fullness = fabricCalculation.fullnessRatio || 0;
              const sideHemsCm = fabricCalculation.totalSideHems || 0;
              const returnsCm = fabricCalculation.returns || 0;
              const wastePercent = fabricCalculation.wastePercent || selectedTemplate.waste_percent || 0;
              
              // Base width after fullness
              const baseWidthCm = railWidthCm * fullness;
              // Add hems and returns
              const widthWithAllowancesCm = baseWidthCm + sideHemsCm + returnsCm;
              // Add waste percentage
              const finalWidthCm = widthWithAllowancesCm * (1 + wastePercent / 100);
              const finalWidthM = finalWidthCm / 100;
              
              pricePerUnit = manufacturingType === 'hand'
                ? (selectedPricingMethod?.hand_price_per_metre ?? selectedTemplate.hand_price_per_metre ?? 0)
                : (selectedPricingMethod?.machine_price_per_metre ?? selectedTemplate.machine_price_per_metre ?? 0);
              
              // Multiply final width by manufacturing price per meter
              manufacturingCost = pricePerUnit * finalWidthM;
              
              console.log('💰 [SAVE] Per metre manufacturing calculation:', {
                railWidthCm,
                fullness,
                baseWidthCm,
                sideHemsCm,
                returnsCm,
                widthWithAllowancesCm,
                wastePercent,
                finalWidthCm,
                finalWidthM,
                pricePerUnit,
                manufacturingCost,
                formula: `${railWidthCm}cm × ${fullness} = ${baseWidthCm.toFixed(0)}cm + ${sideHemsCm}cm hems + ${returnsCm}cm returns + ${wastePercent}% waste = ${finalWidthCm.toFixed(0)}cm (${finalWidthM.toFixed(2)}m) × $${pricePerUnit}/m = $${manufacturingCost.toFixed(2)}`
              });
            } else if (pricingType === 'height_based' && selectedPricingMethod?.height_price_ranges) {
              const height = parseFloat(measurements.drop || '0');
              const range = selectedPricingMethod.height_price_ranges.find((r: any) => 
                height >= r.min_height && height <= r.max_height
              );
              if (range) {
                pricePerUnit = manufacturingType === 'hand' ? range.hand_price : range.machine_price;
                manufacturingCost = pricePerUnit * (fabricCalculation.curtainCount || fabricCalculation.widthsRequired || 1);
              }
            }
            
            console.log('💰 [SAVE] Manufacturing cost result:', {
              pricePerUnit,
              quantity: pricingType === 'per_panel' ? fabricCalculation.curtainCount : 
                       pricingType === 'per_drop' ? fabricCalculation.widthsRequired : 
                       pricingType === 'per_metre' ? (() => {
                         const railWidthCm = parseFloat(measurements.rail_width || '0');
                         const fullness = fabricCalculation.fullnessRatio || 0;
                         const sideHemsCm = fabricCalculation.totalSideHems || 0;
                         const returnsCm = fabricCalculation.returns || 0;
                         const wastePercent = fabricCalculation.wastePercent || 0;
                         const finalWidthCm = ((railWidthCm * fullness) + sideHemsCm + returnsCm) * (1 + wastePercent / 100);
                         return `${(finalWidthCm / 100).toFixed(2)}m`;
                       })() :
                       'N/A',
              manufacturingCost,
              manufacturingType: manufacturingType === 'hand' ? 'Hand Finished' : 'Machine Finished'
            });
          }

          // Calculate total meters including horizontal pieces for railroaded fabric
          const horizontalPiecesNeeded = fabricCalculation?.horizontalPiecesNeeded || 1;
          const totalMetersOrdered = horizontalPiecesNeeded > 1 
            ? linearMeters * horizontalPiecesNeeded  // Horizontal: multiply by pieces
            : (fabricCalculation?.orderedLinearMeters || linearMeters); // Vertical: use ordered or actual

          // Calculate options cost for curtains (if any selected)
          let curtainOptionsCost = 0;
          if (displayCategory === 'curtains' && selectedOptions && selectedOptions.length > 0) {
            curtainOptionsCost = selectedOptions.reduce((sum, opt) => sum + (opt.price || 0), 0);
            console.log('💰 [SAVE] Curtain options cost:', curtainOptionsCost, 'from', selectedOptions.length, 'options');
          }

          // Calculate total cost 
          if (treatmentCategory === 'wallpaper') {
            totalCost = fabricCost; // Already calculated above for wallpaper
          } else if (displayCategory === 'blinds' || displayCategory === 'shutters') {
            // Blinds/shutters totalCost already calculated and includes options
            // DO NOT RECALCULATE - use blindCalc.totalCost which includes all components
          } else {
            // Curtains - recalculate with all components including options
            totalCost = fabricCost + liningCost + headingCost + manufacturingCost + curtainOptionsCost;
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
          let headingDetails: any = {};
          console.log("🎯 Creating heading details:", {
            selectedHeading,
            headingName,
            finalHeadingCost
          });
          
          // Get selected heading metadata for advanced settings
          const selectedHeadingOption = headingOptionsFromSettings.find(h => h.id === selectedHeading) as any;
          const headingMetadata = selectedHeadingOption?.metadata as any;
          
          // Calculate hardware quantity if applicable
          let hardwareQuantity = 0;
          if (headingMetadata?.spacing && parseFloat(measurements.rail_width) > 0) {
            const railWidthCm = parseFloat(measurements.rail_width);
            const spacingCm = parseFloat(headingMetadata.spacing);
            hardwareQuantity = Math.ceil(railWidthCm / spacingCm) + 1;
          }
          
          if (selectedHeading && selectedHeading !== 'standard') {
            headingDetails = {
              heading_name: headingName,
              id: selectedHeading,
              cost: finalHeadingCost,
              fullness_ratio: parseFloat(measurements.heading_fullness) || 0,
              extra_fabric: headingMetadata?.extra_fabric || 0,
              heading_type: headingMetadata?.heading_type,
              spacing: headingMetadata?.spacing,
              eyelet_diameter: headingMetadata?.eyelet_diameter,
              eyelet_color: headingMetadata?.eyelet_color,
              use_multiple_ratios: headingMetadata?.use_multiple_ratios,
              multiple_fullness_ratios: headingMetadata?.multiple_fullness_ratios,
              hardware: headingMetadata?.heading_type ? {
                type: headingMetadata.heading_type === 'eyelet' ? 'rings' : 'hooks',
                quantity: hardwareQuantity,
                spacing: headingMetadata.spacing,
                diameter: headingMetadata.eyelet_diameter,
                color: headingMetadata.eyelet_color
              } : undefined
            };
          } else {
            headingDetails = {
              heading_name: 'Standard',
              id: 'standard',
              cost: 0,
              fullness_ratio: parseFloat(measurements.heading_fullness) || 0
            };
          }
          console.log("🎯 Final heading details for save:", headingDetails);

          // Recalculate total cost with proper lining and heading costs
          // CRITICAL: Include options cost for ALL treatment types
          const finalTotalCost = (displayCategory === 'blinds' || displayCategory === 'shutters') 
            ? totalCost // Already includes all components including options
            : fabricCost + finalLiningCost + finalHeadingCost + manufacturingCost + curtainOptionsCost;

          // Create summary data for windows_summary table - Save ALL 4 steps
          console.log('💾 DynamicWorksheet treatment data for save:', {
            specificTreatmentType,
            displayCategory,
            templateName: selectedTemplate?.name,
            curtainType: selectedTemplate?.curtain_type,
            treatmentCategory,
            options_count: selectedOptions?.length,
            options_cost: blindOptionsCost,
            hardware_cost: hardwareCost,
            heading_cost: finalHeadingCost
          });
          
          const summaryData = {
            window_id: surfaceId,
            // CRITICAL: Save per-piece meters for proper breakdown display
            linear_meters: fabricCalculation?.orderedLinearMeters || linearMeters,
            // For blinds/shutters, widths_required doesn't apply - use 1
            widths_required: (displayCategory === 'blinds' || displayCategory === 'shutters') ? 1 : (fabricCalculation?.widthsRequired || 0),
            // For blinds/shutters, use material price; for curtains use fabric calculation
            price_per_meter: (displayCategory === 'blinds' || displayCategory === 'shutters') 
              ? (selectedItems.material?.selling_price || selectedItems.material?.unit_price || selectedItems.fabric?.selling_price || selectedItems.fabric?.unit_price || 0)
              : (fabricCalculation?.pricePerMeter || selectedItems.fabric?.selling_price || selectedItems.fabric?.unit_price || 0),
            fabric_cost: fabricCost, // Use the already calculated fabricCost, not recalculate
            lining_type: selectedLining || 'none',
            lining_cost: finalLiningCost,
            lining_details: liningDetails,
            manufacturing_type: selectedTemplate?.manufacturing_type || 'machine',
            manufacturing_cost: manufacturingCost,
            hardware_cost: hardwareCost || 0,
            options_cost: (displayCategory === 'blinds' || displayCategory === 'shutters') ? blindOptionsCost : curtainOptionsCost,
            heading_cost: finalHeadingCost || 0,
            // CRITICAL: Save comprehensive options list including ALL selections
            selected_options: [
              // Fabric (base item)
              ...(selectedItems.fabric ? [{
                name: `Fabric: ${selectedItems.fabric.name}`,
                price: fabricCost,
                pricingMethod: 'per-meter',
                quantity: linearMeters,
                unit: 'm',
                unit_price: fabricCalculation?.pricePerMeter || selectedItems.fabric?.selling_price || 0
              }] : []),
              // Lining (base item)
              ...(selectedLining && selectedLining !== 'none' ? [{
                name: `Lining: ${selectedLining}`,
                price: finalLiningCost,
                pricingMethod: 'per-meter',
                quantity: linearMeters,
                unit: 'm'
              }] : []),
              // Dynamic options from treatment_options
              ...selectedOptions,
              // Add heading if selected
              ...(selectedHeading && selectedHeading !== 'standard' && selectedHeading !== 'none' ? [{
                name: `Heading: ${(() => {
                  const headingOpt = headingOptionsFromSettings.find((h: any) => h.id === selectedHeading);
                  return headingOpt?.name || selectedHeading;
                })()}`,
                price: finalHeadingCost || 0,
                pricingMethod: 'fixed'
              }] : []),
              // Add manufacturing finish  
              ...(measurements.manufacturing_type ? [{
                name: `Manufacturing: ${measurements.manufacturing_type === 'hand' ? 'Hand Finished' : 'Machine Finished'}`,
                price: manufacturingCost || 0,
                pricingMethod: 'fixed'
              }] : []),
              // Add fullness ratio ONLY for curtain/roman treatments
              ...((treatmentCategory === 'curtains' || treatmentCategory === 'roman_blinds') && fabricCalculation?.fullnessRatio ? [{
                name: `Fullness Ratio: ${fabricCalculation.fullnessRatio}x`,
                price: 0,
                pricingMethod: 'included'
              }] : []),
              // Add eyelet ring if selected
              ...(measurements.selected_eyelet_ring ? [{
                name: `Ring Type: ${measurements.selected_eyelet_ring}`,
                price: 0,
                pricingMethod: 'included'
              }] : [])
            ],
            
            // CRITICAL: Store dimensions in MM (database standard), save null instead of 0 for empty values
            rail_width: measurements.rail_width && parseFloat(measurements.rail_width) > 0 
              ? (() => {
                  const valueMM = convertLength(parseFloat(measurements.rail_width), units.length, 'mm');
                  // Validation: warn if value seems unreasonably small (likely unit error)
                  if (valueMM < 100) {
                    console.warn('⚠️ Rail width seems very small for MM:', valueMM, 'mm. Expected typical range: 500-3000mm');
                  }
                  return valueMM;
                })()
              : null,
            drop: measurements.drop && parseFloat(measurements.drop) > 0 
              ? (() => {
                  const valueMM = convertLength(parseFloat(measurements.drop), units.length, 'mm');
                  // Validation: warn if value seems unreasonably small (likely unit error)
                  if (valueMM < 100) {
                    console.warn('⚠️ Drop height seems very small for MM:', valueMM, 'mm. Expected typical range: 500-3000mm');
                  }
                  return valueMM;
                })()
              : null,
            
            total_cost: finalTotalCost,
            // CRITICAL: Save structured cost_breakdown for accurate room/project totals
            cost_breakdown: [
              // Fabric - CRITICAL: Use the calculated fabricCost (already includes horizontal pieces)
              ...(fabricCost > 0 ? [{
                id: 'fabric',
                name: 'Fabric Material',
                total_cost: fabricCost,  // CRITICAL: Use fabricCost NOT linearMeters
                category: 'fabric',
                quantity: fabricCalculation?.horizontalPiecesNeeded 
                  ? linearMeters * (fabricCalculation.horizontalPiecesNeeded || 1) 
                  : linearMeters,
                unit: 'm',
                unit_price: fabricCalculation?.pricePerMeter || selectedItems.fabric?.selling_price || 0,
                // CRITICAL: Save pricing method for correct quote display terminology
                pricing_method: selectedTemplate?.pricing_type || 'per_metre',
                // Save additional context for quote display
                widths_required: fabricCalculation?.widthsRequired,
                fabric_orientation: fabricCalculation?.fabricOrientation,
                uses_pricing_grid: !!(selectedItems.fabric?.pricing_grid_data || selectedItems.material?.pricing_grid_data)
              }] : []),
              // Lining
              ...(finalLiningCost > 0 ? [{
                id: 'lining',
                name: `Lining: ${selectedLining}`,
                total_cost: finalLiningCost,
                category: 'lining',
                quantity: linearMeters,
                unit: 'm'
              }] : []),
              // Heading - ALWAYS include even if 0
              ...(selectedHeading && selectedHeading !== 'standard' && selectedHeading !== 'none' ? [{
                id: 'heading',
                name: (() => {
                  const headingOpt = headingOptionsFromSettings.find((h: any) => h.id === selectedHeading);
                  return `Heading: ${headingOpt?.name || selectedHeading}`;
                })(),
                total_cost: finalHeadingCost || 0,
                category: 'heading'
              }] : []),
              // Manufacturing - CRITICAL: Always include manufacturing cost in breakdown
              ...(manufacturingCost > 0 ? [{
                id: 'manufacturing',
                name: `Manufacturing: ${measurements.manufacturing_type === 'hand' ? 'Hand Finished' : 'Machine Finished'}`,
                total_cost: manufacturingCost,
                category: 'manufacturing'
              }] : []),
              // Hardware
              ...(hardwareCost > 0 ? [{
                id: 'hardware',
                name: 'Hardware',
                total_cost: hardwareCost,
                category: 'hardware'
              }] : []),
              // All selected options - INCLUDE ALL (even price:0 "included" items)
              ...selectedOptions.map((opt, idx) => ({
                id: opt.name || `option-${idx}`,
                name: opt.name || 'Option',
                total_cost: opt.price || 0,
                category: 'option',
                description: opt.pricingMethod === 'included' ? 'Included' : undefined
              }))
            ],
            template_id: selectedTemplate?.id,
            pricing_type: selectedTemplate?.pricing_type || 'per_metre',
            waste_percent: selectedTemplate?.waste_percent || 5,
            currency: 'USD',
            
            // STEP 1: Window Type Selection
            window_type: selectedWindowType?.name || 'Standard Window',
            window_type_key: selectedWindowType?.key || 'standard',
            window_type_id: selectedWindowType?.id,
            
            // STEP 2: Treatment/Template Selection - SIMPLIFIED
            // CRITICAL: Preserve custom template_name if it exists, don't overwrite with template name
            template_name: latestSummaryRef.current?.template_name || selectedTemplate?.name,
            template_details: {
              id: selectedTemplate?.id,
              name: selectedTemplate?.name,
              pricing_type: selectedTemplate?.pricing_type,
              unit_price: selectedTemplate?.unit_price,
              machine_price_per_metre: selectedTemplate?.machine_price_per_metre,
              waste_percent: selectedTemplate?.waste_percent,
              manufacturing_type: selectedTemplate?.manufacturing_type
            },
            treatment_type: specificTreatmentType,
            treatment_category: specificTreatmentType, // CRITICAL: Use specific type, not generic
            
            // STEP 3: Inventory Selections - SIMPLIFIED (only IDs and essential fields)
            fabric_details: selectedItems.fabric ? {
              id: selectedItems.fabric.id,
              name: selectedItems.fabric.name,
              fabric_width: selectedItems.fabric.fabric_width || selectedItems.fabric.wallpaper_roll_width || 140,
              selling_price: selectedItems.fabric.selling_price || selectedItems.fabric.unit_price,
              category: selectedItems.fabric.category,
              image_url: selectedItems.fabric.image_url,
              // CRITICAL: Include color - prioritize user selection, then first tag, then color field
              color: measurements.selected_color || selectedItems.fabric.tags?.[0] || selectedItems.fabric.color || null,
              // CRITICAL: Preserve pricing grid data for reloading
              pricing_grid_data: selectedItems.fabric.pricing_grid_data,
              resolved_grid_name: selectedItems.fabric.resolved_grid_name,
              resolved_grid_code: selectedItems.fabric.resolved_grid_code,
              resolved_grid_id: selectedItems.fabric.resolved_grid_id,
              price_group: selectedItems.fabric.price_group,
              product_category: selectedItems.fabric.product_category
            } : null,
            selected_fabric_id: selectedItems.fabric?.id || null,
            selected_hardware_id: selectedItems.hardware?.id || null,
            selected_material_id: selectedItems.material?.id || null,
            hardware_details: selectedItems.hardware ? {
              id: selectedItems.hardware.id,
              name: selectedItems.hardware.name,
              selling_price: selectedItems.hardware.selling_price || selectedItems.hardware.unit_price,
              image_url: selectedItems.hardware.image_url,
              // CRITICAL: Include color for hardware - prioritize user selection, then first tag, then color field
              color: measurements.selected_color || selectedItems.hardware.tags?.[0] || selectedItems.hardware.color || null
            } : null,
            material_details: selectedItems.material ? {
              id: selectedItems.material.id,
              name: selectedItems.material.name,
              selling_price: selectedItems.material.selling_price || selectedItems.material.unit_price,
              image_url: selectedItems.material.image_url,
              // CRITICAL: Include color for material - prioritize user selection, then first tag, then color field
              color: measurements.selected_color || selectedItems.material.tags?.[0] || selectedItems.material.color || null,
              // UNIVERSAL: Preserve pricing grid data for ALL SaaS clients
              pricing_grid_data: selectedItems.material.pricing_grid_data,
              resolved_grid_name: selectedItems.material.resolved_grid_name,
              resolved_grid_code: selectedItems.material.resolved_grid_code,
              resolved_grid_id: selectedItems.material.resolved_grid_id,
              price_group: selectedItems.material.price_group,
              product_category: selectedItems.material.product_category
            } : (
              (displayCategory === 'blinds' || displayCategory === 'shutters') && selectedTemplate
                ? {
                    id: selectedTemplate.id,
                    name: selectedTemplate.name,
                    image_url: selectedTemplate.image_url,
                    unit_price: selectedTemplate.unit_price || 0,
                    template_based: true
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
              // CRITICAL: Store fabric calculation details for accurate display
              horizontal_pieces_needed: fabricCalculation?.horizontalPiecesNeeded || 1,
              fabric_orientation: fabricCalculation?.fabricOrientation || 'vertical',
              
              // CRITICAL: Store ALL template-specific values so they're not lost on reload
              header_hem: measurements.header_hem || selectedTemplate?.header_allowance || selectedTemplate?.header_hem || 8,
              bottom_hem: measurements.bottom_hem || selectedTemplate?.bottom_hem || selectedTemplate?.bottom_allowance || 15,
              side_hems: measurements.side_hem || selectedTemplate?.side_hem || selectedTemplate?.side_hems || 7.5,
              seam_hems: measurements.seam_hem || selectedTemplate?.seam_allowance || selectedTemplate?.seam_hems || 1.5,
              return_left: measurements.return_left || selectedTemplate?.return_left || 0,
              return_right: measurements.return_right || selectedTemplate?.return_right || 0,
              waste_percent: measurements.waste_percent || selectedTemplate?.waste_percent || 5,
              
              // CRITICAL: Store dimensions in MM (database standard), save null instead of 0 for empty values
              rail_width: measurements.rail_width && parseFloat(measurements.rail_width) > 0 
                ? (() => {
                    const valueMM = convertLength(parseFloat(measurements.rail_width), units.length, 'mm');
                    // Validation: warn if value seems unreasonably small (likely unit error)
                    if (valueMM < 100) {
                      console.warn('⚠️ Rail width seems very small for MM:', valueMM, 'mm. Expected typical range: 500-3000mm');
                    }
                    return valueMM;
                  })()
                : null,
              drop: measurements.drop && parseFloat(measurements.drop) > 0 
                ? (() => {
                    const valueMM = convertLength(parseFloat(measurements.drop), units.length, 'mm');
                    // Validation: warn if value seems unreasonably small (likely unit error)
                    if (valueMM < 100) {
                      console.warn('⚠️ Drop height seems very small for MM:', valueMM, 'mm. Expected typical range: 500-3000mm');
                    }
                    return valueMM;
                  })()
                : null,
              wall_width_cm: measurements.wall_width ? parseFloat(measurements.wall_width) : 0,
              wall_height_cm: measurements.wall_height ? parseFloat(measurements.wall_height) : 0,
              // Store original values with unit for reference (different key names to avoid duplicates)
              wall_width: measurements.wall_width,
              wall_height: measurements.wall_height,
              unit: units.length,
              surface_id: surfaceId,
              surface_name: surfaceData?.name,
              // FIX: Use user's selections from measurements instead of template defaults
              curtain_type: measurements.curtain_type || selectedTemplate?.curtain_type || (treatmentCategory === 'wallpaper' ? 'wallpaper' : 'single'),
              curtain_side: measurements.curtain_side || 'left',
              pooling_option: measurements.pooling_option || 'above_floor',
              pooling_amount: measurements.pooling_amount || '',
              fullness_ratio: selectedTemplate?.fullness_ratio || (treatmentCategory === 'wallpaper' ? 1 : 0),
              fabric_width_cm: selectedItems.fabric?.fabric_width || selectedItems.fabric?.wallpaper_roll_width || 140,
              window_type: selectedWindowType?.name || 'Room Wall',
              selected_heading: selectedHeading,
              selected_lining: selectedLining
            }
          };

          // PERFORMANCE FIX: Direct save instead of SaveQueue (30s -> 1s)
          console.log('💾 Saving summary data:', {
            window_id: summaryData.window_id,
            treatment_category: summaryData.treatment_category,
            treatment_type: summaryData.treatment_type,
            fabric_name: summaryData.fabric_details?.name,
            options_cost: summaryData.options_cost,
            hardware_cost: summaryData.hardware_cost,
            selected_options_count: summaryData.selected_options?.length,
            total_cost: summaryData.total_cost
          });

          const { error: saveError } = await supabase
            .from('windows_summary')
            .upsert(summaryData, { onConflict: 'window_id' });

          if (saveError) {
            console.error("❌ Save error:", saveError);
            toast.error("Failed to save window summary");
            throw saveError;
          }
          
          console.log('✅ Summary data saved successfully');

          // CRITICAL: Also save to treatments table for material processing
          if (projectId && surfaceId) {
            console.log('💾 Creating/updating treatment record for materials...');
            
            // Generate descriptive treatment name
            const windowName = surfaceData?.name || 'Window';
            const templateName = selectedTemplate?.name || 'Treatment';
            const fabricName = selectedItems.fabric?.name || '';
            const treatmentName = [windowName, templateName, fabricName].filter(Boolean).join(' - ');
            
            // Build comprehensive breakdown with ALL materials
            const breakdown = [];
            
            // Add fabric
            if (selectedItems.fabric && linearMeters > 0) {
              breakdown.push({
                id: 'fabric',
                itemId: selectedItems.fabric.id,
                itemTable: 'enhanced_inventory_items',
                name: selectedItems.fabric.name,
                quantity: linearMeters,
                unit: 'm',
                unit_price: selectedItems.fabric.selling_price || selectedItems.fabric.unit_price || 0,
                total_cost: fabricCost,
                category: 'fabric',
                image_url: selectedItems.fabric.image_url
              });
            }
            
            // Add lining
            if (selectedLining && selectedLining !== 'none' && finalLiningCost > 0) {
              const liningItem = headingInventory.find((h: any) => h.name?.toLowerCase().includes('lining'));
              if (liningItem) {
                breakdown.push({
                  id: 'lining',
                  itemId: liningItem.id,
                  itemTable: 'enhanced_inventory_items',
                  name: liningItem.name,
                  quantity: linearMeters,
                  unit: 'm',
                  unit_price: liningItem.selling_price || liningItem.cost_price || 0,
                  total_cost: finalLiningCost,
                  category: 'lining'
                });
              }
            }
            
            // Add heading/interlining
            if (selectedHeading && selectedHeading !== 'none' && finalHeadingCost > 0) {
              const headingItem = headingInventory.find((h: any) => h.name?.toLowerCase().includes(selectedHeading.toLowerCase()));
              if (headingItem) {
                breakdown.push({
                  id: 'heading',
                  itemId: headingItem.id,
                  itemTable: 'enhanced_inventory_items',
                  name: headingItem.name,
                  quantity: linearMeters,
                  unit: 'm',
                  unit_price: headingItem.selling_price || headingItem.cost_price || 0,
                  total_cost: finalHeadingCost,
                  category: 'heading'
                });
              }
            }
            
            // Add hardware
            if (selectedItems.hardware) {
              breakdown.push({
                id: 'hardware',
                itemId: selectedItems.hardware.id,
                itemTable: 'enhanced_inventory_items',
                name: selectedItems.hardware.name,
                quantity: 1,
                unit: 'set',
                unit_price: selectedItems.hardware.selling_price || selectedItems.hardware.cost_price || 0,
                total_cost: hardwareCost,
                category: 'hardware'
              });
            }
            
            // Add material (for blinds/shutters/wallpaper)
            if (selectedItems.material) {
              breakdown.push({
                id: 'material',
                itemId: selectedItems.material.id,
                itemTable: 'enhanced_inventory_items',
                name: selectedItems.material.name,
                quantity: selectedItems.material.quantity || 1,
                unit: selectedItems.material.unit || 'unit',
                unit_price: selectedItems.material.selling_price || selectedItems.material.cost_price || 0,
                total_cost: selectedItems.material.selling_price || selectedItems.material.cost_price || 0,
                category: 'material'
              });
            }
            
            const treatmentData = {
              user_id: user.id,
              project_id: projectId,
              window_id: surfaceId,
              treatment_type: selectedTemplate?.name || 'Unknown',
              product_name: treatmentName, // Enhanced descriptive name
              fabric_type: selectedItems.fabric?.name || null,
              total_price: finalTotalCost,
              material_cost: fabricCost,
              labor_cost: manufacturingCost,
              fabric_details: selectedItems.fabric ? {
                id: selectedItems.fabric.id,
                fabric_id: selectedItems.fabric.id,
                name: selectedItems.fabric.name,
                fabric_width: selectedItems.fabric.fabric_width,
                selling_price: selectedItems.fabric.selling_price || selectedItems.fabric.unit_price,
                // CRITICAL: Preserve pricing grid data
                pricing_grid_data: selectedItems.fabric.pricing_grid_data,
                resolved_grid_name: selectedItems.fabric.resolved_grid_name,
                resolved_grid_code: selectedItems.fabric.resolved_grid_code,
                resolved_grid_id: selectedItems.fabric.resolved_grid_id,
                price_group: selectedItems.fabric.price_group,
                product_category: selectedItems.fabric.product_category
              } : null,
              calculation_details: {
                fabricMeters: linearMeters,
                totalCost: finalTotalCost,
                fabricCost,
                liningCost: finalLiningCost,
                headingCost: finalHeadingCost,
                manufacturingCost,
                hardwareCost,
                breakdown // Enhanced breakdown with all materials
              },
              treatment_details: summaryData
            };

            // Use proper upsert with onConflict
            const { error: treatmentError } = await supabase
              .from('treatments')
              .upsert(treatmentData, { 
                onConflict: 'window_id',
                ignoreDuplicates: false 
              });

            if (treatmentError) {
              console.error("❌ Treatment upsert error:", treatmentError);
              // Don't throw - allow summary save to succeed
            } else {
              console.log('✅ Treatment record saved successfully:', treatmentName);
            }
          }

          // Mark as saved and update last saved state
          lastSavedState.current = {
            templateId: selectedTemplate?.id,
            fabricId: selectedItems.fabric?.id,
            hardwareId: selectedItems.hardware?.id,
            materialId: selectedItems.material?.id,
            measurements: JSON.stringify(measurements),
            heading: selectedHeading,
            lining: selectedLining
          };
          setHasUnsavedChanges(false);
          setLastSaveTime(Date.now());
          
          // Clear draft after successful save
          if (surfaceId) {
            draftService.clearDraft(surfaceId);
          }
          
          // Show immediate success feedback
          toast.success("Window summary saved");

          // Invalidate cache to refresh UI
          await queryClient.invalidateQueries({
            queryKey: ["window-summary", surfaceId]
          });
          await queryClient.invalidateQueries({
            queryKey: ["project-window-summaries"]
          });
          await queryClient.invalidateQueries({
            queryKey: ["treatments"]
          });
          await queryClient.invalidateQueries({
            queryKey: ["project-materials"]
          });
      } catch (error) {
        console.error("❌ Auto-save failed:", error);
        throw error;
      }
    }
  }));
  const handleMeasurementChange = (field: string, value: string) => {
    console.log('🔥🔥🔥 LEVEL 1: handleMeasurementChange called:', { field, value });
    
    // PHASE 4: Mark that user is actively editing to prevent data reloads
    isUserEditing.current = true;
    
    setMeasurements(prev => {
      const newMeasurements = {
        ...prev,
        [field]: value
      };
      console.log('🔥🔥🔥 LEVEL 2: State updated:', { field, oldValue: prev[field], newValue: value, fullState: newMeasurements });
      return newMeasurements;
    });
    
    // Reset the editing flag after a short delay (user stopped typing)
    setTimeout(() => {
      isUserEditing.current = false;
    }, 1000);
  };
  const handleItemSelect = async (category: string, item: any) => {
    // For fabric, ensure BOTH id and fabric_id are set for persistence
    let processedItem = item;
    if (category === 'fabric') {
      const fabricId = item.id || item.fabric_id;
      processedItem = {
        ...item,
        id: fabricId,
        fabric_id: fabricId
      };
    }
    
    setSelectedItems(prev => ({
      ...prev,
      [category]: processedItem
    }));
    
    // Auto-navigate to measurements after selecting inventory item with 1 second delay
    setTimeout(() => setActiveTab('measurements'), 1000);
    
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
    
    // ✅ IMMEDIATE SAVE: Save fabric/inventory selection to windows_summary for real-time header updates
    if (category === 'fabric' && surfaceId && item) {
      try {
        const { error } = await supabase
          .from('windows_summary')
          .upsert({
            window_id: surfaceId,
            fabric_type: item.name,
            fabric_details: {
              id: item.id,
              fabric_id: item.id,
              name: item.name,
              fabric_type: item.name,
              fabric_width: item.fabric_width || item.wallpaper_roll_width,
              selling_price: item.selling_price || item.unit_price,
              category: item.category,
              image_url: item.image_url,
              // CRITICAL: Preserve pricing grid data
              pricing_grid_data: item.pricing_grid_data,
              resolved_grid_name: item.resolved_grid_name,
              resolved_grid_id: item.resolved_grid_id,
              price_group: item.price_group,
            } as any
          }, { onConflict: 'window_id' });
          
        if (!error) {
          console.log('✅ Fabric saved to windows_summary:', item.name);
          queryClient.invalidateQueries({ queryKey: ['window-summary-treatment', surfaceId] });
          queryClient.invalidateQueries({ queryKey: ['window-summary', surfaceId] });
        }
      } catch (error) {
        console.error('❌ Error saving fabric:', error);
      }
    }
    
    // ✅ IMMEDIATE SAVE: Save material selection for blinds/shutters with pricing grid data
    if (category === 'material' && surfaceId && item) {
      try {
        console.log('💾 Saving material with pricing grid:', {
          name: item.name,
          pricing_grid_data: item.pricing_grid_data ? 'present' : 'missing',
          resolved_grid_name: item.resolved_grid_name
        });
        
        const { error } = await supabase
          .from('windows_summary')
          .upsert({
            window_id: surfaceId,
            selected_material_id: item.id,
            material_details: {
              id: item.id,
              name: item.name,
              selling_price: item.selling_price || item.unit_price,
              cost_price: item.cost_price,
              image_url: item.image_url,
              category: item.category,
              subcategory: item.subcategory,
              // CRITICAL: Include ALL pricing grid data for calculation
              pricing_grid_data: item.pricing_grid_data,
              resolved_grid_name: item.resolved_grid_name,
              resolved_grid_code: item.resolved_grid_code,
              resolved_grid_id: item.resolved_grid_id,
              price_group: item.price_group,
              product_category: item.product_category,
            } as any
          }, { onConflict: 'window_id' });
          
        if (!error) {
          console.log('✅ Material with pricing grid saved:', item.name);
          queryClient.invalidateQueries({ queryKey: ['window-summary-treatment', surfaceId] });
          queryClient.invalidateQueries({ queryKey: ['window-summary', surfaceId] });
        } else {
          console.error('❌ Failed to save material:', error);
        }
      } catch (error) {
        console.error('❌ Error saving material:', error);
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
    
    // ✅ CRITICAL: Clear old options when template changes to prevent stale data
    setSelectedOptions([]);
    
    // ✅ FIX: Initialize measurements with template defaults ONLY if not already set
    // Don't overwrite existing saved values
    setMeasurements(prev => {
      const templateAny = template as any;
      return {
        ...prev,
        // Only set template defaults if value doesn't exist in saved measurements
        header_hem: prev.header_hem ?? (templateAny.header_allowance || templateAny.header_hem || 8),
        bottom_hem: prev.bottom_hem ?? (templateAny.bottom_hem || templateAny.bottom_allowance || 15),
        side_hems: prev.side_hems ?? prev.side_hem ?? (templateAny.side_hem || template.side_hems || 7.5),
        seam_hems: prev.seam_hems ?? prev.seam_hem ?? (templateAny.seam_allowance || template.seam_hems || 1.5),
        return_left: prev.return_left ?? (template.return_left || 0),
        return_right: prev.return_right ?? (template.return_right || 0),
        waste_percent: prev.waste_percent ?? (template.waste_percent || 5),
        heading_fullness: prev.heading_fullness ?? (templateAny.default_fullness || template.fullness_ratio || 2.0),
      };
    });
    
    console.log('🎯 Template selected - initialized defaults only for missing values');
  };
  const canProceedToMeasurements = selectedWindowType && (selectedTemplate || selectedTreatmentType);
  const canShowPreview = canProceedToMeasurements && Object.keys(measurements).length > 0;
  
  // Show loading state while initial data loads
  if (isInitialLoading) {
    return (
      <div className="animate-fade-in">
        <MeasurementWorksheetSkeleton />
      </div>
    );
  }
  
  return <div className="space-y-2 animate-scale-in">
      {/* Sticky Progress indicator with clickable navigation */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-2">
        <div className="flex items-center justify-center space-x-2">
          {["window-type", "treatment", "inventory", "measurements"].map((step, index) => {
          const stepNames = ["Select Type", "Treatment", "Inventory", "Measurements"];
          const stepIcons = [Ruler, Package, Package, Ruler];
          const StepIcon = stepIcons[index];
          const allSteps = ["window-type", "treatment", "inventory", "measurements"];
          
          const isCompleted = (() => {
            switch (step) {
              case "window-type":
                return selectedWindowType;
              case "treatment":
                return selectedTemplate;
              case "inventory":
                return Object.values(selectedItems).some(item => item);
              case "measurements":
                return measurements.rail_width && measurements.drop;
              default:
                return false;
            }
          })();
          
          const isNextStep = !isCompleted && index === (allSteps.findIndex(s => s === activeTab) + 1);
          
          return <div key={step} className="flex items-center gap-1 sm:gap-2">
                <button 
                  onClick={() => setActiveTab(step)} 
                  disabled={readOnly} 
                  className={`px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                    activeTab === step 
                      ? 'bg-blue-500/20 text-blue-700 border-2 border-blue-400 shadow-sm' 
                      : isCompleted 
                      ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20' 
                      : isNextStep
                      ? 'bg-orange-500/10 text-orange-700 border-2 border-orange-400 animate-pulse hover:bg-orange-500/20'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  } ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {isCompleted && <span className="text-xs">✓</span>}
                  <StepIcon className="h-3.5 w-3.5 sm:hidden" />
                  <span className="hidden sm:inline">{stepNames[index]}</span>
                </button>
                {index < 3 && (
                  <div className="flex items-center justify-center">
                    <span className="text-green-600 text-sm font-bold">→</span>
                  </div>
                )}
              </div>;
        })}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>

        {/* Window Type Selection */}
        <TabsContent value="window-type" className="h-full animate-fade-in">
          <Card className="h-full">
            <CardContent className="pt-4 sm:pt-6 h-full flex flex-col">
              <WindowTypeSelector 
                selectedWindowType={selectedWindowType} 
                onWindowTypeChange={(windowType) => {
                  setSelectedWindowType(windowType);
                  // Auto-navigate to treatment selection after selecting window type with 1 second delay
                  setTimeout(() => setActiveTab('treatment'), 1000);
                }} 
                readOnly={readOnly} 
              />
              
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatment Selection */}
        <TabsContent value="treatment" className="h-full animate-fade-in">
          <Card className="h-full">
            <CardContent className="pt-4 sm:pt-6 h-full flex flex-col">
              <ImprovedTreatmentSelector 
                selectedCoveringId={selectedTemplate?.id || ""} 
                onCoveringSelect={async template => {
                  setSelectedTemplate(template);
                  
                  // ✅ CRITICAL: Clear old options when template changes to prevent stale data
                  setSelectedOptions([]);
                  
                  if (template) {
                    // Detect and set the correct treatment category
                    const detectedCategory = detectTreatmentType(template);
                    setTreatmentCategory(detectedCategory);
                    setSelectedTreatmentType(detectedCategory);
                    
                    // CRITICAL: Immediately save template name to windows_summary AND clear old options
                    if (surfaceId) {
                      try {
                        const { error } = await supabase
                          .from('windows_summary')
                          .upsert({
                            window_id: surfaceId,
                            template_id: template.id,
                            template_name: template.name,
                            treatment_type: detectedCategory,
                            treatment_category: detectedCategory,
                            description_text: '', // Clear description when changing template
                            // ✅ CRITICAL: Clear old options when treatment changes
                            selected_options: [],
                            cost_breakdown: [],
                            options_cost: 0,
                            // Clear lining for non-curtain/roman treatments
                            lining_type: (detectedCategory === 'curtains' || detectedCategory === 'roman_blinds') ? undefined : 'none',
                            lining_cost: (detectedCategory === 'curtains' || detectedCategory === 'roman_blinds') ? undefined : 0,
                          }, { onConflict: 'window_id' });
                          
                        if (!error) {
                          console.log('✅ Template name saved to windows_summary:', template.name);
                          // Invalidate queries to update the header inputs
                          queryClient.invalidateQueries({ queryKey: ['window-summary-treatment', surfaceId] });
                          queryClient.invalidateQueries({ queryKey: ['window-summary', surfaceId] });
                        } else {
                          console.error('❌ Failed to save template name:', error);
                        }
                      } catch (error) {
                        console.error('❌ Error saving template name:', error);
                      }
                    }
                    
                    // Auto-navigate to inventory selection after selecting treatment with 1 second delay
                    setTimeout(() => setActiveTab('inventory'), 1000);
                  }
                }} 
                disabled={readOnly}
                visualKey={selectedWindowType?.visual_key}
              />
              
              <div className="mt-auto space-y-3">
                {selectedTemplate && (
                  <div className="p-2 bg-primary/5 rounded-lg border border-primary/20 animate-fade-in">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Selected: {selectedTemplate.name}
                    </h4>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Selection */}
        <TabsContent value="inventory" className="h-full animate-fade-in">
          <Card className="h-full">
            <CardContent className="pt-4 sm:pt-6 h-full space-y-4">
              <InventorySelectionPanel treatmentType={selectedTreatmentType} selectedItems={selectedItems} onItemSelect={handleItemSelect} onItemDeselect={handleItemDeselect} measurements={measurements} treatmentCategory={treatmentCategory} />
              
              {/* Color Selection for selected fabric, material, or hardware - UNIVERSAL for all product types */}
              {(() => {
                // Get colors from the first selected item that has them (fabric > material > hardware)
                const selectedItemWithColors = 
                  (selectedItems.fabric?.tags?.length > 0 && selectedItems.fabric) ||
                  (selectedItems.material?.tags?.length > 0 && selectedItems.material) ||
                  (selectedItems.hardware?.tags?.length > 0 && selectedItems.hardware);
                
                if (selectedItemWithColors) {
                  return (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                      <ColorSelector 
                        colors={selectedItemWithColors.tags}
                        selectedColor={measurements.selected_color}
                        onColorSelect={(color) => handleMeasurementChange('selected_color', color)}
                        readOnly={readOnly}
                      />
                    </div>
                  );
                }
                return null;
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Measurements - Full Interactive Visual Experience */}
        <TabsContent value="measurements" className="space-y-3 sm:space-y-4 animate-fade-in">
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4 sm:space-y-6">
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
                  {(() => {
                    // Build comprehensive options list for display
                    const allDisplayOptions = [
                      // Dynamic options from treatment_options system
                      ...selectedOptions,
                      // Add heading if selected and not default
                      ...(selectedHeading && selectedHeading !== 'standard' && selectedHeading !== 'none' ? [{
                        name: `Heading: ${(() => {
                          const headingOpt = headingOptionsFromSettings.find((h: any) => h.id === selectedHeading);
                          return headingOpt?.name || selectedHeading;
                        })()}`,
                        price: calculatedCosts.headingCost || 0,
                        pricingMethod: 'fixed'
                      }] : []),
                      // Add manufacturing finish
                      ...(measurements.manufacturing_type ? [{
                        name: `Manufacturing: ${measurements.manufacturing_type === 'hand' ? 'Hand Finished' : 'Machine Finished'}`,
                        price: calculatedCosts.manufacturingCost || 0,
                        pricingMethod: 'fixed'
                      }] : []),
                      // Add fullness ratio ONLY for curtain/roman treatments
                      ...((treatmentCategory === 'curtains' || treatmentCategory === 'roman_blinds') && fabricCalculation?.fullnessRatio ? [{
                        name: `Fullness Ratio: ${fabricCalculation.fullnessRatio}x`,
                        price: 0,
                        pricingMethod: 'included'
                      }] : []),
                      // Add eyelet ring if selected
                      ...(measurements.selected_eyelet_ring ? [{
                        name: `Ring Type: ${measurements.selected_eyelet_ring}`,
                        price: 0,
                        pricingMethod: 'included'
                      }] : [])
                    ];
                    
                    // Calculate costs for curtains
                    if (!selectedTemplate || !fabricCalculation || treatmentCategory === 'wallpaper') {
                      return (
                      <CostCalculationSummary
                          template={selectedTemplate} 
                          measurements={measurements} 
                          selectedFabric={selectedItems.fabric || selectedItems.material} 
                          selectedLining={selectedLining} 
                          selectedHeading={selectedHeading} 
                          inventory={[]} 
                          fabricCalculation={fabricCalculation}
                          selectedOptions={allDisplayOptions}
                        />
                      );
                    }

                    // ✅ SINGLE CALCULATION POINT: Calculate once, save to state
                    const linearMeters = fabricCalculation.linearMeters || 0;
                    const horizontalPiecesNeeded = fabricCalculation.horizontalPiecesNeeded || 1;
                    const pricePerMeter = fabricCalculation.pricePerMeter || 0;
                    
                    // CRITICAL FIX: For horizontal orientation, linearMeters is the WIDTH to order
                    // horizontalPiecesNeeded tells us how many pieces are needed to cover the HEIGHT
                    // The TOTAL fabric to order is linearMeters × horizontalPiecesNeeded
                    // ALWAYS calculate correctly regardless of fabricCalculation.fabricCost
                    const fabricCost = (linearMeters * horizontalPiecesNeeded) * pricePerMeter;

                    // Calculate lining cost - DYNAMIC based on template configuration
                    let liningCost = 0;
                    if (selectedLining && selectedLining !== 'none' && selectedTemplate?.lining_types) {
                      const liningConfig = selectedTemplate.lining_types.find((l: any) => l.type === selectedLining);
                      if (liningConfig) {
                        // Calculate based on pricing method: price_per_metre * meters + labour_per_curtain * curtains
                        const pricePerMetre = liningConfig.price_per_metre || 0;
                        const labourPerCurtain = liningConfig.labour_per_curtain || 0;
                        const curtainCount = fabricCalculation.curtainCount || 1;
                        
                        liningCost = (pricePerMetre * (fabricCalculation.linearMeters || 0)) + (labourPerCurtain * curtainCount);
                        
                        console.log('💰 Lining cost calculation:', {
                          type: selectedLining,
                          pricePerMetre,
                          labourPerCurtain,
                          linearMeters: fabricCalculation.linearMeters,
                          curtainCount,
                          totalCost: liningCost,
                          formula: `(${pricePerMetre}/m × ${fabricCalculation.linearMeters}m) + (${labourPerCurtain} × ${curtainCount} curtains) = ${liningCost}`
                        });
                      }
                    }

                    // Get the selected pricing method
                    const selectedPricingMethod = measurements.selected_pricing_method 
                      ? selectedTemplate.pricing_methods?.find((m: any) => m.id === measurements.selected_pricing_method)
                      : selectedTemplate.pricing_methods?.[0];

                    // Calculate manufacturing/labor cost - CRITICAL: Must match save calculation
                    let manufacturingCost = 0;
                    const manufacturingType = measurements.manufacturing_type || 'machine';
                    const pricingType = selectedPricingMethod?.pricing_type || selectedTemplate.pricing_type || selectedTemplate.makeup_pricing_method || selectedTemplate.pricing_method || 'per_metre';
                    
                    let pricePerUnit = 0;
                    if (pricingType === 'per_panel') {
                      pricePerUnit = manufacturingType === 'hand' 
                        ? (selectedPricingMethod?.hand_price_per_panel ?? selectedTemplate.hand_price_per_panel ?? 0)
                        : (selectedPricingMethod?.machine_price_per_panel ?? selectedTemplate.machine_price_per_panel ?? 0);
                      manufacturingCost = pricePerUnit * (fabricCalculation.curtainCount || 1);
                    } else if (pricingType === 'per_drop') {
                      pricePerUnit = manufacturingType === 'hand'
                        ? (selectedPricingMethod?.hand_price_per_drop ?? selectedTemplate.hand_price_per_drop ?? 0)
                        : (selectedPricingMethod?.machine_price_per_drop ?? selectedTemplate.machine_price_per_drop ?? 0);
                      manufacturingCost = pricePerUnit * (fabricCalculation.widthsRequired || 1);
                    } else if (pricingType === 'per_metre') {
                      // ✅ CRITICAL FIX: Match save calculation exactly - use width after fullness + hems + returns + waste
                      pricePerUnit = manufacturingType === 'hand'
                        ? (selectedPricingMethod?.hand_price_per_metre ?? selectedTemplate.hand_price_per_metre ?? 0)
                        : (selectedPricingMethod?.machine_price_per_metre ?? selectedTemplate.machine_price_per_metre ?? 0);
                      
                      const railWidthCm = parseFloat(measurements.rail_width || '0');
                      const fullness = fabricCalculation.fullnessRatio || 0;
                      const sideHemsCm = fabricCalculation.totalSideHems || 0;
                      const returnsCm = fabricCalculation.returns || 0;
                      const wastePercent = fabricCalculation.wastePercent || selectedTemplate.waste_percent || 0;
                      
                      const baseWidthCm = railWidthCm * fullness;
                      const widthWithAllowancesCm = baseWidthCm + sideHemsCm + returnsCm;
                      const finalWidthCm = widthWithAllowancesCm * (1 + wastePercent / 100);
                      const finalWidthM = finalWidthCm / 100;
                      
                      manufacturingCost = pricePerUnit * finalWidthM;
                    } else {
                      pricePerUnit = manufacturingType === 'hand'
                        ? (selectedPricingMethod?.hand_price_per_metre ?? selectedTemplate.hand_price_per_metre ?? 0)
                        : (selectedPricingMethod?.machine_price_per_metre ?? selectedTemplate.machine_price_per_metre ?? 0);
                      manufacturingCost = pricePerUnit * (fabricCalculation.linearMeters || 0);
                    }

                    if (pricingType === 'height_range' && selectedPricingMethod?.height_price_ranges) {
                      const height = parseFloat(measurements.drop || '0');
                      const range = selectedPricingMethod.height_price_ranges.find((r: any) => 
                        height >= r.min_height && height <= r.max_height
                      );
                      if (range) {
                        pricePerUnit = manufacturingType === 'hand' ? range.hand_price : range.machine_price;
                        manufacturingCost = pricePerUnit * (fabricCalculation.curtainCount || fabricCalculation.widthsRequired || 1);
                      }
                    }

                    // Calculate heading cost - CRITICAL: Must match save calculation
                    let headingCost = 0;
                    if (selectedHeading && selectedHeading !== 'none' && selectedHeading !== 'standard') {
                      // Start with template upcharges
                      const headingUpchargePerCurtain = selectedTemplate.heading_upcharge_per_curtain || 0;
                      const headingUpchargePerMetre = selectedTemplate.heading_upcharge_per_metre || 0;
                      headingCost = headingUpchargePerCurtain + headingUpchargePerMetre * fabricCalculation.linearMeters;
                      
                      // Add heading inventory/settings price - match save calculation exactly
                      const heading = headingOptionsFromSettings.find(h => h.id === selectedHeading || h.name === selectedHeading);
                      if (heading) {
                        const railWidth = parseFloat(measurements.rail_width || '0');
                        const additionalCost = (heading as any).price * (railWidth / 100);
                        headingCost += additionalCost;
                      }
                    }

                    // Calculate options cost
                    const optionsCost = selectedOptions.reduce((sum, opt) => sum + (opt.price || 0), 0);

                    const totalCost = fabricCost + liningCost + manufacturingCost + headingCost + optionsCost;

                    // ✅ SAVE TO STATE: Single source of truth for all displays
                    // Calculate total meters to order (for horizontal pieces)
                    const totalMetersToOrder = linearMeters * horizontalPiecesNeeded;
                    const newCalculatedCosts = {
                      fabricLinearMeters: linearMeters,
                      fabricTotalMeters: totalMetersToOrder,
                      fabricCostPerMeter: pricePerMeter,
                      fabricTotalCost: fabricCost,
                      liningCost,
                      manufacturingCost,
                      headingCost,
                      optionsCost,
                      totalCost,
                      horizontalPiecesNeeded,
                      fabricOrientation: (fabricCalculation.fabricOrientation || 'vertical') as 'horizontal' | 'vertical',
                      seamsRequired: fabricCalculation.seamsRequired || 0,
                      widthsRequired: fabricCalculation.widthsRequired || 0
                    };
                    
                    // Only update if values changed to prevent infinite loops
                    if (JSON.stringify(calculatedCosts) !== JSON.stringify(newCalculatedCosts)) {
                      setCalculatedCosts(newCalculatedCosts);
                    }

                    return (
                      <CostCalculationSummary
                        template={selectedTemplate} 
                        measurements={measurements} 
                        selectedFabric={selectedItems.fabric || selectedItems.material} 
                        selectedLining={selectedLining} 
                        selectedHeading={selectedHeading} 
                        inventory={[]} 
                        fabricCalculation={fabricCalculation}
                        selectedOptions={allDisplayOptions}
                        calculatedFabricCost={calculatedCosts.fabricTotalCost}
                        calculatedLiningCost={calculatedCosts.liningCost}
                        calculatedManufacturingCost={calculatedCosts.manufacturingCost}
                        calculatedHeadingCost={calculatedCosts.headingCost}
                        calculatedOptionsCost={calculatedCosts.optionsCost}
                        calculatedTotalCost={calculatedCosts.totalCost}
                        fabricDisplayData={{
                          linearMeters: calculatedCosts.fabricLinearMeters,
                          totalMeters: calculatedCosts.fabricTotalMeters,
                          pricePerMeter: calculatedCosts.fabricCostPerMeter,
                          horizontalPieces: calculatedCosts.horizontalPiecesNeeded,
                          orientation: calculatedCosts.fabricOrientation
                        }}
                      />
                    );
                  })()}
                  
                <Button onClick={async () => {
                  setIsSaving(true);
                  
                  try {
                    console.log("DynamicWorksheet: Starting save from measurements tab...");
                    const currentRef = ref as React.MutableRefObject<{
                      autoSave: () => Promise<void>;
                    }>;
                    if (currentRef?.current) {
                      await currentRef.current.autoSave();
                    }
                    
                    // Close dialog after successful save
                    onClose?.();
                    
                    const {
                      toast
                    } = await import("@/hooks/use-toast");
                    toast({
                      title: "✅ Saved",
                      description: "Configuration saved successfully"
                    });
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
                  } finally {
                    setIsSaving(false);
                  }
                }} disabled={
                  isSaving || (
                    // For wallpaper, check wall_width and wall_height
                    treatmentCategory === 'wallpaper' 
                      ? (!measurements.wall_width || !measurements.wall_height)
                      : (!measurements.rail_width || !measurements.drop)
                  )
                } className={`w-full ${
                  hasUnsavedChanges 
                    ? 'bg-red-100 hover:bg-red-200 text-red-900 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-100 border border-red-300 dark:border-red-800' 
                    : lastSaveTime && (Date.now() - lastSaveTime < 3000)
                    ? 'bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800'
                    : ''
                }`}>
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-foreground" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Save & Close</span>
                        <span className="sm:hidden">Save</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
});