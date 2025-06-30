
import { useBusinessSettings, type MeasurementUnits, defaultMeasurementUnits, convertLength, formatMeasurement } from "./useBusinessSettings";

export const useMeasurementUnits = () => {
  const { data: businessSettings } = useBusinessSettings();
  
  const units: MeasurementUnits = businessSettings?.measurement_units ? 
    JSON.parse(businessSettings.measurement_units) : defaultMeasurementUnits;

  const convertToUserUnit = (value: number, sourceUnit: string): number => {
    return convertLength(value, sourceUnit, units.length);
  };

  const formatLength = (value: number): string => {
    return formatMeasurement(value, units.length);
  };

  const formatArea = (value: number): string => {
    return formatMeasurement(value, units.area);
  };

  const formatFabric = (value: number): string => {
    return formatMeasurement(value, units.fabric);
  };

  const getLengthUnitLabel = (): string => {
    const labels: Record<string, string> = {
      'mm': 'mm',
      'cm': 'cm', 
      'm': 'm',
      'inches': 'inches',
      'feet': 'feet'
    };
    return labels[units.length] || units.length;
  };

  const getFabricUnitLabel = (): string => {
    const labels: Record<string, string> = {
      'cm': 'cm',
      'm': 'm', 
      'inches': 'inches',
      'yards': 'yards'
    };
    return labels[units.fabric] || units.fabric;
  };

  return {
    units,
    convertToUserUnit,
    formatLength,
    formatArea, 
    formatFabric,
    getLengthUnitLabel,
    getFabricUnitLabel
  };
};
