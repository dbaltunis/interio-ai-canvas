import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Factory, Ruler, Percent } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';

interface StepProps {
  data: OnboardingData;
  updateSection: (section: keyof OnboardingData, data: any) => void;
  isSaving: boolean;
}

export const ManufacturingStep = ({ data, updateSection }: StepProps) => {
  const settings = data.manufacturing_settings || {};
  const windowCoverings = data.window_coverings || {};

  // Check if curtains or roman blinds are enabled
  const showManufacturing = windowCoverings.curtains || windowCoverings.roman_blinds;

  const handleChange = (field: string, value: number) => {
    updateSection('manufacturing_settings', { ...settings, [field]: value });
  };

  if (!showManufacturing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-primary" />
            Manufacturing Settings
          </CardTitle>
          <CardDescription>
            Manufacturing settings are only applicable for Curtains and Roman Blinds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Factory className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No manufacturing settings needed.</p>
            <p className="text-sm mt-2">
              Enable Curtains or Roman Blinds in the previous step to configure manufacturing defaults.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="h-5 w-5 text-primary" />
          Manufacturing Settings
        </CardTitle>
        <CardDescription>
          Set default manufacturing allowances for curtains and roman blinds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hem Allowances */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Ruler className="h-4 w-4" />
            Hem Allowances
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="header_cm">Header Height</Label>
              <div className="relative">
                <Input
                  id="header_cm"
                  type="number"
                  min="0"
                  step="0.5"
                  value={settings.header_cm || 10}
                  onChange={(e) => handleChange('header_cm', parseFloat(e.target.value) || 0)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  cm
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bottom_hem_cm">Bottom Hem</Label>
              <div className="relative">
                <Input
                  id="bottom_hem_cm"
                  type="number"
                  min="0"
                  step="0.5"
                  value={settings.bottom_hem_cm || 15}
                  onChange={(e) => handleChange('bottom_hem_cm', parseFloat(e.target.value) || 0)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  cm
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="side_hems_cm">Side Hems (each)</Label>
              <div className="relative">
                <Input
                  id="side_hems_cm"
                  type="number"
                  min="0"
                  step="0.5"
                  value={settings.side_hems_cm || 3}
                  onChange={(e) => handleChange('side_hems_cm', parseFloat(e.target.value) || 0)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  cm
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Returns & Seams */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Returns & Seams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="returns">Returns</Label>
              <div className="relative">
                <Input
                  id="returns"
                  type="number"
                  min="0"
                  step="0.5"
                  value={settings.returns || 0}
                  onChange={(e) => handleChange('returns', parseFloat(e.target.value) || 0)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  cm
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seams">Seams Allowance</Label>
              <div className="relative">
                <Input
                  id="seams"
                  type="number"
                  min="0"
                  step="0.5"
                  value={settings.seams || 0}
                  onChange={(e) => handleChange('seams', parseFloat(e.target.value) || 0)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  cm
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Waste Percentage */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Percent className="h-4 w-4" />
            Fabric Waste
          </h3>
          <div className="max-w-xs space-y-2">
            <Label htmlFor="waste_percentage">Waste Allowance</Label>
            <div className="relative">
              <Input
                id="waste_percentage"
                type="number"
                min="0"
                max="50"
                step="1"
                value={settings.waste_percentage || 10}
                onChange={(e) => handleChange('waste_percentage', parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Additional fabric allowance for cutting waste
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <strong>Note:</strong> These are default values. They can be overridden per template or per quote.
        </div>
      </CardContent>
    </Card>
  );
};
