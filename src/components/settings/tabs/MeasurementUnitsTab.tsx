
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { UnitSelector } from "./measurement-units/UnitSelector";
import { MeasurementPreview } from "./measurement-units/MeasurementPreview";
import { useMeasurementUnitsForm } from "./measurement-units/useMeasurementUnitsForm";
import { 
  metricLengthOptions, 
  imperialLengthOptions, 
  metricAreaOptions, 
  imperialAreaOptions, 
  metricFabricOptions, 
  imperialFabricOptions,
  currencyOptions
} from "./measurement-units/MeasurementUnitOptions";
import { SettingsInheritanceInfo } from "../SettingsInheritanceInfo";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

export const MeasurementUnitsTab = () => {
  const {
    units,
    isLoading,
    isSaving,
    handleSystemChange,
    handleUnitChange,
    handleSave
  } = useMeasurementUnitsForm();
  
  const { data: profile } = useCurrentUserProfile();
  const { data: businessSettings } = useBusinessSettings();
  
  const isTeamMember = profile?.parent_account_id && profile.parent_account_id !== profile.user_id;
  const isInheritingSettings = isTeamMember && businessSettings?.user_id !== profile?.user_id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading measurement units...</div>
      </div>
    );
  }

  const lengthOptions = units.system === 'metric' ? metricLengthOptions : imperialLengthOptions;
  const areaOptions = units.system === 'metric' ? metricAreaOptions : imperialAreaOptions;
  const fabricOptions = units.system === 'metric' ? metricFabricOptions : imperialFabricOptions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Measurement Units</h3>
          <p className="text-sm text-brand-neutral">Configure your preferred measurement units and currency</p>
        </div>
      </div>

      <SettingsInheritanceInfo 
        settingsType="measurement units" 
        isInheriting={isInheritingSettings}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-brand-primary" />
            Unit System
          </CardTitle>
          <CardDescription>Choose your preferred measurement system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup 
            value={units.system} 
            onValueChange={(value: 'metric' | 'imperial') => handleSystemChange(value)}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="metric" id="metric" />
              <Label htmlFor="metric">Metric System</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="imperial" id="imperial" />
              <Label htmlFor="imperial">Imperial System</Label>
            </div>
          </RadioGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UnitSelector
              id="length"
              label="Length Units"
              value={units.length}
              options={lengthOptions}
              onValueChange={(value) => handleUnitChange('length', value)}
            />

            <UnitSelector
              id="area"
              label="Area Units"
              value={units.area}
              options={areaOptions}
              onValueChange={(value) => handleUnitChange('area', value)}
            />

            <UnitSelector
              id="fabric"
              label="Fabric Units"
              value={units.fabric}
              options={fabricOptions}
              onValueChange={(value) => handleUnitChange('fabric', value)}
            />

            <UnitSelector
              id="currency"
              label="Currency"
              value={units.currency}
              options={currencyOptions}
              onValueChange={(value) => handleUnitChange('currency', value)}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <MeasurementPreview units={units} />
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
