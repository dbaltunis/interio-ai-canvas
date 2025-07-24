
import { type MeasurementUnits } from "@/hooks/useBusinessSettings";

interface MeasurementPreviewProps {
  units: MeasurementUnits;
}

export const MeasurementPreview = ({ units }: MeasurementPreviewProps) => {
  const getUnitLabel = (unitType: keyof MeasurementUnits, value: string) => {
    const unitLabels: Record<string, string> = {
      'mm': 'mm',
      'cm': 'cm',
      'm': 'm',
      'inches': 'in',
      'feet': 'ft',
      'yards': 'yd',
      'sq_mm': 'mm²',
      'sq_cm': 'cm²',
      'sq_m': 'm²',
      'sq_inches': 'in²',
      'sq_feet': 'ft²',
      'USD': '$',
      'AUD': 'A$',
      'NZD': 'NZ$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    return unitLabels[value] || value;
  };

  return (
    <div className="text-sm text-gray-600">
      <p className="font-medium mb-2">Preview:</p>
      <div className="space-y-1">
        <p>System: {units.system === 'metric' ? 'Metric' : 'Imperial'}</p>
        <p>Length: {getUnitLabel('length', units.length)}</p>
        <p>Area: {getUnitLabel('area', units.area)}</p>
        <p>Fabric: {getUnitLabel('fabric', units.fabric)}</p>
        <p>Currency: {getUnitLabel('currency', units.currency)}</p>
      </div>
    </div>
  );
};
