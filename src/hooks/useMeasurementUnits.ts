import { useBusinessSettings, type MeasurementUnits, defaultMeasurementUnits, convertLength, formatMeasurement } from "./useBusinessSettings";
import { settingsCacheService, CACHE_KEYS } from "@/services/settingsCacheService";

export const useMeasurementUnits = () => {
  const { data: businessSettings, isLoading } = useBusinessSettings();
  
  const units: MeasurementUnits = (() => {
    try {
      // Priority 1: Use fetched business settings if available
      if (businessSettings?.measurement_units) {
        return JSON.parse(businessSettings.measurement_units);
      }
      
      // Priority 2: Use cached settings for instant load (prevents unit flash)
      const cachedSettings = settingsCacheService.getInstant(CACHE_KEYS.BUSINESS_SETTINGS);
      if (cachedSettings?.measurement_units) {
        try {
          return JSON.parse(cachedSettings.measurement_units);
        } catch {
          // Fall through to defaults
        }
      }
      
      // Priority 3: Fall back to defaults (MM-based to match database standard)
      return defaultMeasurementUnits;
    } catch (error) {
      console.warn('Failed to parse measurement units, using defaults:', error);
      return defaultMeasurementUnits;
    }
  })();

  const convertToUserUnit = (value: number, sourceUnit: string): number => {
    return convertLength(value, sourceUnit, units.length);
  };

  const formatLength = (value: number): string => {
    // DEPRECATED: Assumes value is in CM
    // Use formatLengthFromMM for MM values or formatLengthFromCM for CM values
    const converted = convertLength(value, 'cm', units.length);
    return formatMeasurement(converted, units.length);
  };

  const formatLengthFromMM = (valueMM: number): string => {
    // Convert from MM (database standard) to user's preferred unit
    const converted = convertLength(valueMM, 'mm', units.length);
    return formatMeasurement(converted, units.length);
  };

  const formatLengthFromCM = (valueCM: number): string => {
    // Convert from CM to user's preferred unit
    const converted = convertLength(valueCM, 'cm', units.length);
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

  // Unit labels for display - includes both short (") and long (inches) formats
  const getLengthUnitLabel = (format: 'short' | 'long' = 'long'): string => {
    const shortLabels: Record<string, string> = {
      'mm': 'mm',
      'cm': 'cm', 
      'm': 'm',
      'inches': '"',  // Short symbol for inches
      'feet': "'"
    };
    const longLabels: Record<string, string> = {
      'mm': 'mm',
      'cm': 'cm', 
      'm': 'm',
      'inches': 'in',  // ✅ FIX: Use 'in' not 'inches' for long format
      'feet': 'ft'
    };
    return format === 'short' 
      ? (shortLabels[units.length] || units.length)
      : (longLabels[units.length] || units.length);
  };

  const getFabricUnitLabel = (format: 'short' | 'long' = 'long'): string => {
    const shortLabels: Record<string, string> = {
      'cm': 'cm',
      'm': 'm', 
      'inches': '"',
      'yards': 'yd'
    };
    const longLabels: Record<string, string> = {
      'cm': 'cm',
      'm': 'm', 
      'inches': 'in',
      'yards': 'yd'
    };
    return format === 'short' 
      ? (shortLabels[units.fabric] || units.fabric)
      : (longLabels[units.fabric] || units.fabric);
  };

  // Get per-unit pricing label based on system (metric vs imperial)
  const getPerUnitLabel = (type: 'length' | 'fabric' | 'area'): string => {
    if (type === 'length') {
      return units.system === 'imperial' ? 'Per Running Yard' : 'Per Running Metre';
    }
    if (type === 'fabric') {
      return units.system === 'imperial' ? 'Per Running Yard' : 'Per Running Metre';
    }
    if (type === 'area') {
      return units.system === 'imperial' ? 'Per sq ft' : 'Per m²';
    }
    return 'Per Unit';
  };

  return {
    units,
    convertToUserUnit,
    formatLength,
    formatLengthFromMM,
    formatLengthFromCM,
    formatArea, 
    formatFabric,
    getLengthUnitLabel,
    getFabricUnitLabel,
    getPerUnitLabel,
    isLoading
  };
};
