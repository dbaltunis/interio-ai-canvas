
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Percent, Shield, Receipt, Grid3X3, BarChart3, Search } from "lucide-react";
import { PricingRulesSection } from "../pricing/PricingRulesSection";
import { PricingGridManager } from "../pricing-grids/PricingGridManager";
import { PricingOverviewDashboard } from "../pricing-grids/PricingOverviewDashboard";
import { PricingGridDiagnostic } from "../pricing-grids/PricingGridDiagnostic";
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
    return <div className="flex items-center justify-center py-12">
      <div className="text-muted-foreground">Loading pricing settings...</div>
    </div>;
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
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-muted-foreground">No pricing settings found.</div>
        <div className="text-sm text-muted-foreground">
          Visit the <strong>Business Settings</strong> tab first to initialize your account settings.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsInheritanceInfo 
        settingsType="pricing and markup" 
        isInheriting={isInheritingSettings}
      />
      
      {/* Tabs for Pricing Overview, Grids, Diagnostic, and Markup/Tax */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="grids" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Upload Grids
          </TabsTrigger>
          <TabsTrigger value="diagnostic" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Diagnostic
          </TabsTrigger>
          <TabsTrigger value="markup" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Markup & Tax
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PricingOverviewDashboard />
        </TabsContent>

        <TabsContent value="grids">
          <PricingGridManager />
        </TabsContent>

        <TabsContent value="diagnostic">
          <PricingGridDiagnostic />
        </TabsContent>

        <TabsContent value="markup" className="space-y-6">
      
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
          <CardDescription>Base settings that apply when no grid or category markup is set</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hierarchy Info */}
          <div className="rounded-lg border bg-muted/30 p-3 text-xs">
            <span className="font-medium">Priority:</span>{' '}
            <span className="text-primary font-medium">Grid Markup</span> → Category → Default → Minimum (floor)
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
              <Input 
                id="defaultMarkup" 
                type="number" 
                step="0.1" 
                value={formData.default_markup_percentage}
                onChange={(e) => setFormData(prev => prev ? {...prev, default_markup_percentage: Number(e.target.value)} : null)}
              />
              <p className="text-xs text-muted-foreground mt-1">Applied when no category markup is set</p>
            </div>
            <div>
              <Label htmlFor="minimumMargin">Minimum Margin (Floor) (%)</Label>
              <Input 
                id="minimumMargin" 
                type="number" 
                step="0.1" 
                value={formData.minimum_markup_percentage}
                onChange={(e) => setFormData(prev => prev ? {...prev, minimum_markup_percentage: Number(e.target.value)} : null)}
              />
              <p className="text-xs text-muted-foreground mt-1">No item will ever have markup below this</p>
            </div>
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

      {/* Pricing Rules Management - Hidden (not fully functional) */}
      {false && <PricingRulesSection />}

      {/* Category-Specific Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-brand-primary" />
            Category-Specific Markup
          </CardTitle>
          <CardDescription>Override default markup for specific categories. Set to 0 to use the default.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Show effective markup indicators */}
            {[
              { id: 'curtainMarkup', label: 'Curtains & Drapes', key: 'curtains' },
              { id: 'blindMarkup', label: 'Blinds', key: 'blinds' },
              { id: 'shutterMarkup', label: 'Shutters', key: 'shutters' },
              { id: 'hardwareMarkup', label: 'Hardware', key: 'hardware' },
              { id: 'fabricMarkup', label: 'Fabrics', key: 'fabric' },
              { id: 'installationMarkup', label: 'Installation/Labor', key: 'installation' }
            ].map(({ id, label, key }) => {
              const value = formData.category_markups[key] || 0;
              const effective = value > 0 ? value : formData.default_markup_percentage;
              const usesDefault = value === 0;
              return (
                <div key={id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={id}>{label} (%)</Label>
                    <span className="text-xs text-muted-foreground">
                      {usesDefault ? `→ Uses Default (${effective}%)` : `→ ${effective}%`}
                    </span>
                  </div>
                  <Input 
                    id={id} 
                    type="number" 
                    step="0.1" 
                    value={value}
                    placeholder="0"
                    onChange={(e) => setFormData(prev => prev ? {
                      ...prev, 
                      category_markups: {...prev.category_markups, [key]: Number(e.target.value)}
                    } : null)}
                  />
                </div>
              );
            })}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
