
import { useBusinessSettings, type MeasurementUnits, defaultMeasurementUnits, convertLength, formatMeasurement, formatCurrency as formatCurrencyUtil } from "./useBusinessSettings";

export const useMeasurementUnits = () => {
  const { data: businessSettings, isLoading } = useBusinessSettings();
  
  const units: MeasurementUnits = (() => {
    if (!businessSettings?.measurement_units) {
      return defaultMeasurementUnits;
    }
    
    try {
      return typeof businessSettings.measurement_units === 'string' 
        ? JSON.parse(businessSettings.measurement_units) 
        : businessSettings.measurement_units;
    } catch (error) {
      console.warn('Failed to parse measurement units from settings, using defaults:', error);
      return defaultMeasurementUnits;
    }
  })();

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

  const formatCurrency = (amount: number): string => {
    return formatCurrencyUtil(amount, units.currency);
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
    isLoading,
    convertToUserUnit,
    formatLength,
    formatArea, 
    formatFabric,
    formatCurrency,
    getLengthUnitLabel,
    getFabricUnitLabel
  };
};
