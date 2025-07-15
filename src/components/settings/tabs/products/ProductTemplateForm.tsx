import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, EyeOff } from "lucide-react";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { useHardwareOptions, useLiningOptions, usePartsOptions } from "@/hooks/useComponentOptions";
import { useServiceOptions } from "@/hooks/useServiceOptions";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import { usePricingGrids } from "@/hooks/usePricingGrids";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { PricingGridPreview } from "@/components/job-creation/calculator/components/PricingGridPreview";

interface ProductTemplateFormProps {
  template?: any;
  onSave: (templateData: any) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const ProductTemplateForm = ({ template, onSave, onCancel, isEditing }: ProductTemplateFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showPricingPreview, setShowPricingPreview] = useState(false);
  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    product_type: template?.product_type || "",
    product_category: template?.product_category || "curtain",
    window_covering_id: "",
    calculationMethod: template?.calculation_method || "fabric_area",
    pricingUnit: template?.pricing_unit || "per-sq-meter",
    selectedPricingGrid: template?.pricing_grid_id || template?.calculation_rules?.selectedPricingGrid || "",
    baseMakingCost: (template?.calculation_rules?.baseMakingCost || "").toString(),
    baseHeightLimit: (template?.calculation_rules?.baseHeightLimit || "2.4").toString(),
    useHeightSurcharges: template?.calculation_rules?.useHeightSurcharges || false,
    complexityMultiplier: template?.calculation_rules?.complexityMultiplier || "standard",
    heightSurcharge1: (template?.calculation_rules?.heightSurcharge1 || "").toString(),
    heightSurcharge2: (template?.calculation_rules?.heightSurcharge2 || "").toString(),
    heightSurcharge3: (template?.calculation_rules?.heightSurcharge3 || "").toString(),
    heightRange1Start: (template?.calculation_rules?.heightRange1Start || "2.4").toString(),
    heightRange1End: (template?.calculation_rules?.heightRange1End || "3.0").toString(),
    heightRange2Start: (template?.calculation_rules?.heightRange2Start || "3.0").toString(),
    heightRange2End: (template?.calculation_rules?.heightRange2End || "4.0").toString(),
    heightRange3Start: (template?.calculation_rules?.heightRange3Start || "4.0").toString(),
    selectedComponents: template?.components || {
      headings: {},
      lining: {},
      hardware: {},
      parts: {},
      trimming: {},
      service: {}
    },
    requiredComponents: {
      headings: [],
      lining: [],
      hardware: [],
      parts: [],
      trimming: [],
      service: []
    },
    calculationRules: {
      baseMakingCost: 0,
      markup_percentage: 40,
      labor_rate: 45
    },
    measurementRequirements: template?.measurement_requirements || {}
  });

  const { windowCoverings, isLoading: windowCoveringsLoading } = useWindowCoverings();
  const { data: hardwareOptions = [], isLoading: hardwareLoading } = useHardwareOptions();
  const { data: liningOptions = [], isLoading: liningLoading } = useLiningOptions();
  const { data: partsOptions = [], isLoading: partsLoading } = usePartsOptions();
  const { data: serviceOptions = [], isLoading: serviceLoading } = useServiceOptions();
  const { data: headingOptions = [], isLoading: headingLoading } = useHeadingOptions();
  const { data: pricingGrids, isLoading: pricingGridsLoading } = usePricingGrids();
  const { data: businessSettings } = useBusinessSettings();

  const components = {
    hardware: hardwareOptions || [],
    headings: headingOptions || [],
    lining: liningOptions || [],
    parts: partsOptions || [],
    trimming: [],
    service: serviceOptions || []
  };

  const componentsLoading = hardwareLoading || liningLoading || partsLoading || serviceLoading || headingLoading;

  const selectedPricingGrid = pricingGrids?.find(grid => grid.id === formData.selectedPricingGrid);

  useEffect(() => {
    if (businessSettings) {
      setFormData(prev => ({
        ...prev,
        calculationRules: {
          ...prev.calculationRules,
          labor_rate: parseFloat(businessSettings?.labor_rate?.toString() || "45")
        }
      }));
    }
  }, [businessSettings]);

  useEffect(() => {
    if (template && windowCoverings) {
      const windowCovering = windowCoverings.find(wc => wc.name === template.product_type);
      if (windowCovering) {
        setFormData(prev => ({ ...prev, window_covering_id: windowCovering.id }));
      }
    }
  }, [template, windowCoverings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string, windowCoveringId?: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      window_covering_id: windowCoveringId || prev.window_covering_id
    }));
  };

  const handleComponentChange = (category: string, componentId: string, isChecked: boolean) => {
    setFormData(prev => {
      const updatedSelectedComponents = {
        ...prev.selectedComponents,
        [category]: {
          ...prev.selectedComponents[category],
          [componentId]: isChecked
        }
      };

      return {
        ...prev,
        selectedComponents: updatedSelectedComponents
      };
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }

    try {
      setIsSaving(true);

      const calculationRules = {
        baseMakingCost: parseFloat(formData.baseMakingCost) || 0,
        markup_percentage: 40,
        labor_rate: parseFloat(businessSettings?.labor_rate?.toString() || "45"),
        baseHeightLimit: parseFloat(formData.baseHeightLimit) || 2.4,
        useHeightSurcharges: formData.useHeightSurcharges,
        complexityMultiplier: formData.complexityMultiplier,
        heightSurcharge1: parseFloat(formData.heightSurcharge1) || 0,
        heightSurcharge2: parseFloat(formData.heightSurcharge2) || 0,
        heightSurcharge3: parseFloat(formData.heightSurcharge3) || 0,
        heightRange1Start: parseFloat(formData.heightRange1Start) || 2.4,
        heightRange1End: parseFloat(formData.heightRange1End) || 3.0,
        heightRange2Start: parseFloat(formData.heightRange2Start) || 3.0,
        heightRange2End: parseFloat(formData.heightRange2End) || 4.0,
        heightRange3Start: parseFloat(formData.heightRange3Start) || 4.0,
        selectedPricingGrid: formData.selectedPricingGrid || null
      };

      const templateData = {
        name: formData.name,
        description: formData.description,
        product_type: formData.product_type,
        product_category: formData.product_category,
        calculation_method: formData.calculationMethod,
        pricing_unit: formData.pricingUnit,
        calculation_rules: calculationRules,
        pricing_grid_id: formData.selectedPricingGrid || null,
        components: formData.selectedComponents,
        measurement_requirements: formData.measurementRequirements,
        making_cost_required: formData.calculationMethod === 'fabric_area',
        pricing_grid_required: formData.calculationMethod === 'pricing_grid',
        active: true
      };

      await onSave(templateData);
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (windowCoveringsLoading || componentsLoading || pricingGridsLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Template" : "Add Template"}</CardTitle>
        <CardDescription>
          {isEditing ? "Edit the details of the selected template." : "Create a new product template."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Template Name *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Premium Roman Blind"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleTextareaChange}
              placeholder="Brief description of this template"
            />
          </div>
        </div>

        {/* Window Covering Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="window_covering">Window Covering *</Label>
            <Select
              value={formData.window_covering_id}
              onValueChange={value => {
                const windowCovering = windowCoverings?.find(wc => wc.id === value);
                handleSelectChange("product_type", windowCovering?.name || "", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select window covering type" />
              </SelectTrigger>
              <SelectContent>
                {windowCoverings && windowCoverings.length > 0 ? (
                  windowCoverings.map(wc => (
                    <SelectItem key={wc.id} value={wc.id}>
                      {wc.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No window coverings available - Add them in Window Coverings tab
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Choose the window covering product this template is for. Add new window coverings in the "Window Coverings" tab.
            </p>
          </div>
          <div>
            <Label htmlFor="product_category">Product Category</Label>
            <Select
              value={formData.product_category}
              onValueChange={value => handleSelectChange("product_category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="curtain">Curtain</SelectItem>
                <SelectItem value="blind">Blind</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              General category for grouping and filtering
            </p>
          </div>
        </div>

        {/* Calculation Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="calculationMethod">Calculation Method *</Label>
            <Select
              value={formData.calculationMethod}
              onValueChange={value => handleSelectChange("calculationMethod", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select calculation method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fabric_area">Fabric Area Based</SelectItem>
                <SelectItem value="pricing_grid">Pricing Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pricingUnit">Pricing Unit</Label>
            <Select
              value={formData.pricingUnit}
              onValueChange={value => handleSelectChange("pricingUnit", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pricing unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per-sq-meter">Per Square Meter</SelectItem>
                <SelectItem value="per-linear-meter">Per Linear Meter</SelectItem>
                <SelectItem value="per-unit">Per Unit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pricing Grid Selection with Preview */}
        {formData.calculationMethod === "pricing_grid" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="selectedPricingGrid">Pricing Grid *</Label>
              <Select
                value={formData.selectedPricingGrid}
                onValueChange={value => handleSelectChange("selectedPricingGrid", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pricing grid" />
                </SelectTrigger>
                <SelectContent>
                  {pricingGrids && pricingGrids.length > 0 ? (
                    pricingGrids.map(grid => (
                      <SelectItem key={grid.id} value={grid.id}>
                        {grid.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No pricing grids available - Add them in Pricing Grids section
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {selectedPricingGrid && (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPricingPreview(true)}
                  className="flex items-center gap-2"
                >
                  Preview Pricing Grid
                </Button>
                
                <PricingGridPreview
                  isOpen={showPricingPreview}
                  onClose={() => setShowPricingPreview(false)}
                  gridId={formData.selectedPricingGrid}
                  gridName={selectedPricingGrid.name}
                />
              </div>
            )}
          </div>
        )}

        {/* Base Making Cost - Only for fabric_area */}
        {formData.calculationMethod === "fabric_area" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="baseMakingCost">Base Making Cost</Label>
              <Input
                type="number"
                id="baseMakingCost"
                name="baseMakingCost"
                value={formData.baseMakingCost}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
          </div>
        )}

        {/* Height Surcharges - Only for fabric_area */}
        {formData.calculationMethod === "fabric_area" && (
          <>
            <h3 className="text-lg font-medium">Height Surcharges</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="baseHeightLimit">Base Height Limit (m)</Label>
                <Input
                  type="number"
                  id="baseHeightLimit"
                  name="baseHeightLimit"
                  value={formData.baseHeightLimit}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="useHeightSurcharges"
                  checked={formData.useHeightSurcharges}
                  onCheckedChange={checked =>
                    setFormData(prev => ({ ...prev, useHeightSurcharges: checked }))
                  }
                />
                <Label htmlFor="useHeightSurcharges">Use Height Surcharges</Label>
              </div>
              {formData.useHeightSurcharges && (
                <div>
                  <Label htmlFor="complexityMultiplier">Complexity Multiplier</Label>
                  <Select
                    value={formData.complexityMultiplier}
                    onValueChange={value => handleSelectChange("complexityMultiplier", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select complexity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="complex">Complex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {formData.useHeightSurcharges && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="heightSurcharge1">Height Surcharge 1</Label>
                  <Input
                    type="number"
                    id="heightSurcharge1"
                    name="heightSurcharge1"
                    value={formData.heightSurcharge1}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="heightSurcharge2">Height Surcharge 2</Label>
                  <Input
                    type="number"
                    id="heightSurcharge2"
                    name="heightSurcharge2"
                    value={formData.heightSurcharge2}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="heightSurcharge3">Height Surcharge 3</Label>
                  <Input
                    type="number"
                    id="heightSurcharge3"
                    name="heightSurcharge3"
                    value={formData.heightSurcharge3}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Components Selection */}
        <div>
          <h3 className="text-lg font-medium mb-4">Components</h3>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Components</CardTitle>
              <CardDescription>
                Choose which components are available for this product template. All components are optional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                  {Object.entries(components).map(([category, componentList]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium capitalize">{category}</h4>
                      <div className="space-y-1">
                        {Array.isArray(componentList) && componentList.length > 0 ? (
                          componentList.map(component => (
                            <div key={component.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${category}-${component.id}`}
                                checked={formData.selectedComponents[category]?.[component.id] || false}
                                onCheckedChange={checked =>
                                  handleComponentChange(category, component.id, checked === true)
                                }
                              />
                              <Label htmlFor={`${category}-${component.id}`} className="text-sm">
                                {component.name}
                              </Label>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            No {category} components available. Add components in Settings → Components.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
