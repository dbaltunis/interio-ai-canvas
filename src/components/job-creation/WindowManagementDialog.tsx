import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ruler, Save } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeasurementBridge } from "../measurements/MeasurementBridge";
import { convertLegacyToDynamic, validateMeasurement } from "../measurements/utils/measurementMigration";
import { TreatmentPricingForm } from "./TreatmentPricingForm";
import { buildClientBreakdown } from "@/utils/quotes/buildClientBreakdown";
import { useInventory } from "@/hooks/useInventory";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { WindowRenameButton } from "./WindowRenameButton";
import { useToast } from "@/hooks/use-toast";
interface WindowManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  surface: any;
  clientId?: string; // Optional - measurements can exist without being assigned to a client
  projectId: string;
  existingMeasurement?: any;
  existingTreatments?: any[];
  onSaveTreatment?: (treatmentData: any) => void;
}
const TREATMENT_TYPES = [{
  id: "curtains",
  name: "Curtains",
  icon: "🪟",
  description: "Custom made curtains and drapes"
}, {
  id: "blinds",
  name: "Blinds",
  icon: "📏",
  description: "Horizontal or vertical blinds"
}, {
  id: "roman_blinds",
  name: "Roman Blinds",
  icon: "📋",
  description: "Soft fold window coverings"
}, {
  id: "vertical_blinds",
  name: "Vertical Blinds",
  icon: "📏",
  description: "Adjustable vertical slats"
}, {
  id: "roller_blinds",
  name: "Roller Blinds",
  icon: "🎞️",
  description: "Simple roll-up window covering"
}, {
  id: "plantation_shutters",
  name: "Plantation Shutters",
  icon: "🚪",
  description: "Adjustable louver panels"
}, {
  id: "shutters",
  name: "Traditional Shutters",
  icon: "🏠",
  description: "Solid or louvered panels"
}];
export const WindowManagementDialog = ({
  isOpen,
  onClose,
  surface,
  clientId,
  projectId,
  existingMeasurement,
  existingTreatments = [],
  onSaveTreatment
}: WindowManagementDialogProps) => {
  const [activeTab, setActiveTab] = useState("measurements");
  const [selectedTreatmentType, setSelectedTreatmentType] = useState("curtains");
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [calculatedCost, setCalculatedCost] = useState(0);
  // Reference to access worksheet's save function
  const worksheetRef = useRef<any>(null);
  const {
    data: inventoryItems = []
  } = useInventory();
  const {
    units
  } = useMeasurementUnits();

  // Fetch window type to get visual_key for dynamic display
  const {
    data: windowTypeData
  } = useQuery({
    queryKey: ['window-type', surface?.window_type_id],
    queryFn: async () => {
      if (!surface?.window_type_id) return null;
      const {
        data
      } = await supabase.from('window_types').select('visual_key, name').eq('id', surface.window_type_id).single();
      return data;
    },
    enabled: !!surface?.window_type_id
  });

  // Determine display text based on visual_key
  const getDesignAreaType = () => {
    if (windowTypeData?.visual_key === 'room_wall') {
      return 'Wall';
    }
    return 'Window';
  };

  // Filter inventory by category based on treatment type
  const getInventoryForTreatment = (treatmentType: string) => {
    const categoryMap = {
      curtains: "Fabric",
      blinds: "Hardware",
      shutters: "Hardware"
    };
    return inventoryItems.filter(item => item.category === categoryMap[treatmentType as keyof typeof categoryMap]);
  };
  const handleTreatmentTypeSelect = (type: string) => {
    setSelectedTreatmentType(type);
    setSelectedInventoryItem(null);
    setActiveTab("treatment");
  };
  const handleInventorySelect = (item: any) => {
    setSelectedInventoryItem(item);
    // Calculate preliminary cost based on surface dimensions and item pricing
    const surfaceArea = (surface.width || 60) * (surface.height || 48) / 144; // sq ft
    const estimatedCost = surfaceArea * (item.selling_price || item.unit_price || 0);
    setCalculatedCost(estimatedCost);
  };
  const handleCreateTreatment = () => {
    if (!selectedInventoryItem) return;
    setShowTreatmentForm(true);
  };
  const handleTreatmentSave = async (treatmentData: any) => {
    try {
      // CRITICAL: Save ALL cost data to windows_summary table
      if (treatmentData.cost_summary && surface?.id) {
        const costSummary = treatmentData.cost_summary;
        
        const summaryData = {
          window_id: surface.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          
          // Core costs from cost_summary - PRESERVE ALL VALUES
          fabric_cost: costSummary.fabric_cost || costSummary.material_cost || 0,
          manufacturing_cost: costSummary.labor_cost || costSummary.manufacturing_cost || 0,
          options_cost: costSummary.options_cost || 0, // CRITICAL: Save options cost
          hardware_cost: costSummary.hardware_cost || 0,
          lining_cost: costSummary.lining_cost || 0,
          heading_cost: costSummary.heading_cost || 0,
          total_cost: costSummary.total_cost || 0,
          
          // Measurements - PRESERVE dimensions
          linear_meters: costSummary.linear_meters || treatmentData.measurements?.fabric_usage || 0,
          widths_required: costSummary.widths_required || 0,
          // CRITICAL: Save rail_width and drop as top-level columns for pricing calculations
          rail_width: treatmentData.measurements?.rail_width || treatmentData.measurements?.width || 0,
          drop: treatmentData.measurements?.drop || treatmentData.measurements?.height || 0,
          
          // Fabric details - PRESERVE pricing
          price_per_meter: costSummary.price_per_meter || treatmentData.fabric_details?.fabric_cost_per_yard || 0,
          fabric_details: treatmentData.fabric_details || {},
          
          // Treatment info
          treatment_type: selectedTreatmentType,
          treatment_category: treatmentData.window_covering?.category || 'curtains',
          
          // Template details
          template_id: treatmentData.window_covering?.id,
          template_name: treatmentData.window_covering?.name,
          template_details: treatmentData.window_covering || {},
          
          // Full cost breakdown - PRESERVE EVERYTHING
          cost_summary: costSummary,
          
          // Measurements with options
          measurements_details: {
            ...treatmentData.measurements,
            selected_options: treatmentData.selected_options
          },
          
          // Options - PRESERVE selection
          selected_options: treatmentData.selected_options || [],
          
          // Metadata
          pricing_type: treatmentData.pricing_type || 'per_metre',
          currency: treatmentData.currency || 'USD'
        };
        
        // CRITICAL: Build structured cost_breakdown for display
        const costBreakdown = buildClientBreakdown(summaryData);
        const finalSummaryData = {
          ...summaryData,
          cost_breakdown: costBreakdown as any
        };

        const { error: saveError } = await supabase
          .from('windows_summary')
          .upsert(finalSummaryData, { onConflict: 'window_id' });

        if (saveError) {
          console.error("❌ Failed to save cost summary:", saveError);
          throw saveError;
        }

        console.log("✅ Cost summary saved to windows_summary:", summaryData);
      }

      // Also call the parent callback if provided
      if (onSaveTreatment) {
        const enrichedTreatmentData = {
          ...treatmentData,
          window_id: surface.id,
          room_id: surface.room_id,
          inventory_item: selectedInventoryItem,
          surface_dimensions: {
            width: surface.width,
            height: surface.height
          }
        };
        onSaveTreatment(enrichedTreatmentData);
      }

      setShowTreatmentForm(false);
      setSelectedInventoryItem(null);
      onClose();
    } catch (error) {
      console.error("❌ Treatment save failed:", error);
      toast({
        title: "Error",
        description: "Failed to save treatment data",
        variant: "destructive"
      });
    }
  };

  // Simple save function that just triggers the worksheet's save
  const handleSaveData = async () => {
    try {
      console.log("🔄 WindowManagementDialog: Triggering worksheet save...");

      // The worksheet handles its own persistence now
      if (worksheetRef.current && typeof worksheetRef.current.autoSave === 'function') {
        await worksheetRef.current.autoSave();
      }
      console.log("✅ WindowManagementDialog: Save completed successfully");
      const {
        toast
      } = await import("@/hooks/use-toast");
      toast({
        title: "✅ Configuration Saved",
        description: "Your measurements and selections have been saved successfully"
      });
    } catch (error) {
      console.error("❌ WindowManagementDialog: Save failed:", error);
      const {
        toast
      } = await import("@/hooks/use-toast");
      toast({
        title: "❌ Save Failed",
        description: "There was an error saving your data. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Dialog close handler - NO AUTO-SAVE (user must click Save button)
  const handleDialogClose = async (open: boolean) => {
    if (!open) {
      // Removed auto-save - user must explicitly click Save button
      // This prevents accidentally overwriting measurements with zeros when closing
      console.log("Dialog closing - no auto-save, user must click Save button");
      onClose();
    }
  };
  const queryClient = useQueryClient();
  const {
    toast
  } = useToast();
  const handleRename = async (newName: string) => {
    if (!surface?.id) return;
    try {
      const {
        error
      } = await supabase.from('surfaces').update({
        name: newName
      }).eq('id', surface.id);
      if (error) throw error;

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["surfaces"]
      });
      queryClient.invalidateQueries({
        queryKey: ["surfaces", projectId]
      });
      toast({
        title: "Success",
        description: "Surface name updated successfully"
      });
    } catch (error) {
      console.error('Error updating surface name:', error);
      toast({
        title: "Error",
        description: "Failed to update surface name",
        variant: "destructive"
      });
    }
  };
  const hasMeasurements = existingMeasurement && Object.keys(existingMeasurement.measurements || {}).length > 0;
  
  // Get treatment name from existingTreatments
  const [treatmentName, setTreatmentName] = useState('');
  const currentTreatment = existingTreatments?.[0];
  
  useEffect(() => {
    if (currentTreatment) {
      // Priority: treatment_name > product_name > template name
      const name = currentTreatment.treatment_name || 
                   currentTreatment.product_name || 
                   currentTreatment.treatment_type || 
                   'Treatment';
      setTreatmentName(name);
    }
  }, [currentTreatment]);

  const handleTreatmentNameUpdate = async (newName: string) => {
    if (!currentTreatment?.id || !newName.trim()) return;
    
    try {
      await supabase
        .from('treatments')
        .update({ treatment_name: newName.trim() })
        .eq('id', currentTreatment.id);
      
      setTreatmentName(newName.trim());
      toast({
        title: 'Success',
        description: 'Treatment name updated',
      });
    } catch (error) {
      console.error('Failed to update treatment name:', error);
      toast({
        title: 'Error',
        description: 'Failed to update treatment name',
        variant: 'destructive',
      });
    }
  };
  
  return <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-7xl max-h-[95vh] flex flex-col bg-background border-2 p-3 sm:p-6">
          <DialogHeader className="flex-shrink-0 pb-2 sm:pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-base sm:text-xl font-bold text-foreground">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 w-full">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Ruler className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    <span className="hidden sm:inline">Design area:</span>
                    <span className="sm:hidden">Area:</span>
                    <WindowRenameButton windowName={surface?.name || 'Untitled'} onRename={handleRename} />
                  </div>
                  {currentTreatment && (
                    <>
                      <span className="hidden sm:inline text-muted-foreground">|</span>
                      <div className="flex items-center gap-1.5">
                        <Input
                          value={treatmentName}
                          onChange={(e) => setTreatmentName(e.target.value)}
                          onBlur={() => handleTreatmentNameUpdate(treatmentName)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleTreatmentNameUpdate(treatmentName);
                          }}
                          className="h-7 text-sm font-semibold max-w-[200px]"
                          placeholder="Treatment name"
                        />
                      </div>
                    </>
                  )}
                </div>
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto bg-background/50 rounded-md p-2 sm:p-4">
            <MeasurementBridge key={surface?.id} // Stable key for consistent state
          ref={worksheetRef} mode="dynamic" // Always use dynamic mode
          clientId={clientId || ""} projectId={projectId} surfaceId={surface?.id} surfaceData={surface} currentRoomId={surface?.room_id} visualKey={windowTypeData?.visual_key} existingMeasurement={existingMeasurement} existingTreatments={existingTreatments} onSave={handleSaveData} onSaveTreatment={handleTreatmentSave} onClose={() => handleDialogClose(false)} // Ensure dialog closes after save
          readOnly={false} />
          </div>
        </DialogContent>
      </Dialog>
    </>;
};