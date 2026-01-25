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
import { calculateOptionPrices, getOptionEffectivePrice } from "@/utils/calculateOptionPrices";
import { runShadowComparison } from "@/engine/shadowModeRunner";
import { useCurtainEngine } from "@/engine/useCurtainEngine";
import { useFabricEnrichment } from "@/hooks/pricing/useFabricEnrichment";
import { getManufacturingPrice } from "@/utils/pricing/headingPriceLookup";
import { resolveMarkup, applyMarkup } from "@/utils/pricing/markupResolver";
import { useMarkupSettings } from "@/hooks/useMarkupSettings";
import { syncWindowToWorkshopItem } from "@/hooks/useWorkshopItemSync";

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
export interface DynamicWindowWorksheetRef {
  autoSave: () => Promise<void>;
  hasUnsavedChanges: () => boolean;
  getDraftData: () => any;
  saveDraftNow: () => void;
  clearDraft: () => void;
}

export const DynamicWindowWorksheet = forwardRef<DynamicWindowWorksheetRef, DynamicWindowWorksheetProps>(({
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
  // CRITICAL FIX: Initialize to null when editing to prevent "spontaneous curtain" bug
  // Treatment type will be restored from database before any auto-navigation happens
  const [selectedTreatmentType, setSelectedTreatmentType] = useState<string | null>(
    existingTreatments?.length > 0 ? null : "curtains"
  );
  const [treatmentCategory, setTreatmentCategory] = useState<TreatmentCategory | null>(
    existingTreatments?.length > 0 ? null : 'curtains'
  );
  
  // Track if treatment type has been properly restored from database
  const hasRestoredTreatmentType = useRef(false);
  
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
  const [selectedHeading, setSelectedHeading] = useState("none");
  const [selectedLining, setSelectedLining] = useState("none");
  const [selectedOptions, setSelectedOptions] = useState<Array<{ name: string; price: number; pricingMethod?: string; pricingGridData?: any; optionKey?: string }>>([]);
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
    widthsRequired: 0,
    usesLeftover: false
  });
  
  // ✅ LIVE BLIND COSTS: Stored from CostCalculationSummary callback
  // Used during autoSave to prevent recalculation with different unit assumptions
  const [liveBlindCalcResult, setLiveBlindCalcResult] = useState<{
    fabricCost: number;
    manufacturingCost: number;
    optionsCost: number;
    optionDetails: Array<{ name: string; cost: number; pricingMethod: string }>; // ✅ Individual option costs
    totalCost: number;
    squareMeters: number;
    displayText: string;
  } | null>(null);
  
  // ✅ NEW: LIVE CURTAIN COSTS: Stored from CostCalculationSummary callback
  // Used during autoSave to prevent recalculation with different unit assumptions
  const [liveCurtainCalcResult, setLiveCurtainCalcResult] = useState<{
    fabricCost: number;
    liningCost: number;
    manufacturingCost: number;
    headingCost: number;
    headingName?: string;
    optionsCost: number;
    optionDetails: Array<{ 
      name: string; 
      cost: number; 
      pricingMethod: string;
      // Accessory-specific fields for hardware itemization
      category?: string;
      quantity?: number;
      unit_price?: number;
      pricingDetails?: string;
      optionKey?: string;
      parentOptionKey?: string;
      value?: string;
    }>;
    totalCost: number;
    linearMeters: number;
  } | null>(null);
  
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
  
  // PHASE 5: Track if units changed after initial load for re-conversion
  const previousUnitsRef = useRef<string | null>(null);

  // Reset the loaded flag when surfaceId changes (new window being edited)
  useEffect(() => {
    hasLoadedInitialData.current = false;
    isUserEditing.current = false;
    previousUnitsRef.current = null;
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
  const { data: markupSettings } = useMarkupSettings();
  const queryClient = useQueryClient();

  // ✅ CRITICAL: Enrich fabric with pricing grid data BEFORE engine calculation
  // This ensures the engine has access to grid prices for curtains/romans
  const { enrichedFabric } = useFabricEnrichment({
    fabricItem: selectedItems.fabric || selectedItems.material,
    formData: { 
      ...measurements, 
      system_type: selectedTemplate?.system_type,
      treatment_category: treatmentCategory 
    }
  });

  // ✅ NEW ENGINE: Single source of truth for curtain/roman calculations
  // This replaces multiple scattered calculation paths with one authoritative engine
  const engineResult = useCurtainEngine({
    treatmentCategory,
    surfaceId,
    projectId,
    measurements,
    selectedTemplate,
    selectedFabric: enrichedFabric, // ✅ Use enriched fabric with pricing grid data
    selectedOptions,
    units,
  });

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
        // CRITICAL FIX: Set treatment type EARLY from summary columns BEFORE async template fetch
        // This prevents race condition where auto-navigation happens before treatment type is set
        if (existingWindowSummary.treatment_category) {
          setTreatmentCategory(existingWindowSummary.treatment_category as TreatmentCategory);
          setSelectedTreatmentType(existingWindowSummary.treatment_category);
          hasRestoredTreatmentType.current = true;
          console.log('✅ [EARLY] Restored treatment category from summary:', existingWindowSummary.treatment_category);
        } else if (existingWindowSummary.treatment_type) {
          setTreatmentCategory(existingWindowSummary.treatment_type as TreatmentCategory);
          setSelectedTreatmentType(existingWindowSummary.treatment_type);
          hasRestoredTreatmentType.current = true;
          console.log('✅ [EARLY] Restored treatment type from summary:', existingWindowSummary.treatment_type);
        }
        
        if (templateDetails) {
          console.log('🔧 [v2.0.3] Template details from snapshot:', {
            id: templateDetails.id,
            name: templateDetails.name,
            has_selected_heading_ids: !!templateDetails.selected_heading_ids,
            selected_heading_ids_count: templateDetails.selected_heading_ids?.length || 0
          });
          
          // CRITICAL FIX: ALWAYS fetch full template to ensure we have selected_heading_ids AND manufacturing pricing
          // FIX: Use template_id from windows_summary as fallback if template_details.id is missing
          const templateIdToFetch = templateDetails?.id || existingWindowSummary.template_id;
          let fullTemplate = templateDetails || {};
          if (templateIdToFetch) {
            console.log('🔍 [v2.0.3] Fetching full template to get selected_heading_ids and manufacturing pricing:', templateIdToFetch);
            try {
              const { data: fetchedTemplate, error: fetchError } = await supabase
                .from('curtain_templates')
                .select('*')
                .eq('id', templateIdToFetch)
                .maybeSingle();
              
              if (fetchError) {
                console.error('❌ [v2.0.3] Error fetching template:', fetchError);
              } else if (fetchedTemplate) {
                console.log('✅ [v2.0.3] Fetched full template:', {
                  id: fetchedTemplate.id,
                  name: fetchedTemplate.name,
                  selected_heading_ids: fetchedTemplate.selected_heading_ids,
                  headingIdsCount: fetchedTemplate.selected_heading_ids?.length || 0
                });
                fullTemplate = { ...templateDetails, ...fetchedTemplate };
              } else {
                console.warn('⚠️ [v2.0.3] Template not found in curtain_templates:', templateIdToFetch);
              }
            } catch (err) {
              console.error('❌ [v2.0.3] Exception fetching full template:', err);
            }
          }
          
          setSelectedTemplate(fullTemplate);
          
          // Detect treatment category from template (prioritize curtain_type for wallpaper)
          detectedCategory = detectTreatmentType(fullTemplate);
          setTreatmentCategory(detectedCategory);
          setSelectedTreatmentType(detectedCategory);
          hasRestoredTreatmentType.current = true;
          console.log('✅ [TEMPLATE] Restored treatment category from template:', detectedCategory);
        }
        if (existingWindowSummary.treatment_type && !templateDetails) {
          setSelectedTreatmentType(existingWindowSummary.treatment_type);
          hasRestoredTreatmentType.current = true;
        }
        if (existingWindowSummary.treatment_category && !templateDetails) {
          setTreatmentCategory(existingWindowSummary.treatment_category as TreatmentCategory);
          hasRestoredTreatmentType.current = true;
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
            // CRITICAL FIX: For blinds/shutters, ALSO fetch fresh from inventory to get pricing_grid_data
            // The saved fabric_details snapshot may not include the full pricing grid needed for calculations
            const isBlindOrShutter = detectedCategory.includes('blind') || 
                                     detectedCategory.includes('shutter') || 
                                     detectedCategory.includes('shade') ||
                                     detectedCategory.includes('awning');
            
            if (isBlindOrShutter) {
              try {
                const { data: freshMaterial } = await supabase
                  .from('enhanced_inventory_items')
                  .select('*')
                  .eq('id', fabricId)
                  .single();
                
                if (freshMaterial) {
                  restoredItems.fabric = freshMaterial;
                  restoredItems.material = freshMaterial; // Also set as material for blind context
                  console.log('✅ Restored fresh material for blind/shutter with pricing grid:', {
                    id: freshMaterial.id,
                    name: freshMaterial.name,
                    has_pricing_grid: !!(freshMaterial as any).pricing_grid_data,
                    resolved_grid_name: (freshMaterial as any).resolved_grid_name
                  });
                } else {
                  // Fallback to saved details if fetch fails
                  restoredItems.fabric = { ...fabricDetails, id: fabricId, fabric_id: fabricId };
                }
              } catch (error) {
                console.error('Error fetching fresh material for blind:', error);
                restoredItems.fabric = { ...fabricDetails, id: fabricId, fabric_id: fabricId };
              }
            } else {
              // ✅ FIX: For curtains/romans, ALSO fetch fresh from inventory to get pricing_grid_data
              // Grid-priced curtains need the full pricing grid data for calculations
              try {
                const { data: freshFabric } = await supabase
                  .from('enhanced_inventory_items')
                  .select('*')
                  .eq('id', fabricId)
                  .single();
                
                if (freshFabric) {
                  restoredItems.fabric = freshFabric;
                  console.log('✅ Restored fresh fabric for curtain/roman with pricing grid:', {
                    id: freshFabric.id,
                    name: freshFabric.name,
                    has_pricing_grid: !!(freshFabric as any).pricing_grid_data,
                    resolved_grid_name: (freshFabric as any).resolved_grid_name
                  });
                } else {
                  restoredItems.fabric = { ...fabricDetails, id: fabricId, fabric_id: fabricId };
                }
              } catch (error) {
                console.error('Error fetching fresh fabric for curtain:', error);
                restoredItems.fabric = { ...fabricDetails, id: fabricId, fabric_id: fabricId };
              }
            }
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
        
        // Restore heading and lining - normalize 'standard' to 'none' for dropdown compatibility
        if (existingWindowSummary.selected_heading_id) {
          const normalizedHeading = existingWindowSummary.selected_heading_id === 'standard' 
            ? 'none' 
            : existingWindowSummary.selected_heading_id;
          setSelectedHeading(normalizedHeading);
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
          // Normalize 'standard' to 'none' for dropdown compatibility
          const rawHeading = measurementsDetails.selected_heading || existingWindowSummary.selected_heading_id || '';
          restoredMeasurements.selected_heading = rawHeading === 'standard' ? 'none' : rawHeading;
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
            // Apply defaults if values don't exist - FIXED: 0 is a valid explicit value
            const safeValue = (saved: any, ...fallbacks: any[]) => {
              // Only treat null/undefined as missing - 0 is valid for "no hem/allowance"
              if (saved !== null && saved !== undefined) return saved;
              for (const fb of fallbacks) {
                if (fb !== null && fb !== undefined) return fb;
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
        
        // Set fabric calculation if available - CRITICAL: Include hems and returns AND totalWidthWithAllowances
        // FIX: Set fabricCalculation even when linear_meters is null so manufacturing can calculate
        if (existingWindowSummary.template_id) {
          const md = existingWindowSummary.measurements_details as any || {};
          
          // CRITICAL FIX: Calculate totalWidthWithAllowances from restored values
          // rail_width is stored in MM in database, convert to CM for fabric calculation
          const railWidthCm = (md.rail_width || 0) / 10;
          const fullness = md.heading_fullness || md.fullness_ratio || 1; // ✅ FIX: Use 1 (no multiplication) if no fullness found
          const requiredWidth = railWidthCm * fullness;
          const returns = (md.return_left || 0) + (md.return_right || 0);
          const curtainMultiplier = (md.curtain_type === 'pair' || md.curtain_type === 'double') ? 2 : 1;
          const totalSideHems = (md.side_hems || 0) * 2 * curtainMultiplier;
          // Use saved value if available, otherwise calculate
          const totalWidthWithAllowances = md.total_width_with_allowances_cm || (requiredWidth + returns + totalSideHems);
          
          setFabricCalculation({
            linearMeters: existingWindowSummary.linear_meters,
            totalCost: existingWindowSummary.fabric_cost,
            pricePerMeter: existingWindowSummary.price_per_meter,
            widthsRequired: existingWindowSummary.widths_required,
            // ✅ FIX: Restore curtainCount from curtain_type for per-panel pricing
            curtainCount: curtainMultiplier,
            // CRITICAL: Restore all values needed for manufacturing calculation
            returns: returns,
            totalSideHems: totalSideHems,
            returnLeft: md.return_left || 0,
            returnRight: md.return_right || 0,
            sideHems: md.side_hems || 0,
            fullnessRatio: fullness,
            totalWidthWithAllowances: totalWidthWithAllowances, // ✅ Now calculated/restored
            railWidth: railWidthCm,
            wastePercent: md.waste_percent || 5
          });
        }
        return;
      }
    };

    // Call the async function
    loadData();
  }, []); // CRITICAL: Empty dependency array - only run on mount

  // PHASE 5: Re-convert measurements when units change AFTER initial load
  // This handles the race condition where units load after measurements are restored
  useEffect(() => {
    // Skip if not yet loaded or user is editing
    if (!hasLoadedInitialData.current || isUserEditing.current) return;
    
    // Skip if this is the first time (units just initialized)
    if (previousUnitsRef.current === null) {
      previousUnitsRef.current = units.length;
      return;
    }
    
    // Skip if units haven't actually changed
    if (previousUnitsRef.current === units.length) return;
    
    console.log('📐 Units changed after initial load:', {
      from: previousUnitsRef.current,
      to: units.length,
      hasLoadedInitialData: hasLoadedInitialData.current
    });
    
    // Re-convert measurements from MM to new unit
    // Get the stored MM values from existingWindowSummary
    if (existingWindowSummary) {
      const measurementsDetails = existingWindowSummary.measurements_details as any || {};
      const storedRailWidthMM = measurementsDetails.rail_width || existingWindowSummary.rail_width;
      const storedDropMM = measurementsDetails.drop || existingWindowSummary.drop;
      
      if (storedRailWidthMM && storedRailWidthMM > 0) {
        const convertedWidth = convertLength(storedRailWidthMM, 'mm', units.length).toString();
        console.log('📏 Re-converting rail_width:', storedRailWidthMM, 'mm →', convertedWidth, units.length);
        
        setMeasurements(prev => ({
          ...prev,
          rail_width: convertedWidth,
          drop: storedDropMM && storedDropMM > 0 
            ? convertLength(storedDropMM, 'mm', units.length).toString()
            : prev.drop
        }));
      }
    }
    
    // Update previous units ref
    previousUnitsRef.current = units.length;
  }, [units.length, existingWindowSummary]);

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

  // AUTO-NAVIGATE to measurements tab when editing existing treatment
  // Skip the wizard steps if template and fabric are already selected
  // CRITICAL FIX: Only navigate AFTER treatment type is properly restored to prevent spontaneous curtain bug
  const hasNavigatedToMeasurements = useRef(false);
  useEffect(() => {
    // Only run once
    if (hasNavigatedToMeasurements.current) return;
    
    // CRITICAL: Wait for treatment type to be restored first
    // This prevents navigating to measurements with wrong/default treatment type
    if (!hasRestoredTreatmentType.current && existingWindowSummary) {
      console.log('⏳ Waiting for treatment type restoration before auto-navigating...');
      return;
    }
    
    // Check if we're editing (has existing data with template)
    if (existingWindowSummary && selectedTemplate) {
      // Check if fabric/material is also selected (step 3 complete)
      const hasFabricOrMaterial = selectedItems.fabric || selectedItems.material || selectedItems.hardware;
      
      if (hasFabricOrMaterial) {
        console.log('📍 Auto-navigating to measurements tab (editing existing treatment with restored type:', treatmentCategory, ')');
        hasNavigatedToMeasurements.current = true;
        // Small delay to ensure state is settled
        setTimeout(() => setActiveTab('measurements'), 100);
      }
    }
  }, [existingWindowSummary, selectedTemplate, selectedItems, treatmentCategory]);

  // AUTO-RESTORE draft on mount (no confirmation needed)
  useEffect(() => {
    if (!surfaceId || existingWindowSummary) return;

    const draft = draftService.loadDraft(surfaceId);
    if (draft) {
      const age = draftService.getDraftAge(surfaceId);
      console.log(`📥 [Draft] Auto-restoring draft from ${age} minutes ago`);
      
      // Auto-restore without confirmation
      if (draft.templateId) {
        setSelectedTemplate(draft.templateId);
      }
      if (draft.measurements && Object.keys(draft.measurements).length > 0) {
        setMeasurements(draft.measurements);
      }
      if (draft.selectedOptions && draft.selectedOptions.length > 0) {
        setSelectedOptions(draft.selectedOptions);
      }
      if (draft.selectedHeading) setSelectedHeading(draft.selectedHeading);
      if (draft.selectedLining) setSelectedLining(draft.selectedLining);
      if (draft.windowType) setSelectedWindowType(draft.windowType);
      if (draft.treatmentCategory) {
        setTreatmentCategory(draft.treatmentCategory as TreatmentCategory);
        setSelectedTreatmentType(draft.treatmentCategory);
      }
      
      // Show subtle notification
      toast.success("Previous work restored", {
        description: `Draft from ${age} minutes ago`,
        duration: 3000
      });
    }
    draftService.clearExpiredDrafts();
  }, [surfaceId, existingWindowSummary]);

  // DEBOUNCED draft save - saves 500ms after any change
  useEffect(() => {
    if (!surfaceId) return;
    
    // Only save if there's meaningful data
    const hasData = selectedTemplate || selectedWindowType || selectedItems.fabric || 
                   selectedItems.hardware || selectedItems.material || 
                   Object.keys(measurements).length > 0 || selectedOptions.length > 0;
    
    if (!hasData) return;

    const timeoutId = setTimeout(() => {
      draftService.saveDraft(surfaceId, {
        windowId: surfaceId,
        templateId: selectedTemplate?.id,
        templateName: selectedTemplate?.name,
        fabricId: selectedItems.fabric?.id,
        fabricName: selectedItems.fabric?.name,
        hardwareId: selectedItems.hardware?.id,
        materialId: selectedItems.material?.id,
        measurements,
        selectedOptions,
        selectedHeading,
        selectedLining,
        windowType: selectedWindowType,
        windowTypeName: selectedWindowType?.name,
        treatmentCategory
      });
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [
    surfaceId,
    selectedTemplate,
    selectedWindowType,
    selectedItems,
    measurements,
    selectedOptions,
    selectedHeading,
    selectedLining,
    treatmentCategory
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
          
          // ✅ FIX #5: Check for existing window summary with non-zero cost
          // This prevents saving zero costs over existing valid costs when editing
          const existingSummaryData = latestSummaryRef.current || existingWindowSummary;
          const existingTotalCost = existingSummaryData?.total_cost || 0;
          
          // Calculate comprehensive costs including all components
          let fabricCost = 0;
          let totalCost = 0;
          let linearMeters = 0;
          let manufacturingCost = 0;
          let liningCost = 0;
          let headingCost = 0;
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
            // ✅ CRITICAL FIX: Use live-calculated blind costs from CostCalculationSummary
            // This ensures save uses IDENTICAL values to what's displayed - no recalculation
            if (liveBlindCalcResult) {
              console.log('✅ [SAVE] Using live blind calculation (no recalculation):', liveBlindCalcResult);
              fabricCost = liveBlindCalcResult.fabricCost;
              manufacturingCost = liveBlindCalcResult.manufacturingCost;
              blindOptionsCost = liveBlindCalcResult.optionsCost;
              totalCost = liveBlindCalcResult.totalCost;
              linearMeters = liveBlindCalcResult.squareMeters; // Use sqm for blinds
              hardwareCost = 0; // Hardware included in options
            } else {
              // Fallback: Recalculate only if CostCalculationSummary hasn't rendered yet
              console.log('⚠️ [SAVE] No live blind result, falling back to recalculation');
              
              // BLIND/SHUTTER CALCULATIONS
              // ✅ CRITICAL FIX: measurements are in USER'S DISPLAY UNIT during live editing
              // Convert from user's display unit to CM before passing to calculator
              const rawWidth = parseFloat(measurements.rail_width) || 0;
              const rawHeight = parseFloat(measurements.drop) || 0;
              const width = convertLength(rawWidth, units.length, 'cm');
              const height = convertLength(rawHeight, units.length, 'cm');
              
              // Import blind calculation utility - UNIFIED TO SINGLE CALCULATOR
              const { calculateBlindCosts, isBlindCategory } = await import('@/components/measurements/dynamic-options/utils/blindCostCalculator');
              
              // CRITICAL: Use fabric first (with pricing grid data), then fall back to material or template
              const materialForCalc = selectedItems.fabric || selectedItems.material || (selectedTemplate ? {
                unit_price: selectedTemplate.unit_price || 0,
                selling_price: selectedTemplate.unit_price || 0
              } : null);
              
              console.log('🎯 Calculating blind cost (fallback):', {
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
              
              console.log('💰 Blind calculation result (fallback):', {
                fabricCost: blindCalc.fabricCost,
                manufacturingCost: blindCalc.manufacturingCost,
                optionsCost: blindOptionsCost,
                squareMeters: blindCalc.squareMeters,
                totalCost: blindCalc.totalCost
              });
            }
          } else {
            // ✅ CRITICAL FIX: Use live-calculated curtain costs from CostCalculationSummary
            // This ensures save uses IDENTICAL values to what's displayed - no recalculation
            if (liveCurtainCalcResult) {
              console.log('✅ [SAVE] Using live curtain calculation (no recalculation):', liveCurtainCalcResult);
              fabricCost = liveCurtainCalcResult.fabricCost;
              linearMeters = liveCurtainCalcResult.linearMeters;
              // ✅ CRITICAL: Also use lining, heading, manufacturing from live result!
              // DO NOT recalculate - this was causing display/save mismatch
              liningCost = liveCurtainCalcResult.liningCost;
              headingCost = liveCurtainCalcResult.headingCost;
              manufacturingCost = liveCurtainCalcResult.manufacturingCost;
            } else {
              // Original curtain calculations - use engineResult when available
              const isCurtainOrRoman = treatmentCategory === 'curtains' || treatmentCategory === 'roman_blinds';
              
              // Get horizontal pieces from engine or fabricCalculation
              const horizontalPiecesNeeded = (isCurtainOrRoman && engineResult?.formula_breakdown?.values?.['horizontal_pieces'] as number) 
                || fabricCalculation?.horizontalPiecesNeeded 
                || 1;
              
              // Check if using leftover fabric - only charge for 1 piece instead of multiple
              const usesLeftover = measurements.uses_leftover_for_horizontal === true || 
                                   measurements.uses_leftover_for_horizontal === 'true';
              
              // Check if railroaded from engine
              const isRailroaded = engineResult?.formula_breakdown?.values?.['is_railroaded'] === 'yes' 
                || fabricCalculation?.fabricOrientation === 'horizontal';
              
              // ✅ SINGLE SOURCE OF TRUTH: Engine returns TOTAL linear meters (includes all pieces for railroaded)
              const engineTotalMeters = (isCurtainOrRoman && engineResult?.linear_meters != null) 
                ? engineResult.linear_meters 
                : null;
              const fabricCalcMeters = fabricCalculation?.linearMeters || 0;
              const usingEngine = engineTotalMeters != null;
              
              const pricePerMeter = fabricCalculation?.pricePerMeter || 0;
              
              // Calculate per-piece and total meters for consistent handling
              let perPieceMeters: number;
              let totalMetersToOrder: number;
              
              if (usingEngine && engineTotalMeters != null) {
                // ENGINE PATH: linear_meters is TOTAL
                if (isRailroaded && horizontalPiecesNeeded > 1) {
                  perPieceMeters = engineTotalMeters / horizontalPiecesNeeded;
                } else {
                  perPieceMeters = engineTotalMeters;
                }
                
                // Total to order: charge for 1 piece if using leftover, else total
                if (usesLeftover && horizontalPiecesNeeded > 1) {
                  totalMetersToOrder = perPieceMeters;
                  fabricCost = perPieceMeters * pricePerMeter;
                } else {
                  totalMetersToOrder = engineTotalMeters;
                  fabricCost = engineTotalMeters * pricePerMeter;
                }
                linearMeters = totalMetersToOrder; // Save the total being ordered
              } else {
                // LEGACY PATH: fabricCalculation returns per-width meters
                perPieceMeters = fabricCalcMeters;
                const piecesToCharge = (usesLeftover && horizontalPiecesNeeded > 1) ? 1 : horizontalPiecesNeeded;
                totalMetersToOrder = perPieceMeters * piecesToCharge;
                fabricCost = totalMetersToOrder * pricePerMeter;
                linearMeters = totalMetersToOrder; // Save the total being ordered
              }
              
              console.log('💰 [SAVE] Using fabric calculation (fallback):', {
                usingEngine,
                isRailroaded,
                perPieceMeters,
                totalMetersToOrder,
                linearMeters,
                horizontalPiecesNeeded,
                usesLeftover,
                pricePerMeter,
                fabricCost,
                widthsRequired: fabricCalculation?.widthsRequired
              });
            }
          }

          // ✅ LEGACY LINING SAVE CODE REMOVED: Lining is now an OPTION with per-linear-meter pricing
          // liningCost is already declared at line 919 and set from liveCurtainCalcResult if available
          // Otherwise it remains 0 - lining cost is included in options cost via calculateOptionPrices()

          // Calculate heading cost (for curtains only) - ONLY if not using liveCurtainCalcResult
          // Note: headingCost already declared at line 920, and set from liveCurtainCalcResult if available
          
          // ✅ CRITICAL FIX: ALWAYS resolve heading name, regardless of liveCurtainCalcResult
          // Previously this was inside the if(!liveCurtainCalcResult) block, causing "Standard" to always show
          let headingName = liveCurtainCalcResult?.headingName || 'Standard';
          if (!headingName || headingName === 'Standard') {
            // Resolve from settings/inventory if not provided by liveCurtainCalcResult
            if (selectedHeading && selectedHeading !== 'standard' && selectedHeading !== 'none') {
              const headingOptionFromSettings = headingOptionsFromSettings.find(h => h.id === selectedHeading);
              if (headingOptionFromSettings) {
                headingName = headingOptionFromSettings.name;
              } else {
                const headingItem = headingInventory?.find(item => item.id === selectedHeading);
                if (headingItem) {
                  headingName = headingItem.name;
                } else {
                  headingName = getHeadingName(selectedHeading);
                }
              }
            }
          }
          console.log("🎯 Resolved heading name:", headingName, "for ID:", selectedHeading, "from liveCurtainCalcResult:", !!liveCurtainCalcResult?.headingName);
          
          if (!liveCurtainCalcResult && treatmentCategory !== 'wallpaper') {
            console.log("🎯 AutoSave heading calculation:", {
              selectedHeading,
              headingOptionsFromSettings: headingOptionsFromSettings.length,
              headingInventory: headingInventory?.length,
              railWidth: measurements.rail_width
            });
            if (selectedHeading && selectedHeading !== 'standard' && selectedTemplate && fabricCalculation) {
              const headingUpchargePerCurtain = selectedTemplate.heading_upcharge_per_curtain || 0;
              const headingUpchargePerMetre = selectedTemplate.heading_upcharge_per_metre || 0;
              // CRITICAL FIX: Use linearMeters (which accounts for leftover/pieces logic) not fabricCalculation.linearMeters
              headingCost = headingUpchargePerCurtain + headingUpchargePerMetre * linearMeters;

              // Add additional heading costs from settings/inventory
              // ✅ CRITICAL FIX: Use linearMeters (fullness-adjusted width) NOT raw rail_width
              // Heading tape is applied to the finished curtain width which includes fullness
              const headingOptionFromSettings = headingOptionsFromSettings.find(h => h.id === selectedHeading);
              console.log("🎯 Found heading in settings:", headingOptionFromSettings, "linearMeters:", linearMeters);
              if (headingOptionFromSettings) {
                // ✅ FIX: Use linearMeters (already in meters, includes fullness)
                const headingPricePerMeter = headingOptionFromSettings.price || 0;
                const additionalCost = headingPricePerMeter * linearMeters;
                headingCost += additionalCost;
                headingName = headingOptionFromSettings.name;
                console.log("🎯 Settings heading cost:", additionalCost, "= price:", headingPricePerMeter, "× linearMeters:", linearMeters);
              } else {
                const headingItem = headingInventory?.find(item => item.id === selectedHeading);
                console.log("🎯 Found heading in inventory:", headingItem, "linearMeters:", linearMeters);
                if (headingItem) {
                  // ✅ FIX: Use linearMeters (already in meters, includes fullness)
                  const headingPricePerMeter = headingItem.price_per_meter || headingItem.selling_price || 0;
                  const additionalCost = headingPricePerMeter * linearMeters;
                  headingCost += additionalCost;
                  headingName = headingItem.name;
                  console.log("🎯 Inventory heading cost:", additionalCost, "= price:", headingPricePerMeter, "× linearMeters:", linearMeters);
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

          // ✅ Calculate manufacturing cost dynamically - ONLY if not using liveCurtainCalcResult
          // Note: manufacturingCost set from liveCurtainCalcResult if available (line ~1030)
          if (!liveCurtainCalcResult && displayCategory === 'curtains' && selectedTemplate && fabricCalculation) {
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
              // ✅ FIX: Calculate totalWidthWithAllowances directly from raw measurements
              // Never rely on potentially-stale fabricCalculation state
              const railWidthCm = (parseFloat(measurements.rail_width || '0')) / 10; // MM to CM
              const fullness = fabricCalculation?.fullnessRatio || parseFloat(measurements.heading_fullness || '0') || selectedTemplate?.fullness_ratio || 1; // ✅ FIX: Use 1 if no fullness
              const sideHemCm = fabricCalculation?.sideHems || parseFloat(String(measurements.side_hem || selectedTemplate?.side_hem || 4));
              const returnLeftCm = parseFloat(measurements.return_left || '0');
              const returnRightCm = parseFloat(measurements.return_right || '0');
              const returnsCm = fabricCalculation?.returns || (returnLeftCm + returnRightCm);
              
              // Calculate total width with allowances directly
              const widthWithAllowancesCm = (railWidthCm * fullness) + (sideHemCm * 2) + returnsCm;
              const wastePercent = fabricCalculation?.wastePercent || selectedTemplate?.waste_percent || 0;
              
              // Add waste percentage and convert to meters
              const finalWidthCm = widthWithAllowancesCm * (1 + wastePercent / 100);
              const finalWidthM = finalWidthCm / 100;
              
              // ✅ FIX: Check heading-specific price overrides first
              pricePerUnit = getManufacturingPrice(
                manufacturingType === 'hand',
                measurements.selected_heading,
                selectedTemplate.heading_prices,
                {
                  machine_price_per_metre: selectedPricingMethod?.machine_price_per_metre,
                  hand_price_per_metre: selectedPricingMethod?.hand_price_per_metre,
                },
                {
                  machine_price_per_metre: selectedTemplate.machine_price_per_metre,
                  hand_price_per_metre: selectedTemplate.hand_price_per_metre,
                }
              );
              
              // Multiply final width by manufacturing price per meter
              manufacturingCost = pricePerUnit * finalWidthM;
              
              console.log('💰 [SAVE] Per metre manufacturing calculation (FIXED):', {
                widthWithAllowancesCm,
                wastePercent,
                finalWidthCm,
                finalWidthM,
                pricePerUnit,
                manufacturingCost,
                formula: `${widthWithAllowancesCm.toFixed(0)}cm + ${wastePercent}% waste = ${finalWidthCm.toFixed(0)}cm (${finalWidthM.toFixed(2)}m) × $${pricePerUnit}/m = $${manufacturingCost.toFixed(2)}`
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
                         // ✅ CRITICAL: measurements.rail_width is in MM, convert to CM first
                         const railWidthCm = (parseFloat(measurements.rail_width || '0')) / 10;
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
            // ✅ CRITICAL: Use pre-calculated options cost from liveCurtainCalcResult if available
            if (liveCurtainCalcResult) {
              curtainOptionsCost = liveCurtainCalcResult.optionsCost;
              console.log('✅ [SAVE] Using live curtain options cost:', curtainOptionsCost);
            } else {
              curtainOptionsCost = selectedOptions.reduce((sum, opt) => sum + (opt.price || 0), 0);
              console.log('💰 [SAVE] Curtain options cost (fallback):', curtainOptionsCost, 'from', selectedOptions.length, 'options');
            }
          }

          // Calculate total cost 
          if (treatmentCategory === 'wallpaper') {
            totalCost = fabricCost; // Already calculated above for wallpaper
          } else if (displayCategory === 'blinds' || displayCategory === 'shutters') {
            // Blinds/shutters totalCost already calculated and includes options
            // DO NOT RECALCULATE - use blindCalc.totalCost which includes all components
          } else if (liveCurtainCalcResult) {
            // ✅ CRITICAL: Use pre-calculated total from liveCurtainCalcResult
            // This ensures popup display === saved values
            totalCost = liveCurtainCalcResult.totalCost;
            console.log('✅ [SAVE] Using live curtain total cost:', totalCost);
          } else {
            // Curtains - recalculate with all components including options (fallback)
            totalCost = fabricCost + liningCost + headingCost + manufacturingCost + curtainOptionsCost;
          }

          // ✅ FIX #5: Guard against saving zero costs over existing valid costs
          // This prevents the "editing zeroing totals" bug
          if (totalCost === 0 && existingTotalCost > 0 && !liveCurtainCalcResult && !liveBlindCalcResult) {
            console.warn('⚠️ [SAVE] Refusing to save zero total cost over existing non-zero cost:', {
              calculatedTotal: totalCost,
              existingTotal: existingTotalCost,
              hasLiveCurtainResult: !!liveCurtainCalcResult,
              hasLiveBlindResult: !!liveBlindCalcResult
            });
            
            // Use existing values instead of zeroing them out
            totalCost = existingTotalCost;
            fabricCost = existingSummaryData?.fabric_cost || fabricCost;
            manufacturingCost = existingSummaryData?.manufacturing_cost || manufacturingCost;
            blindOptionsCost = existingSummaryData?.options_cost || blindOptionsCost;
            linearMeters = existingSummaryData?.linear_meters || linearMeters;
            console.log('✅ [SAVE] Using existing costs as fallback:', { totalCost, fabricCost, manufacturingCost });
          }

          // ============================================================
          // SHADOW MODE: Compare new CalculationEngine vs old calculation
          // DEV ONLY - does NOT change any visible prices
          // ============================================================
          if (displayCategory === 'curtains' || specificTreatmentType === 'roman_blinds') {
            runShadowComparison(
              {
                surfaceId,
                projectId,
                treatmentCategory: specificTreatmentType,
                measurements,
                selectedTemplate,
                selectedFabric: selectedItems.fabric,
                selectedOptions,
                units,
              },
              totalCost
            );
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
            // ✅ CRITICAL: measurements.rail_width is in MM, convert to CM for spacing calculation
            const railWidthCm = parseFloat(measurements.rail_width) / 10;
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

          // CRITICAL FIX: Calculate total_selling with PER-ITEM MARKUPS
          // This ensures Room Cards, Rooms Tab, and Quotes all show the same price
          // ✅ FIX: Calculate total_selling with PER-ITEM MARKUPS
          // This ensures Room Cards, Rooms Tab, and Quotes all show the same price
          // Also track the overall markup percentage applied for display
          const calculateTotalSellingWithMarkup = () => {
            // Determine the treatment category for markup resolution
            const treatmentCat = treatmentCategory || 'curtains';
            const makingCategory = `${treatmentCat.replace(/_/g, '').replace('s', '')}_making`; // curtain_making, blind_making, etc.
            
            // ✅ FIX: Get product-level markup from inventory item OR pricing grid
            // Hierarchy: Product markup > Implied markup (from library pricing) > Grid markup > Category markup > Global
            const fabricItem = enrichedFabric || selectedItems.fabric || selectedItems.material;
            const productMarkup = fabricItem?.markup_percentage || undefined;
            const gridMarkup = fabricItem?.pricing_grid_markup || undefined;
            
            // ✅ CRITICAL FIX: Calculate implied markup from library pricing
            // If fabric has both cost_price and selling_price defined, the difference IS the markup
            // This prevents double-markup (applying 40% on top of already-marked-up selling_price)
            const costPrice = fabricItem?.cost_price || 0;
            const sellingPrice = fabricItem?.selling_price || 0;
            const hasPreDefinedPricing = costPrice > 0 && sellingPrice > costPrice;
            const impliedMarkup = hasPreDefinedPricing 
              ? ((sellingPrice - costPrice) / costPrice) * 100 
              : undefined;
            
            if (impliedMarkup && impliedMarkup > 0) {
              console.log('💰 [LIBRARY PRICING] Fabric has pre-defined markup:', {
                costPrice,
                sellingPrice,
                impliedMarkup: `${impliedMarkup.toFixed(1)}%`,
                note: 'Using cost_price as base, implied markup prevents double-markup'
              });
            }
            
            // Calculate selling prices for each component with their specific category markup
            const fabricMarkupResult = resolveMarkup({
              productMarkup, // ✅ Pass explicit product-level markup from inventory item
              impliedMarkup, // ✅ Pass implied markup from cost vs selling difference
              gridMarkup,    // ✅ Pass grid-level markup from pricing grid
              category: treatmentCat,
              markupSettings: markupSettings || undefined
            });
            const fabricSelling = applyMarkup(fabricCost, fabricMarkupResult.percentage);
            
            const liningMarkupResult = resolveMarkup({
              category: 'lining',
              markupSettings: markupSettings || undefined
            });
            const liningSelling = applyMarkup(finalLiningCost, liningMarkupResult.percentage);
            
            const headingMarkupResult = resolveMarkup({
              category: 'heading',
              markupSettings: markupSettings || undefined
            });
            const headingSelling = applyMarkup(finalHeadingCost, headingMarkupResult.percentage);
            
            const manufacturingMarkupResult = resolveMarkup({
              category: makingCategory,
              markupSettings: markupSettings || undefined
            });
            const manufacturingSelling = applyMarkup(manufacturingCost, manufacturingMarkupResult.percentage);
            
            const optionsMarkupResult = resolveMarkup({
              category: 'options',
              markupSettings: markupSettings || undefined
            });
            const optionsSelling = applyMarkup(curtainOptionsCost, optionsMarkupResult.percentage);
            
            const totalSelling = fabricSelling + liningSelling + headingSelling + manufacturingSelling + optionsSelling;
            
            // ✅ Calculate overall effective markup percentage: (selling - cost) / cost * 100
            const totalCostForMarkup = fabricCost + finalLiningCost + finalHeadingCost + manufacturingCost + curtainOptionsCost;
            const effectiveMarkupPercent = totalCostForMarkup > 0 
              ? ((totalSelling - totalCostForMarkup) / totalCostForMarkup) * 100 
              : 0;
            
            // ✅ Calculate profit margin: (selling - cost) / selling * 100
            const profitMarginPercent = totalSelling > 0
              ? ((totalSelling - totalCostForMarkup) / totalSelling) * 100
              : 0;
            
            console.log('💰 [PER-ITEM MARKUP] Calculating total_selling:', {
              fabricCost, fabricSelling,
              fabricMarkupSource: fabricMarkupResult.source,
              fabricMarkupPercent: fabricMarkupResult.percentage,
              productMarkup, gridMarkup,
              liningCost: finalLiningCost, liningSelling,
              headingCost: finalHeadingCost, headingSelling,
              manufacturingCost, manufacturingSelling,
              optionsCost: curtainOptionsCost, optionsSelling,
              makingCategory,
              effectiveMarkupPercent: effectiveMarkupPercent.toFixed(2),
              profitMarginPercent: profitMarginPercent.toFixed(2)
            });
            
            return {
              totalSelling,
              effectiveMarkupPercent,
              profitMarginPercent,
              primaryMarkupSource: fabricMarkupResult.source,
              primaryMarkupPercent: fabricMarkupResult.percentage
            };
          };
          
          const sellingResult = calculateTotalSellingWithMarkup();
          const finalTotalSelling = sellingResult.totalSelling;
          const markupApplied = sellingResult.effectiveMarkupPercent;
          const profitMargin = sellingResult.profitMarginPercent;

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
              // NOTE: Manufacturing is NOT included here - it's saved separately as manufacturing_cost
              // Adding it here would cause duplication in totals
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
            total_selling: finalTotalSelling, // ✅ PER-ITEM MARKUP SELLING PRICE
            markup_applied: markupApplied, // ✅ Store effective markup percentage
            profit_margin: profitMargin, // ✅ Store profit margin percentage
            // CRITICAL: Save structured cost_breakdown for accurate room/project totals
            cost_breakdown: (() => {
              // Calculate pieces to charge (accounting for leftover usage)
              const horizontalPiecesNeeded = fabricCalculation?.horizontalPiecesNeeded || 1;
              const usesLeftover = measurements.uses_leftover_for_horizontal === true || 
                                   measurements.uses_leftover_for_horizontal === 'true';
              const piecesToCharge = (usesLeftover && horizontalPiecesNeeded > 1) ? 1 : horizontalPiecesNeeded;
              const fabricQuantity = piecesToCharge > 1 ? linearMeters * piecesToCharge : linearMeters;
              
              // CRITICAL FIX: Get actual fabric/material name for display
              const fabricName = selectedItems.fabric?.name || selectedItems.material?.name || 'Material';
              const fabricColor = measurements.selected_color || selectedItems.fabric?.tags?.[0] || selectedItems.fabric?.color || 
                                 selectedItems.material?.tags?.[0] || selectedItems.material?.color || null;
              const materialLabel = selectedTemplate?.treatment_category?.includes('blind') || selectedTemplate?.treatment_category?.includes('shutter') 
                ? 'Material' 
                : selectedTemplate?.treatment_category === 'wallpaper' 
                  ? 'Wallpaper' 
                  : 'Fabric';
              
              // UNIVERSAL: Build option items with full name:value format for quote display
              // Works for ALL treatment types: curtains, romans, blinds, shutters, wallpaper, hardware, services
              const buildOptionBreakdownItems = () => {
                // UNIVERSAL: Try live calculation results first (any treatment type)
                const liveOptions = liveBlindCalcResult?.optionDetails || liveCurtainCalcResult?.optionDetails || [];
                
                // Helper to extract and validate option value
                const extractOptionValue = (opt: any): { name: string; value: string; isValid: boolean } => {
                  // CRITICAL: Use opt.name first (contains "key: value" format for blinds)
                  let optionName = opt.name || opt.optionKey || 'Option';
                  // CRITICAL: Check label FIRST (explicitly stored), then other sources
                  let optionValue = opt.label || opt.value || opt.selectedValue || opt.selectedLabel || '';
                  
                  // Extract from "name: value" format if value not already found
                  if (!optionValue && optionName.includes(':')) {
                    const colonIndex = optionName.indexOf(':');
                    optionValue = optionName.substring(colonIndex + 1).trim();
                    optionName = optionName.substring(0, colonIndex).trim();
                  }
                  
                  // Also try "name - value" format (sub-options use hyphen)
                  if (!optionValue && optionName.includes(' - ')) {
                    const hyphenIndex = optionName.indexOf(' - ');
                    optionValue = optionName.substring(hyphenIndex + 3).trim();
                    optionName = optionName.substring(0, hyphenIndex).trim();
                  }
                  
                  // Final fallback - use original full name as value if it has content
                  if (!optionValue && opt.name && !opt.name.includes(':') && !opt.name.includes(' - ')) {
                    optionValue = opt.name;
                  }
                  
                  // Format snake_case to Title Case for display
                  optionName = optionName
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c: string) => c.toUpperCase());
                  
                  // CRITICAL: Filter out N/A, empty, and invalid options
                  const invalidValues = ['n/a', 'na', '-', '', 'none', 'select', 'select option', 'choose'];
                  const isValid = optionValue && !invalidValues.includes(optionValue.toLowerCase().trim());
                  
                  return { name: optionName, value: optionValue || '-', isValid };
                };
                
                if (liveOptions.length > 0) {
                  // MUTUAL EXCLUSIVITY: Filter hidden hardware before processing
                  const hwTypeOpt = liveOptions.find((o: any) => 
                    o.optionKey === 'hardware_type' || o.name?.toLowerCase().includes('hardware type'));
                  const hwTypeVal = ((hwTypeOpt as any)?.name?.toLowerCase() || (hwTypeOpt as any)?.selectedValue?.toLowerCase() || '');
                  const isTrack = hwTypeVal.includes('track');
                  const isRod = hwTypeVal.includes('rod');
                  
                  const filteredLiveOptions = liveOptions.filter((opt: any) => {
                    const optKey = (opt.optionKey || '').toLowerCase();
                    if (isTrack && optKey.startsWith('rod_selection')) return false;
                    if (isRod && optKey.startsWith('track_selection')) return false;
                    return true;
                  });
                  
                  return filteredLiveOptions
                    .map((opt: any, idx: number) => {
                      const extracted = extractOptionValue(opt);
                      
                      // CRITICAL: Detect hardware accessories and preserve their fields
                      const isAccessory = opt.category === 'hardware_accessory';
                      const quantity = opt.quantity || 1;
                      const unitPrice = opt.unit_price || 0;
                      const pricingDetails = opt.pricingDetails || '';
                      
                      // Build proper description for accessories: "12 × ₹10.00 (1 per 10cm)"
                      let description = extracted.value;
                      if (isAccessory && quantity > 0 && unitPrice > 0) {
                        description = `${quantity} × ${unitPrice.toFixed(2)}`;
                        if (pricingDetails) {
                          description += ` (${pricingDetails})`;
                        }
                      }
                      
                      return {
                        id: opt.optionKey || opt.name || `option-${idx}`,
                        optionKey: opt.optionKey || '', // CRITICAL: Preserve for hardware grouping
                        name: extracted.name,
                        description: description,
                        total_cost: opt.cost || (quantity * unitPrice),
                        category: opt.category || 'option', // Preserve hardware_accessory category!
                        quantity: quantity,
                        unit_price: unitPrice,
                        pricing_method: opt.pricingMethod,
                        pricingDetails: pricingDetails,
                        parentOptionKey: opt.parentOptionKey,
                        image_url: opt.image_url || null,
                        orderIndex: opt.orderIndex ?? idx,
                        isValid: extracted.isValid
                      };
                    })
                    .filter((opt: any) => {
                      // Filter out invalid options
                      if (!opt.isValid) return false;
                      // Filter out "Fullness Ratio" - it's included in heading description
                      if (opt.name?.toLowerCase().includes('fullness ratio')) return false;
                      // Filter out "Hardware Type" with ₹0 - accessories will show under Select Track
                      if (opt.name?.toLowerCase() === 'hardware type' && (opt.total_cost === 0 || !opt.total_cost)) return false;
                      return true;
                    })
                    .sort((a: any, b: any) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
                }
                
                // UNIVERSAL FALLBACK: Use selectedOptions array (works for ALL template types)
                const optionsToUse = selectedOptions.length > 0 
                  ? selectedOptions 
                  : (Array.isArray(measurements.selected_options) ? measurements.selected_options : []);
                
                // MUTUAL EXCLUSIVITY FIX: Filter out hidden hardware based on hardware_type selection
                // If hardware_type is "track", filter out all rod_selection items (and vice versa)
                const hardwareTypeOpt = optionsToUse.find((o: any) => 
                  o.optionKey === 'hardware_type' || o.name?.toLowerCase().includes('hardware type'));
                const hardwareTypeValue = hardwareTypeOpt?.name?.toLowerCase() || hardwareTypeOpt?.value?.toLowerCase() || '';
                const isTrackSelected = hardwareTypeValue.includes('track');
                const isRodSelected = hardwareTypeValue.includes('rod');
                
                const filteredOptions = optionsToUse.filter((opt: any) => {
                  const optKey = (opt.optionKey || '').toLowerCase();
                  // Filter out rod items if track is selected
                  if (isTrackSelected && optKey.startsWith('rod_selection')) {
                    return false;
                  }
                  // Filter out track items if rod is selected
                  if (isRodSelected && optKey.startsWith('track_selection')) {
                    return false;
                  }
                  return true;
                });
                
                return filteredOptions
                  .map((opt: any, idx: number) => {
                    // ✅ CRITICAL FIX: Use calculatedPrice if exists to prevent double-calculation
                    // Only recalculate if price exists but calculatedPrice doesn't
                    let optionTotalCost = opt.calculatedPrice ?? opt.price ?? 0;
                    const isPerMeterOption = opt.pricingMethod === 'per-meter' || opt.pricingMethod === 'per-metre' || 
                                            opt.pricingMethod === 'per_meter' || opt.pricingMethod === 'per_metre' ||
                                            opt.name?.toLowerCase().includes('lining');
                    
                    // Only recalculate per-meter IF no calculatedPrice exists
                    if (!opt.calculatedPrice && isPerMeterOption && linearMeters > 0 && opt.price > 0) {
                      optionTotalCost = opt.price * linearMeters;
                    }
                    
                    const extracted = extractOptionValue(opt);
                    
                    // ACCESSORY PRESERVATION: For hardware_accessory items, use proper accessory data
                    const isAccessory = opt.category === 'hardware_accessory';
                    const accessoryQuantity = opt.quantity || 1;
                    const accessoryUnitPrice = opt.unit_price || 0;
                    
                    // For accessories, create descriptive name from accessory data
                    let displayName = extracted.name;
                    let displayDescription = extracted.value;
                    
                    if (isAccessory) {
                      // Use the accessory name directly (e.g., "Runners", "End Caps")
                      displayName = opt.name || extracted.name;
                      // Create pricing description (e.g., "12 × ₹10")
                      displayDescription = accessoryQuantity > 1 && accessoryUnitPrice > 0 
                        ? `${accessoryQuantity} × ₹${accessoryUnitPrice.toFixed(2)}`
                        : extracted.value;
                    }
                    
                    return {
                      id: opt.optionKey || `option-${idx}`,
                      optionKey: opt.optionKey || '', // CRITICAL: Preserve for hardware grouping
                      name: displayName,
                      description: displayDescription,
                      total_cost: optionTotalCost,
                      category: opt.category || 'option', // PRESERVE original category (hardware_accessory)
                      quantity: accessoryQuantity,
                      unit_price: accessoryUnitPrice,
                      pricing_method: opt.pricingMethod,
                      pricingDetails: opt.pricingDetails || '', // e.g., "1 per 10cm"
                      parentOptionKey: opt.parentOptionKey, // Links to parent hardware
                      image_url: opt.image_url || null,
                      orderIndex: opt.orderIndex ?? idx,
                      isValid: extracted.isValid
                    };
                  })
                  .filter((opt: any) => {
                    // Filter out invalid options
                    if (!opt.isValid) return false;
                    // Filter out "Fullness Ratio" - it's included in heading description
                    if (opt.name?.toLowerCase().includes('fullness ratio')) return false;
                    // Filter out "Hardware Type" with ₹0 - accessories will show under Select Track
                    if (opt.name?.toLowerCase() === 'hardware type' && (opt.total_cost === 0 || !opt.total_cost)) return false;
                    return true;
                  })
                  .sort((a: any, b: any) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
              };
              
              return [
                // Fabric/Material - CRITICAL: Include actual name and color
                ...(fabricCost > 0 ? [{
                  id: 'fabric',
                  name: materialLabel,
                  description: fabricName + (fabricColor ? ` - ${fabricColor}` : ''),
                  total_cost: fabricCost,
                  category: 'fabric',
                  quantity: fabricQuantity,
                  unit: 'm',
                  unit_price: fabricCalculation?.pricePerMeter || selectedItems.fabric?.selling_price || 0,
                  pricing_method: selectedTemplate?.pricing_type || 'per_metre',
                  widths_required: fabricCalculation?.widthsRequired,
                  fabric_orientation: fabricCalculation?.fabricOrientation,
                  uses_pricing_grid: !!(selectedItems.fabric?.pricing_grid_data || selectedItems.material?.pricing_grid_data),
                  uses_leftover: usesLeftover,
                  horizontal_pieces_needed: horizontalPiecesNeeded,
                  pieces_charged: piecesToCharge,
                  image_url: selectedItems.fabric?.image_url || selectedItems.material?.image_url || null,
                  color: fabricColor
                }] : []),
                // Lining
                ...(finalLiningCost > 0 ? [{
                  id: 'lining',
                  name: 'Lining',
                  description: selectedLining || 'Standard',
                  total_cost: finalLiningCost,
                  category: 'lining',
                  quantity: linearMeters,
                  unit: 'm'
                }] : []),
                // Heading - include fullness ratio in description (e.g., "European Pleat x2")
                ...(selectedHeading && selectedHeading !== 'standard' && selectedHeading !== 'none' ? [{
                  id: 'heading',
                  name: 'Heading',
                  description: (() => {
                    const headingOpt = headingOptionsFromSettings.find((h: any) => h.id === selectedHeading);
                    const headingName = headingOpt?.name || selectedHeading;
                    // Include fullness ratio in heading description
                    const fullness = measurements.fullness_ratio || measurements.heading_fullness || headingOpt?.fullness_ratio;
                    if (fullness && fullness > 1) {
                      return `${headingName} x${fullness}`;
                    }
                    return headingName;
                  })(),
                  total_cost: finalHeadingCost || 0,
                  category: 'heading'
                }] : []),
                // Manufacturing
                ...(manufacturingCost > 0 ? [{
                  id: 'manufacturing',
                  name: 'Manufacturing',
                  description: measurements.manufacturing_type === 'hand' ? 'Hand Finished' : 'Machine Finished',
                  total_cost: manufacturingCost,
                  category: 'manufacturing'
                }] : []),
                // Hardware
                ...(hardwareCost > 0 ? [{
                  id: 'hardware',
                  name: 'Hardware',
                  description: selectedItems.hardware?.name || 'Track/Rod',
                  total_cost: hardwareCost,
                  category: 'hardware',
                  image_url: selectedItems.hardware?.image_url || null
                }] : []),
                // All options with full name:value format
                ...buildOptionBreakdownItems()
              ];})(),
            template_id: selectedTemplate?.id,
            pricing_type: selectedTemplate?.pricing_type || 'per_metre',
            waste_percent: selectedTemplate?.waste_percent || 5,
            currency: units?.currency || 'USD',
            
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
              manufacturing_type: selectedTemplate?.manufacturing_type,
              // CRITICAL: Include heading IDs for curtain templates
              selected_heading_ids: selectedTemplate?.selected_heading_ids || [],
              // ✅ FIX: Save template image URL for display in summary cards
              image_url: selectedTemplate?.image_url || selectedTemplate?.display_image_url,
              display_image_url: selectedTemplate?.display_image_url || selectedTemplate?.image_url
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
              
              // CRITICAL: Store ALL template-specific values - NO hardcoded fallbacks, must come from template
              header_hem: measurements.header_hem || selectedTemplate?.header_allowance || selectedTemplate?.header_hem || null,
              bottom_hem: measurements.bottom_hem || selectedTemplate?.bottom_hem || selectedTemplate?.bottom_allowance || null,
              side_hems: measurements.side_hem || selectedTemplate?.side_hem || selectedTemplate?.side_hems || null,
              seam_hems: measurements.seam_hem || selectedTemplate?.seam_allowance || selectedTemplate?.seam_hems || null,
              return_left: measurements.return_left || selectedTemplate?.return_left || 0,
              return_right: measurements.return_right || selectedTemplate?.return_right || 0,
              waste_percent: measurements.waste_percent || selectedTemplate?.waste_percent || 0,
              
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
              // CRITICAL FIX: Use user's heading_fullness selection, NOT template default
              // ✅ FIX: No hardcoded fallback - use 1 (no multiplication) if not set
              fullness_ratio: measurements.heading_fullness || measurements.fullness_ratio || selectedTemplate?.fullness_ratio || 1,
              heading_fullness: measurements.heading_fullness || measurements.fullness_ratio || selectedTemplate?.fullness_ratio || 1,
              fabric_width_cm: selectedItems.fabric?.fabric_width || selectedItems.fabric?.wallpaper_roll_width || 140,
              window_type: selectedWindowType?.name || 'Room Wall',
              selected_heading: selectedHeading,
              selected_lining: selectedLining,
              // CRITICAL: Save totalWidthWithAllowances for manufacturing calculation restoration
              total_width_with_allowances_cm: fabricCalculation?.totalWidthWithAllowances || 0,
              waste_percent_saved: fabricCalculation?.wastePercent || measurements.waste_percent || selectedTemplate?.waste_percent || 5
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
          
          // CRITICAL FIX: Also update the surfaces table with current measurements
          // This ensures visualizers and cards that read from surfaces table show correct values
          if (surfaceId && measurements.rail_width && measurements.drop) {
            const railWidthMM = convertLength(parseFloat(measurements.rail_width), units.length, 'mm');
            const dropMM = convertLength(parseFloat(measurements.drop), units.length, 'mm');
            
            console.log('📐 Updating surfaces table with measurements:', {
              surfaceId,
              railWidthMM,
              dropMM
            });
            
            const { error: surfaceError } = await supabase
              .from('surfaces')
              .update({
                width: railWidthMM,
                height: dropMM,
                measurement_a: railWidthMM,
                measurement_b: dropMM
              })
              .eq('id', surfaceId);
            
            if (surfaceError) {
              console.error('⚠️ Failed to update surfaces table:', surfaceError);
              // Don't throw - this is a non-critical update
            } else {
              console.log('✅ Surfaces table updated with measurements');
            }
          }

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

          // CRITICAL: Sync to workshop_items for shared work orders
          // This ensures shared links always show current data
          if (surfaceId && summaryData) {
            console.log('🔄 Syncing to workshop_items for share link consistency...');
            syncWindowToWorkshopItem(surfaceId, summaryData, surfaceData?.room?.name);
          }

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
          await queryClient.invalidateQueries({
            queryKey: ["workshop-items"]
          });
      } catch (error) {
        console.error("❌ Auto-save failed:", error);
        throw error;
      }
    },
    // New methods for draft management
    hasUnsavedChanges: () => hasUnsavedChanges,
    getDraftData: () => ({
      windowId: surfaceId,
      templateId: selectedTemplate?.id,
      templateName: selectedTemplate?.name,
      fabricId: selectedItems.fabric?.id,
      fabricName: selectedItems.fabric?.name,
      hardwareId: selectedItems.hardware?.id,
      materialId: selectedItems.material?.id,
      measurements,
      selectedOptions,
      selectedHeading,
      selectedLining,
      windowType: selectedWindowType,
      windowTypeName: selectedWindowType?.name,
      treatmentCategory
    }),
    saveDraftNow: () => {
      if (!surfaceId) return;
      draftService.saveDraft(surfaceId, {
        windowId: surfaceId,
        templateId: selectedTemplate?.id,
        templateName: selectedTemplate?.name,
        fabricId: selectedItems.fabric?.id,
        fabricName: selectedItems.fabric?.name,
        hardwareId: selectedItems.hardware?.id,
        materialId: selectedItems.material?.id,
        measurements,
        selectedOptions,
        selectedHeading,
        selectedLining,
        windowType: selectedWindowType,
        windowTypeName: selectedWindowType?.name,
        treatmentCategory
      });
    },
    clearDraft: () => {
      if (surfaceId) {
        draftService.clearDraft(surfaceId);
      }
    }
  }));
  const handleMeasurementChange = (field: string, value: string) => {
    console.log('🔥🔥🔥 handleMeasurementChange:', { field, value, userUnit: units.length });
    
    // PHASE 4: Mark that user is actively editing to prevent data reloads
    isUserEditing.current = true;
    
    // Store value AS-IS in user's display unit
    // Conversion to MM happens ONLY when saving to database
    // Conversion to CM happens at calculation boundary
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset the editing flag after a short delay
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
    // ✅ FIX: Only clear options when user manually changes to a DIFFERENT template
    // Don't clear when restoring same template from saved data
    const previousTemplateId = selectedTemplate?.id;
    const newTemplateId = template?.id;
    const isTemplateChange = previousTemplateId && newTemplateId && previousTemplateId !== newTemplateId;
    
    setSelectedTemplate(template);
    // Set treatment type based on template category
    const category = template?.treatment_category || 'curtains';
    setSelectedTreatmentType(category === 'wallpaper' ? 'wallpaper' : category);
    setTreatmentCategory(category);
    
    // ✅ CRITICAL: Only clear options when user MANUALLY switches to a different template
    // This prevents clearing restored options when editing existing projects
    if (isTemplateChange) {
      console.log('🔄 Template changed from', previousTemplateId, 'to', newTemplateId, '- clearing old options');
      setSelectedOptions([]);
    } else {
      console.log('✅ Same template or initial load - keeping existing options');
    }
    
    // ✅ FIX: Initialize measurements with template defaults ONLY if not already set
    // Don't overwrite existing saved values
    setMeasurements(prev => {
      const templateAny = template as any;
      return {
        ...prev,
        // Only set template defaults if value doesn't exist - NO hardcoded fallbacks
        // Values MUST come from template settings
        header_hem: prev.header_hem ?? templateAny.header_allowance ?? templateAny.header_hem,
        bottom_hem: prev.bottom_hem ?? templateAny.bottom_hem ?? templateAny.bottom_allowance,
        side_hems: prev.side_hems ?? prev.side_hem ?? templateAny.side_hem ?? template.side_hems,
        seam_hems: prev.seam_hems ?? prev.seam_hem ?? templateAny.seam_allowance ?? template.seam_hems,
        return_left: prev.return_left ?? template.return_left,
        return_right: prev.return_right ?? template.return_right,
        waste_percent: prev.waste_percent ?? template.waste_percent,
        heading_fullness: prev.heading_fullness ?? templateAny.default_fullness ?? template.fullness_ratio,
      };
    });
    
    console.log('🎯 Template selected - initialized defaults from template (no hardcoded fallbacks)');
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
                            // ✅ CRITICAL: Save template_details immediately with manufacturing pricing
                            template_details: {
                              id: template.id,
                              name: template.name,
                              pricing_type: template.pricing_type,
                              machine_price_per_metre: template.machine_price_per_metre,
                              hand_price_per_metre: template.hand_price_per_metre,
                              machine_price_per_drop: template.machine_price_per_drop,
                              hand_price_per_drop: template.hand_price_per_drop,
                              manufacturing_type: template.manufacturing_type,
                              waste_percent: template.waste_percent,
                              selected_heading_ids: template.selected_heading_ids || []
                            },
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
              <InventorySelectionPanel treatmentType={selectedTreatmentType} selectedItems={selectedItems} onItemSelect={handleItemSelect} onItemDeselect={handleItemDeselect} measurements={measurements} treatmentCategory={treatmentCategory} templateId={selectedTemplate?.id} parentProductId={selectedTemplate?.inventory_item_id} />
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
                    selectedFabricItem={selectedItems.fabric}
                    selectedLining={selectedLining} 
                    onLiningChange={setSelectedLining} 
                    selectedHeading={selectedHeading} 
                    onHeadingChange={setSelectedHeading} 
                    onFabricCalculationChange={setFabricCalculation} 
                    readOnly={readOnly} 
                    treatmentCategory={treatmentCategory}
                    selectedOptions={selectedOptions}
                    onSelectedOptionsChange={setSelectedOptions}
                    selectedMaterial={selectedItems.material}
                    engineResult={engineResult}
                  />
                </div>

                {/* Bottom Section - Configuration & Cost */}
                <div className="space-y-4">
                  {(() => {
                    // Early return for incomplete data - basic options only
                    if (!selectedTemplate || !fabricCalculation || treatmentCategory === 'wallpaper') {
                      const basicOptions = [
                        ...selectedOptions,
                        ...(selectedHeading && selectedHeading !== 'standard' && selectedHeading !== 'none' ? [{
                          name: `Heading: ${headingOptionsFromSettings.find((h: any) => h.id === selectedHeading)?.name || selectedHeading}`,
                          price: 0,
                          pricingMethod: 'fixed'
                        }] : [])
                      ];
                      
                      // ✅ FIX: When editing, show saved costs instead of recalculating
                      // This prevents €0.00 display while data loads
                      const savedBreakdown = existingWindowSummary?.cost_breakdown as any[] | undefined;
                      const savedTotal = existingWindowSummary?.total_cost;
                      
                      return (
                        <CostCalculationSummary
                          template={selectedTemplate} 
                          measurements={measurements} 
                          selectedFabric={selectedItems.fabric || selectedItems.material} 
                          selectedLining={selectedLining} 
                          selectedHeading={selectedHeading} 
                          inventory={[]} 
                          fabricCalculation={fabricCalculation}
                          selectedOptions={basicOptions}
                          engineResult={engineResult}
                          savedCostBreakdown={savedBreakdown}
                          savedTotalCost={savedTotal}
                          onBlindCostsCalculated={(costs) => setLiveBlindCalcResult(costs)}
                          onCurtainCostsCalculated={(costs) => setLiveCurtainCalcResult(costs)}
                        />
                      );
                    }

                    // ✅ SINGLE SOURCE OF TRUTH: Use engine result when available for curtains/romans
                    // This ensures all displays use identical values from the authoritative calculation
                    const isCurtainOrRoman = treatmentCategory === 'curtains' || treatmentCategory === 'roman_blinds';
                    
                    // Get horizontal pieces from engine or fabricCalculation
                    const horizontalPiecesNeeded = (engineResult?.formula_breakdown?.values?.['horizontal_pieces'] as number) 
                      || fabricCalculation?.horizontalPiecesNeeded 
                      || 1;
                    
                    // CRITICAL: Engine returns TOTAL linear meters (already includes all pieces for railroaded)
                    const engineTotalMeters = (isCurtainOrRoman && engineResult?.linear_meters != null) 
                      ? engineResult.linear_meters 
                      : null;
                    
                    // Old fabricCalculation returns per-width meters that need multiplication
                    const fabricCalcMeters = fabricCalculation?.linearMeters || 0;
                    
                    // Determine which source we're using
                    const usingEngine = engineTotalMeters != null;
                    
                    // Get price from fabric item or fabricCalculation - never calculate from total/meters
                    const selectedFabricItem = selectedItems.fabric || selectedItems.material;
                    const pricePerMeter = selectedFabricItem?.price_per_meter 
                      || selectedFabricItem?.selling_price 
                      || fabricCalculation?.pricePerMeter 
                      || 0;
                    
                    // ✅ FIX: Check if curtain fabric uses pricing grid
                    const curtainUsesPricingGrid = selectedFabricItem?.pricing_grid_data && 
                      (selectedFabricItem?.pricing_method === 'pricing_grid' || selectedFabricItem?.resolved_grid_name);
                    
                    // CRITICAL FIX: Check if using leftover fabric for horizontal seaming
                    const usesLeftover = measurements.uses_leftover_for_horizontal === true || 
                                        measurements.uses_leftover_for_horizontal === 'true';
                    
                    // Check if railroaded from engine
                    const isRailroaded = engineResult?.formula_breakdown?.values?.['is_railroaded'] === 'yes' 
                      || fabricCalculation?.fabricOrientation === 'horizontal';
                    
                    // Calculate per-piece and total meters for display
                    // CRITICAL: Engine returns TOTAL, display expects PER-PIECE × pieces = TOTAL
                    let perPieceMeters: number;
                    let totalMeters: number;
                    let fabricCost: number;
                    
                    // ✅ FIX: For curtains with pricing grid, use grid price (not per-meter calculation)
                    if (curtainUsesPricingGrid && usingEngine) {
                      // Grid pricing path - use engine's fabric_cost which includes grid lookup with markup
                      totalMeters = engineTotalMeters!;
                      perPieceMeters = isRailroaded && horizontalPiecesNeeded > 1 
                        ? engineTotalMeters! / horizontalPiecesNeeded 
                        : engineTotalMeters!;
                      
                      // Engine already calculated grid price with effective width
                      fabricCost = engineResult?.fabric_cost ?? 0;
                      
                      // Apply leftover discount if applicable
                      if (usesLeftover && horizontalPiecesNeeded > 1) {
                        // For grid pricing, we don't have per-meter, so just show full grid price
                        // Grid prices are typically for the complete treatment
                        totalMeters = perPieceMeters;
                      }
                      
                      console.log('📊 CURTAIN GRID PRICING PATH:', {
                        gridName: selectedFabricItem?.resolved_grid_name,
                        engineFabricCost: engineResult?.fabric_cost,
                        gridMarkup: selectedFabricItem?.pricing_grid_markup,
                        finalCost: fabricCost
                      });
                    } else if (usingEngine && engineTotalMeters != null) {
                      // ENGINE PATH (per-meter): linear_meters is TOTAL
                      totalMeters = engineTotalMeters;
                      
                      if (isRailroaded && horizontalPiecesNeeded > 1) {
                        // Railroaded: per-piece = total / pieces
                        perPieceMeters = engineTotalMeters / horizontalPiecesNeeded;
                      } else {
                        // Vertical or single piece: per-piece = total
                        perPieceMeters = engineTotalMeters;
                      }
                      
                      // Fabric cost: charge for total unless using leftover
                      if (usesLeftover && horizontalPiecesNeeded > 1) {
                        fabricCost = perPieceMeters * pricePerMeter; // Charge for 1 piece
                        totalMeters = perPieceMeters; // Only ordering 1 piece worth
                      } else {
                        fabricCost = totalMeters * pricePerMeter;
                      }
                    } else {
                      // LEGACY PATH: fabricCalculation.linearMeters is TOTAL (includes all pieces)
                      // fabricCalculation.linearMetersPerPiece is per-piece for horizontal fabric
                      
                      if (isRailroaded && horizontalPiecesNeeded > 1) {
                        // For railroaded: get per-piece value from hook, or calculate from total
                        perPieceMeters = fabricCalculation?.linearMetersPerPiece || (fabricCalcMeters / horizontalPiecesNeeded);
                        const piecesToCharge = usesLeftover ? 1 : horizontalPiecesNeeded;
                        totalMeters = perPieceMeters * piecesToCharge;
                      } else {
                        // For vertical: linearMeters is already correct total
                        perPieceMeters = fabricCalcMeters;
                        totalMeters = fabricCalcMeters;
                      }
                      fabricCost = totalMeters * pricePerMeter;
                    }
                    
                    // For backward compatibility, linearMeters = perPieceMeters
                    const linearMeters = perPieceMeters;
                    
                    // Debug: Log which source is being used
                    if (import.meta.env.DEV && isCurtainOrRoman) {
                      console.log('📊 [DynamicWorksheet] Linear Meters Source:', {
                        usingEngine,
                        engineValue: engineTotalMeters,
                        isRailroaded,
                        horizontalPiecesNeeded,
                        perPieceMeters,
                        totalMeters,
                        usesLeftover,
                        fabricCost,
                        pricePerMeter,
                      });
                    }

                    // ✅ LEGACY LINING REMOVED: Lining is now an OPTION with per-linear-meter pricing
                    // The old selectedLining/template.lining_types system is deprecated
                    // Lining cost is calculated in calculateOptionPrices() above
                    let liningCost = 0; // Lining is now part of optionsCost

                    // Get the selected pricing method
                    const selectedPricingMethod = measurements.selected_pricing_method 
                      ? selectedTemplate.pricing_methods?.find((m: any) => m.id === measurements.selected_pricing_method)
                      : selectedTemplate.pricing_methods?.[0];

                    // Calculate manufacturing/labor cost - CRITICAL: Must match save calculation
                    let manufacturingCost = 0;
                    const manufacturingType = measurements.manufacturing_type || 'machine';
                    const pricingType = selectedPricingMethod?.pricing_type || selectedTemplate.pricing_type || selectedTemplate.makeup_pricing_method || selectedTemplate.pricing_method || 'per_metre';
                    
                    // Track actual values used for display breakdown
                    let pricePerUnit = 0;
                    let manufacturingQuantity = 0;
                    let manufacturingQuantityLabel = '';
                    
                    if (pricingType === 'per_panel') {
                      pricePerUnit = manufacturingType === 'hand' 
                        ? (selectedPricingMethod?.hand_price_per_panel ?? selectedTemplate.hand_price_per_panel ?? 0)
                        : (selectedPricingMethod?.machine_price_per_panel ?? selectedTemplate.machine_price_per_panel ?? 0);
                      manufacturingQuantity = fabricCalculation.curtainCount || 1;
                      manufacturingQuantityLabel = manufacturingQuantity === 1 ? 'panel' : 'panels';
                      manufacturingCost = pricePerUnit * manufacturingQuantity;
                    } else if (pricingType === 'per_drop') {
                      pricePerUnit = manufacturingType === 'hand'
                        ? (selectedPricingMethod?.hand_price_per_drop ?? selectedTemplate.hand_price_per_drop ?? 0)
                        : (selectedPricingMethod?.machine_price_per_drop ?? selectedTemplate.machine_price_per_drop ?? 0);
                      manufacturingQuantity = fabricCalculation.widthsRequired || 1;
                      manufacturingQuantityLabel = manufacturingQuantity === 1 ? 'drop' : 'drops';
                      manufacturingCost = pricePerUnit * manufacturingQuantity;
                    } else if (pricingType === 'per_metre') {
                      // ✅ CRITICAL FIX: Use SAME linearMeters as fabric calculation for consistency
                      // This ensures manufacturing cost matches fabric cost display
                      // ✅ FIX: Check heading-specific price overrides first
                      pricePerUnit = getManufacturingPrice(
                        manufacturingType === 'hand',
                        measurements.selected_heading,
                        selectedTemplate.heading_prices,
                        {
                          machine_price_per_metre: selectedPricingMethod?.machine_price_per_metre,
                          hand_price_per_metre: selectedPricingMethod?.hand_price_per_metre,
                        },
                        {
                          machine_price_per_metre: selectedTemplate.machine_price_per_metre,
                          hand_price_per_metre: selectedTemplate.hand_price_per_metre,
                        }
                      );
                      
                      // ✅ UNIFIED SOURCE: Use totalMeters (same as fabric cost display)
                      // This ensures manufacturing cost matches fabric cost display exactly
                      const unitIsMetric = units?.length === 'mm' || units?.length === 'cm' || units?.length === 'm';
                      manufacturingQuantity = totalMeters; // ✅ Use totalMeters directly - consistent with fabric cost
                      manufacturingQuantityLabel = unitIsMetric ? 'm' : 'yd';
                      manufacturingCost = pricePerUnit * manufacturingQuantity;
                    } else {
                      // ✅ FIX: Check heading-specific price overrides first (fallback case)
                      pricePerUnit = getManufacturingPrice(
                        manufacturingType === 'hand',
                        measurements.selected_heading,
                        selectedTemplate.heading_prices,
                        {
                          machine_price_per_metre: selectedPricingMethod?.machine_price_per_metre,
                          hand_price_per_metre: selectedPricingMethod?.hand_price_per_metre,
                        },
                        {
                          machine_price_per_metre: selectedTemplate.machine_price_per_metre,
                          hand_price_per_metre: selectedTemplate.hand_price_per_metre,
                        }
                      );
                      manufacturingQuantity = totalMeters; // ✅ Use totalMeters - consistent with fabric cost
                      const fallbackUnitIsMetric = units?.length === 'mm' || units?.length === 'cm' || units?.length === 'm';
                      manufacturingQuantityLabel = fallbackUnitIsMetric ? 'm' : 'yd';
                      manufacturingCost = pricePerUnit * manufacturingQuantity;
                    }

                    if (pricingType === 'height_range' && selectedPricingMethod?.height_price_ranges) {
                      const height = parseFloat(measurements.drop || '0');
                      const range = selectedPricingMethod.height_price_ranges.find((r: any) => 
                        height >= r.min_height && height <= r.max_height
                      );
                      if (range) {
                        pricePerUnit = manufacturingType === 'hand' ? range.hand_price : range.machine_price;
                        manufacturingQuantity = fabricCalculation.curtainCount || fabricCalculation.widthsRequired || 1;
                        manufacturingQuantityLabel = manufacturingQuantity === 1 ? 'unit' : 'units';
                        manufacturingCost = pricePerUnit * manufacturingQuantity;
                      }
                    }
                    
                    // 🔍 DEBUG: Manufacturing cost calculation trace
                    console.log('🏭 Manufacturing Cost Debug:', {
                      templateName: selectedTemplate?.name,
                      pricingType,
                      manufacturingType,
                      pricePerUnit,
                      manufacturingQuantity,
                      manufacturingCost,
                      sources: {
                        engineLinearMeters: engineResult?.linear_meters,
                        fabricCalcLinearMeters: fabricCalculation?.linearMeters,
                        widthsRequired: fabricCalculation?.widthsRequired,
                        curtainCount: fabricCalculation?.curtainCount
                      },
                      templatePrices: {
                        machine_price_per_metre: selectedTemplate?.machine_price_per_metre,
                        machine_price_per_drop: selectedTemplate?.machine_price_per_drop,
                        machine_price_per_panel: selectedTemplate?.machine_price_per_panel,
                        hand_price_per_metre: selectedTemplate?.hand_price_per_metre
                      },
                      selectedPricingMethod
                    });
                    
                    // Store manufacturing details for display breakdown
                    const manufacturingDetails = {
                      pricingType,
                      pricePerUnit,
                      quantity: manufacturingQuantity,
                      quantityLabel: manufacturingQuantityLabel,
                      manufacturingType: manufacturingType as 'hand' | 'machine'
                    };

                    // Calculate heading cost - CRITICAL: Must match save calculation
                    let headingCost = 0;
                    if (selectedHeading && selectedHeading !== 'none' && selectedHeading !== 'standard') {
                      // Start with template upcharges
                      const headingUpchargePerCurtain = selectedTemplate.heading_upcharge_per_curtain || 0;
                      const headingUpchargePerMetre = selectedTemplate.heading_upcharge_per_metre || 0;
                      // ✅ Use totalMeters - consistent with fabric cost calculation
                      headingCost = headingUpchargePerCurtain + headingUpchargePerMetre * totalMeters;
                      
                      // Add heading inventory/settings price - match save calculation exactly
                      // ✅ CRITICAL FIX: Use totalMeters (fullness-adjusted width) NOT raw rail_width
                      // Heading tape is applied to the finished curtain width which includes fullness
                      const heading = headingOptionsFromSettings.find(h => h.id === selectedHeading || h.name === selectedHeading);
                      if (heading) {
                        const headingPricePerMeter = (heading as any).price || 0;
                        const additionalCost = headingPricePerMeter * totalMeters;
                        headingCost += additionalCost;
                        console.log("🎯 Display heading cost:", additionalCost, "= price:", headingPricePerMeter, "× totalMeters:", totalMeters);
                      }
                    }

                    // Calculate options cost - CRITICAL: Use pricing method calculations!
                    // Hardware uses actual rail width, fabric options use fullness-adjusted linear meters
                    // ✅ FIX: Pass totalMeters explicitly so per-linear-meter options (like Lining) calculate correctly
                    const enrichedOptions = calculateOptionPrices(selectedOptions, measurements, { 
                      ...fabricCalculation, 
                      linearMeters: totalMeters  // ✅ Use correct linear meters (fullness-adjusted)
                    });
                    const optionsCost = enrichedOptions.reduce((sum, opt) => sum + getOptionEffectivePrice(opt), 0);

                    // ✅ BUILD allDisplayOptions AFTER enrichedOptions calculated
                    // Use LOCAL calculated values, NOT stale state!
                    const allDisplayOptions = [
                      // Dynamic options with CALCULATED prices from enrichedOptions
                      // ✅ FIX: Preserve calculatedPrice so CostCalculationSummary can use it directly
                      ...enrichedOptions.map(opt => ({
                        ...opt,
                        calculatedPrice: getOptionEffectivePrice(opt), // Preserve for display component
                      })),
                      // Add heading if selected and not default
                      ...(selectedHeading && selectedHeading !== 'standard' && selectedHeading !== 'none' ? [{
                        name: `Heading: ${headingOptionsFromSettings.find((h: any) => h.id === selectedHeading)?.name || selectedHeading}`,
                        price: headingCost, // LOCAL variable, not stale state
                        pricingMethod: 'fixed'
                      }] : []),
                      // NOTE: Manufacturing is NOT included in allDisplayOptions - it's displayed separately
                      // via calculatedManufacturingCost prop to avoid duplication in totals
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

                    const totalCost = fabricCost + liningCost + manufacturingCost + headingCost + optionsCost;

                    // ✅ SAVE TO STATE: Single source of truth for all displays
                    // Use engine values when available
                    const isCurtainOrRomanForCosts = treatmentCategory === 'curtains' || treatmentCategory === 'roman_blinds';
                    
                    // Calculate pieces to display (actual pieces, not piecesCharged which is for costing)
                    // For railroaded: use horizontal pieces needed
                    // For vertical: use widths required (number of fabric widths to cover the total curtain width)
                    const widthsReqForVertical = engineResult?.widths_required ?? fabricCalculation?.widthsRequired ?? 1;
                    const piecesToDisplay = isRailroaded ? horizontalPiecesNeeded : widthsReqForVertical;
                    
                    const newCalculatedCosts = {
                      // linearMeters is now per-piece, totalMeters is the total to order
                      fabricLinearMeters: perPieceMeters,
                      fabricTotalMeters: totalMeters,
                      fabricCostPerMeter: pricePerMeter,
                      fabricTotalCost: fabricCost,
                      liningCost,
                      manufacturingCost,
                      headingCost,
                      optionsCost: (isCurtainOrRomanForCosts && engineResult) 
                        ? engineResult.options_cost 
                        : optionsCost,
                      totalCost: fabricCost + liningCost + manufacturingCost + headingCost + 
                        ((isCurtainOrRomanForCosts && engineResult) ? engineResult.options_cost : optionsCost),
                      horizontalPiecesNeeded: piecesToDisplay,
                      fabricOrientation: (isRailroaded ? 'horizontal' : 'vertical') as 'horizontal' | 'vertical',
                      seamsRequired: (isCurtainOrRomanForCosts && engineResult?.formula_breakdown?.values?.seams_count != null)
                        ? Number(engineResult.formula_breakdown.values.seams_count)
                        : (fabricCalculation.seamsRequired || 0),
                      widthsRequired: (isCurtainOrRomanForCosts && engineResult?.widths_required != null)
                        ? engineResult.widths_required
                        : (fabricCalculation.widthsRequired || 0),
                      manufacturingDetails,
                      usesLeftover
                    };
                    
                    // Only update if values changed to prevent infinite loops
                    if (JSON.stringify(calculatedCosts) !== JSON.stringify(newCalculatedCosts)) {
                      setCalculatedCosts(newCalculatedCosts);
                    }

                    // ✅ FIX: When editing and engine/fabric not loaded yet, show saved costs
                    // This prevents €0.00 display while data is still loading
                    const savedBreakdown = existingWindowSummary?.cost_breakdown as any[] | undefined;
                    const savedTotal = existingWindowSummary?.total_cost;
                    const shouldUseSavedCosts = savedBreakdown && savedTotal && savedTotal > 0 && totalCost === 0;
                    
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
                        calculatedFabricCost={(() => {
                          // ✅ CRITICAL: Ensure fabric cost matches display data for consistency
                          const displayFabricCost = totalMeters * pricePerMeter;
                          if (Math.abs(displayFabricCost - fabricCost) > 0.01 && !curtainUsesPricingGrid) {
                            console.warn('⚠️ Fabric cost mismatch - using display-calculated value', { fabricCost, displayFabricCost, totalMeters, pricePerMeter });
                            return displayFabricCost;
                          }
                          return fabricCost;
                        })()}
                        calculatedLiningCost={liningCost}
                        calculatedManufacturingCost={manufacturingCost}
                        calculatedHeadingCost={headingCost}
                        calculatedOptionsCost={optionsCost}
                        calculatedTotalCost={totalCost}
                        fabricDisplayData={{
                          linearMeters: perPieceMeters,
                          totalMeters: totalMeters,
                          pricePerMeter: pricePerMeter,
                          horizontalPieces: piecesToDisplay,
                          orientation: isRailroaded ? 'horizontal' : 'vertical',
                          usesLeftover,
                          usesPricingGrid: curtainUsesPricingGrid,
                          gridPrice: curtainUsesPricingGrid ? fabricCost : undefined,
                          gridName: curtainUsesPricingGrid ? selectedFabricItem?.resolved_grid_name : undefined
                        }}
                        manufacturingDetails={manufacturingDetails}
                        engineResult={engineResult}
                        savedCostBreakdown={shouldUseSavedCosts ? savedBreakdown : undefined}
                        savedTotalCost={shouldUseSavedCosts ? savedTotal : undefined}
                        onBlindCostsCalculated={(costs) => setLiveBlindCalcResult(costs)}
                        onCurtainCostsCalculated={(costs) => setLiveCurtainCalcResult(costs)}
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