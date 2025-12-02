import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Blinds } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';

interface StepProps {
  data: OnboardingData;
  updateSection: (section: keyof OnboardingData, data: any) => void;
  isSaving: boolean;
}

const WINDOW_COVERING_TYPES = [
  { id: 'curtains', label: 'Curtains', icon: '🪟', hasPricingMethod: true },
  { id: 'roman_blinds', label: 'Roman Blinds', icon: '📐', hasPricingMethod: true },
  { id: 'roller_blinds', label: 'Roller Blinds', icon: '🔲', hasPricingMethod: true },
  { id: 'venetian_blinds', label: 'Venetian Blinds', icon: '📊', hasPricingMethod: true },
  { id: 'cellular_blinds', label: 'Cellular / Honeycomb', icon: '🐝', hasPricingMethod: true },
  { id: 'vertical_blinds', label: 'Vertical Blinds', icon: '📏', hasPricingMethod: true },
  { id: 'shutters', label: 'Shutters', icon: '🚪', hasPricingMethod: true },
  { id: 'awnings', label: 'Awnings', icon: '⛱️', hasPricingMethod: true },
];

const PRICING_METHODS = [
  { value: 'grid', label: 'Pricing Grid' },
  { value: 'per_meter', label: 'Per Linear Meter' },
  { value: 'per_sqm', label: 'Per Square Meter' },
  { value: 'fixed', label: 'Fixed Price' },
];

export const WindowCoveringsStep = ({ data, updateSection }: StepProps) => {
  const windowCoverings = data.window_coverings || {};
  const pricingMethods = windowCoverings.pricing_methods || {};

  const handleToggle = (id: string, checked: boolean) => {
    updateSection('window_coverings', { ...windowCoverings, [id]: checked });
  };

  const handlePricingMethodChange = (id: string, method: string) => {
    updateSection('window_coverings', {
      ...windowCoverings,
      pricing_methods: { ...pricingMethods, [id]: method },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Blinds className="h-5 w-5 text-primary" />
          Window Covering Types
        </CardTitle>
        <CardDescription>
          Select the window treatments you offer and their pricing methods.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {WINDOW_COVERING_TYPES.map((type) => {
            const isEnabled = windowCoverings[type.id as keyof typeof windowCoverings] || false;
            
            return (
              <div
                key={type.id}
                className={`border rounded-lg p-4 transition-colors ${
                  isEnabled ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    id={type.id}
                    checked={isEnabled as boolean}
                    onCheckedChange={(checked) => handleToggle(type.id, checked as boolean)}
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{type.icon}</span>
                      <Label htmlFor={type.id} className="font-medium cursor-pointer">
                        {type.label}
                      </Label>
                    </div>
                    
                    {isEnabled && type.hasPricingMethod && (
                      <div className="flex items-center gap-3 pt-2">
                        <Label className="text-sm text-muted-foreground whitespace-nowrap">
                          Pricing Method:
                        </Label>
                        <Select
                          value={pricingMethods[type.id] || 'grid'}
                          onValueChange={(value) => handlePricingMethodChange(type.id, value)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRICING_METHODS.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <strong>Tip:</strong> You can enable/disable window covering types later in Settings → Templates.
        </div>
      </CardContent>
    </Card>
  );
};
