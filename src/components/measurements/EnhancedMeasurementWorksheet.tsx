
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { MeasurementDiagram } from "./MeasurementDiagram";
import { PhotoUpload } from "./PhotoUpload";
import { TreatmentTypeSelector } from "./treatment-config/TreatmentTypeSelector";
import { RodTrackSelector } from "./treatment-config/RodTrackSelector";
import { FabricSelector } from "./treatment-config/FabricSelector";
import { MotorizationSelector } from "./treatment-config/MotorizationSelector";
import { MeasurementInputs } from "./MeasurementInputs";
import { VisualPreview } from "./treatment-config/VisualPreview";
import { CostCalculator } from "./treatment-config/CostCalculator";
import { useCreateClientMeasurement } from "@/hooks/useClientMeasurements";

interface EnhancedMeasurementWorksheetProps {
  clientId: string;
  projectId: string;
  roomId: string;
  surfaceId: string;
  surfaceName: string;
  existingMeasurement?: any;
  onSave: () => void;
}

export const EnhancedMeasurementWorksheet = ({
  clientId,
  projectId,
  roomId,
  surfaceId,
  surfaceName,
  existingMeasurement,
  onSave
}: EnhancedMeasurementWorksheetProps) => {
  const [measurements, setMeasurements] = useState({
    width: existingMeasurement?.measurements?.width || "",
    height: existingMeasurement?.measurements?.height || "",
    depth: existingMeasurement?.measurements?.depth || "",
    notes: existingMeasurement?.notes || ""
  });
  
  const [photos, setPhotos] = useState<string[]>(existingMeasurement?.photos || []);
  const [treatmentConfig, setTreatmentConfig] = useState({
    treatmentType: "",
    rodTrack: null,
    fabric: null,
    motorization: null,
    finials: null,
    brackets: null,
    bending: 0,
    fullness: 2.5,
    heading: ""
  });

  const { toast } = useToast();
  const { units, formatLength, formatCurrency } = useMeasurementUnits();
  const createMeasurement = useCreateClientMeasurement();

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  const handleTreatmentConfigChange = (field: string, value: any) => {
    setTreatmentConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const measurementData = {
        client_id: clientId,
        project_id: projectId,
        measurement_type: "window_treatment",
        measurements: {
          ...measurements,
          room_id: roomId,
          surface_id: surfaceId,
          surface_name: surfaceName,
          treatment_config: treatmentConfig
        },
        photos,
        notes: measurements.notes,
        measured_by: "User",
        measured_at: new Date().toISOString()
      };

      await createMeasurement.mutateAsync(measurementData);
      onSave();
    } catch (error) {
      console.error("Failed to save measurement:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Treatment Configuration</h2>
        <p className="text-muted-foreground">{surfaceName} - Complete measurement and product selection</p>
      </div>

      <Tabs defaultValue="measurements" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="treatment">Treatment</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="fabric">Fabric</TabsTrigger>
          <TabsTrigger value="preview">Preview & Cost</TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Window Diagram</CardTitle>
              </CardHeader>
              <CardContent>
                <MeasurementDiagram 
                  measurements={measurements}
                  onMeasurementChange={handleMeasurementChange}
                />
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <MeasurementInputs 
                measurements={measurements}
                onMeasurementChange={handleMeasurementChange}
              />
              
              <PhotoUpload 
                photos={photos}
                onPhotosChange={setPhotos}
                maxPhotos={5}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="treatment" className="space-y-4">
          <TreatmentTypeSelector
            selectedType={treatmentConfig.treatmentType}
            onTypeChange={(type) => handleTreatmentConfigChange("treatmentType", type)}
            measurements={measurements}
          />
        </TabsContent>

        <TabsContent value="hardware" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RodTrackSelector
              selectedRodTrack={treatmentConfig.rodTrack}
              onSelectionChange={(rodTrack) => handleTreatmentConfigChange("rodTrack", rodTrack)}
              measurements={measurements}
            />
            
            <MotorizationSelector
              selectedMotorization={treatmentConfig.motorization}
              onSelectionChange={(motorization) => handleTreatmentConfigChange("motorization", motorization)}
              treatmentType={treatmentConfig.treatmentType}
            />
          </div>
        </TabsContent>

        <TabsContent value="fabric" className="space-y-4">
          <FabricSelector
            selectedFabric={treatmentConfig.fabric}
            onSelectionChange={(fabric) => handleTreatmentConfigChange("fabric", fabric)}
            treatmentType={treatmentConfig.treatmentType}
            measurements={measurements}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VisualPreview
              measurements={measurements}
              treatmentConfig={treatmentConfig}
              photos={photos}
            />
            
            <CostCalculator
              measurements={measurements}
              treatmentConfig={treatmentConfig}
              currency={units.currency}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={onSave}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={createMeasurement.isPending}
        >
          {createMeasurement.isPending ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
};
