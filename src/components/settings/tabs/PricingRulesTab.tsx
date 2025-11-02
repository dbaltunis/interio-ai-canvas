
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Percent, Shield, Receipt } from "lucide-react";
import { PricingRulesSection } from "../pricing/PricingRulesSection";
import { useMarkupSettings, useUpdateMarkupSettings, MarkupSettings } from "@/hooks/useMarkupSettings";
import { useBusinessSettings, useUpdateBusinessSettings } from "@/hooks/useBusinessSettings";
import { useHasPermission } from "@/hooks/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SettingsInheritanceInfo } from "../SettingsInheritanceInfo";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";

export const PricingRulesTab = () => {
  const { data: markupSettings, isLoading } = useMarkupSettings();
  const { data: businessSettings, isLoading: isLoadingBusiness } = useBusinessSettings();
  const canManageSettings = useHasPermission('manage_settings');
  const updateMarkupSettings = useUpdateMarkupSettings();
  const updateBusinessSettings = useUpdateBusinessSettings();
  const { data: profile } = useCurrentUserProfile();
  
  const [formData, setFormData] = useState<MarkupSettings | null>(null);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [taxType, setTaxType] = useState<'none' | 'vat' | 'gst' | 'sales_tax'>('none');
  const [taxInclusive, setTaxInclusive] = useState<boolean>(false);
  
  const isTeamMember = profile?.parent_account_id && profile.parent_account_id !== profile.user_id;
  const isInheritingSettings = isTeamMember && businessSettings?.user_id !== profile?.user_id;

  useEffect(() => {
    if (markupSettings) {
      setFormData(markupSettings);
    }
  }, [markupSettings]);

  useEffect(() => {
    if (businessSettings) {
      setTaxRate(businessSettings.tax_rate || 0);
      const validTaxType = businessSettings.tax_type || 'none';
      if (['none', 'vat', 'gst', 'sales_tax'].includes(validTaxType)) {
        setTaxType(validTaxType as 'none' | 'vat' | 'gst' | 'sales_tax');
      }
      // Get tax_inclusive from pricing_settings
      const pricingSettings = businessSettings.pricing_settings as any;
      setTaxInclusive(pricingSettings?.tax_inclusive || false);
    }
  }, [businessSettings]);

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

  const handleSaveTaxSettings = async () => {
    if (!businessSettings?.id) return;
    
    // Get current pricing_settings and update tax_inclusive
    const currentPricingSettings = (businessSettings.pricing_settings as any) || {};
    const updatedPricingSettings = {
      ...currentPricingSettings,
      tax_inclusive: taxInclusive
    };
    
    await updateBusinessSettings.mutateAsync({
      id: businessSettings.id,
      tax_rate: taxRate,
      tax_type: taxType,
      pricing_settings: updatedPricingSettings
    });
  };

  // Show loading state while permissions or data are being checked
  if (canManageSettings === undefined || isLoading || isLoadingBusiness) {
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
      <SettingsInheritanceInfo 
        settingsType="pricing and markup" 
        isInheriting={isInheritingSettings}
      />
      
      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-brand-primary" />
            Tax Settings
          </CardTitle>
          <CardDescription>Configure tax type and rate for quotes and invoices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxType">Tax Type</Label>
              <Select value={taxType} onValueChange={(value) => setTaxType(value as 'none' | 'vat' | 'gst' | 'sales_tax')}>
                <SelectTrigger id="taxType">
                  <SelectValue placeholder="Select tax type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Tax</SelectItem>
                  <SelectItem value="vat">VAT (Value Added Tax)</SelectItem>
                  <SelectItem value="gst">GST (Goods & Services Tax)</SelectItem>
                  <SelectItem value="sales_tax">Sales Tax</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input 
                id="taxRate" 
                type="number" 
                step="0.1" 
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                placeholder="e.g., 20 for 20%"
              />
            </div>
          </div>
          
          <div className="rounded-lg border-2 p-4 bg-muted/30" style={{ borderColor: taxInclusive ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="space-y-1">
                <Label htmlFor="taxInclusive" className="text-base font-semibold cursor-pointer">
                  Tax Inclusive Pricing
                </Label>
                <p className="text-sm text-muted-foreground font-normal">
                  {taxInclusive 
                    ? "✓ Prices include tax - Tax is already included in displayed prices" 
                    : "✗ Prices exclude tax - Tax will be added to displayed prices"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {taxInclusive ? "ON" : "OFF"}
                </span>
                <Switch 
                  id="taxInclusive"
                  checked={taxInclusive}
                  onCheckedChange={setTaxInclusive}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-background/50 rounded p-2 space-y-2">
              <div>
                <strong>Example:</strong> If you set a price of $100 and tax is 20%:
                <ul className="mt-1 ml-4 list-disc">
                  <li><strong>Inclusive ON:</strong> Customer pays $100 total (includes $16.67 tax)</li>
                  <li><strong>Inclusive OFF:</strong> Customer pays $120 total ($100 + $20 tax)</li>
                </ul>
              </div>
              <div className="border-t pt-2">
                <strong>Note:</strong> Existing projects and quotes will automatically recalculate with the new setting when you make any changes to them (e.g., add/edit treatments, update measurements).
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Common rates: Australia/NZ GST = 10-15%, UK VAT = 20%, EU VAT = 15-27%
          </p>
          <Button 
            className="bg-brand-primary hover:bg-brand-accent"
            onClick={handleSaveTaxSettings}
            disabled={updateBusinessSettings.isPending}
          >
            Save Tax Settings
          </Button>
        </CardContent>
      </Card>

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
