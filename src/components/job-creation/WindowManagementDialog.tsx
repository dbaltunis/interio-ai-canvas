import { useState, useEffect, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ruler, Package, Calculator, Save, PlusCircle } from "lucide-react";
import { MeasurementWorksheet } from "../measurements/MeasurementWorksheet";
import { EnhancedMeasurementWorksheet } from "../measurements/EnhancedMeasurementWorksheet";
import { TreatmentPricingForm } from "./TreatmentPricingForm";
import { useInventory } from "@/hooks/useInventory";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { TreatmentEditDialog } from "./TreatmentEditDialog";
import { TreatmentListPanel } from "./TreatmentListPanel";

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
  { id: "Curtains", name: "Curtains", icon: "🪟" },
  { id: "Blinds", name: "Blinds", icon: "📏" },
  { id: "Shutters", name: "Shutters", icon: "🚪" },
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
  const [selectedTreatmentType, setSelectedTreatmentType] = useState("Curtains");
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [calculatedCost, setCalculatedCost] = useState(0);

  // Treatments state for local, responsive updates
  const [treatments, setTreatments] = useState<any[]>(existingTreatments || []);
  const [editingTreatment, setEditingTreatment] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Reference to access worksheet's save function
  const worksheetRef = useRef<any>(null);

  const { data: inventoryItems = [] } = useInventory();
  const { units } = useMeasurementUnits();

  useEffect(() => {
    setTreatments(existingTreatments || []);
  }, [existingTreatments]);

  // Filter inventory by category based on treatment type
  const getInventoryForTreatment = (treatmentType: string) => {
    const categoryMap = {
      Curtains: "Fabric",
      Blinds: "Hardware", 
      Shutters: "Hardware"
    };
    return inventoryItems.filter(item => 
      item.category === categoryMap[treatmentType as keyof typeof categoryMap]
    );
  };

  const handleTreatmentTypeSelect = (type: string) => {
    setSelectedTreatmentType(type);
    setSelectedInventoryItem(null);
    setActiveTab("treatments");
  };

  const handleInventorySelect = (item: any) => {
    setSelectedInventoryItem(item);
    // Calculate preliminary cost based on surface dimensions and item pricing
    const surfaceArea = (surface.width || 60) * (surface.height || 48) / 144; // sq ft
    const estimatedCost = surfaceArea * (item.selling_price || item.unit_price || 0);
    setCalculatedCost(estimatedCost);
  };

  const handleCreateTreatment = () => {
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
    // push locally for instant feedback
    setTreatments(prev => [...prev, enrichedTreatmentData]);
    onSaveTreatment(enrichedTreatmentData);
    setShowTreatmentForm(false);
    setSelectedInventoryItem(null);
    // Stay on Treatments tab so user can add more
    setActiveTab("treatments");
  };

  const handleEditTreatment = (treatment: any) => {
    setEditingTreatment(treatment);
    setIsEditOpen(true);
  };

  const handleEditSaved = (updated: any) => {
    setTreatments(prev => prev.map(t => (t.id && updated.id && t.id === updated.id) ? updated : (t === editingTreatment ? updated : t)));
  };

  // Auto-save function when dialog closes
  const handleDialogOpenChange = async (open: boolean) => {
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

  const hasMeasurements = existingMeasurement && Object.keys(existingMeasurement.measurements || {}).length > 0;

  if (!surface) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Window Management: {surface?.name}
            </DialogTitle>
          </DialogHeader>

          {/* Organized tabs for clarity */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="measurements">Measurements</TabsTrigger>
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
            </TabsList>

            <TabsContent value="measurements" className="mt-4">
              <div className="flex-1 overflow-y-auto">
                <EnhancedMeasurementWorksheet
                  ref={worksheetRef}
                  clientId={clientId}
                  projectId={projectId}
                  surfaceId={surface?.id} // Pass unique surface ID to isolate state
                  surfaceData={surface} // Pass surface data to extract room_id
                  onClose={onClose}
                  existingMeasurement={existingMeasurement}
                  existingTreatments={treatments}
                  onSave={() => console.log("Measurements saved")}
                  onSaveTreatment={handleTreatmentSave}
                  readOnly={false}
                />
              </div>
            </TabsContent>

            <TabsContent value="treatments" className="mt-4">
              <TreatmentListPanel
                treatments={treatments}
                currency={units.currency}
                onAdd={handleCreateTreatment}
                onEdit={handleEditTreatment}
              />
            </TabsContent>
          </Tabs>

          {/* Create New Treatment */}
          <TreatmentPricingForm
            isOpen={showTreatmentForm}
            onClose={() => setShowTreatmentForm(false)}
            onSave={handleTreatmentSave}
            treatmentType={selectedTreatmentType}
            surfaceType="window"
            windowCovering={undefined /* optional; can be set from worksheet later */}
            projectId={projectId}
          />

          {/* Edit Treatment */}
          {editingTreatment && (
            <TreatmentEditDialog
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
              treatment={editingTreatment}
              onSave={handleEditSaved}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
