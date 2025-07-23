
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface MeasurementInputsProps {
  measurements: any;
  onMeasurementChange: (field: string, value: string) => void;
}

export const MeasurementInputs = ({
  measurements,
  onMeasurementChange
}: MeasurementInputsProps) => {
  const { getLengthUnitLabel } = useMeasurementUnits();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Measurements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="width">Width ({getLengthUnitLabel()})</Label>
          <Input
            id="width"
            type="number"
            step="0.5"
            value={measurements.width}
            onChange={(e) => onMeasurementChange("width", e.target.value)}
            placeholder="0.0"
          />
        </div>
        
        <div>
          <Label htmlFor="height">Height ({getLengthUnitLabel()})</Label>
          <Input
            id="height"
            type="number"
            step="0.5"
            value={measurements.height}
            onChange={(e) => onMeasurementChange("height", e.target.value)}
            placeholder="0.0"
          />
        </div>
        
        <div>
          <Label htmlFor="depth">Depth ({getLengthUnitLabel()})</Label>
          <Input
            id="depth"
            type="number"
            step="0.5"
            value={measurements.depth}
            onChange={(e) => onMeasurementChange("depth", e.target.value)}
            placeholder="0.0"
          />
        </div>
        
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={measurements.notes}
            onChange={(e) => onMeasurementChange("notes", e.target.value)}
            placeholder="Additional notes about the window or installation requirements..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};
