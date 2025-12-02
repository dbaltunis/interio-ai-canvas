import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  { id: 'curtains', label: 'Curtains', icon: '🪟', pricingOptions: ['per_linear_meter', 'per_width', 'per_drop', 'flat'] },
  { id: 'roman_blinds', label: 'Roman Blinds', icon: '📐', pricingOptions: ['per_linear_meter', 'per_width', 'per_drop', 'flat'] },
  { id: 'roller_blinds', label: 'Roller Blinds', icon: '🔲', pricingOptions: ['grid', 'flat'] },
  { id: 'venetian_blinds', label: 'Venetian Blinds', icon: '📊', pricingOptions: ['grid', 'flat'] },
  { id: 'cellular_blinds', label: 'Cellular / Honeycomb', icon: '🐝', pricingOptions: ['grid', 'flat'] },
  { id: 'vertical_blinds', label: 'Vertical Blinds', icon: '📏', pricingOptions: ['grid', 'flat'] },
  { id: 'shutters', label: 'Shutters', icon: '🚪', pricingOptions: ['grid', 'flat'] },
  { id: 'awning', label: 'Awnings', icon: '⛱️', pricingOptions: ['grid', 'flat'] },
  { id: 'panel_glide', label: 'Panel Glide', icon: '🎚️', pricingOptions: ['grid', 'flat'] },
  { id: 'wallpaper', label: 'Wallpaper', icon: '🎨', pricingOptions: ['per_linear_meter', 'flat'] },
];

const PRICING_METHOD_LABELS: Record<string, string> = {
  grid: 'Pricing Grid',
  flat: 'Flat Price',
  per_linear_meter: 'Per Linear Meter',
  per_width: 'Per Width',
  per_drop: 'Per Drop',
};

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
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {WINDOW_COVERING_TYPES.map((type) => {
            const isEnabled = windowCoverings[type.id as keyof typeof windowCoverings] || false;
            const defaultPricing = type.pricingOptions[0];
            
            return (
              <div
                key={type.id}
                className={`border rounded-lg p-4 transition-colors ${
                  isEnabled ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    id={type.id}
                    checked={isEnabled as boolean}
                    onCheckedChange={(checked) => handleToggle(type.id, checked as boolean)}
                  />
                  <span className="text-xl">{type.icon}</span>
                  <Label htmlFor={type.id} className="font-medium cursor-pointer flex-1">
                    {type.label}
                  </Label>
                  
                  {isEnabled && (
                    <Select
                      value={pricingMethods[type.id] || defaultPricing}
                      onValueChange={(value) => handlePricingMethodChange(type.id, value)}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {type.pricingOptions.map((method) => (
                          <SelectItem key={method} value={method}>
                            {PRICING_METHOD_LABELS[method]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
