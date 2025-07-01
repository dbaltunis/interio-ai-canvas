
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { TreatmentFormData } from "./useTreatmentFormData";

interface TreatmentMeasurementsCardProps {
  formData: TreatmentFormData;
  onInputChange: (field: string, value: any) => void;
}

export const TreatmentMeasurementsCard = ({ formData, onInputChange }: TreatmentMeasurementsCardProps) => {
  const { getLengthUnitLabel } = useMeasurementUnits();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Measurements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 items-center">
          <Label htmlFor="rail_width">Rail Width ({getLengthUnitLabel()})</Label>
          <Input
            id="rail_width"
            type="number"
            step="0.25"
            value={formData.rail_width}
            onChange={(e) => onInputChange("rail_width", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 items-center">
          <Label htmlFor="drop">Drop ({getLengthUnitLabel()})</Label>
          <Input
            id="drop"
            type="number"
            step="0.25"
            value={formData.drop}
            onChange={(e) => onInputChange("drop", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 items-center">
          <Label htmlFor="pooling">Pooling ({getLengthUnitLabel()})</Label>
          <Input
            id="pooling"
            type="number"
            step="0.25"
            value={formData.pooling}
            onChange={(e) => onInputChange("pooling", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 items-center">
          <Label htmlFor="heading_fullness">Heading Fullness</Label>
          <Input
            id="heading_fullness"
            type="number"
            step="0.1"
            min="1"
            max="5"
            value={formData.heading_fullness}
            onChange={(e) => onInputChange("heading_fullness", e.target.value)}
            placeholder="2.5"
          />
        </div>
        <p className="text-xs text-gray-500 col-span-2">
          Typical values: 2.0-2.5 for curtains, 1.5-2.0 for sheers
        </p>
      </CardContent>
    </Card>
  );
};
