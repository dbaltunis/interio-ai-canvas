
import { useState, useEffect } from "react";
import { useBusinessSettings, useCreateBusinessSettings, useUpdateBusinessSettings, type MeasurementUnits, defaultMeasurementUnits } from "@/hooks/useBusinessSettings";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { settingsCacheService, CACHE_KEYS } from "@/services/settingsCacheService";

export const useMeasurementUnitsForm = () => {
  const { data: businessSettings, isLoading } = useBusinessSettings();
  const createSettings = useCreateBusinessSettings();
  const updateSettings = useUpdateBusinessSettings();
  const queryClient = useQueryClient();

  // Initialize from cache first for instant load, then update from server
  const [units, setUnits] = useState<MeasurementUnits>(() => {
    const cached = settingsCacheService.getInstant(CACHE_KEYS.MEASUREMENT_UNITS);
    return cached || defaultMeasurementUnits;
  });

  useEffect(() => {
    if (businessSettings?.measurement_units) {
      try {
        const parsedUnits = typeof businessSettings.measurement_units === 'string' 
          ? JSON.parse(businessSettings.measurement_units) 
          : businessSettings.measurement_units;
        const newUnits = { ...defaultMeasurementUnits, ...parsedUnits };
        setUnits(newUnits);
        
        // Update cache with latest server data
        settingsCacheService.set(CACHE_KEYS.MEASUREMENT_UNITS, newUnits);
      } catch (error) {
        console.error("Failed to parse measurement units:", error);
        setUnits(defaultMeasurementUnits);
      }
    }
  }, [businessSettings]);

  const handleSystemChange = (system: 'metric' | 'imperial') => {
    // Don't reset if already on this system (prevents accidental resets)
    if (system === units.system) return;
    
    const newUnits = { ...units, system };
    
    // Auto-adjust units based on system
    // CRITICAL: Database standard is MM - use mm for metric length to prevent 10x calculation errors
    if (system === 'metric') {
      newUnits.length = 'mm';  // ✅ Database standard is MM
      newUnits.area = 'sq_m';  // ✅ sq_m is more practical than sq_cm
      newUnits.fabric = 'm';   // ✅ meters for fabric is industry standard
    } else {
      newUnits.length = 'inches';
      newUnits.area = 'sq_inches';
      newUnits.fabric = 'yards';
    }
    
    setUnits(newUnits);
  };

  const handleUnitChange = (unitType: keyof MeasurementUnits, value: string) => {
    setUnits(prev => ({ ...prev, [unitType]: value }));
  };

  const handleSave = async () => {
    try {
      const measurementUnitsJson = JSON.stringify(units);
      
      // Update cache immediately for instant feedback
      settingsCacheService.set(CACHE_KEYS.MEASUREMENT_UNITS, units);
      console.log('💾 Cached measurement units:', units);
      
      if (businessSettings) {
        await updateSettings.mutateAsync({
          id: businessSettings.id,
          measurement_units: measurementUnitsJson
        });
      } else {
        await createSettings.mutateAsync({
          measurement_units: measurementUnitsJson
        });
      }
      
      // Force refetch to ensure fresh data
      await queryClient.refetchQueries({ queryKey: ["business-settings"] });
      
      console.log('✅ Saved measurement units to database:', units);
      toast.success("Measurement units updated successfully");
    } catch (error) {
      console.error("❌ Failed to save measurement units:", error);
      toast.error("Failed to save measurement units");
    }
  };

  return {
    units,
    isLoading,
    isSaving: createSettings.isPending || updateSettings.isPending,
    handleSystemChange,
    handleUnitChange,
    handleSave
  };
};
