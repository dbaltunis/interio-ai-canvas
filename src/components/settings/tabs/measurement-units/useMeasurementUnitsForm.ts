
import { useState } from "react";
import { useBusinessSettings, useUpdateBusinessSettings, useCreateBusinessSettings, type MeasurementUnits, defaultMeasurementUnits } from "@/hooks/useBusinessSettings";
import { useToast } from "@/hooks/use-toast";

export const useMeasurementUnitsForm = () => {
  const { data: businessSettings } = useBusinessSettings();
  const updateSettings = useUpdateBusinessSettings();
  const createSettings = useCreateBusinessSettings();
  const { toast } = useToast();

  const currentUnits: MeasurementUnits = (businessSettings as any)?.measurement_units ? 
    JSON.parse((businessSettings as any).measurement_units) : defaultMeasurementUnits;

  const [units, setUnits] = useState<MeasurementUnits>(currentUnits);

  const handleSystemChange = (system: 'metric' | 'imperial') => {
    const newUnits: MeasurementUnits = {
      system,
      length: system === 'metric' ? 'cm' : 'inches',
      area: system === 'metric' ? 'sq_cm' : 'sq_inches', 
      fabric: system === 'metric' ? 'm' : 'yards'
    };
    setUnits(newUnits);
  };

  const handleSave = async () => {
    try {
      const settingsData = {
        measurement_units: JSON.stringify(units)
      } as any;

      if (businessSettings?.id) {
        await updateSettings.mutateAsync({
          id: businessSettings.id,
          ...settingsData
        });
      } else {
        await createSettings.mutateAsync(settingsData);
      }

      toast({
        title: "Settings saved",
        description: "Measurement units have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save measurement units settings.",
        variant: "destructive",
      });
    }
  };

  return {
    units,
    setUnits,
    handleSystemChange,
    handleSave
  };
};
