import { useBusinessSettings, type MeasurementUnits, defaultMeasurementUnits } from "./useBusinessSettings";

/**
 * Hook to get the currency from business settings
 * Automatically falls back to account owner's settings for team members
 * Returns undefined while loading to prevent flash of incorrect default values
 */
export const useCurrency = () => {
  const { data: businessSettings, isLoading } = useBusinessSettings();
  
  // Don't return default currency while loading - prevents flash of wrong values
  if (isLoading) {
    return undefined;
  }
  
  const currency = (() => {
    try {
      const measurementUnits: MeasurementUnits = businessSettings?.measurement_units 
        ? (typeof businessSettings.measurement_units === 'string' 
            ? JSON.parse(businessSettings.measurement_units)
            : businessSettings.measurement_units)
        : defaultMeasurementUnits;
      return measurementUnits.currency;
    } catch {
      return defaultMeasurementUnits.currency;
    }
  })();

  return currency;
};
