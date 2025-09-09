import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from "react";
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
import { useCreateTreatment, useUpdateTreatment } from "@/hooks/useTreatments";
import { VisualMeasurementSheet } from "./VisualMeasurementSheet";
import { TreatmentSpecificFields } from "./TreatmentSpecificFields";
import { TreatmentVisualizer } from "./TreatmentVisualizer";
import { HeadingOptionsSection } from "./dynamic-options/HeadingOptionsSection";
import { LiningOptionsSection } from "./dynamic-options/LiningOptionsSection";
import { FabricSelectionSection } from "./dynamic-options/FabricSelectionSection";
import { FixedWindowCoveringSelector } from "./FixedWindowCoveringSelector";
import { CostCalculationSummary } from "./dynamic-options/CostCalculationSummary";
import { useSaveWindowSummary, useWindowSummary } from "@/hooks/useWindowSummary";
import { calculateTreatmentPricing } from "@/utils/pricing/calculateTreatmentPricing";
import { useTreatments } from "@/hooks/useTreatments";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  // Debug readOnly state
  console.log("🔍 EnhancedMeasurementWorksheet readOnly state:", readOnly);
  console.log("🔍 Props received:", { clientId, projectId, surfaceId, readOnly });
  // Create state keys that include surfaceId to isolate state per window
  const stateKey = surfaceId || 'default';
  
  // Load exact saved treatment data if editing an existing treatment
  const { data: savedSummary } = useWindowSummary(
    existingMeasurement?.use_saved_summary ? surfaceId : undefined
  );
  
  // Add defensive programming to prevent null reference errors
  const safeExistingMeasurement = existingMeasurement || {};
  const safeExistingTreatments = existingTreatments || [];
  const safeSurfaceData = surfaceData || {};
  
  // Determine if we should use saved summary data
  const shouldUseSavedData = safeExistingMeasurement?.use_saved_summary && savedSummary;
  
  console.log(`🔍 EnhancedMeasurementWorksheet for ${surfaceId}:`, {
    shouldUseSavedData,
    hasSavedSummary: !!savedSummary,
    useSavedSummaryFlag: safeExistingMeasurement?.use_saved_summary,
    clientId,
    projectId,
    existingMeasurement: safeExistingMeasurement,
    existingTreatments: safeExistingTreatments,
    surfaceData: safeSurfaceData
  });
  
  console.log("🚀 WORKSHEET OPENING: Component mounted successfully");
  const [windowType, setWindowType] = useState(() => 
    safeExistingMeasurement?.measurement_type || "standard"
  );
  const [selectedRoom, setSelectedRoom] = useState(() => 
    safeExistingMeasurement?.room_id || safeSurfaceData?.room_id || currentRoomId || "no_room"
  );
  const [selectedWindowCovering, setSelectedWindowCovering] = useState(() => {
    const initialValue = safeExistingMeasurement?.window_covering_id || "no_covering";
    console.log("🔍 INITIAL selectedWindowCovering value:", initialValue, "type:", typeof initialValue);
    // Ensure we always return a string, never an object
    return typeof initialValue === 'string' ? initialValue : "no_covering";
  });
  
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [measurements, setMeasurements] = useState(() => {
    let initialMeasurements: any = {};
    
    console.log("🔍 INITIAL SETUP: Loading measurements with priority system");
    console.log("- shouldUseSavedData:", shouldUseSavedData);
    console.log("- savedSummary:", !!savedSummary);
    console.log("- existingMeasurement:", !!safeExistingMeasurement?.measurements);
    console.log("- existingTreatments:", safeExistingTreatments.length);
    
    // Priority 1: Use saved summary measurement details if available
    if (shouldUseSavedData && savedSummary?.measurements_details) {
      console.log("📊 PRIORITY 1: Loading from saved summary");
      initialMeasurements = {
        rail_width: savedSummary.measurements_details.rail_width_cm || savedSummary.measurements_details.rail_width || "",
        drop: savedSummary.measurements_details.drop_cm || savedSummary.measurements_details.drop || "",
        window_width: savedSummary.measurements_details.window_width || "",
        window_height: savedSummary.measurements_details.window_height || "",
        pooling_amount: savedSummary.measurements_details.pooling_amount_cm || "",
        selected_fabric: savedSummary.fabric_details?.fabric_id || savedSummary.measurements_details.selected_fabric,
        fabric_width: savedSummary.fabric_details?.fabric_width || savedSummary.fabric_details?.width_cm || 140,
        price_per_meter: savedSummary.price_per_meter || 0,
        surface_id: surfaceId,
        surface_name: surfaceData?.name,
        curtain_type: savedSummary.measurements_details.curtain_type || savedSummary.template_details?.curtain_type,
        ...savedSummary.measurements_details
      };
    }
    // Priority 2: Use existing measurement data
    else if (safeExistingMeasurement?.measurements) {
      console.log("📊 PRIORITY 2: Loading from existing measurement");
      initialMeasurements = { 
        ...safeExistingMeasurement.measurements,
        rail_width: safeExistingMeasurement.measurements.rail_width || safeExistingMeasurement.measurements.measurement_a || "",
        drop: safeExistingMeasurement.measurements.drop || safeExistingMeasurement.measurements.measurement_b || ""
      };
    }
    
    // Priority 3: Merge any existing treatment measurements
    if (safeExistingTreatments?.[0]?.measurements) {
      console.log("📊 PRIORITY 3: Merging treatment measurements");
      try {
        const treatmentMeasurements = typeof safeExistingTreatments[0].measurements === 'string' 
          ? JSON.parse(safeExistingTreatments[0].measurements)
          : safeExistingTreatments[0].measurements;
        
        initialMeasurements = {
          ...initialMeasurements,
          ...treatmentMeasurements,
          // Ensure key fields are preserved
          rail_width: treatmentMeasurements.rail_width || initialMeasurements.rail_width || "",
          drop: treatmentMeasurements.drop || initialMeasurements.drop || ""
        };
      } catch (e) {
        console.warn("Failed to parse treatment measurements:", e);
      }
    }
    
    console.log("✅ FINAL MEASUREMENTS LOADED:", {
      rail_width: initialMeasurements.rail_width,
      drop: initialMeasurements.drop,
      total_keys: Object.keys(initialMeasurements).length,
      allKeys: Object.keys(initialMeasurements)
    });
    return initialMeasurements;
  });
  const [treatmentData, setTreatmentData] = useState<any>(() => 
    safeExistingTreatments?.[0] ? { ...safeExistingTreatments[0] } : {}
  );
  const [notes, setNotes] = useState(() => 
    safeExistingMeasurement?.notes || ""
  );
  const [measuredBy, setMeasuredBy] = useState(() => 
    safeExistingMeasurement?.measured_by || ""
  );
  const [photos, setPhotos] = useState<string[]>(() => 
    safeExistingMeasurement?.photos || []
  );
  const [activeTab, setActiveTab] = useState("measurements");
  const [calculatedCost, setCalculatedCost] = useState(0);
  const [fabricCalculation, setFabricCalculation] = useState(null);
  
  // Dynamic options state - isolated per window
  const [selectedHeading, setSelectedHeading] = useState(() => 
    safeExistingTreatments?.[0]?.selected_heading || "standard"
  );
  const [selectedLining, setSelectedLining] = useState(() => 
    safeExistingTreatments?.[0]?.selected_lining || "none"
  );
  const [selectedFabric, setSelectedFabric] = useState(() => 
    safeExistingTreatments?.[0]?.fabric_details?.fabric_id || 
    safeExistingMeasurement?.measurements?.selected_fabric || 
    ""
  );

  // Get treatments data early so it can be used in the effect
  const { data: allProjectTreatments = [] } = useTreatments(projectId);

  // Centralized data loading effect - SINGLE SOURCE OF TRUTH
  useEffect(() => {
    if (!surfaceId) return;
    
    console.log("🔄 LOADING: Loading data for surface:", surfaceId);
    
    // Create data loading priority system
    let measurements = {};
    let windowCoveringId = "no_covering";
    let fabricId = "";
    let headingValue = "standard";
    let liningValue = "none";
    let treatmentTypeValue = "";
    
    // Load from saved treatment first (highest priority)
    const savedTreatment = allProjectTreatments.find(t => t.window_id === surfaceId);
    if (savedTreatment) {
      console.log("📦 Found saved treatment for surface:", surfaceId, savedTreatment);
      
      // Parse fabric details and treatment details
      try {
        const fabricDetails = savedTreatment.fabric_details ? 
          (typeof savedTreatment.fabric_details === 'string' ? 
           JSON.parse(savedTreatment.fabric_details) : savedTreatment.fabric_details) : {};
        
        const treatmentDetails = savedTreatment.treatment_details ? 
          (typeof savedTreatment.treatment_details === 'string' ? 
           JSON.parse(savedTreatment.treatment_details) : savedTreatment.treatment_details) : {};

        const treatmentMeasurements = savedTreatment.measurements ? 
          (typeof savedTreatment.measurements === 'string' ? 
           JSON.parse(savedTreatment.measurements) : savedTreatment.measurements) : {};
        
        // Priority order for fabric ID: fabric_details.fabric_id > treatment_details.selected_fabric > measurements.fabric_id
        fabricId = fabricDetails.fabric_id || 
                   treatmentDetails.selected_fabric || 
                   treatmentMeasurements.fabric_id || 
                   treatmentMeasurements.selected_fabric || "";
        
        // Priority order for heading: treatment_details > fabric_details > measurements
        headingValue = treatmentDetails.selected_heading || 
                       fabricDetails.selected_heading || 
                       treatmentMeasurements.selected_heading || 
                       treatmentMeasurements.heading_type || "standard";
        
        // Priority order for lining: treatment_details > fabric_details > measurements  
        liningValue = treatmentDetails.selected_lining || 
                      fabricDetails.selected_lining || 
                      treatmentMeasurements.selected_lining || 
                      treatmentMeasurements.lining_type || "none";
        
        windowCoveringId = treatmentDetails.window_covering?.id || savedTreatment.treatment_type || "no_covering";
        treatmentTypeValue = savedTreatment.treatment_type || "";
        
        console.log("📦 Loaded from saved treatment:", {
          fabricId, headingValue, liningValue, windowCoveringId, treatmentTypeValue,
          sources: {
            fabricDetails: Object.keys(fabricDetails),
            treatmentDetails: Object.keys(treatmentDetails),
            measurements: Object.keys(treatmentMeasurements)
          }
        });
      } catch (e) {
        console.warn("Failed to parse saved treatment data:", e);
      }
    }
    
    // Load from measurements if no treatment data found
    if (!savedTreatment && safeExistingMeasurement) {
      const measurementData = safeExistingMeasurement.measurements || {};
      fabricId = measurementData.selected_fabric || "";
      headingValue = measurementData.selected_heading || "standard";
      liningValue = measurementData.selected_lining || "none";
      windowCoveringId = measurementData.window_covering_id || "no_covering";
      
      console.log("📋 Loaded from measurements:", {
        fabricId, headingValue, liningValue, windowCoveringId
      });
    }
    
    // Priority 1: Existing saved summary (only if no saved treatment exists)
    if (shouldUseSavedData && savedSummary?.measurements_details && !savedTreatment) {
      console.log("✅ PRIORITY 1: Loading from saved summary (no treatment found)");
      measurements = {
        ...savedSummary.measurements_details,
        rail_width: savedSummary.measurements_details.rail_width_cm || savedSummary.measurements_details.rail_width || 0,
        drop: savedSummary.measurements_details.drop_cm || savedSummary.measurements_details.drop || 0,
        surface_id: surfaceId,
        surface_name: surfaceData?.name
      };
      windowCoveringId = savedSummary.template_id || "no_covering";
      // Only use saved summary fabric/lining if no treatment data exists
      if (!fabricId) fabricId = savedSummary.fabric_details?.fabric_id || "";
      if (headingValue === "standard") headingValue = savedSummary.heading_details?.heading_name || savedSummary.heading_details?.id || "standard";
      if (liningValue === "none") liningValue = savedSummary.lining_type || "none";
      treatmentTypeValue = savedSummary.template_details?.curtain_type || "";
    } else if (shouldUseSavedData && savedSummary?.measurements_details && savedTreatment) {
      console.log("✅ PRIORITY 1: Loading measurements from saved summary but keeping treatment fabric/lining");
      // Use measurements from summary but preserve treatment fabric/lining selections
      measurements = {
        ...savedSummary.measurements_details,
        rail_width: savedSummary.measurements_details.rail_width_cm || savedSummary.measurements_details.rail_width || 0,
        drop: savedSummary.measurements_details.drop_cm || savedSummary.measurements_details.drop || 0,
        surface_id: surfaceId,
        surface_name: surfaceData?.name
      };
      windowCoveringId = savedSummary.template_id || "no_covering";
      // Keep the treatment fabric/lining data that was loaded earlier
    }
    
    // Priority 2: Existing treatments
    const existingTreatment = existingTreatments?.[0];
    if (existingTreatment && (!shouldUseSavedData || !savedSummary)) {
      console.log("✅ PRIORITY 2: Loading from existing treatment");
      try {
        const treatmentMeasurements = typeof existingTreatment.measurements === 'string' 
          ? JSON.parse(existingTreatment.measurements) : existingTreatment.measurements;
        measurements = { ...measurements, ...treatmentMeasurements };
        
        const treatmentDetails = typeof existingTreatment.treatment_details === 'string'
          ? JSON.parse(existingTreatment.treatment_details) : existingTreatment.treatment_details;
        
        windowCoveringId = treatmentDetails?.window_covering?.id || existingTreatment.treatment_type || windowCoveringId;
        fabricId = treatmentDetails?.selected_fabric || existingTreatment.fabric_details?.fabric_id || fabricId;
        headingValue = treatmentDetails?.selected_heading || existingTreatment.selected_heading || headingValue;
        liningValue = treatmentDetails?.selected_lining || existingTreatment.selected_lining || liningValue;
        treatmentTypeValue = existingTreatment.treatment_type || treatmentTypeValue;
      } catch (e) {
        console.warn("Failed to parse treatment data:", e);
      }
    }
    
    // Priority 3: Basic measurements - BUT PRESERVE USER SELECTIONS
    if (existingMeasurement?.measurements && Object.keys(measurements).length === 0) {
      console.log("✅ PRIORITY 3: Loading from basic measurements");
      measurements = { ...existingMeasurement.measurements };
      // Don't override user selections with "no_covering" - preserve current state
      const currentSelection = selectedWindowCovering || "";
      if (currentSelection && currentSelection !== "no_covering") {
        console.log("🔄 PRESERVING user selection:", currentSelection);
        windowCoveringId = currentSelection;
      } else {
        windowCoveringId = existingMeasurement.window_covering_id || windowCoveringId;
      }
    }
    
    // Apply all loaded data with explicit logging
    console.log("🎯 APPLYING: Final data before setting state:", {
      measurements,
      windowCoveringId,
      fabricId,
      headingValue,
      liningValue,
      treatmentTypeValue
    });
    
    setMeasurements(measurements);
    
    // Enhanced user interaction protection
    const isCurrentlyUserInteracting = isUserInteractingRef.current;
    const hasUserSelection = selectedWindowCovering && selectedWindowCovering !== "no_covering";
    
    // Only update window covering if:
    // 1. User is not currently interacting
    // 2. User doesn't have an existing selection OR we have saved data that should override
    if (!isCurrentlyUserInteracting && (!hasUserSelection || savedTreatment || savedSummary)) {
      setSelectedWindowCovering(windowCoveringId);
      console.log("🔄 DATA LOAD: Set selectedWindowCovering to:", windowCoveringId);
    } else {
      console.log("🚫 DATA LOAD: Preserved user selection:", selectedWindowCovering, "Reasons:", {
        userInteracting: isCurrentlyUserInteracting,
        hasUserSelection,
        hasSavedTreatment: !!savedTreatment,
        hasSavedSummary: !!savedSummary
      });
    }
    
    // Set fabric and lining with explicit logging
    console.log("🎯 Setting selectedFabric to:", fabricId);
    setSelectedFabric(fabricId);
    
    console.log("🎯 Setting selectedHeading to:", headingValue);  
    setSelectedHeading(headingValue);
    
    console.log("🎯 Setting selectedLining to:", liningValue);
    setSelectedLining(liningValue);
    
    // Set other form fields
    setWindowType(existingMeasurement?.measurement_type || "standard");
    setSelectedRoom(existingMeasurement?.room_id || surfaceData?.room_id || currentRoomId || "no_room");
    setNotes(existingMeasurement?.notes || "");
    setMeasuredBy(existingMeasurement?.measured_by || "");
    setPhotos(existingMeasurement?.photos || []);
    
    // Update treatment data
    setTreatmentData({
      treatment_type: treatmentTypeValue,
      measurements: measurements,
      fabric_details: existingTreatment?.fabric_details || {},
      treatment_details: existingTreatment?.treatment_details || {}
    });
    
    console.log("✅ LOADING: Complete data load finished for surface:", surfaceId);
    
    // Add a small delay to ensure UI updates
    setTimeout(() => {
      console.log("🔍 VERIFICATION: Current state after load:", {
        selectedFabric,
        selectedLining,
        selectedHeading,
        selectedWindowCovering
      });
    }, 100);
  }, [surfaceId, shouldUseSavedData, savedSummary, existingMeasurement, existingTreatments, currentRoomId, surfaceData]);
  
  // Separate effect for allProjectTreatments to prevent state override during user interactions
  const isUserInteractingRef = useRef(false);
  
  useEffect(() => {
    // Don't reload data if user is actively making selections
    if (isUserInteractingRef.current) {
      console.log("🚫 CRITICAL: Skipping data reload - user is interacting");
      return;
    }
    
    // Only reload if we have new treatment data and it's not from user interaction
    if (allProjectTreatments?.length) {
      console.log("📊 CRITICAL: Processing treatment updates from server - this might override user selection!");
      console.log("📊 Current selectedWindowCovering before potential override:", selectedWindowCovering);
    }
  }, [allProjectTreatments]);
  
  // Add effect to monitor selectedWindowCovering changes
  useEffect(() => {
    console.log("🔍 MONITOR: selectedWindowCovering changed to:", selectedWindowCovering);
  }, [selectedWindowCovering]);

  const createMeasurement = useCreateClientMeasurement();
  const updateMeasurement = useUpdateClientMeasurement();
  const queryClient = useQueryClient();
  const { data: rooms = [] } = useRooms(projectId);
  const { data: curtainTemplates = [] } = useCurtainTemplates();
  const { data: inventoryItems = [] } = useInventory();
  const { data: windowCoverings = [] } = useWindowCoverings();
  const { units } = useMeasurementUnits();
  const saveWindowSummary = useSaveWindowSummary();
  const createTreatment = useCreateTreatment();
  const updateTreatment = useUpdateTreatment();

  // Now log rooms data after it's declared
  console.log("🏠 Project ID:", projectId, "Rooms count:", rooms?.length || 0, "ReadOnly:", readOnly);

  // Remove duplicate loading effect - handled by main effect above

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
    
    console.log(`📏 Measurement change: ${field} = ${value}`);
    
    setMeasurements(prev => {
      const newMeasurements = { ...prev };
      
      if (stringFields.includes(field)) {
        newMeasurements[field] = value;
      } else {
        // Allow empty strings and partial numbers while typing
        if (value === "" || value === null || value === undefined) {
          newMeasurements[field] = "";
        } else {
          // Store the raw value to allow partial numbers (e.g., "12.", "0.5")
          newMeasurements[field] = String(value);
        }
      }
      
      console.log("Updated measurements:", newMeasurements);
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
    const measurementsData = measurements as any;
    const width = measurementsData.measurement_a || measurementsData.rail_width || (units.length === 'cm' ? 150 : 60);
    const height = measurementsData.measurement_b || measurementsData.drop || (units.length === 'cm' ? 120 : 48);
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

    // Create/update treatment in database - require projectId and surfaceId
    if (projectId && surfaceId) {
      try {
        // Validate required data before save
        if (!surfaceId) {
          throw new Error("Missing window/surface ID for treatment");
        }
        
        const treatmentPayload = {
          project_id: projectId,
          room_id: (selectedRoom && selectedRoom !== "no_room") ? selectedRoom : surfaceData?.room_id || null,
          window_id: surfaceId, // CRITICAL: This must link to the surface/window
          treatment_type: selectedCovering.name.toLowerCase(),
          product_name: selectedCovering.name,
          measurements: JSON.stringify({
            ...measurements,
            ...treatmentData.measurements
          }),
          fabric_details: JSON.stringify({
            fabric_id: fabricItem?.id || null,
            name: fabricItem?.name || 'No fabric selected',
            price_per_meter: pricePerMeter,
            selected_heading: selectedHeading,
            selected_lining: selectedLining,
            fabric_item: fabricItem,
            ...treatmentData.fabric_details
          }),
          treatment_details: JSON.stringify({
            ...treatmentData,
            selected_fabric: fabricItem?.id || null,
            selected_heading: selectedHeading,
            selected_lining: selectedLining,
            window_covering: selectedCovering
          }),
          calculation_details: JSON.stringify(calculation_details),
          material_cost: fabricCost + liningCost,
          labor_cost: manufacturingCost,
          total_price: totalCost,
          unit_price: totalCost,
          quantity: 1,
          status: "planned",
          notes: treatmentData.notes || ""
        };

        console.log("Creating/updating treatment with payload:", treatmentPayload);
        
        // Find existing treatment for this specific window/surface
        const existingTreatment = allProjectTreatments.find(t => 
          t.window_id === surfaceId
        );
        
        let savedTreatment;
        if (existingTreatment) {
          console.log("Updating existing treatment:", existingTreatment.id);
          
          // Delete any duplicate treatments for this window first
          const duplicateTreatments = allProjectTreatments.filter(t => 
            t.window_id === surfaceId && t.id !== existingTreatment.id
          );
          
          for (const duplicate of duplicateTreatments) {
            console.log("Deleting duplicate treatment:", duplicate.id);
            try {
              await supabase.from("treatments").delete().eq("id", duplicate.id);
            } catch (error) {
              console.warn("Failed to delete duplicate treatment:", error);
            }
          }
          
          savedTreatment = await updateTreatment.mutateAsync({
            id: existingTreatment.id,
            ...treatmentPayload,
            window_id: surfaceId // Ensure window_id is preserved
          });
          console.log("Treatment updated successfully:", savedTreatment);
        } else {
          console.log("🆕 SAVE: Creating new treatment for window_id:", surfaceId);
          savedTreatment = await createTreatment.mutateAsync({
            ...treatmentPayload,
            window_id: surfaceId // Ensure window_id is set for new treatments
          });
          console.log("Treatment created successfully:", savedTreatment);
        }
        
        // Force refresh treatments data to ensure worksheet picks up saved values
        queryClient.invalidateQueries({ queryKey: ["treatments", projectId] });
        await queryClient.refetchQueries({ queryKey: ["treatments", projectId] });
        
        console.log("Treatment saved successfully to database");
      } catch (error) {
        console.error("Error saving treatment to database:", error);
        throw error; // Re-throw to be caught by save button handler
      }
      
      // Also call the callback if provided
      onSaveTreatment?.(treatmentConfigData);
    } else {
      console.warn("Cannot save treatment - missing required data:", {
        projectId: !!projectId,
        surfaceId: !!surfaceId
      });
      throw new Error("Missing project ID or surface ID for treatment save");
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
      // Enhanced measurement data with cross-mode compatibility
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
          lining_type: selectedLining,
          selected_fabric: selectedFabric,
          selected_heading: selectedHeading,
          selected_lining: selectedLining
        },
        notes,
        measured_by: measuredBy,
        measured_at: new Date().toISOString(),
        photos,
        // Cross-mode compatibility fields for Dynamic mode
        window_type: windowType,
        template: windowCoverings.find(w => w.id === selectedWindowCovering),
        treatment_type: selectedWindowCovering !== "no_covering" ? "curtains" : "",
        selected_items: {
          fabric: selectedFabric ? inventoryItems.find(item => item.id === selectedFabric) : null,
          hardware: null,
          material: null
        },
        selected_heading: selectedHeading,
        selected_lining: selectedLining
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
      
      console.log("Enhanced auto-save completed with cross-mode data");
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [readOnly, clientId, projectId, selectedRoom, selectedWindowCovering, windowType, measurements, notes, measuredBy, photos, selectedFabric, selectedHeading, selectedLining, inventoryItems, existingMeasurement, updateMeasurement, createMeasurement, windowCoverings]);

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
            {/* Window type and room dropdowns removed as requested */}

            {/* Window Covering Selector */}
            <div>
              <Label htmlFor="windowCovering">Window Covering</Label>
              <FixedWindowCoveringSelector
                selectedCoveringId={selectedWindowCovering !== "no_covering" ? selectedWindowCovering : undefined}
                onCoveringSelect={(covering) => {
                  const newCoveringId = covering?.id || "no_covering";
                  console.log("🎯 USER SELECT: WindowCovering selected:", covering?.name, "ID:", newCoveringId);
                  console.log("🎯 USER SELECT: Current selectedWindowCovering:", selectedWindowCovering);
                  
                  // CRITICAL: Set user interaction flag IMMEDIATELY to prevent state override
                  isUserInteractingRef.current = true;
                  console.log("🎯 USER SELECT: Set interaction flag to true");
                  
                  // Immediate state update - ensure it's always a string
                  const safeNewCoveringId = typeof newCoveringId === 'string' ? newCoveringId : "no_covering";
                  
                  // Force update the state immediately with multiple calls to ensure persistence
                  setSelectedWindowCovering(safeNewCoveringId);
                  console.log("🎯 USER SELECT: Called setSelectedWindowCovering with:", safeNewCoveringId);
                  
                  // Use flushSync to ensure immediate state update before any other effects run
                  setTimeout(() => {
                    setSelectedWindowCovering(safeNewCoveringId);
                    console.log("🎯 USER SELECT: Reinforced setSelectedWindowCovering with:", safeNewCoveringId);
                  }, 0);
                  
                  // Reset dependent selections when covering changes
                  if (newCoveringId !== selectedWindowCovering) {
                    console.log("🎯 USER SELECT: Resetting dependent selections");
                    setSelectedFabric(null);
                    setSelectedHeading(null);
                    setSelectedLining(null);
                    setSelectedInventoryItem(null);
                  }
                  
                  // Update treatment data to include template details
                  if (covering) {
                    setTreatmentData(prev => ({
                      ...prev,
                      treatment_type: covering.id,
                      template_details: covering
                    }));
                  }
                  
                  // Extended protection against state override
                  setTimeout(() => {
                    console.log("🎯 USER SELECT: Starting auto-save");
                    debouncedAutoSave();
                    // Keep interaction flag for longer to prevent state resets
                    setTimeout(() => {
                      console.log("🎯 USER SELECT: Clearing interaction flag after extended delay");
                      isUserInteractingRef.current = false;
                    }, 500);
                  }, 100);
                  
                  // Verify state after a brief delay
                  setTimeout(() => {
                    console.log("🎯 STEP 7: Verification - selectedWindowCovering should be:", newCoveringId);
                    console.log("🎯 STEP 7: Verification - interaction flag:", isUserInteractingRef.current);
                  }, 200);
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
            measurements={{
              ...measurements,
              // FORCE the correct values if they exist in savedSummary
              rail_width: measurements.rail_width || (shouldUseSavedData && savedSummary?.measurements_details?.rail_width_cm) || (shouldUseSavedData && savedSummary?.measurements_details?.rail_width) || measurements.rail_width || "",
              drop: measurements.drop || (shouldUseSavedData && savedSummary?.measurements_details?.drop_cm) || (shouldUseSavedData && savedSummary?.measurements_details?.drop) || measurements.drop || ""
            }}
            onMeasurementChange={handleMeasurementChange}
            readOnly={readOnly}
            key={`measurements-${stateKey}`} // Use stable key based on surface ID
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
                              inventoryItems.find(item => item.id === (measurements as any)?.selected_fabric)}
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
                    const { toast } = await import("@/hooks/use-toast");
                    try {
                      console.log("Starting save process...");
                      
                      // Save measurements first
                      await handleSaveMeasurements();
                      console.log("Measurements saved successfully");
                      
                      // Save treatment if window covering is selected
                      if (selectedCovering && projectId && surfaceId) {
                        console.log("Saving treatment configuration...");
                        await handleSaveTreatmentConfig();
                        console.log("Treatment saved successfully");
                      } else {
                        console.log("Skipping treatment save - missing requirements:", {
                          selectedCovering: !!selectedCovering,
                          projectId: !!projectId,
                          surfaceId: !!surfaceId
                        });
                        
                        toast({
                          title: "✅ Measurements Saved",
                          description: "Window measurements saved successfully",
                        });
                      }
                      
                      // Force refresh to show saved data
                      setTimeout(async () => {
                        try {
                          await queryClient.invalidateQueries({ queryKey: ["treatments"] });
                          await queryClient.invalidateQueries({ queryKey: ["window-summary"] });
                          await queryClient.invalidateQueries({ queryKey: ["client-measurements"] });
                          console.log("✅ All data refreshed after save");
                        } catch (refreshError) {
                          console.warn("Failed to refresh after save:", refreshError);
                        }
                      }, 500);
                      
                      // Close worksheet
                      onClose?.();
                    } catch (error) {
                      console.error("Save failed:", error);
                      toast({
                        title: "Save Failed",
                        description: `Failed to save worksheet data: ${error.message}`,
                        variant: "destructive"
                      });
                    }
                  }}
                  disabled={createMeasurement.isPending || updateMeasurement.isPending || createTreatment.isPending || updateTreatment.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {(createMeasurement.isPending || updateMeasurement.isPending || createTreatment.isPending || updateTreatment.isPending) ? "Saving..." : "Save"}
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