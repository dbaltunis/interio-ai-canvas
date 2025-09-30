
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calculator, Percent, Shield } from "lucide-react";
import { PricingRulesSection } from "../pricing/PricingRulesSection";
import { useMarkupSettings, useUpdateMarkupSettings, MarkupSettings } from "@/hooks/useMarkupSettings";
import { useHasPermission } from "@/hooks/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PricingRulesTab = () => {
  const { data: markupSettings, isLoading } = useMarkupSettings();
  const canManageSettings = useHasPermission('manage_settings');
  const updateMarkupSettings = useUpdateMarkupSettings();
  
  const [formData, setFormData] = useState<MarkupSettings | null>(null);

  useEffect(() => {
    if (markupSettings) {
      setFormData(markupSettings);
    }
  }, [markupSettings]);

  const handleSaveGlobalSettings = async () => {
    if (!formData) return;
    
    await updateMarkupSettings.mutateAsync({
      default_markup_percentage: formData.default_markup_percentage,
      labor_markup_percentage: formData.labor_markup_percentage,
      material_markup_percentage: formData.material_markup_percentage,
      minimum_markup_percentage: formData.minimum_markup_percentage,
      dynamic_pricing_enabled: formData.dynamic_pricing_enabled,
      quantity_discounts_enabled: formData.quantity_discounts_enabled,
      show_markup_to_staff: formData.show_markup_to_staff
    });
  };

  const handleSaveCategorySettings = async () => {
    if (!formData) return;
    
    await updateMarkupSettings.mutateAsync({
      category_markups: formData.category_markups
    });
  };

  // Show loading state while permissions or data are being checked
  if (canManageSettings === undefined || isLoading) {
    return <div>Loading pricing settings...</div>;
  }

  // Check permissions after loading is complete
  if (!canManageSettings) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to manage pricing settings. Contact your account owner for access.
        </AlertDescription>
      </Alert>
    );
  }

  if (!formData) {
    return <div>Loading pricing settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Global Pricing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-primary" />
            Global Pricing Settings
          </CardTitle>
          <CardDescription>Base settings that apply to all calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
              <Input 
                id="defaultMarkup" 
                type="number" 
                step="0.1" 
                value={formData.default_markup_percentage}
                onChange={(e) => setFormData(prev => prev ? {...prev, default_markup_percentage: Number(e.target.value)} : null)}
              />
            </div>
            <div>
              <Label htmlFor="laborMarkup">Labor Markup (%)</Label>
              <Input 
                id="laborMarkup" 
                type="number" 
                step="0.1" 
                value={formData.labor_markup_percentage}
                onChange={(e) => setFormData(prev => prev ? {...prev, labor_markup_percentage: Number(e.target.value)} : null)}
              />
            </div>
            <div>
              <Label htmlFor="materialMarkup">Material Markup (%)</Label>
              <Input 
                id="materialMarkup" 
                type="number" 
                step="0.1" 
                value={formData.material_markup_percentage}
                onChange={(e) => setFormData(prev => prev ? {...prev, material_markup_percentage: Number(e.target.value)} : null)}
              />
            </div>
            <div>
              <Label htmlFor="minimumMargin">Minimum Margin (%)</Label>
              <Input 
                id="minimumMargin" 
                type="number" 
                step="0.1" 
                value={formData.minimum_markup_percentage}
                onChange={(e) => setFormData(prev => prev ? {...prev, minimum_markup_percentage: Number(e.target.value)} : null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Dynamic Pricing</h4>
                <p className="text-sm text-brand-neutral">Adjust prices based on market conditions</p>
              </div>
              <Switch 
                checked={formData.dynamic_pricing_enabled}
                onCheckedChange={(checked) => setFormData(prev => prev ? {...prev, dynamic_pricing_enabled: checked} : null)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Quantity Discounts</h4>
                <p className="text-sm text-brand-neutral">Apply automatic bulk discounts</p>
              </div>
              <Switch 
                checked={formData.quantity_discounts_enabled}
                onCheckedChange={(checked) => setFormData(prev => prev ? {...prev, quantity_discounts_enabled: checked} : null)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Show Markup to Staff</h4>
              <p className="text-sm text-brand-neutral">Allow managers and staff to see markup details</p>
            </div>
            <Switch 
              checked={formData.show_markup_to_staff}
              onCheckedChange={(checked) => setFormData(prev => prev ? {...prev, show_markup_to_staff: checked} : null)}
            />
          </div>

          <Button 
            className="bg-brand-primary hover:bg-brand-accent"
            onClick={handleSaveGlobalSettings}
            disabled={updateMarkupSettings.isPending}
          >
            Save Global Settings
          </Button>
        </CardContent>
      </Card>

      {/* Pricing Rules Management */}
      <PricingRulesSection />

      {/* Category-Specific Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-brand-primary" />
            Category-Specific Markup
          </CardTitle>
          <CardDescription>Set different markup rates for product categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="curtainMarkup">Curtains & Drapes (%)</Label>
              <Input 
                id="curtainMarkup" 
                type="number" 
                step="0.1" 
                value={formData.category_markups.curtains}
                onChange={(e) => setFormData(prev => prev ? {
                  ...prev, 
                  category_markups: {...prev.category_markups, curtains: Number(e.target.value)}
                } : null)}
              />
            </div>
            <div>
              <Label htmlFor="blindMarkup">Blinds (%)</Label>
              <Input 
                id="blindMarkup" 
                type="number" 
                step="0.1" 
                value={formData.category_markups.blinds}
                onChange={(e) => setFormData(prev => prev ? {
                  ...prev, 
                  category_markups: {...prev.category_markups, blinds: Number(e.target.value)}
                } : null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shutterMarkup">Shutters (%)</Label>
              <Input 
                id="shutterMarkup" 
                type="number" 
                step="0.1" 
                value={formData.category_markups.shutters}
                onChange={(e) => setFormData(prev => prev ? {
                  ...prev, 
                  category_markups: {...prev.category_markups, shutters: Number(e.target.value)}
                } : null)}
              />
            </div>
            <div>
              <Label htmlFor="hardwareMarkup">Hardware (%)</Label>
              <Input 
                id="hardwareMarkup" 
                type="number" 
                step="0.1" 
                value={formData.category_markups.hardware}
                onChange={(e) => setFormData(prev => prev ? {
                  ...prev, 
                  category_markups: {...prev.category_markups, hardware: Number(e.target.value)}
                } : null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fabricMarkup">Fabrics (%)</Label>
              <Input 
                id="fabricMarkup" 
                type="number" 
                step="0.1" 
                value={formData.category_markups.fabric}
                onChange={(e) => setFormData(prev => prev ? {
                  ...prev, 
                  category_markups: {...prev.category_markups, fabric: Number(e.target.value)}
                } : null)}
              />
            </div>
            <div>
              <Label htmlFor="installationMarkup">Installation (%)</Label>
              <Input 
                id="installationMarkup" 
                type="number" 
                step="0.1" 
                value={formData.category_markups.installation}
                onChange={(e) => setFormData(prev => prev ? {
                  ...prev, 
                  category_markups: {...prev.category_markups, installation: Number(e.target.value)}
                } : null)}
              />
            </div>
          </div>

          <Button 
            className="bg-brand-primary hover:bg-brand-accent"
            onClick={handleSaveCategorySettings}
            disabled={updateMarkupSettings.isPending}
          >
            Save Category Pricing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
