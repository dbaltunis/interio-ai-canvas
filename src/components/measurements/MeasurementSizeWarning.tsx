import { AlertTriangle } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getUnitLabel } from "@/utils/measurementFormatters";

interface MeasurementSizeWarningProps {
  value: number | undefined;
  minValue: number | undefined | null;
  maxValue: number | undefined | null;
  fieldLabel: string;
}

export const MeasurementSizeWarning = ({
  value,
  minValue,
  maxValue,
  fieldLabel
}: MeasurementSizeWarningProps) => {
  const { units } = useMeasurementUnits();
  const unitLabel = getUnitLabel(units.length);
  
  if (!value) return null;
  
  // Check if value is below minimum
  if (minValue && value < minValue) {
    return (
      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 text-xs mt-1">
        <AlertTriangle className="h-3 w-3" />
        <span>{fieldLabel} below minimum ({minValue}{unitLabel})</span>
      </div>
    );
  }
  
  // Check if value exceeds maximum
  if (maxValue && value > maxValue) {
    return (
      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 text-xs mt-1">
        <AlertTriangle className="h-3 w-3" />
        <span>{fieldLabel} exceeds maximum ({maxValue}{unitLabel})</span>
      </div>
    );
  }
  
  return null;
};
