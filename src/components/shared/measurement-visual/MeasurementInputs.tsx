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
      console.log(`🔧 Dynamic MeasurementInputs: ${field} changed to:`, value);
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
                step="0.25"
                value={measurements[key] || ""}
                onChange={(e) => handleInputChange(key, e.target.value)}
                placeholder="0.00"
                readOnly={readOnly}
                className="pr-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                {unitSymbol}
              </span>
              {measurements[key] && measurements[key] !== "" && measurements[key] !== "0" && (
                <div className="text-xs text-green-600 font-medium mt-1">
                  ✓ {measurements[key]}{unitSymbol} entered
                </div>
              )}
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
          <Label className="text-sm font-medium">Pooling Option (Dynamic)</Label>
          <RadioGroup
            value={measurements.pooling_option || "above_floor"}
            onValueChange={(value) => {
              handleInputChange('pooling_option', value);
              // Auto-set default pooling amount for below_floor
              if (value === "below_floor" && (!measurements.pooling_amount || measurements.pooling_amount === "0")) {
                const defaultValue = unitSymbol === 'cm' ? "2" : "1";
                handleInputChange('pooling_amount', defaultValue);
              }
              // Clear pooling amount when not below floor
              if (value !== "below_floor") {
                handleInputChange('pooling_amount', "");
              }
            }}
            disabled={readOnly}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="above_floor" id="pooling-above" />
              <Label htmlFor="pooling-above" className="text-sm cursor-pointer">Above Floor</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="touching_floor" id="pooling-touching" />
              <Label htmlFor="pooling-touching" className="text-sm cursor-pointer">Touching Floor</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="below_floor" id="pooling-below" />
              <Label htmlFor="pooling-below" className="text-sm cursor-pointer">Below Floor (Pooling)</Label>
            </div>
          </RadioGroup>
          
          {measurements.pooling_option === "below_floor" && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Label htmlFor="pooling_amount" className="text-sm font-medium">
                Pooling Amount (Dynamic)
              </Label>
              <div className="relative mt-1">
                <Input
                  id="pooling_amount"
                  type="number"
                  step="0.25"
                  value={measurements.pooling_amount || ""}
                  onChange={(e) => handleInputChange('pooling_amount', e.target.value)}
                  placeholder="2.00"
                  readOnly={readOnly}
                  className="pr-12 transition-all duration-200"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  {unitSymbol}
                </span>
              </div>
              {measurements.pooling_amount && measurements.pooling_amount !== "" && measurements.pooling_amount !== "0" && (
                <div className="text-xs text-green-600 font-medium mt-1">
                  ✓ {measurements.pooling_amount}{unitSymbol} pooling will be saved
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};