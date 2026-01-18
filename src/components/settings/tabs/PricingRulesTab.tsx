import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Percent, Receipt, Grid3X3, Settings2, Info } from "lucide-react";
import { PricingGridCardDashboard } from "../pricing-grids/PricingGridCardDashboard";
import { PricingGridUploadWizard } from "../pricing-grids/PricingGridUploadWizard";
import { useMarkupSettings, useUpdateMarkupSettings, MarkupSettings } from "@/hooks/useMarkupSettings";
import { useBusinessSettings, useUpdateBusinessSettings } from "@/hooks/useBusinessSettings";
import { useHasPermission } from "@/hooks/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SettingsInheritanceInfo } from "../SettingsInheritanceInfo";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { Shield } from "lucide-react";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";

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
  
  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardProductType, setWizardProductType] = useState<string | undefined>();
  const [wizardPriceGroup, setWizardPriceGroup] = useState<string | undefined>();
  
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
    
    console.log('[SAVE] ====== CATEGORY MARKUP SAVE ======');
    console.log('[SAVE] Full category_markups:', JSON.stringify(formData.category_markups, null, 2));
    console.log('[SAVE] Manufacturing values:', {
      curtain_making: formData.category_markups.curtain_making,
      blind_making: formData.category_markups.blind_making,
      roman_making: formData.category_markups.roman_making,
      shutter_making: formData.category_markups.shutter_making
    });
    
    await updateMarkupSettings.mutateAsync({
      category_markups: formData.category_markups
    });
  };

  const handleSaveTaxSettings = async () => {
    if (!businessSettings?.id) return;
    
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

  const handleAddGrid = (productType?: string, priceGroup?: string) => {
    setWizardProductType(productType);
    setWizardPriceGroup(priceGroup);
    setShowWizard(true);
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    setWizardProductType(undefined);
    setWizardPriceGroup(undefined);
  };

  // Helper: Convert markup % to margin %
  const markupToMargin = (markup: number): number => {
    if (markup <= 0) return 0;
    return (markup / (100 + markup)) * 100;
  };

  // Loading state
  if (canManageSettings === undefined || isLoading || isLoadingBusiness) {
    return <div className="flex items-center justify-center py-12">
      <div className="text-muted-foreground">Loading pricing settings...</div>
    </div>;
  }

  // Permission check
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
      {/* Header with Help */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pricing & Tax</h3>
          <p className="text-sm text-muted-foreground">Configure pricing grids, markup, and tax settings</p>
        </div>
        <SectionHelpButton sectionId="pricing" />
      </div>

      <SettingsInheritanceInfo 
        settingsType="pricing and markup" 
        isInheriting={isInheritingSettings}
      />
      
      {/* 2-Tab Structure: Grids, Settings */}
      <Tabs defaultValue="grids" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grids" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Pricing Grids
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* My Grids Tab */}
        <TabsContent value="grids" className="space-y-4">
          {showWizard ? (
            <PricingGridUploadWizard
              onComplete={handleWizardComplete}
              onCancel={() => setShowWizard(false)}
              initialProductType={wizardProductType}
              initialPriceGroup={wizardPriceGroup}
            />
          ) : (
            <PricingGridCardDashboard onAddGrid={handleAddGrid} />
          )}
        </TabsContent>

        {/* Settings Tab (Markup & Tax) */}
        <TabsContent value="settings" className="space-y-6">
          {/* Markup vs Margin Explainer */}
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-600" />
                Understanding Markup vs Margin
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Markup (what you enter)</p>
                  <p className="text-muted-foreground text-xs">Added to cost price</p>
                  <p className="text-xs mt-1">100% markup = Cost × 2</p>
                </div>
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Margin (for reference)</p>
                  <p className="text-muted-foreground text-xs">% of selling price that is profit</p>
                  <p className="text-xs mt-1">100% markup = 50% margin</p>
                </div>
              </div>
              <div className="mt-3 p-2 bg-background rounded border text-xs">
                <span className="font-medium">Example:</span> £100 cost + 100% markup = £200 selling price (50% margin)
              </div>
            </CardContent>
          </Card>

          {/* Markup Hierarchy Guide */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4 text-primary" />
                How Markup is Applied
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full font-medium text-primary">
                  <Grid3X3 className="h-3.5 w-3.5" />
                  Pricing Grid
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full font-medium">
                  <Percent className="h-3.5 w-3.5" />
                  Category
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full font-medium">
                  <Calculator className="h-3.5 w-3.5" />
                  Default
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full font-medium border-2 border-dashed border-muted-foreground/30">
                  Minimum Floor
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                The system checks each level in order. If a pricing grid has markup set, it uses that. Otherwise, it falls back to category markup, then default, with minimum floor as the absolute lowest.
              </p>
            </CardContent>
          </Card>

          {/* Tax Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
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
              </div>
              
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={handleSaveTaxSettings}
                disabled={updateBusinessSettings.isPending}
              >
                Save Tax Settings
              </Button>
            </CardContent>
          </Card>

          {/* Global Markup Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Global Markup Settings
              </CardTitle>
              <CardDescription>Base settings when no grid or category markup is set</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                className="bg-primary hover:bg-primary/90"
                onClick={handleSaveGlobalSettings}
                disabled={updateMarkupSettings.isPending}
              >
                Save Global Settings
              </Button>
            </CardContent>
          </Card>

          {/* Category-Specific Markup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                Category Markup
              </CardTitle>
              <CardDescription>Override default markup for specific categories (0 = use default)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Categories */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Product Categories</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'curtainMarkup', label: 'Curtains & Drapes', key: 'curtains' },
                    { id: 'blindMarkup', label: 'Blinds', key: 'blinds' },
                    { id: 'shutterMarkup', label: 'Shutters', key: 'shutters' },
                    { id: 'hardwareMarkup', label: 'Hardware', key: 'hardware' },
                    { id: 'fabricMarkup', label: 'Fabrics', key: 'fabric' },
                    { id: 'installationMarkup', label: 'Installation', key: 'installation' }
                  ].map(({ id, label, key }) => {
                    const value = formData.category_markups[key] || 0;
                    const effective = value > 0 ? value : formData.default_markup_percentage;
                    const usesDefault = value === 0;
                    const marginEquiv = markupToMargin(effective);
                    return (
                      <div key={id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={id}>{label}</Label>
                          <span className="text-xs text-muted-foreground">
                            {usesDefault 
                              ? `→ Default (${effective}% markup = ${marginEquiv.toFixed(1)}% margin)` 
                              : `→ ${effective}% markup = ${marginEquiv.toFixed(1)}% margin`}
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
              </div>

              {/* Manufacturing/Sewing Markups */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Manufacturing / Sewing</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'curtainMakingMarkup', label: 'Curtain Making', key: 'curtain_making' },
                    { id: 'romanMakingMarkup', label: 'Roman Blind Making', key: 'roman_making' },
                    { id: 'blindMakingMarkup', label: 'Blind Manufacturing', key: 'blind_making' },
                    { id: 'shutterMakingMarkup', label: 'Shutter Manufacturing', key: 'shutter_making' }
                  ].map(({ id, label, key }) => {
                    const value = formData.category_markups[key] || 0;
                    const effective = value > 0 ? value : formData.default_markup_percentage;
                    const usesDefault = value === 0;
                    const marginEquiv = markupToMargin(effective);
                    return (
                      <div key={id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={id}>{label}</Label>
                          <span className="text-xs text-muted-foreground">
                            {usesDefault 
                              ? `→ Default (${effective}% markup = ${marginEquiv.toFixed(1)}% margin)` 
                              : `→ ${effective}% markup = ${marginEquiv.toFixed(1)}% margin`}
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
              </div>

              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={handleSaveCategorySettings}
                disabled={updateMarkupSettings.isPending}
              >
                Save Category Markup
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
