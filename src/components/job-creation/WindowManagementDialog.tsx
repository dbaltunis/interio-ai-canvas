import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ruler, Package, Calculator, Save } from "lucide-react";
import { MeasurementWorksheet } from "../measurements/MeasurementWorksheet";
import { DynamicWindowWorksheet } from "../measurements/DynamicWindowWorksheet";
import { MeasurementBridge } from "../measurements/MeasurementBridge";
import { convertLegacyToDynamic, validateMeasurement } from "../measurements/utils/measurementMigration";
import { TreatmentPricingForm } from "./TreatmentPricingForm";
import { useInventory } from "@/hooks/useInventory";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface WindowManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  surface: any;
  clientId?: string; // Optional - measurements can exist without being assigned to a client
  projectId: string;
  existingMeasurement?: any;
  existingTreatments?: any[];
  onSaveTreatment: (treatmentData: any) => void;
}

const TREATMENT_TYPES = [
  { id: "curtains", name: "Curtains", icon: "🪟" },
  { id: "blinds", name: "Blinds", icon: "📏" },
  { id: "shutters", name: "Shutters", icon: "🚪" },
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
  const [measurementMode, setMeasurementMode] = useState<'dynamic' | 'enhanced'>('dynamic');
  
  // Reference to access worksheet's save function
  const worksheetRef = useRef<any>(null);

  const { data: inventoryItems = [] } = useInventory();
  const { units } = useMeasurementUnits();

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

  // Auto-save function when dialog closes
  const handleDialogClose = async (open: boolean) => {
    if (!open && worksheetRef.current && typeof worksheetRef.current.autoSave === 'function') {
      try {
        await worksheetRef.current.autoSave();
        console.log("Auto-saved measurements on dialog close");
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }
    onClose();
  };

  const hasMeasurements = existingMeasurement && Object.keys(existingMeasurement.measurements || {}).length > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Enhanced Window Management: {surface?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Mode toggle for advanced users */}
            <div className="mb-4 flex justify-end">
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setMeasurementMode('dynamic')}
                  className={`px-3 py-1 rounded ${
                    measurementMode === 'dynamic' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Dynamic Mode
                </button>
                <button
                  onClick={() => setMeasurementMode('enhanced')}
                  className={`px-3 py-1 rounded ${
                    measurementMode === 'enhanced' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Enhanced Mode
                </button>
              </div>
            </div>

            <MeasurementBridge
              key={`${surface?.id}-${measurementMode}`} // Force remount on mode change
              ref={worksheetRef}
              mode={measurementMode}
              clientId={clientId || ""}
              projectId={projectId}
              surfaceId={surface?.id}
              surfaceData={surface}
              currentRoomId={surface?.room_id}
              existingMeasurement={existingMeasurement}
              existingTreatments={existingTreatments}
              onSave={() => console.log("Measurements saved")}
              onSaveTreatment={handleTreatmentSave}
              readOnly={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
