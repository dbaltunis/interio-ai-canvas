import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ruler, Package, Calculator, Save } from "lucide-react";
import { MeasurementWorksheet } from "../measurements/MeasurementWorksheet";
import { TreatmentPricingForm } from "./TreatmentPricingForm";
import { useInventory } from "@/hooks/useInventory";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface WindowManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  surface: any;
  clientId: string;
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

  const hasMeasurements = existingMeasurement && Object.keys(existingMeasurement.measurements || {}).length > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Manage Window: {surface?.name}
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              {surface?.width}" × {surface?.height}" • Room: {surface?.room_name}
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="measurements" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Measurements
                {hasMeasurements && <Badge variant="secondary" className="ml-1">✓</Badge>}
              </TabsTrigger>
              <TabsTrigger value="treatment" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Treatment
                {existingTreatments.length > 0 && <Badge variant="secondary" className="ml-1">{existingTreatments.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Pricing
                {calculatedCost > 0 && <Badge variant="secondary" className="ml-1">{units.currency}{calculatedCost.toFixed(2)}</Badge>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="measurements" className="mt-4 overflow-y-auto max-h-[70vh]">
              <MeasurementWorksheet
                clientId={clientId}
                projectId={projectId}
                existingMeasurement={existingMeasurement}
                onSave={() => setActiveTab("treatment")}
              />
            </TabsContent>

            <TabsContent value="treatment" className="mt-4 space-y-4 overflow-y-auto max-h-[70vh]">
              {!hasMeasurements && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-yellow-800">
                      Please complete measurements first before selecting a treatment.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Treatment Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Treatment Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {TREATMENT_TYPES.map((type) => (
                      <Button
                        key={type.id}
                        variant={selectedTreatmentType === type.id ? "default" : "outline"}
                        className="h-20 flex flex-col items-center gap-2"
                        onClick={() => handleTreatmentTypeSelect(type.id)}
                        disabled={!hasMeasurements}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <span className="text-sm">{type.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Inventory Selection */}
              {selectedTreatmentType && hasMeasurements && (
                <Card>
                  <CardHeader>
                    <CardTitle>Select from Inventory</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={selectedInventoryItem?.id || ""} onValueChange={(value) => {
                      const item = inventoryItems.find(i => i.id === value);
                      if (item) handleInventorySelect(item);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${selectedTreatmentType} from inventory`} />
                      </SelectTrigger>
                      <SelectContent>
                        {getInventoryForTreatment(selectedTreatmentType).map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{item.name}</span>
                              <span className="text-sm text-muted-foreground ml-4">
                                {units.currency}{item.selling_price || item.unit_price || 0}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedInventoryItem && (
                      <Card className="p-4 bg-muted/50">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{selectedInventoryItem.name}</span>
                            <span>{units.currency}{selectedInventoryItem.selling_price || selectedInventoryItem.unit_price || 0}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{selectedInventoryItem.description}</p>
                          <div className="flex justify-between text-sm">
                            <span>Estimated Cost:</span>
                            <span className="font-medium">{units.currency}{calculatedCost.toFixed(2)}</span>
                          </div>
                        </div>
                      </Card>
                    )}

                    {selectedInventoryItem && (
                      <Button onClick={handleCreateTreatment} className="w-full">
                        Configure Treatment
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Existing Treatments */}
              {existingTreatments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Existing Treatments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {existingTreatments.map((treatment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">{treatment.product_name}</span>
                            <p className="text-sm text-muted-foreground">{treatment.treatment_type}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{units.currency}{treatment.total_price}</div>
                            <Badge variant="outline">{treatment.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pricing" className="mt-4 overflow-y-auto max-h-[70vh]">
              <Card>
                <CardHeader>
                  <CardTitle>Window Product Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Window Details</h4>
                      <div className="space-y-1 text-sm">
                        <div>Dimensions: {surface?.width}" × {surface?.height}"</div>
                        <div>Type: {surface?.surface_type}</div>
                        <div>Measurements: {hasMeasurements ? "Complete" : "Pending"}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Treatment Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div>Treatments: {existingTreatments.length}</div>
                        <div>Total Cost: {units.currency}{existingTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0).toFixed(2)}</div>
                        <div>Status: {existingTreatments.length > 0 ? "Configured" : "Pending"}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Treatment Configuration Dialog */}
      {showTreatmentForm && selectedInventoryItem && (
        <TreatmentPricingForm
          isOpen={showTreatmentForm}
          onClose={() => setShowTreatmentForm(false)}
          onSave={handleTreatmentSave}
          treatmentType={selectedTreatmentType}
          surfaceType={surface?.surface_type || "window"}
          windowCovering={{
            id: selectedInventoryItem.id,
            name: selectedInventoryItem.name,
            ...selectedInventoryItem
          }}
          projectId={projectId}
        />
      )}
    </>
  );
};
