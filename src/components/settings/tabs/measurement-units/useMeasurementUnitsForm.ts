
import { useState, useEffect, useMemo, useRef } from "react";
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

  // Track original values for dirty state
  const [originalUnits, setOriginalUnits] = useState<MeasurementUnits | null>(null);
  const initialLoadComplete = useRef(false);

  useEffect(() => {
    if (businessSettings?.measurement_units) {
      try {
        const parsedUnits = typeof businessSettings.measurement_units === 'string' 
          ? JSON.parse(businessSettings.measurement_units) 
          : businessSettings.measurement_units;
        const newUnits = { ...defaultMeasurementUnits, ...parsedUnits };
        setUnits(newUnits);
        
        // Set original only on first load
        if (!initialLoadComplete.current) {
          setOriginalUnits(newUnits);
          initialLoadComplete.current = true;
        }
        
        // Update cache with latest server data
        settingsCacheService.set(CACHE_KEYS.MEASUREMENT_UNITS, newUnits);
      } catch (error) {
        console.error("Failed to parse measurement units:", error);
        setUnits(defaultMeasurementUnits);
        if (!initialLoadComplete.current) {
          setOriginalUnits(defaultMeasurementUnits);
          initialLoadComplete.current = true;
        }
      }
    } else if (!isLoading && !initialLoadComplete.current) {
      // No settings exist yet, set defaults as original
      setOriginalUnits(defaultMeasurementUnits);
      initialLoadComplete.current = true;
    }
  }, [businessSettings, isLoading]);

  // Compute hasChanges
  const hasChanges = useMemo(() => {
    if (!originalUnits) return false;
    return JSON.stringify(units) !== JSON.stringify(originalUnits);
  }, [units, originalUnits]);

  const handleSystemChange = (system: 'metric' | 'imperial' | 'mixed') => {
    // Don't reset if already on this system (prevents accidental resets)
    if (system === units.system) return;
    
    const newUnits = { ...units, system };
    
    // Auto-adjust units based on system
    // CRITICAL: Database standard is MM - use mm for metric length to prevent 10x calculation errors
    if (system === 'metric') {
      newUnits.length = 'mm';  // ✅ Database standard is MM
      newUnits.area = 'sq_m';  // ✅ sq_m is more practical than sq_cm
      newUnits.fabric = 'm';   // ✅ meters for fabric is industry standard
    } else if (system === 'imperial') {
      newUnits.length = 'inches';
      newUnits.area = 'sq_feet';
      newUnits.fabric = 'yards';
    } else if (system === 'mixed') {
      // Mixed system: inches for window dimensions, meters for fabric, sq_feet for blind pricing
      newUnits.length = 'inches';
      newUnits.area = 'sq_feet';
      newUnits.fabric = 'm';
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
      
      // Update original to current (mark as saved)
      setOriginalUnits(units);
      
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
    hasChanges,
    handleSystemChange,
    handleUnitChange,
    handleSave
  };
};
