import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { MeasurementData } from "./types";

interface MeasurementInputsProps {
  measurements: MeasurementData;
  onMeasurementChange?: (field: string, value: string) => void;
  readOnly?: boolean;
  compact?: boolean;
}

export const MeasurementInputs = ({
  measurements,
  onMeasurementChange,
  readOnly = false,
  compact = false
}: MeasurementInputsProps) => {
  const { units } = useMeasurementUnits();
  const unitSymbol = units.length === 'cm' ? 'cm' : '"';

  const handleInputChange = (field: string, value: string) => {
    if (!readOnly && onMeasurementChange) {
      onMeasurementChange(field, value);
    }
  };

  const inputFields = [
    { key: 'rail_width', label: 'Rail Width', required: true },
    { key: 'drop', label: 'Drop Height', required: true },
    { key: 'stackback_left', label: 'Stackback Left' },
    { key: 'stackback_right', label: 'Stackback Right' },
    { key: 'returns', label: 'Returns' },
    { key: 'pooling_amount', label: 'Pooling Amount' },
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {inputFields.slice(0, 4).map(({ key, label, required }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
              <Input
                id={key}
                type="number"
                value={measurements[key] || ""}
                onChange={(e) => handleInputChange(key, e.target.value)}
                placeholder="0"
                readOnly={readOnly}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                {unitSymbol}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Measurements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inputFields.map(({ key, label, required }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
              <Input
                id={key}
                type="number"
                value={measurements[key] || ""}
                onChange={(e) => handleInputChange(key, e.target.value)}
                placeholder="0"
                readOnly={readOnly}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                {unitSymbol}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Curtain Configuration */}
      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Curtain Type</Label>
          <RadioGroup
            value={measurements.curtain_type || "pair"}
            onValueChange={(value) => handleInputChange('curtain_type', value)}
            disabled={readOnly}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pair" id="curtain-pair" />
              <Label htmlFor="curtain-pair" className="text-sm">Curtain Pair</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="curtain-single" />
              <Label htmlFor="curtain-single" className="text-sm">Single Curtain</Label>
            </div>
          </RadioGroup>
        </div>

        {measurements.curtain_type === "single" && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Curtain Side</Label>
            <RadioGroup
              value={measurements.curtain_side || "left"}
              onValueChange={(value) => handleInputChange('curtain_side', value)}
              disabled={readOnly}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="side-left" />
                <Label htmlFor="side-left" className="text-sm">Left Side</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="side-right" />
                <Label htmlFor="side-right" className="text-sm">Right Side</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-sm font-medium">Hardware Type</Label>
          <RadioGroup
            value={measurements.hardware_type || "rod"}
            onValueChange={(value) => handleInputChange('hardware_type', value)}
            disabled={readOnly}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rod" id="hardware-rod" />
              <Label htmlFor="hardware-rod" className="text-sm">Curtain Rod</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="track" id="hardware-track" />
              <Label htmlFor="hardware-track" className="text-sm">Curtain Track</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Pooling Option</Label>
          <RadioGroup
            value={measurements.pooling_option || "above_floor"}
            onValueChange={(value) => handleInputChange('pooling_option', value)}
            disabled={readOnly}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="above_floor" id="pooling-above" />
              <Label htmlFor="pooling-above" className="text-sm">Above Floor</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="touching_floor" id="pooling-touching" />
              <Label htmlFor="pooling-touching" className="text-sm">Touching Floor</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="below_floor" id="pooling-below" />
              <Label htmlFor="pooling-below" className="text-sm">Below Floor (Pooling)</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};