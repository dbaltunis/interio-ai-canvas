
import { useState, useEffect } from "react";
import { useBusinessSettings, useCreateBusinessSettings, useUpdateBusinessSettings, type MeasurementUnits, defaultMeasurementUnits } from "@/hooks/useBusinessSettings";
import { toast } from "sonner";

export const useMeasurementUnitsForm = () => {
  const { data: businessSettings, isLoading } = useBusinessSettings();
  const createSettings = useCreateBusinessSettings();
  const updateSettings = useUpdateBusinessSettings();

  const [units, setUnits] = useState<MeasurementUnits>(defaultMeasurementUnits);

  useEffect(() => {
    console.log('Business settings changed:', businessSettings);
    
    if (businessSettings?.measurement_units) {
      try {
        const parsedUnits = typeof businessSettings.measurement_units === 'string' 
          ? JSON.parse(businessSettings.measurement_units) 
          : businessSettings.measurement_units;
        
        console.log('Parsed measurement units:', parsedUnits);
        setUnits({ ...defaultMeasurementUnits, ...parsedUnits });
      } catch (error) {
        console.error("Failed to parse measurement units:", error);
        toast.error("Failed to parse measurement units from database");
        setUnits(defaultMeasurementUnits);
      }
    } else {
      console.log('No measurement units found, using defaults');
      setUnits(defaultMeasurementUnits);
    }
  }, [businessSettings]);

  const handleSystemChange = (system: 'metric' | 'imperial') => {
    console.log('System changed to:', system);
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
    
    console.log('New units after system change:', newUnits);
    setUnits(newUnits);
  };

  const handleUnitChange = (unitType: keyof MeasurementUnits, value: string) => {
    console.log('Unit changed:', unitType, 'to:', value);
    const newUnits = { ...units, [unitType]: value };
    console.log('New units after unit change:', newUnits);
    setUnits(newUnits);
  };

  const handleSave = async () => {
    try {
      console.log('Saving measurement units:', units);
      
      // Validate required fields
      if (!units.system || !units.length || !units.area || !units.fabric || !units.currency) {
        toast.error("All measurement unit fields are required");
        return;
      }

      const measurementUnitsJson = JSON.stringify(units);
      console.log('Measurement units JSON:', measurementUnitsJson);
      
      if (businessSettings) {
        console.log('Updating existing business settings with ID:', businessSettings.id);
        await updateSettings.mutateAsync({
          id: businessSettings.id,
          measurement_units: measurementUnitsJson
        });
      } else {
        console.log('Creating new business settings');
        await createSettings.mutateAsync({
          measurement_units: measurementUnitsJson
        });
      }
      
      toast.success("Measurement units updated successfully");
    } catch (error) {
      console.error("Failed to save measurement units:", error);
      toast.error(`Failed to save measurement units: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
