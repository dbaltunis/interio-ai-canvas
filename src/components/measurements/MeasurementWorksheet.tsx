
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Save, Upload } from "lucide-react";
import { useCreateClientMeasurement, useUpdateClientMeasurement } from "@/hooks/useClientMeasurements";

interface MeasurementWorksheetProps {
  clientId: string;
  projectId?: string;
  existingMeasurement?: any;
  onSave?: () => void;
}

const WINDOW_TYPES = [
  { value: "standard", label: "Standard Window" },
  { value: "bay", label: "Bay Window" },
  { value: "french_doors", label: "French Doors" },
  { value: "sliding_doors", label: "Sliding Doors" },
  { value: "large_window", label: "Large Window" },
  { value: "corner_window", label: "Corner Window" }
];

export const MeasurementWorksheet = ({ 
  clientId, 
  projectId, 
  existingMeasurement, 
  onSave 
}: MeasurementWorksheetProps) => {
  const [windowType, setWindowType] = useState(existingMeasurement?.measurement_type || "standard");
  const [measurements, setMeasurements] = useState(existingMeasurement?.measurements || {});
  const [notes, setNotes] = useState(existingMeasurement?.notes || "");
  const [measuredBy, setMeasuredBy] = useState(existingMeasurement?.measured_by || "");
  const [photos, setPhotos] = useState<string[]>(existingMeasurement?.photos || []);

  const createMeasurement = useCreateClientMeasurement();
  const updateMeasurement = useUpdateClientMeasurement();

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSave = async () => {
    const measurementData = {
      client_id: clientId,
      project_id: projectId,
      measurement_type: windowType,
      measurements,
      photos,
      notes,
      measured_by: measuredBy,
      measured_at: new Date().toISOString()
    };

    if (existingMeasurement?.id) {
      await updateMeasurement.mutateAsync({
        id: existingMeasurement.id,
        ...measurementData
      });
    } else {
      await createMeasurement.mutateAsync(measurementData);
    }

    onSave?.();
  };

  const renderMeasurementFields = () => {
    switch (windowType) {
      case "standard":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Width (inches)</Label>
              <Input
                id="width"
                type="number"
                step="0.25"
                value={measurements.width || ""}
                onChange={(e) => handleMeasurementChange("width", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (inches)</Label>
              <Input
                id="height"
                type="number"
                step="0.25"
                value={measurements.height || ""}
                onChange={(e) => handleMeasurementChange("height", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="depth">Depth (inches)</Label>
              <Input
                id="depth"
                type="number"
                step="0.25"
                value={measurements.depth || ""}
                onChange={(e) => handleMeasurementChange("depth", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="ceiling_height">Ceiling Height (inches)</Label>
              <Input
                id="ceiling_height"
                type="number"
                step="0.25"
                value={measurements.ceiling_height || ""}
                onChange={(e) => handleMeasurementChange("ceiling_height", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        );

      case "bay":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="left_width">Left Panel Width</Label>
                <Input
                  id="left_width"
                  type="number"
                  step="0.25"
                  value={measurements.left_width || ""}
                  onChange={(e) => handleMeasurementChange("left_width", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="center_width">Center Panel Width</Label>
                <Input
                  id="center_width"
                  type="number"
                  step="0.25"
                  value={measurements.center_width || ""}
                  onChange={(e) => handleMeasurementChange("center_width", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="right_width">Right Panel Width</Label>
                <Input
                  id="right_width"
                  type="number"
                  step="0.25"
                  value={measurements.right_width || ""}
                  onChange={(e) => handleMeasurementChange("right_width", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Overall Height</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.25"
                  value={measurements.height || ""}
                  onChange={(e) => handleMeasurementChange("height", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="projection">Bay Projection</Label>
                <Input
                  id="projection"
                  type="number"
                  step="0.25"
                  value={measurements.projection || ""}
                  onChange={(e) => handleMeasurementChange("projection", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        );

      case "french_doors":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="door_width">Single Door Width</Label>
              <Input
                id="door_width"
                type="number"
                step="0.25"
                value={measurements.door_width || ""}
                onChange={(e) => handleMeasurementChange("door_width", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="door_height">Door Height</Label>
              <Input
                id="door_height"
                type="number"
                step="0.25"
                value={measurements.door_height || ""}
                onChange={(e) => handleMeasurementChange("door_height", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="frame_width">Frame Width</Label>
              <Input
                id="frame_width"
                type="number"
                step="0.25"
                value={measurements.frame_width || ""}
                onChange={(e) => handleMeasurementChange("frame_width", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="clearance">Floor Clearance</Label>
              <Input
                id="clearance"
                type="number"
                step="0.25"
                value={measurements.clearance || ""}
                onChange={(e) => handleMeasurementChange("clearance", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Width (inches)</Label>
              <Input
                id="width"
                type="number"
                step="0.25"
                value={measurements.width || ""}
                onChange={(e) => handleMeasurementChange("width", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (inches)</Label>
              <Input
                id="height"
                type="number"
                step="0.25"
                value={measurements.height || ""}
                onChange={(e) => handleMeasurementChange("height", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Measurement Worksheet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="windowType">Window Type</Label>
            <Select value={windowType} onValueChange={setWindowType}>
              <SelectTrigger>
                <SelectValue placeholder="Select window type" />
              </SelectTrigger>
              <SelectContent>
                {WINDOW_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="measuredBy">Measured By</Label>
            <Input
              id="measuredBy"
              value={measuredBy}
              onChange={(e) => setMeasuredBy(e.target.value)}
              placeholder="Enter name"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-4">Measurements</h3>
          {renderMeasurementFields()}
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about the measurements..."
            rows={3}
          />
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Add Photos
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={createMeasurement.isPending || updateMeasurement.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {existingMeasurement ? "Update" : "Save"} Measurements
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
