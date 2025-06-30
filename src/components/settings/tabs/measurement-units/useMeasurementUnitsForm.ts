
import { useState, useEffect } from "react";
import { useBusinessSettings, useCreateBusinessSettings, useUpdateBusinessSettings, defaultMeasurementUnits, type MeasurementUnits } from "@/hooks/useBusinessSettings";
import { toast } from "sonner";

export const useMeasurementUnitsForm = () => {
  const { data: businessSettings, isLoading } = useBusinessSettings();
  const createSettings = useCreateBusinessSettings();
  const updateSettings = useUpdateBusinessSettings();

  const [units, setUnits] = useState<MeasurementUnits>(defaultMeasurementUnits);

  useEffect(() => {
    if (businessSettings?.measurement_units) {
      try {
        const parsedUnits = JSON.parse(businessSettings.measurement_units);
        setUnits({ ...defaultMeasurementUnits, ...parsedUnits });
      } catch (error) {
        console.error("Failed to parse measurement units:", error);
        setUnits(defaultMeasurementUnits);
      }
    }
  }, [businessSettings]);

  const handleSystemChange = (system: 'metric' | 'imperial') => {
    const newUnits = { ...units, system };
    
    // Auto-adjust units based on system
    if (system === 'metric') {
      newUnits.length = 'cm';
      newUnits.area = 'sq_cm';
      newUnits.fabric = 'cm';
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
      
      toast.success("Measurement units updated successfully");
    } catch (error) {
      console.error("Failed to save measurement units:", error);
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
