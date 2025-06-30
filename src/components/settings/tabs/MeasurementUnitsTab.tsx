
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ruler, Save } from "lucide-react";
import { useMeasurementUnitsForm } from "./measurement-units/useMeasurementUnitsForm";
import { UnitSelector } from "./measurement-units/UnitSelector";
import { MeasurementPreview } from "./measurement-units/MeasurementPreview";
import {
  metricLengthOptions,
  imperialLengthOptions,
  metricAreaOptions,
  imperialAreaOptions,
  metricFabricOptions,
  imperialFabricOptions
} from "./measurement-units/MeasurementUnitOptions";

export const MeasurementUnitsTab = () => {
  const { units, setUnits, handleSystemChange, handleSave } = useMeasurementUnitsForm();

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
          <UnitSelector
            id="system"
            label="Measurement System"
            value={units.system}
            options={[
              { value: 'metric', label: 'Metric System' },
              { value: 'imperial', label: 'Imperial System' }
            ]}
            onValueChange={handleSystemChange}
          />

          {/* Length Units */}
          <UnitSelector
            id="length"
            label="Length Measurements"
            value={units.length}
            options={lengthOptions}
            onValueChange={(value) => setUnits({ ...units, length: value as any })}
          />

          {/* Area Units */}
          <UnitSelector
            id="area"
            label="Area Measurements"
            value={units.area}
            options={areaOptions}
            onValueChange={(value) => setUnits({ ...units, area: value as any })}
          />

          {/* Fabric Units */}
          <UnitSelector
            id="fabric"
            label="Fabric Measurements"
            value={units.fabric}
            options={fabricOptions}
            onValueChange={(value) => setUnits({ ...units, fabric: value as any })}
          />

          {/* Preview */}
          <MeasurementPreview units={units} />

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Measurement Units
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
