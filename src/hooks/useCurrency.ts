import { useBusinessSettings, type MeasurementUnits, defaultMeasurementUnits } from "./useBusinessSettings";

/**
 * Hook to get the currency from business settings
 * Automatically falls back to account owner's settings for team members
 */
export const useCurrency = () => {
  const { data: businessSettings } = useBusinessSettings();
  
  const currency = (() => {
    try {
      const measurementUnits: MeasurementUnits = businessSettings?.measurement_units 
        ? (typeof businessSettings.measurement_units === 'string' 
            ? JSON.parse(businessSettings.measurement_units)
            : businessSettings.measurement_units)
        : defaultMeasurementUnits;
      return measurementUnits.currency || 'EUR';
    } catch {
      return 'EUR';
    }
  })();

  return currency;
};
