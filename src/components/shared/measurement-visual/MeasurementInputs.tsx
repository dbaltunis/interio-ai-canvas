import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MeasurementData } from "./types";

interface MeasurementInputsProps {
  measurements: MeasurementData;
  onMeasurementChange?: (field: string, value: string) => void;
  readOnly?: boolean;
}

export const MeasurementInputs = ({
  measurements,
  onMeasurementChange,
  readOnly = false,
}: MeasurementInputsProps) => {
  const handleChange = (field: string, value: string) => {
    if (onMeasurementChange) {
      onMeasurementChange(field, value);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="rail_width">Rail Width</Label>
        <Input
          id="rail_width"
          type="number"
          value={measurements.rail_width || ''}
          onChange={(e) => handleChange('rail_width', e.target.value)}
          readOnly={readOnly}
          placeholder="Width..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="drop">Drop</Label>
        <Input
          id="drop"
          type="number"
          value={measurements.drop || ''}
          onChange={(e) => handleChange('drop', e.target.value)}
          readOnly={readOnly}
          placeholder="Drop..."
        />
      </div>
    </div>
  );
};
