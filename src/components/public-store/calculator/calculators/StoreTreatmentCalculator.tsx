import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { formatCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";
import { StoreQuoteRequestForm } from "../StoreQuoteRequestForm";
import { TreatmentPreviewEngine } from "@/components/treatment-visualizers/TreatmentPreviewEngine";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WindowCoveringOptionsCard } from "@/components/job-creation/treatment-pricing/WindowCoveringOptionsCard";
import { TreatmentMeasurementsCard } from "@/components/job-creation/treatment-pricing/TreatmentMeasurementsCard";
import { useWindowCoveringOptions } from "@/hooks/useWindowCoveringOptions";
import { useTreatmentTypes } from "@/hooks/useTreatmentTypes";
import { useFabricCalculation } from "@/components/job-creation/treatment-pricing/useFabricCalculation";
import { useTreatmentFormData } from "@/components/job-creation/treatment-pricing/useTreatmentFormData";
import { useTreatmentTemplates } from "@/hooks/useTreatmentTemplates";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface StoreTreatmentCalculatorProps {
  product: any;
  storeData: any;
  onSubmitQuote: (quoteData: any) => void;
  onAddToCart?: (configuration: Record<string, any>, estimatedPrice: number) => void;
}

export const StoreTreatmentCalculator = ({ product, storeData, onSubmitQuote, onAddToCart }: StoreTreatmentCalculatorProps) => {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [windowType, setWindowType] = useState("standard");
  
  // Fetch all available templates
  const { data: allTemplates } = useTreatmentTemplates();
  
  // Get the default template assigned to this product
  const defaultTemplate = product.template;
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(defaultTemplate?.id || '');
  
  // Get current template (selected or default)
  const template = useMemo(() => {
    if (selectedTemplateId && allTemplates) {
      return allTemplates.find(t => t.id === selectedTemplateId) || defaultTemplate;
    }
    return defaultTemplate;
  }, [selectedTemplateId, allTemplates, defaultTemplate]);
  
  // Filter templates by product category
  const compatibleTemplates = useMemo(() => {
    if (!allTemplates) return [];
    const productCategory = product.inventory_item?.category?.toLowerCase();
    return allTemplates.filter(t => t.category?.toLowerCase() === productCategory);
  }, [allTemplates, product.inventory_item?.category]);
  
  const treatmentType = template?.category || template?.curtain_type || 'curtains';
  
  // Initialize form data with template
  const { formData, handleInputChange } = useTreatmentFormData(treatmentType, {
    id: template?.id,
    name: template?.name,
    curtain_type: template?.curtain_type || treatmentType,
    treatment_category: template?.treatment_category,
    pricing_type: template?.pricing_type,
    pricing_grid_data: template?.pricing_grid_data,
    fabric_details: {
      id: product.inventory_item?.id,
      name: product.inventory_item?.name,
      unit_price: product.inventory_item?.unit_price,
      selling_price: product.inventory_item?.selling_price,
      price_per_meter: product.inventory_item?.price_per_meter,
      fabric_width: product.inventory_item?.fabric_width || 137,
      pricing_grid_data: product.inventory_item?.pricing_grid_data,
      price_group: product.inventory_item?.price_group,
      product_category: product.inventory_item?.product_category,
    }
  });
  
  // Fetch window covering options for this template
  const { options, hierarchicalOptions, isLoading: optionsLoading } = useWindowCoveringOptions(template?.id);
  const { data: treatmentTypesData } = useTreatmentTypes();
  
  // Use the same calculation logic as job system
  const { calculateFabricUsage, calculateCosts } = useFabricCalculation(
    formData, 
    options, 
    treatmentTypesData, 
    treatmentType, 
    hierarchicalOptions
  );
  
  const fabricUsage = calculateFabricUsage();
  const costs = calculateCosts();
  
  const treatmentData = useMemo(() => {
    if (!template) return undefined;
    
    return {
      template: {
        ...template,
        id: template.id,
        name: template.name,
        curtain_type: template.curtain_type,
        fullness_ratio: template.fullness_ratio,
        header_allowance: template.header_allowance,
        bottom_hem: template.bottom_hem,
        side_hems: template.side_hems,
        seam_hems: template.seam_hems,
        return_left: template.return_left,
        return_right: template.return_right,
        waste_percent: template.waste_percent,
        compatible_hardware: template.compatible_hardware,
      },
      fabric: {
        id: product.inventory_item?.id,
        name: product.inventory_item?.name,
        fabric_width: product.inventory_item?.fabric_width || 137,
        price_per_meter: product.inventory_item?.selling_price || product.inventory_item?.unit_price || 0,
        unit_price: product.inventory_item?.unit_price,
        selling_price: product.inventory_item?.selling_price,
      }
    };
  }, [template, product.inventory_item]);
  
  const handleOptionToggle = (optionId: string) => {
    const currentOptions = formData.selected_options || [];
    const newOptions = currentOptions.includes(optionId)
      ? currentOptions.filter(id => id !== optionId)
      : [...currentOptions, optionId];
    
    handleInputChange('selected_options', newOptions);
  };

  const handleCalculate = () => {
    if (costs && costs.totalPrice > 0) {
      setShowQuoteForm(true);
    }
  };

  const handleSubmitQuote = (customerInfo: any) => {
    onSubmitQuote({
      ...customerInfo,
      configuration_data: {
        formData,
        product_name: product.inventory_item?.name,
        product_category: product.inventory_item?.category,
        template_name: template?.name,
        selected_options: formData.selected_options,
      },
      quote_data: {
        estimated_price: costs?.totalPrice || 0,
        currency: 'NZD',
        calculation_details: {
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

  if (!template) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calculator Not Available</CardTitle>
          <CardDescription>
            This product hasn't been configured with a template yet. Please contact us for a quote.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowQuoteForm(true)} className="w-full">
            Request Custom Quote
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Preview - Featured at top */}
      {formData.rail_width && formData.drop && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">See it on Your Window</CardTitle>
                <CardDescription>
                  Preview shows how your {template.name} will look with {product.inventory_item?.name}
                </CardDescription>
              </div>
              <Badge variant="outline">{treatmentType.replace('_', ' ')}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Window Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="window-type">Window Type</Label>
              <Select value={windowType} onValueChange={setWindowType}>
                <SelectTrigger id="window-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Window</SelectItem>
                  <SelectItem value="bay">Bay Window</SelectItem>
                  <SelectItem value="french_doors">French Doors</SelectItem>
                  <SelectItem value="sliding_doors">Sliding Doors</SelectItem>
                  <SelectItem value="large">Large Window</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Treatment Preview */}
            <div className="bg-muted/30 rounded-lg overflow-hidden min-h-[400px]">
              <TreatmentPreviewEngine
                windowType={windowType}
                treatmentType={treatmentType}
                measurements={{
                  rail_width: formData.rail_width,
                  drop: formData.drop,
                  pooling_amount: formData.pooling || 0,
                }}
                template={template}
                selectedItems={{
                  fabric: product.inventory_item,
                  material: product.inventory_item,
                }}
                hideDetails={false}
              />
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Preview is approximate - book a consultation for exact visualization
            </p>
          </CardContent>
        </Card>
      )}

      {/* Header with template selector */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Configure Your Treatment
              </CardTitle>
              <CardDescription>
                Choose a style and enter measurements for an instant quote
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="template-selector">Treatment Style</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger id="template-selector">
                <SelectValue placeholder="Choose a style..." />
              </SelectTrigger>
              <SelectContent>
                {compatibleTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {template?.description && (
              <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Measurements Input */}
      <TreatmentMeasurementsCard
        formData={formData}
        onInputChange={handleInputChange}
      />

      {/* Window Covering Options */}
      {(options.length > 0 || hierarchicalOptions.length > 0) && (
        <WindowCoveringOptionsCard
          options={options}
          hierarchicalOptions={hierarchicalOptions}
          optionsLoading={optionsLoading}
          windowCovering={{ id: template.id, name: template.name }}
          selectedOptions={formData.selected_options || []}
          onOptionToggle={handleOptionToggle}
        />
      )}

      {/* Cost Summary */}
      {costs && formData.rail_width && formData.drop && (
        <Card>
          <CardHeader>
            <CardTitle>Price Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Estimated Price:</span>
                <span className="text-2xl font-bold" style={{ color: 'var(--store-primary)' }}>
                  {formatCurrency(costs.totalPrice, 'NZD')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Final price may vary based on site conditions and installation requirements
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <Button
                onClick={handleCalculate}
                className="w-full"
                size="lg"
                style={{ backgroundColor: 'var(--store-primary)' }}
                disabled={!costs || costs.totalPrice === 0}
              >
                Request Quote
              </Button>

              {onAddToCart && costs && costs.totalPrice > 0 && (
                <Button
                  onClick={() => {
                    onAddToCart(
                      {
                        ...formData,
                        template_id: template.id,
                        template_name: template.name,
                        product_name: product.inventory_item?.name,
                      },
                      costs.totalPrice
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
      )}

      {showQuoteForm && costs && (
        <StoreQuoteRequestForm
          estimatedPrice={costs.totalPrice}
          onSubmit={handleSubmitQuote}
          onCancel={() => setShowQuoteForm(false)}
        />
      )}
    </div>
  );
};
