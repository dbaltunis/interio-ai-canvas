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
import { Settings2, Percent, Save, RotateCcw, Eye, EyeOff, Shield } from 'lucide-react';
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
        {/* Markup Hierarchy Info */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
          <p className="text-sm font-medium">Markup Priority (highest to lowest):</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="default" className="bg-primary">1. Pricing Grid</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="secondary">2. Category</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="outline">3. Default</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="outline" className="border-destructive text-destructive">4. Minimum (floor)</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Grid markup on a pricing grid overrides everything. If no grid markup, category applies. If no category, default applies. Minimum is always enforced.
          </p>
        </div>

        {/* Default & Minimum Markups */}
        <div className="grid gap-4 md:grid-cols-2">
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
              Applied when no category or grid markup is set
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-markup" className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />
              Minimum Margin (Floor)
            </Label>
            <div className="relative">
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
            <p className="text-xs text-muted-foreground">
              No quote item will ever have markup below this
            </p>
          </div>
        </div>

        <Separator />

        {/* Category Markups */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Category Markups</Label>
            <p className="text-sm text-muted-foreground">
              Override the default markup for specific product categories. Set to 0 to use the default.
            </p>
          </div>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {categories.map(({ key, label }) => {
              const categoryValue = localSettings.category_markups[key] || 0;
              const effectiveMarkup = categoryValue > 0 ? categoryValue : localSettings.default_markup_percentage;
              const usesDefault = categoryValue === 0;
              
              return (
                <div key={key} className="space-y-1.5 p-3 rounded-lg border bg-card">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`cat-${key}`} className="text-sm font-medium">
                      {label}
                    </Label>
                    {usesDefault ? (
                      <Badge variant="outline" className="text-xs">Uses Default</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Custom</Badge>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id={`cat-${key}`}
                      type="number"
                      min="0"
                      max="500"
                      step="0.5"
                      value={categoryValue}
                      onChange={(e) => handleCategoryChange(key, parseFloat(e.target.value) || 0)}
                      className="pr-8 h-9"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Effective: <span className="font-medium">{effectiveMarkup}%</span>
                  </p>
                </div>
              );
            })}
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
