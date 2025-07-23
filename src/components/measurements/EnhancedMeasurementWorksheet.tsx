
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Ruler, Settings, Palette, Eye, DollarSign } from "lucide-react";
import { MeasurementDiagram } from "./MeasurementDiagram";
import { TreatmentTypeSelector } from "./treatment-config/TreatmentTypeSelector";
import { RodTrackSelector } from "./treatment-config/RodTrackSelector";
import { MotorizationSelector } from "./treatment-config/MotorizationSelector";
import { FabricSelector } from "./treatment-config/FabricSelector";
import { VisualPreview } from "./treatment-config/VisualPreview";
import { CostCalculator } from "./treatment-config/CostCalculator";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface EnhancedMeasurementWorksheetProps {
  surface: any;
  room: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const EnhancedMeasurementWorksheet = ({
  surface,
  room,
  onSave,
  onCancel
}: EnhancedMeasurementWorksheetProps) => {
  const { formatCurrency, isLoading: unitsLoading } = useMeasurementUnits();
  
  const [measurements, setMeasurements] = useState({
    width: surface.width?.toString() || "",
    height: surface.height?.toString() || "",
    depth: "",
    notes: ""
  });

  const [selectedTreatment, setSelectedTreatment] = useState<any>(null);
  const [selectedRodTrack, setSelectedRodTrack] = useState<any>(null);
  const [selectedMotorization, setSelectedMotorization] = useState<any>(null);
  const [selectedFabric, setSelectedFabric] = useState<any>(null);

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalCost = () => {
    let total = 0;
    
    if (selectedTreatment) total += selectedTreatment.basePrice || 0;
    if (selectedRodTrack) total += selectedRodTrack.price || 0;
    if (selectedMotorization) total += selectedMotorization.price || 0;
    if (selectedFabric?.usage) total += selectedFabric.usage.cost || 0;
    
    return total;
  };

  const handleSave = () => {
    const treatmentData = {
      measurements,
      treatment: selectedTreatment,
      rodTrack: selectedRodTrack,
      motorization: selectedMotorization,
      fabric: selectedFabric,
      totalCost: calculateTotalCost()
    };
    onSave(treatmentData);
  };

  if (unitsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading measurement settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Treatment Configuration</h2>
          <p className="text-muted-foreground">
            {surface.name} in {room.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            Total: {formatCurrency(calculateTotalCost())}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="measurements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="measurements" className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Measurements
          </TabsTrigger>
          <TabsTrigger value="treatment" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Treatment
          </TabsTrigger>
          <TabsTrigger value="hardware" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Hardware
          </TabsTrigger>
          <TabsTrigger value="fabric" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Fabric
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="cost" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cost
          </TabsTrigger>
        </TabsList>

        <TabsContent value="measurements">
          <MeasurementDiagram
            measurements={measurements}
            onMeasurementChange={handleMeasurementChange}
          />
        </TabsContent>

        <TabsContent value="treatment">
          <TreatmentTypeSelector
            selectedType={selectedTreatment?.id || ""}
            onTypeChange={(type) => {
              // Find treatment details from the list
              setSelectedTreatment({ id: type, basePrice: 45 });
            }}
            measurements={measurements}
          />
        </TabsContent>

        <TabsContent value="hardware">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <RodTrackSelector
              selectedRodTrack={selectedRodTrack}
              onSelectionChange={setSelectedRodTrack}
              measurements={measurements}
            />
            <MotorizationSelector
              selectedMotorization={selectedMotorization}
              onSelectionChange={setSelectedMotorization}
              treatmentType={selectedTreatment?.id || ""}
            />
          </div>
        </TabsContent>

        <TabsContent value="fabric">
          <FabricSelector
            selectedFabric={selectedFabric}
            onSelectionChange={setSelectedFabric}
            treatmentType={selectedTreatment?.id || ""}
            measurements={measurements}
          />
        </TabsContent>

        <TabsContent value="preview">
          <VisualPreview
            measurements={measurements}
            treatment={selectedTreatment}
            rodTrack={selectedRodTrack}
            fabric={selectedFabric}
          />
        </TabsContent>

        <TabsContent value="cost">
          <CostCalculator
            treatment={selectedTreatment}
            rodTrack={selectedRodTrack}
            motorization={selectedMotorization}
            fabric={selectedFabric}
            measurements={measurements}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-primary">
          Save Treatment Configuration
        </Button>
      </div>
    </div>
  );
};
