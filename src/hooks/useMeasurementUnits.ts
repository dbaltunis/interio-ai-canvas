
import { useBusinessSettings, type MeasurementUnits, defaultMeasurementUnits, convertLength, formatMeasurement } from "./useBusinessSettings";

export const useMeasurementUnits = () => {
  const { data: businessSettings, isLoading } = useBusinessSettings();
  
  const units: MeasurementUnits = (() => {
    try {
      return businessSettings?.measurement_units ? 
        JSON.parse(businessSettings.measurement_units) : defaultMeasurementUnits;
    } catch (error) {
      console.warn('Failed to parse measurement units, using defaults:', error);
      return defaultMeasurementUnits;
    }
  })();

  const convertToUserUnit = (value: number, sourceUnit: string): number => {
    return convertLength(value, sourceUnit, units.length);
  };

  const formatLength = (value: number): string => {
    // Convert from cm (internal storage) to user's preferred unit
    const converted = convertLength(value, 'cm', units.length);
    return formatMeasurement(converted, units.length);
  };

  const formatArea = (value: number): string => {
    // Convert from cm² (internal storage) to user's preferred area unit
    const converted = convertLength(value, 'sq_cm', units.area);
    return formatMeasurement(converted, units.area);
  };

  const formatFabric = (value: number): string => {
    // Convert from cm (internal storage) to user's preferred fabric unit
    const converted = convertLength(value, 'cm', units.fabric);
    return formatMeasurement(converted, units.fabric);
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
    getFabricUnitLabel,
    isLoading
  };
};
