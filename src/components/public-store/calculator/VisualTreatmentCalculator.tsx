import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calculator, Ruler, Package, Sparkles, Eye } from "lucide-react";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useWindowCoveringOptions } from "@/hooks/useWindowCoveringOptions";
import { useFabricCalculation } from "@/components/job-creation/treatment-pricing/useFabricCalculation";
import { useTreatmentFormData } from "@/components/job-creation/treatment-pricing/useTreatmentFormData";
import { useTreatmentTypes } from "@/hooks/useTreatmentTypes";
import { MeasurementVisualCore } from "@/components/shared/measurement-visual/MeasurementVisualCore";
import { formatCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";
import { WindowCoveringOptionsCard } from "@/components/job-creation/treatment-pricing/WindowCoveringOptionsCard";
import { StoreQuoteRequestForm } from "./StoreQuoteRequestForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { calculateWallpaperCost } from "@/utils/wallpaperCalculations";

interface VisualTreatmentCalculatorProps {
  storeData: any;
  onSubmitQuote: (quoteData: any) => void;
  onAddToCart?: (configuration: Record<string, any>, estimatedPrice: number) => void;
}

export const VisualTreatmentCalculator = ({ 
  storeData, 
  onSubmitQuote, 
  onAddToCart 
}: VisualTreatmentCalculatorProps) => {
  const [activeStep, setActiveStep] = useState("template");
  const [selectedCategory, setSelectedCategory] = useState<"curtains" | "blinds" | "shutters" | "wallpaper">("curtains");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedFabric, setSelectedFabric] = useState<any>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [wallpaperMeasurements, setWallpaperMeasurements] = useState({ wall_width: '', wall_height: '' });

  // Fetch all templates and inventory
  const { data: allTemplates = [] } = useCurtainTemplates();
  const { data: inventoryData = [] } = useEnhancedInventory();

  // Filter templates by category
  const templates = useMemo(() => {
    if (selectedCategory === 'wallpaper') return [];
    return allTemplates.filter(t => 
      t.treatment_category?.toLowerCase() === selectedCategory ||
      (selectedCategory === 'curtains' && !t.treatment_category)
    );
  }, [allTemplates, selectedCategory]);

  // Filter fabrics/materials by category
  const materials = useMemo(() => {
    const categoryMap: Record<string, string[]> = {
      curtains: ['fabric'],
      blinds: ['roller_fabric', 'fabric'],
      shutters: ['shutter_material'],
      wallpaper: ['wallcovering']
    };
    
    const validCategories = categoryMap[selectedCategory] || [];
    return inventoryData.filter(item => 
      validCategories.includes(item.category?.toLowerCase() || '')
    );
  }, [inventoryData, selectedCategory]);

  // Initialize form data
  const { formData, handleInputChange } = useTreatmentFormData(selectedCategory, {
    id: selectedTemplate?.id,
    name: selectedTemplate?.name,
    curtain_type: selectedTemplate?.curtain_type || selectedCategory,
    treatment_category: selectedTemplate?.treatment_category,
    pricing_type: selectedTemplate?.pricing_type,
    pricing_grid_data: selectedTemplate?.pricing_grid_data,
    fabric_details: selectedFabric ? {
      id: selectedFabric.id,
      name: selectedFabric.name,
      unit_price: selectedFabric.unit_price,
      selling_price: selectedFabric.selling_price,
      price_per_meter: selectedFabric.price_per_meter,
      fabric_width: selectedFabric.fabric_width || 137,
      pricing_grid_data: selectedFabric.pricing_grid_data,
      price_group: selectedFabric.price_group,
      product_category: selectedFabric.product_category,
    } : undefined
  });

  // Fetch options for selected template
  const { options, hierarchicalOptions, isLoading: optionsLoading } = useWindowCoveringOptions(selectedTemplate?.id);
  const { data: treatmentTypesData } = useTreatmentTypes();

  // Calculate fabric and costs
  const { calculateFabricUsage, calculateCosts } = useFabricCalculation(
    formData,
    options,
    treatmentTypesData,
    selectedCategory,
    hierarchicalOptions
  );

  const fabricUsage = selectedTemplate ? calculateFabricUsage() : null;
  const costs = selectedTemplate ? calculateCosts() : null;

  // Wallpaper calculations
  const wallpaperCosts = useMemo(() => {
    if (selectedCategory !== 'wallpaper' || !selectedFabric || !wallpaperMeasurements.wall_width || !wallpaperMeasurements.wall_height) {
      return null;
    }

    return calculateWallpaperCost(
      parseFloat(wallpaperMeasurements.wall_width) || 0,
      parseFloat(wallpaperMeasurements.wall_height) || 0,
      selectedFabric
    );
  }, [selectedCategory, selectedFabric, wallpaperMeasurements.wall_width, wallpaperMeasurements.wall_height]);

  const treatmentData = useMemo(() => {
    if (!selectedTemplate || !selectedFabric) return undefined;
    
    return {
      template: {
        ...selectedTemplate,
        id: selectedTemplate.id,
        name: selectedTemplate.name,
        curtain_type: selectedTemplate.curtain_type,
        fullness_ratio: selectedTemplate.fullness_ratio,
        header_allowance: selectedTemplate.header_allowance,
        bottom_hem: selectedTemplate.bottom_hem,
        side_hems: selectedTemplate.side_hems,
        seam_hems: selectedTemplate.seam_hems,
        return_left: selectedTemplate.return_left,
        return_right: selectedTemplate.return_right,
        waste_percent: selectedTemplate.waste_percent,
      },
      fabric: {
        id: selectedFabric.id,
        name: selectedFabric.name,
        fabric_width: selectedFabric.fabric_width || 137,
        price_per_meter: selectedFabric.selling_price || selectedFabric.unit_price || 0,
        unit_price: selectedFabric.unit_price,
        selling_price: selectedFabric.selling_price,
      }
    };
  }, [selectedTemplate, selectedFabric]);

  const handleOptionToggle = (optionId: string) => {
    const currentOptions = formData.selected_options || [];
    const newOptions = currentOptions.includes(optionId)
      ? currentOptions.filter(id => id !== optionId)
      : [...currentOptions, optionId];
    
    handleInputChange('selected_options', newOptions);
  };

  const handleSubmitQuote = (customerInfo: any) => {
    const finalPrice = selectedCategory === 'wallpaper' 
      ? wallpaperCosts?.totalCost 
      : costs?.totalPrice;

    onSubmitQuote({
      ...customerInfo,
      configuration_data: {
        category: selectedCategory,
        template: selectedTemplate?.name,
        fabric: selectedFabric?.name,
        measurements: formData,
        selected_options: formData.selected_options,
      },
      quote_data: {
        estimated_price: finalPrice || 0,
        currency: 'NZD',
        calculation_details: selectedCategory === 'wallpaper' ? wallpaperCosts : {
          fabricCost: costs?.fabricCost,
          optionsCost: costs?.optionsCost,
          laborCost: costs?.laborCost,
          totalPrice: costs?.totalPrice,
          fabricUsage,
        },
      },
    });
    setShowQuoteForm(false);
  };

  const isReadyForQuote = selectedCategory === 'wallpaper' 
    ? !!(wallpaperCosts && wallpaperCosts.totalCost > 0)
    : !!(costs && costs.totalPrice > 0 && formData.rail_width && formData.drop);

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Build Your Window Treatment
          </CardTitle>
          <CardDescription>
            Choose your treatment type and customize it to your exact specifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "curtains", label: "Curtains", icon: "🪟" },
              { value: "blinds", label: "Blinds", icon: "📊" },
              { value: "shutters", label: "Shutters", icon: "🚪" },
              { value: "wallpaper", label: "Wallpaper", icon: "🎨" }
            ].map(category => (
              <button
                key={category.value}
                onClick={() => {
                  setSelectedCategory(category.value as any);
                  setSelectedTemplate(null);
                  setSelectedFabric(null);
                  setActiveStep("template");
                }}
                className={`p-4 border-2 rounded-lg text-center transition-all hover:shadow-md ${
                  selectedCategory === category.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="font-medium">{category.label}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Tabs */}
      <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="template" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Template</span>
          </TabsTrigger>
          <TabsTrigger value="material" className="gap-2" disabled={!selectedTemplate && selectedCategory !== 'wallpaper'}>
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Material</span>
          </TabsTrigger>
          <TabsTrigger value="measurements" className="gap-2" disabled={!selectedFabric}>
            <Ruler className="h-4 w-4" />
            <span className="hidden sm:inline">Measure</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2" disabled={!isReadyForQuote}>
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Template Selection */}
        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Select {selectedCategory === 'wallpaper' ? 'Wallpaper Pattern' : 'Treatment Template'}
              </CardTitle>
              <CardDescription>
                {selectedCategory === 'wallpaper' 
                  ? 'Skip to material selection for wallpaper'
                  : `Choose from our ${selectedCategory} templates`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCategory === 'wallpaper' ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Wallpaper doesn't require a template. Click "Material" to choose your wallpaper.
                  </p>
                  <Button onClick={() => setActiveStep("material")}>
                    Continue to Material Selection →
                  </Button>
                </div>
              ) : templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setActiveStep("material");
                      }}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold mb-1">{template.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {template.curtain_type && (
                          <Badge variant="outline" className="text-xs">
                            {template.curtain_type}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No {selectedCategory} templates available. Contact us for custom options.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Material Selection */}
        <TabsContent value="material" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Select {selectedCategory === 'wallpaper' ? 'Wallpaper' : 'Fabric'}
              </CardTitle>
              <CardDescription>
                Choose your preferred {selectedCategory === 'wallpaper' ? 'wallpaper pattern' : 'fabric material'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {materials && materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.map((material: any) => (
                    <button
                      key={material?.id || Math.random()}
                      onClick={() => {
                        if (material) {
                          setSelectedFabric(material);
                          setActiveStep("measurements");
                        }
                      }}
                      className={`group relative overflow-hidden border-2 rounded-lg transition-all hover:shadow-lg cursor-pointer ${
                        selectedFabric?.id === material?.id
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {material?.image_url && (
                        <div className="aspect-square overflow-hidden bg-muted">
                          <img
                            src={material.image_url}
                            alt={material.name || 'Material'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <div className="font-semibold text-sm mb-1">{material?.name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(material?.selling_price || material?.unit_price || 0, 'NZD')}
                          {selectedCategory === 'wallpaper' ? '/roll' : '/m'}
                        </div>
                      </div>
                      {selectedFabric?.id === material?.id && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No materials available for {selectedCategory}. Contact us for options.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Measurements */}
        <TabsContent value="measurements" className="space-y-4">
          {selectedCategory === 'wallpaper' ? (
            <Card>
              <CardHeader>
                <CardTitle>Wall Measurements</CardTitle>
                <CardDescription>Enter your wall dimensions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wall_width">Wall Width (cm)</Label>
                    <Input
                      id="wall_width"
                      type="number"
                      value={wallpaperMeasurements.wall_width}
                      onChange={(e) => setWallpaperMeasurements(prev => ({ ...prev, wall_width: e.target.value }))}
                      placeholder="e.g., 300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wall_height">Wall Height (cm)</Label>
                    <Input
                      id="wall_height"
                      type="number"
                      value={wallpaperMeasurements.wall_height}
                      onChange={(e) => setWallpaperMeasurements(prev => ({ ...prev, wall_height: e.target.value }))}
                      placeholder="e.g., 250"
                    />
                  </div>
                </div>

                {wallpaperCosts && (
                  <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Wall Area:</span>
                      <span className="font-medium">{wallpaperCosts.squareMeters.toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rolls Needed:</span>
                      <span className="font-medium">{wallpaperCosts.rollsNeeded}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Cost:</span>
                      <span className="text-lg">{formatCurrency(wallpaperCosts.totalCost, 'NZD')}</span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => setActiveStep("preview")} 
                  className="w-full"
                  disabled={!wallpaperCosts}
                >
                  Continue to Preview →
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Window Measurements</CardTitle>
                  <CardDescription>Enter your window dimensions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rail_width">Rail Width (cm)</Label>
                      <Input
                        id="rail_width"
                        type="number"
                        value={formData.rail_width || ''}
                        onChange={(e) => handleInputChange('rail_width', e.target.value)}
                        placeholder="e.g., 150"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="drop">Drop / Height (cm)</Label>
                      <Input
                        id="drop"
                        type="number"
                        value={formData.drop || ''}
                        onChange={(e) => handleInputChange('drop', e.target.value)}
                        placeholder="e.g., 200"
                      />
                    </div>
                  </div>

                  {formData.rail_width && formData.drop && treatmentData && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">Visual Preview</h4>
                      <div className="bg-muted/50 rounded-lg overflow-hidden">
                        <MeasurementVisualCore
                          measurements={{
                            rail_width: formData.rail_width,
                            drop: formData.drop,
                            pooling_amount: formData.pooling || "0",
                          }}
                          treatmentData={treatmentData}
                          config={{ compact: false, readOnly: true }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Options */}
              {(options.length > 0 || hierarchicalOptions.length > 0) && (
                <WindowCoveringOptionsCard
                  options={options}
                  hierarchicalOptions={hierarchicalOptions}
                  optionsLoading={optionsLoading}
                  windowCovering={{ id: selectedTemplate?.id, name: selectedTemplate?.name }}
                  selectedOptions={formData.selected_options || []}
                  onOptionToggle={handleOptionToggle}
                />
              )}

              <Button 
                onClick={() => setActiveStep("preview")} 
                className="w-full"
                disabled={!isReadyForQuote}
              >
                Continue to Preview →
              </Button>
            </>
          )}
        </TabsContent>

        {/* Step 4: Preview & Quote */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Price Summary</CardTitle>
              <CardDescription>Review your configuration and request a quote</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Configuration Summary */}
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div>
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <p className="font-medium capitalize">{selectedCategory}</p>
                </div>
                {selectedTemplate && (
                  <div>
                    <span className="text-sm text-muted-foreground">Template:</span>
                    <p className="font-medium">{selectedTemplate.name}</p>
                  </div>
                )}
                {selectedFabric && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {selectedCategory === 'wallpaper' ? 'Wallpaper:' : 'Fabric:'}
                    </span>
                    <p className="font-medium">{selectedFabric.name}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Cost Breakdown */}
              {selectedCategory === 'wallpaper' && wallpaperCosts ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Wallpaper ({wallpaperCosts.rollsNeeded} rolls)
                    </span>
                    <span className="font-medium">{formatCurrency(wallpaperCosts.totalCost, 'NZD')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Coverage: {wallpaperCosts.squareMeters.toFixed(2)} m²</span>
                  </div>
                </div>
              ) : costs && (
                <div className="space-y-2">
                  {fabricUsage && typeof fabricUsage === 'string' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fabric ({fabricUsage})</span>
                      <span className="font-medium">{formatCurrency(costs.fabricCost || 0, 'NZD')}</span>
                    </div>
                  )}
                  {costs.optionsCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Options & Extras</span>
                      <span className="font-medium">{formatCurrency(costs.optionsCost, 'NZD')}</span>
                    </div>
                  )}
                  {costs.laborCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Make-Up / Labor</span>
                      <span className="font-medium">{formatCurrency(costs.laborCost, 'NZD')}</span>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Total */}
              <div className="pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Estimated Price:</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--store-primary)' }}>
                    {formatCurrency(
                      selectedCategory === 'wallpaper' ? wallpaperCosts?.totalCost || 0 : costs?.totalPrice || 0,
                      'NZD'
                    )}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * Final price may vary based on site conditions and installation requirements
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4">
                <Button
                  onClick={() => setShowQuoteForm(true)}
                  className="w-full"
                  size="lg"
                  style={{ backgroundColor: 'var(--store-primary)' }}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Request Quote
                </Button>

                {onAddToCart && isReadyForQuote && (
                  <Button
                    onClick={() => {
                      const finalPrice = selectedCategory === 'wallpaper' 
                        ? wallpaperCosts?.totalCost 
                        : costs?.totalPrice;
                      
                      onAddToCart(
                        {
                          ...formData,
                          category: selectedCategory,
                          template_id: selectedTemplate?.id,
                          template_name: selectedTemplate?.name,
                          fabric_id: selectedFabric?.id,
                          fabric_name: selectedFabric?.name,
                        },
                        finalPrice || 0
                      );
                    }}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Add to Cart
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quote Request Form */}
      {showQuoteForm && (
        <StoreQuoteRequestForm
          estimatedPrice={
            selectedCategory === 'wallpaper' 
              ? wallpaperCosts?.totalCost || 0
              : costs?.totalPrice || 0
          }
          onSubmit={handleSubmitQuote}
          onCancel={() => setShowQuoteForm(false)}
        />
      )}
    </div>
  );
};
