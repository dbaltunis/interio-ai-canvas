import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ruler, Save, Pencil, Check, X } from "lucide-react";
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

      // Invalidate queries to refetch the updated treatment data
      queryClient.invalidateQueries({ queryKey: ['window-summary', surface.id] });
      queryClient.invalidateQueries({ queryKey: ['window-summary-treatment', surface.id] });
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      
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
  
  // Get treatment name and description from existingTreatments OR windows_summary
  const [treatmentName, setTreatmentName] = useState('');
  const [treatmentDescription, setTreatmentDescription] = useState('');
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editProductValue, setEditProductValue] = useState('');
  const [editDescriptionValue, setEditDescriptionValue] = useState('');
  const currentTreatment = existingTreatments?.[0];
  
  // Fetch treatment data from windows_summary if existingTreatments is empty
  const { data: windowSummary } = useQuery({
    queryKey: ['window-summary-treatment', surface?.id],
    queryFn: async () => {
      if (!surface?.id) return null;
      const { data } = await supabase
        .from('windows_summary')
        .select('*')
        .eq('window_id', surface.id)
        .maybeSingle();
      return data;
    },
    enabled: !!surface?.id && !currentTreatment,
    refetchOnMount: 'always'
  });
  
  useEffect(() => {
    console.log('🔄 Treatment data changed:', { currentTreatment, windowSummary });
    if (currentTreatment) {
      // Priority: treatment_name > product_name > template name
      const name = currentTreatment.treatment_name || 
                   currentTreatment.product_name || 
                   currentTreatment.treatment_type || 
                   '';
      setTreatmentName(name);
      setEditProductValue(name);
      // Only use actual description field, not fallbacks
      const desc = currentTreatment.description || '';
      setTreatmentDescription(desc);
      setEditDescriptionValue(desc);
    } else if (windowSummary) {
      // Fallback to windows_summary data
      const name = windowSummary.template_name || 
                   windowSummary.treatment_type || 
                   '';
      // Only use description_text field, empty if not set
      const desc = windowSummary.description_text || '';
      setTreatmentName(name);
      setEditProductValue(name);
      setTreatmentDescription(desc);
      setEditDescriptionValue(desc);
    } else {
      // Clear fields if no treatment
      setTreatmentName('');
      setEditProductValue('');
      setTreatmentDescription('');
      setEditDescriptionValue('');
    }
  }, [currentTreatment, windowSummary, surface?.id]);

  const handleTreatmentNameUpdate = async (newName: string) => {
    if (!newName.trim() || !surface?.id) return;
    
    try {
      // Update both treatments table (if exists) and windows_summary
      if (currentTreatment?.id) {
        await supabase
          .from('treatments')
          .update({ treatment_name: newName.trim() })
          .eq('id', currentTreatment.id);
      }
      
      // Always update windows_summary
      await supabase
        .from('windows_summary')
        .update({ template_name: newName.trim() })
        .eq('window_id', surface.id);
      
      setTreatmentName(newName.trim());
      queryClient.invalidateQueries({ queryKey: ['window-summary', surface.id] });
      queryClient.invalidateQueries({ queryKey: ['window-summary-treatment', surface.id] });
      
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

  const handleDescriptionUpdate = async (newDescription: string) => {
    if (!surface?.id) return;
    
    try {
      // Update windows_summary
      await supabase
        .from('windows_summary')
        .update({ description_text: newDescription.trim() })
        .eq('window_id', surface.id);
      
      setTreatmentDescription(newDescription.trim());
      queryClient.invalidateQueries({ queryKey: ['window-summary', surface.id] });
      queryClient.invalidateQueries({ queryKey: ['window-summary-treatment', surface.id] });
      
      toast({
        title: 'Success',
        description: 'Description updated',
      });
    } catch (error) {
      console.error('Failed to update description:', error);
      toast({
        title: 'Error',
        description: 'Failed to update description',
        variant: 'destructive',
      });
    }
  };
  
  return <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-7xl max-h-[95vh] flex flex-col bg-background border-2 p-2 sm:p-4">
          <DialogHeader className="flex-shrink-0 pb-1 sm:pb-2 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center flex-wrap gap-2 text-sm font-semibold text-foreground w-full">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-background border border-border rounded-md w-[200px]">
                  <Ruler className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs font-medium text-muted-foreground shrink-0">Design:</span>
                  <WindowRenameButton windowName={surface?.name || 'Untitled'} onRename={handleRename} />
                </div>
                
                {(currentTreatment || windowSummary) && (
                  <>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-background border border-border rounded-md w-[200px]">
                      <span className="text-xs font-medium text-muted-foreground shrink-0">Product:</span>
                      {isEditingProduct ? (
                        <>
                          <Input
                            value={editProductValue}
                            onChange={(e) => setEditProductValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleTreatmentNameUpdate(editProductValue);
                                setIsEditingProduct(false);
                              }
                              if (e.key === 'Escape') {
                                setEditProductValue(treatmentName);
                                setIsEditingProduct(false);
                              }
                            }}
                            className="h-4 text-xs font-semibold border-0 bg-transparent px-0 focus-visible:ring-0"
                            autoFocus
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleTreatmentNameUpdate(editProductValue);
                              setIsEditingProduct(false);
                            }}
                            className="h-4 w-4 p-0 hover:bg-transparent text-green-600 hover:text-green-700"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setEditProductValue(treatmentName);
                              setIsEditingProduct(false);
                            }}
                            className="h-4 w-4 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-semibold truncate flex-1">{treatmentName || 'Untitled'}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setEditProductValue(treatmentName);
                              setIsEditingProduct(true);
                            }}
                            className="h-4 w-4 p-0 hover:bg-transparent opacity-60 hover:opacity-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-background border border-border rounded-md w-[200px]">
                      <span className="text-xs font-medium text-muted-foreground shrink-0">Description:</span>
                      {isEditingDescription ? (
                        <>
                          <Input
                            value={editDescriptionValue}
                            onChange={(e) => setEditDescriptionValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleDescriptionUpdate(editDescriptionValue);
                                setIsEditingDescription(false);
                              }
                              if (e.key === 'Escape') {
                                setEditDescriptionValue(treatmentDescription);
                                setIsEditingDescription(false);
                              }
                            }}
                            className="h-4 text-xs border-0 bg-transparent px-0 focus-visible:ring-0"
                            autoFocus
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleDescriptionUpdate(editDescriptionValue);
                              setIsEditingDescription(false);
                            }}
                            className="h-4 w-4 p-0 hover:bg-transparent text-green-600 hover:text-green-700"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setEditDescriptionValue(treatmentDescription);
                              setIsEditingDescription(false);
                            }}
                            className="h-4 w-4 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="text-xs truncate flex-1">{treatmentDescription || 'Optional...'}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setEditDescriptionValue(treatmentDescription);
                              setIsEditingDescription(true);
                            }}
                            className="h-4 w-4 p-0 hover:bg-transparent opacity-60 hover:opacity-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto bg-background/50 rounded-md p-1 sm:p-2">
            <MeasurementBridge key={surface?.id} // Stable key for consistent state
          ref={worksheetRef} mode="dynamic" // Always use dynamic mode
          clientId={clientId || ""} projectId={projectId} surfaceId={surface?.id} surfaceData={surface} currentRoomId={surface?.room_id} visualKey={windowTypeData?.visual_key} existingMeasurement={existingMeasurement} existingTreatments={existingTreatments} onSave={handleSaveData} onSaveTreatment={handleTreatmentSave} onClose={() => handleDialogClose(false)} // Ensure dialog closes after save
          readOnly={false} />
          </div>
        </DialogContent>
      </Dialog>
    </>;
};