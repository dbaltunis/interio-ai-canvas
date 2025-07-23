
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface MeasurementDiagramProps {
  measurements: any;
  onMeasurementChange: (field: string, value: string) => void;
}

export const MeasurementDiagram = ({
  measurements,
  onMeasurementChange
}: MeasurementDiagramProps) => {
  const { formatLength, getLengthUnitLabel } = useMeasurementUnits();
  const unitLabel = getLengthUnitLabel();

  return (
    <div className="space-y-4">
      {/* Visual Window Diagram */}
      <div className="relative bg-muted/30 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
        <div className="relative">
          {/* Window Frame */}
          <div 
            className="border-4 border-gray-600 bg-blue-100/50 relative"
            style={{
              width: `${Math.max(120, (parseFloat(measurements.width) || 100) * 1.2)}px`,
              height: `${Math.max(80, (parseFloat(measurements.height) || 150) * 0.8)}px`
            }}
          >
            {/* Width Measurement Line */}
            <div className="absolute -top-8 left-0 right-0 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded shadow-sm text-xs">
                <span>Width:</span>
                <span className="font-medium">
                  {measurements.width ? formatLength(parseFloat(measurements.width)) : `-- ${unitLabel}`}
                </span>
              </div>
            </div>
            
            {/* Height Measurement Line */}
            <div className="absolute -right-16 top-0 bottom-0 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded shadow-sm text-xs rotate-90">
                <span>Height:</span>
                <span className="font-medium">
                  {measurements.height ? formatLength(parseFloat(measurements.height)) : `-- ${unitLabel}`}
                </span>
              </div>
            </div>

            {/* Window Content */}
            <div className="absolute inset-2 bg-sky-200/30 flex items-center justify-center text-xs text-muted-foreground">
              Window
            </div>
          </div>

          {/* Depth Indicator */}
          {measurements.depth && (
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded shadow-sm text-xs">
                <span>Depth:</span>
                <span className="font-medium">{formatLength(parseFloat(measurements.depth))}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Measurement Inputs */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="diagram-width">Width ({unitLabel})</Label>
          <Input
            id="diagram-width"
            type="number"
            step="0.1"
            value={measurements.width}
            onChange={(e) => onMeasurementChange("width", e.target.value)}
            placeholder="0.0"
          />
        </div>
        <div>
          <Label htmlFor="diagram-height">Height ({unitLabel})</Label>
          <Input
            id="diagram-height"
            type="number"
            step="0.1"
            value={measurements.height}
            onChange={(e) => onMeasurementChange("height", e.target.value)}
            placeholder="0.0"
          />
        </div>
        <div>
          <Label htmlFor="diagram-depth">Depth ({unitLabel})</Label>
          <Input
            id="diagram-depth"
            type="number"
            step="0.1"
            value={measurements.depth}
            onChange={(e) => onMeasurementChange("depth", e.target.value)}
            placeholder="0.0"
          />
        </div>
      </div>
    </div>
  );
};
