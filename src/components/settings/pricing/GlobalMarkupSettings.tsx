/**
 * Global Markup Settings Component
 * Allows configuration of markup percentages at different levels
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings2, Percent, Save, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useMarkupSettings, useUpdateMarkupSettings, MarkupSettings, defaultMarkupSettings } from '@/hooks/useMarkupSettings';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const GlobalMarkupSettings: React.FC = () => {
  const { data: markupSettings, isLoading } = useMarkupSettings();
  const updateMarkupSettings = useUpdateMarkupSettings();
  
  const [localSettings, setLocalSettings] = React.useState<MarkupSettings>(defaultMarkupSettings);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Sync with fetched settings
  React.useEffect(() => {
    if (markupSettings) {
      setLocalSettings(markupSettings);
      setHasChanges(false);
    }
  }, [markupSettings]);

  const handleChange = (key: keyof MarkupSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleCategoryChange = (category: string, value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      category_markups: {
        ...prev.category_markups,
        [category]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateMarkupSettings.mutateAsync(localSettings);
      setHasChanges(false);
      toast.success('Markup settings saved');
    } catch (error) {
      console.error('Failed to save markup settings:', error);
      toast.error('Failed to save markup settings');
    }
  };

  const handleReset = () => {
    if (markupSettings) {
      setLocalSettings(markupSettings);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categories = [
    { key: 'fabric', label: 'Fabric' },
    { key: 'blinds', label: 'Blinds' },
    { key: 'curtains', label: 'Curtains' },
    { key: 'shutters', label: 'Shutters' },
    { key: 'hardware', label: 'Hardware' },
    { key: 'installation', label: 'Installation/Services' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Global Markup Settings
            </CardTitle>
            <CardDescription>
              Configure default markup percentages. These apply when no product or grid-specific markup is set.
            </CardDescription>
          </div>
          {hasChanges && (
            <Badge variant="secondary" className="animate-pulse">
              Unsaved changes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Markups */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="default-markup" className="flex items-center gap-2">
              <Percent className="h-3.5 w-3.5" />
              Default Markup
            </Label>
            <div className="relative">
              <Input
                id="default-markup"
                type="number"
                min="0"
                max="500"
                step="0.5"
                value={localSettings.default_markup_percentage}
                onChange={(e) => handleChange('default_markup_percentage', parseFloat(e.target.value) || 0)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Applied when no category markup is set
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="material-markup">Material Markup</Label>
            <div className="relative">
              <Input
                id="material-markup"
                type="number"
                min="0"
                max="500"
                step="0.5"
                value={localSettings.material_markup_percentage}
                onChange={(e) => handleChange('material_markup_percentage', parseFloat(e.target.value) || 0)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Default for physical products
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="labor-markup">Labor Markup</Label>
            <div className="relative">
              <Input
                id="labor-markup"
                type="number"
                min="0"
                max="500"
                step="0.5"
                value={localSettings.labor_markup_percentage}
                onChange={(e) => handleChange('labor_markup_percentage', parseFloat(e.target.value) || 0)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Default for services/installation
            </p>
          </div>
        </div>

        <Separator />

        {/* Category Markups */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Category-Specific Markups</Label>
          <p className="text-sm text-muted-foreground">
            Override the default markup for specific product categories
          </p>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {categories.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <Label htmlFor={`cat-${key}`} className="min-w-24 text-sm">
                  {label}
                </Label>
                <div className="relative flex-1">
                  <Input
                    id={`cat-${key}`}
                    type="number"
                    min="0"
                    max="500"
                    step="0.5"
                    value={localSettings.category_markups[key] || 0}
                    onChange={(e) => handleCategoryChange(key, parseFloat(e.target.value) || 0)}
                    className="pr-8 h-9"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Minimum Markup */}
        <div className="space-y-2">
          <Label htmlFor="min-markup">Minimum Markup</Label>
          <div className="flex items-center gap-4">
            <div className="relative w-32">
              <Input
                id="min-markup"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={localSettings.minimum_markup_percentage}
                onChange={(e) => handleChange('minimum_markup_percentage', parseFloat(e.target.value) || 0)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                %
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Enforced floor - no quote item will have markup below this percentage
            </p>
          </div>
        </div>

        <Separator />

        {/* Staff Visibility */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            {localSettings.show_markup_to_staff ? (
              <Eye className="h-5 w-5 text-muted-foreground" />
            ) : (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <Label htmlFor="show-to-staff" className="font-medium">
                Show Profit to Staff
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow staff members to see cost prices and profit margins
              </p>
            </div>
          </div>
          <Switch
            id="show-to-staff"
            checked={localSettings.show_markup_to_staff}
            onCheckedChange={(checked) => handleChange('show_markup_to_staff', checked)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateMarkupSettings.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMarkupSettings.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalMarkupSettings;
