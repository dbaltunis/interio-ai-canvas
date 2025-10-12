import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Ruler } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeasurementBridge } from "../measurements/MeasurementBridge";
import { convertLegacyToDynamic, validateMeasurement } from "../measurements/utils/measurementMigration";
import { TreatmentPricingForm } from "./TreatmentPricingForm";
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

const TREATMENT_TYPES = [
  { id: "curtains", name: "Curtains", icon: "🪟", description: "Custom made curtains and drapes" },
  { id: "blinds", name: "Blinds", icon: "📏", description: "Horizontal or vertical blinds" },
  { id: "roman_blinds", name: "Roman Blinds", icon: "📋", description: "Soft fold window coverings" },
  { id: "vertical_blinds", name: "Vertical Blinds", icon: "📏", description: "Adjustable vertical slats" },
  { id: "roller_blinds", name: "Roller Blinds", icon: "🎞️", description: "Simple roll-up window covering" },
  { id: "plantation_shutters", name: "Plantation Shutters", icon: "🚪", description: "Adjustable louver panels" },
  { id: "shutters", name: "Traditional Shutters", icon: "🏠", description: "Solid or louvered panels" }
];

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

  const { data: inventoryItems = [] } = useInventory();
  const { units } = useMeasurementUnits();
  
  // Fetch window type to get visual_key for dynamic display
  const { data: windowTypeData } = useQuery({
    queryKey: ['window-type', surface?.window_type_id],
    queryFn: async () => {
      if (!surface?.window_type_id) return null;
      const { data } = await supabase
        .from('window_types')
        .select('visual_key, name')
        .eq('id', surface.window_type_id)
        .single();
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
    return inventoryItems.filter(item => 
      item.category === categoryMap[treatmentType as keyof typeof categoryMap]
    );
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

  const handleTreatmentSave = (treatmentData: any) => {
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
    setShowTreatmentForm(false);
    setSelectedInventoryItem(null);
    onClose();
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
      
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "✅ Configuration Saved",
        description: "Your measurements and selections have been saved successfully",
      });
      
    } catch (error) {
      console.error("❌ WindowManagementDialog: Save failed:", error);
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "❌ Save Failed", 
        description: "There was an error saving your data. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Auto-save function when dialog closes
  const handleDialogClose = async (open: boolean) => {
    if (!open) {
      if (worksheetRef.current && typeof worksheetRef.current.autoSave === 'function') {
        try {
          await worksheetRef.current.autoSave();
          console.log("Auto-saved measurements on dialog close");
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }
      onClose();
    }
  };

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRename = async (newName: string) => {
    if (!surface?.id) return;
    
    try {
      const { error } = await supabase
        .from('surfaces')
        .update({ name: newName })
        .eq('id', surface.id);

      if (error) throw error;

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["surfaces"] });
      queryClient.invalidateQueries({ queryKey: ["surfaces", projectId] });
      
      toast({
        title: "Success",
        description: "Surface name updated successfully",
      });
    } catch (error) {
      console.error('Error updating surface name:', error);
      toast({
        title: "Error",
        description: "Failed to update surface name",
        variant: "destructive",
      });
    }
  };

  const hasMeasurements = existingMeasurement && Object.keys(existingMeasurement.measurements || {}).length > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col bg-background border-2">
          <DialogHeader className="flex-shrink-0 pb-4 border-b border-border">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Ruler className="h-6 w-6 text-primary" />
              Design area: {getDesignAreaType()} - 
              <WindowRenameButton 
                windowName={surface?.name || 'Untitled'}
                onRename={handleRename}
              />
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto bg-background/50 rounded-md p-4">
            <MeasurementBridge
              key={surface?.id} // Stable key for consistent state
              ref={worksheetRef}
              mode="dynamic" // Always use dynamic mode
              clientId={clientId || ""}
              projectId={projectId}
              surfaceId={surface?.id}
              surfaceData={surface}
              currentRoomId={surface?.room_id}
              existingMeasurement={existingMeasurement}
              existingTreatments={existingTreatments}
              onSave={handleSaveData}
              onSaveTreatment={handleTreatmentSave}
              onClose={() => handleDialogClose(false)} // Ensure dialog closes after save
              readOnly={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};