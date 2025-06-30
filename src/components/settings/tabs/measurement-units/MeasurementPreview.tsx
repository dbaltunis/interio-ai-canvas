
import { type MeasurementUnits } from "@/hooks/useBusinessSettings";

interface MeasurementPreviewProps {
  units: MeasurementUnits;
}

export const MeasurementPreview = ({ units }: MeasurementPreviewProps) => {
  const formatUnit = (unit: string) => {
    const unitMap: Record<string, string> = {
      'mm': 'mm',
      'cm': 'cm',
      'm': 'm',
      'inches': '"',
      'feet': "'",
      'yards': 'yd',
      'sq_mm': 'mm²',
      'sq_cm': 'cm²',
      'sq_m': 'm²',
      'sq_inches': 'in²',
      'sq_feet': 'ft²'
    };
    return unitMap[unit] || unit;
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium mb-2">Preview</h4>
      <div className="text-sm space-y-1">
        <p>Length: 150 {formatUnit(units.length)}</p>
        <p>Area: 2.5 {formatUnit(units.area)}</p>
        <p>Fabric: 3.5 {formatUnit(units.fabric)}</p>
      </div>
    </div>
  );
};
