
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ruler, Save } from "lucide-react";
import { useBusinessSettings, useUpdateBusinessSettings, useCreateBusinessSettings, type MeasurementUnits, defaultMeasurementUnits } from "@/hooks/useBusinessSettings";
import { useToast } from "@/hooks/use-toast";

export const MeasurementUnitsTab = () => {
  const { data: businessSettings } = useBusinessSettings();
  const updateSettings = useUpdateBusinessSettings();
  const createSettings = useCreateBusinessSettings();
  const { toast } = useToast();

  const currentUnits: MeasurementUnits = (businessSettings as any)?.measurement_units ? 
    JSON.parse((businessSettings as any).measurement_units) : defaultMeasurementUnits;

  const [units, setUnits] = useState<MeasurementUnits>(currentUnits);

  const metricLengthOptions = [
    { value: 'mm', label: 'Millimeters (mm)' },
    { value: 'cm', label: 'Centimeters (cm)' },
    { value: 'm', label: 'Meters (m)' }
  ];

  const imperialLengthOptions = [
    { value: 'inches', label: 'Inches (")' },
    { value: 'feet', label: 'Feet (\')' }
  ];

  const metricAreaOptions = [
    { value: 'sq_mm', label: 'Square Millimeters (mm²)' },
    { value: 'sq_cm', label: 'Square Centimeters (cm²)' },
    { value: 'sq_m', label: 'Square Meters (m²)' }
  ];

  const imperialAreaOptions = [
    { value: 'sq_inches', label: 'Square Inches (in²)' },
    { value: 'sq_feet', label: 'Square Feet (ft²)' }
  ];

  const metricFabricOptions = [
    { value: 'cm', label: 'Centimeters (cm)' },
    { value: 'm', label: 'Meters (m)' }
  ];

  const imperialFabricOptions = [
    { value: 'inches', label: 'Inches (")' },
    { value: 'yards', label: 'Yards (yd)' }
  ];

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

  const lengthOptions = units.system === 'metric' ? metricLengthOptions : imperialLengthOptions;
  const areaOptions = units.system === 'metric' ? metricAreaOptions : imperialAreaOptions;
  const fabricOptions = units.system === 'metric' ? metricFabricOptions : imperialFabricOptions;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Measurement Units
          </CardTitle>
          <CardDescription>
            Configure how measurements are displayed throughout the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Selection */}
          <div className="space-y-2">
            <Label htmlFor="system">Measurement System</Label>
            <Select 
              value={units.system} 
              onValueChange={handleSystemChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric System</SelectItem>
                <SelectItem value="imperial">Imperial System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Length Units */}
          <div className="space-y-2">
            <Label htmlFor="length">Length Measurements</Label>
            <Select 
              value={units.length} 
              onValueChange={(value) => setUnits({ ...units, length: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lengthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Area Units */}
          <div className="space-y-2">
            <Label htmlFor="area">Area Measurements</Label>
            <Select 
              value={units.area} 
              onValueChange={(value) => setUnits({ ...units, area: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {areaOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fabric Units */}
          <div className="space-y-2">
            <Label htmlFor="fabric">Fabric Measurements</Label>
            <Select 
              value={units.fabric} 
              onValueChange={(value) => setUnits({ ...units, fabric: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fabricOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Preview</h4>
            <div className="text-sm space-y-1">
              <p>Length: 150 {units.length === 'mm' ? 'mm' : units.length === 'cm' ? 'cm' : units.length === 'm' ? 'm' : units.length === 'inches' ? '"' : "'"}</p>
              <p>Area: 2.5 {units.area === 'sq_mm' ? 'mm²' : units.area === 'sq_cm' ? 'cm²' : units.area === 'sq_m' ? 'm²' : units.area === 'sq_inches' ? 'in²' : 'ft²'}</p>
              <p>Fabric: 3.5 {units.fabric === 'cm' ? 'cm' : units.fabric === 'm' ? 'm' : units.fabric === 'inches' ? '"' : 'yd'}</p>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Measurement Units
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
