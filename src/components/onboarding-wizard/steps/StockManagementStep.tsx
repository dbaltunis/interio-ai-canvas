import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Warehouse, Plus, Trash2 } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';

interface StepProps {
  data: OnboardingData;
  updateSection: (section: keyof OnboardingData, data: any) => void;
  isSaving: boolean;
}

const DEFAULT_COLORS = [
  '#22c55e', // green
  '#eab308', // yellow
  '#ef4444', // red
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f97316', // orange
];

export const StockManagementStep = ({ data, updateSection }: StepProps) => {
  const settings = data.stock_management || { track_inventory: true, low_stock_threshold: 5, custom_statuses: [] };

  const handleChange = (field: string, value: any) => {
    updateSection('stock_management', { ...settings, [field]: value });
  };

  const addStatus = () => {
    const newStatus = { name: '', color: DEFAULT_COLORS[settings.custom_statuses?.length || 0] || '#6b7280' };
    handleChange('custom_statuses', [...(settings.custom_statuses || []), newStatus]);
  };

  const updateStatus = (index: number, field: string, value: string) => {
    const updated = [...(settings.custom_statuses || [])];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('custom_statuses', updated);
  };

  const removeStatus = (index: number) => {
    const updated = (settings.custom_statuses || []).filter((_, i) => i !== index);
    handleChange('custom_statuses', updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Warehouse className="h-5 w-5 text-primary" />
          Stock Management
        </CardTitle>
        <CardDescription>
          Configure inventory tracking and stock level alerts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Track Inventory Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label className="font-medium">Track Inventory Levels</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Enable to track stock quantities and receive low stock alerts
            </p>
          </div>
          <Switch
            checked={settings.track_inventory !== false}
            onCheckedChange={(checked) => handleChange('track_inventory', checked)}
          />
        </div>

        {settings.track_inventory !== false && (
          <>
            {/* Low Stock Threshold */}
            <div className="space-y-2">
              <Label htmlFor="low_stock">Low Stock Threshold</Label>
              <div className="flex items-center gap-2 max-w-xs">
                <Input
                  id="low_stock"
                  type="number"
                  min="0"
                  value={settings.low_stock_threshold || 5}
                  onChange={(e) => handleChange('low_stock_threshold', parseInt(e.target.value) || 0)}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">units</span>
              </div>
              <p className="text-xs text-muted-foreground">
                You'll receive alerts when stock falls below this level
              </p>
            </div>

            {/* Custom Statuses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Custom Stock Statuses</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define custom status labels for your inventory
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addStatus}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Status
                </Button>
              </div>

              {settings.custom_statuses && settings.custom_statuses.length > 0 && (
                <div className="space-y-2">
                  {settings.custom_statuses.map((status, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <input
                        type="color"
                        value={status.color}
                        onChange={(e) => updateStatus(index, 'color', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border-0"
                      />
                      <Input
                        placeholder="Status name (e.g., On Order)"
                        value={status.name}
                        onChange={(e) => updateStatus(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStatus(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <strong>Tip:</strong> Common statuses include "In Stock", "Low Stock", "On Order", "Discontinued", "Back Order".
        </div>
      </CardContent>
    </Card>
  );
};
