import { Info } from "lucide-react";
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
  
  // Build range text
  const hasMin = minValue !== null && minValue !== undefined;
  const hasMax = maxValue !== null && maxValue !== undefined;
  
  let rangeText = "";
  if (hasMin && hasMax) {
    rangeText = `${minValue}–${maxValue}${unitLabel}`;
  } else if (hasMin) {
    rangeText = `min ${minValue}${unitLabel}`;
  } else if (hasMax) {
    rangeText = `max ${maxValue}${unitLabel}`;
  }
  
  // Check if value is outside range
  const isBelowMin = hasMin && value < minValue;
  const isAboveMax = hasMax && value > maxValue;
  
  if (!isBelowMin && !isAboveMax) return null;
  
  return (
    <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-500 text-xs mt-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-1.5 rounded-md">
      <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
      <div>
        <span className="font-medium">{fieldLabel} ({value}{unitLabel})</span>
        <span className="text-muted-foreground"> is outside typical range ({rangeText})</span>
        <p className="text-muted-foreground mt-0.5">Verify measurement before saving</p>
      </div>
    </div>
  );
};
