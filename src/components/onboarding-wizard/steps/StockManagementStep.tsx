import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Package } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';

interface StepProps {
  data: OnboardingData;
  updateSection: (section: keyof OnboardingData, data: any) => void;
  isSaving: boolean;
}

export const StockManagementStep = ({ data, updateSection }: StepProps) => {
  const settings = data.stock_management || {};

  const handleChange = (field: string, value: any) => {
    updateSection('stock_management', { ...settings, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Stock Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label className="font-medium">Track Inventory</Label>
            <p className="text-sm text-muted-foreground">
              Enable stock level tracking
            </p>
          </div>
          <Switch
            checked={settings.track_inventory || false}
            onCheckedChange={(checked) => handleChange('track_inventory', checked)}
          />
        </div>

        {settings.track_inventory && (
          <div className="space-y-2">
            <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
            <div className="flex items-center gap-2 max-w-xs">
              <Input
                id="low_stock_threshold"
                type="number"
                min="0"
                value={settings.low_stock_threshold || 5}
                onChange={(e) => handleChange('low_stock_threshold', parseInt(e.target.value) || 5)}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">units</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
