import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Settings, Edit, Trash2, Calculator } from "lucide-react";
import { useState } from "react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import { useHardwareOptions, useLiningOptions } from "@/hooks/useComponentOptions";
import { useServiceOptions } from "@/hooks/useServiceOptions";
import { usePricingGrids } from "@/hooks/usePricingGrids";

export const ProductTemplatesTab = () => {
  const { units, getLengthUnitLabel, getFabricUnitLabel } = useMeasurementUnits();
  const lengthUnit = getLengthUnitLabel();
  const fabricUnit = getFabricUnitLabel();
  
  // Load actual component options
  const { data: headingOptions = [] } = useHeadingOptions();
  const { data: hardwareOptions = [] } = useHardwareOptions();
  const { data: liningOptions = [] } = useLiningOptions();
  const { data: serviceOptions = [] } = useServiceOptions();
  const { data: pricingGrids = [] } = usePricingGrids();
  
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Curtains",
      calculationMethod: "width-drop",
      pricingUnit: "per-linear-meter",
      active: true,
      components: ["headings", "fabric", "lining", "hardware"],
      calculationRules: {
        heightTiers: [1, 2, 3],
        constructionOptions: [1, 2, 3, 4, 5],
        seamingOptions: [1, 2, 3, 4]
      }
    },
    {
      id: 2,
      name: "Roman Blinds",
      calculationMethod: "csv-pricing-grid",
      pricingUnit: "csv-grid",
      selectedPricingGrid: "roman-blinds-standard",
      active: true,
      components: ["fabric", "hardware", "chain"],
      calculationRules: {
        heightTiers: [1],
        constructionOptions: [1],
        seamingOptions: [1]
      }
    }
  ]);

  // Mock calculation rules data (would come from your Calculations tab)
  const availableCalculationRules = {
    heightTiers: [
      { id: 1, name: "Standard Height (0-240cm)", description: "Standard curtains up to 2.4m drop" },
      { id: 2, name: "Extra Height (240-300cm)", description: "Tall curtains 2.4m to 3.0m drop" },
      { id: 3, name: "Super Height (300cm+)", description: "Very tall curtains 3.0m+ drop" }
    ],
    constructionOptions: [
      { id: 1, name: "Unlined", description: "Basic curtain with no lining" },
      { id: 2, name: "Standard Lined", description: "Curtain with cotton sateen lining" },
      { id: 3, name: "Detachable Lined", description: "Curtain with detachable lining" },
      { id: 4, name: "Interlined", description: "Curtain with interlining for insulation" },
      { id: 5, name: "Lined & Interlined", description: "Premium construction" }
    ],
    seamingOptions: [
      { id: 1, name: "No Seams Required", description: "Single width fabric" },
      { id: 2, name: "Standard Seaming", description: "Basic straight seams" },
      { id: 3, name: "Pattern Matching Seams", description: "Careful pattern alignment" },
      { id: 4, name: "Complex Pattern Match", description: "Intricate patterns" }
    ]
  };
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    calculationMethod: "",
    pricingUnit: "",
    selectedPricingGrid: "",
    baseMakingCost: "",
    baseHeightLimit: "2.4",
    useHeightSurcharges: false,
    complexityMultiplier: "standard",
    showComplexityOption: true,
    heightSurcharge1: "",
    heightSurcharge2: "", 
    heightSurcharge3: "",
    heightRange1Start: "2.4",
    heightRange1End: "3.0",
    heightRange2Start: "3.0", 
    heightRange2End: "4.0",
    heightRange3Start: "4.0",
    selectedComponents: {
      headings: {},
      hardware: {},
      lining: {},
      services: {}
    },
    calculationRules: {
      heightTiers: [],
      constructionOptions: [],
      seamingOptions: []
    }
  });

  const requiresMakingCost = formData.calculationMethod !== "csv-pricing-grid";
  const requiresPricingGrid = formData.calculationMethod === "csv-pricing-grid";

  const handleCreateTemplate = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      alert("Please enter a product name");
      return;
    }
    if (!formData.calculationMethod) {
      alert("Please select a calculation method");
      return;
    }
    if (!formData.pricingUnit) {
      alert("Please select a pricing unit");
      return;
    }
    
    // Validate based on calculation method
    if (requiresMakingCost && !formData.baseMakingCost) {
      alert("Please enter a base making cost");
      return;
    }
    
    if (requiresPricingGrid && !formData.selectedPricingGrid) {
      alert("Please select a pricing grid");
      return;
    }

    const templateData = {
      name: formData.name.trim(),
      calculationMethod: formData.calculationMethod,
      pricingUnit: formData.pricingUnit,
      selectedPricingGrid: formData.selectedPricingGrid || undefined,
      baseMakingCost: requiresMakingCost ? parseFloat(formData.baseMakingCost) : undefined,
      complexityMultiplier: formData.complexityMultiplier,
      showComplexityOption: formData.showComplexityOption,
      active: true,
      components: Object.keys(formData.selectedComponents).filter(key => 
        typeof formData.selectedComponents[key] === 'object' 
          ? Object.keys(formData.selectedComponents[key]).length > 0
          : formData.selectedComponents[key]
      ),
      calculationRules: {
        heightTiers: [...formData.calculationRules.heightTiers],
        constructionOptions: [...formData.calculationRules.constructionOptions],
        seamingOptions: [...formData.calculationRules.seamingOptions]
      }
    };

    if (editingId) {
      // Update existing template
      setTemplates(prev => prev.map(template => 
        template.id === editingId 
          ? { ...template, ...templateData }
          : template
      ));
      alert("Template updated successfully!");
    } else {
      // Create new template
      const newTemplate = {
        id: templates.length + 1,
        ...templateData
      };
      setTemplates(prev => [...prev, newTemplate]);
      alert("Template created successfully!");
    }

    // Reset form
    resetForm();
    setIsCreating(false);
    setEditingId(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      calculationMethod: "",
      pricingUnit: "",
      selectedPricingGrid: "",
      baseMakingCost: "",
      baseHeightLimit: "2.4",
      useHeightSurcharges: false,
      complexityMultiplier: "standard",
      showComplexityOption: true,
      heightSurcharge1: "",
      heightSurcharge2: "", 
      heightSurcharge3: "",
      heightRange1Start: "2.4",
      heightRange1End: "3.0",
      heightRange2Start: "3.0", 
      heightRange2End: "4.0",
      heightRange3Start: "4.0",
      selectedComponents: {
        headings: {},
        hardware: {},
        lining: {},
        services: {}
      },
      calculationRules: {
        heightTiers: [],
        constructionOptions: [],
        seamingOptions: []
      }
    });
  };

  const handleToggleCreating = () => {
    setIsCreating(!isCreating);
    setEditingId(null);
    // Reset form when canceling
    if (isCreating) {
      resetForm();
    }
  };

  const handleEditTemplate = (template) => {
    setEditingId(template.id);
    setIsCreating(true);
    
    // Convert components array back to selectedComponents object structure
    const selectedComponents = {
      headings: {},
      hardware: {},
      lining: {},
      services: {}
    };
    
    // If template has component selections, reconstruct the selectedComponents object
    if (template.selectedComponents) {
      Object.keys(template.selectedComponents).forEach(category => {
        if (template.selectedComponents[category]) {
          selectedComponents[category] = template.selectedComponents[category];
        }
      });
    } else if (template.components && Array.isArray(template.components)) {
      // Legacy support - if only components array exists, mark all as selected (but empty)
      // This is a fallback for older templates that might not have the full structure
      template.components.forEach(component => {
        if (selectedComponents[component]) {
          selectedComponents[component] = {};
        }
      });
    }
    
    setFormData({
      name: template.name,
      calculationMethod: template.calculationMethod,
      pricingUnit: template.pricingUnit,
      selectedPricingGrid: template.selectedPricingGrid || "",
      baseMakingCost: template.baseMakingCost?.toString() || "",
      baseHeightLimit: template.baseHeightLimit?.toString() || "2.4",
      useHeightSurcharges: template.useHeightSurcharges || false,
      complexityMultiplier: template.complexityMultiplier || "standard",
      showComplexityOption: template.showComplexityOption !== false,
      heightSurcharge1: template.heightSurcharge1?.toString() || "",
      heightSurcharge2: template.heightSurcharge2?.toString() || "", 
      heightSurcharge3: template.heightSurcharge3?.toString() || "",
      heightRange1Start: template.heightRange1Start?.toString() || "2.4",
      heightRange1End: template.heightRange1End?.toString() || "3.0",
      heightRange2Start: template.heightRange2Start?.toString() || "3.0", 
      heightRange2End: template.heightRange2End?.toString() || "4.0",
      heightRange3Start: template.heightRange3Start?.toString() || "4.0",
      selectedComponents: selectedComponents,
      calculationRules: {
        heightTiers: template.calculationRules?.heightTiers || [],
        constructionOptions: template.calculationRules?.constructionOptions || [],
        seamingOptions: template.calculationRules?.seamingOptions || []
      }
    });
  };

  const handleDeleteTemplate = (templateId) => {
    if (confirm("Are you sure you want to delete this template?")) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleCalculationRuleToggle = (category, ruleId, checked) => {
    console.log(`Toggling ${category} rule ${ruleId} to ${checked}`);
    setFormData(prev => {
      const currentRules = prev.calculationRules[category] || [];
      const newRules = checked 
        ? [...currentRules, ruleId]
        : currentRules.filter(id => id !== ruleId);
      
      console.log(`Updated ${category} rules:`, newRules);
      
      return {
        ...prev,
        calculationRules: {
          ...prev.calculationRules,
          [category]: newRules
        }
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Product Templates</h3>
          <p className="text-sm text-brand-neutral">Define how different window covering products are calculated</p>
        </div>
        <Button 
          onClick={handleToggleCreating}
          className="bg-brand-primary hover:bg-brand-accent"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isCreating ? "Cancel" : "Add Template"}
        </Button>
      </div>

      {/* Existing Templates */}
      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-brand-primary">{template.name}</CardTitle>
                  <CardDescription>
                    Calculation: {template.calculationMethod} • Pricing: {template.pricingUnit}
                    {template.selectedPricingGrid && (
                      <span className="block text-xs text-blue-600 mt-1">
                        Using grid: {pricingGrids.find(g => g.id === template.selectedPricingGrid)?.name || template.selectedPricingGrid}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={template.active} />
                  <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Required Components:</h4>
                  <div className="flex gap-2 flex-wrap">
                    {template.components && template.components.map((component) => (
                      <Badge key={component} variant="outline">
                        {component}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {template.calculationRules && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Applied Calculation Rules:
                    </h4>
                    <div className="space-y-2 text-xs">
                      {template.calculationRules.heightTiers?.length > 0 && (
                        <div>
                          <span className="font-medium text-blue-700">Height Tiers:</span>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {template.calculationRules.heightTiers.map(tierId => {
                              const tier = availableCalculationRules.heightTiers.find(t => t.id === tierId);
                              return tier ? (
                                <Badge key={tierId} variant="secondary" className="text-xs">
                                  {tier.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                      {template.calculationRules.constructionOptions?.length > 0 && (
                        <div>
                          <span className="font-medium text-green-700">Construction Options:</span>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {template.calculationRules.constructionOptions.map(optionId => {
                              const option = availableCalculationRules.constructionOptions.find(o => o.id === optionId);
                              return option ? (
                                <Badge key={optionId} variant="secondary" className="text-xs">
                                  {option.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                      {template.calculationRules.seamingOptions?.length > 0 && (
                        <div>
                          <span className="font-medium text-purple-700">Seaming Options:</span>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {template.calculationRules.seamingOptions.map(optionId => {
                              const option = availableCalculationRules.seamingOptions.find(o => o.id === optionId);
                              return option ? (
                                <Badge key={optionId} variant="secondary" className="text-xs">
                                  {option.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Template Form - Only show when creating */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Product Template" : "Create New Product Template"}</CardTitle>
            <CardDescription>{editingId ? "Update the window covering product template" : "Define a new window covering product type"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Info Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="templateName">Product Name *</Label>
                <Input 
                  id="templateName" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Curtains, Roman Blinds" 
                />
              </div>
              <div>
                <Label htmlFor="calculationMethod">Calculation Method *</Label>
                <Select value={formData.calculationMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, calculationMethod: value, pricingUnit: value === 'csv-pricing-grid' ? 'csv-grid' : '', selectedPricingGrid: '' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="width-drop">Width × Drop (Curtains)</SelectItem>
                    <SelectItem value="width-height">Width × Height (Blinds)</SelectItem>
                    <SelectItem value="csv-pricing-grid">CSV Pricing Grid (Pre-defined pricing)</SelectItem>
                    <SelectItem value="panels">Number of Panels</SelectItem>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pricingUnit">Pricing Unit *</Label>
                <Select value={formData.pricingUnit} onValueChange={(value) => setFormData(prev => ({ ...prev, pricingUnit: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {requiresPricingGrid ? (
                      <SelectItem value="csv-grid">From CSV Pricing Grid</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="per-linear-meter">Per Linear Meter</SelectItem>
                        <SelectItem value="per-sqm">Per Square Meter</SelectItem>
                        <SelectItem value="per-panel">Per Panel</SelectItem>
                        <SelectItem value="per-drop">Per Drop</SelectItem>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing Grid Selection - only show when CSV pricing grid is selected */}
              {requiresPricingGrid && (
                <div>
                  <Label htmlFor="selectedPricingGrid">Select Pricing Grid *</Label>
                  <Select value={formData.selectedPricingGrid} onValueChange={(value) => setFormData(prev => ({ ...prev, selectedPricingGrid: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a pricing grid" />
                    </SelectTrigger>
                    <SelectContent>
                      {pricingGrids.length === 0 ? (
                        <SelectItem value="" disabled>No pricing grids available - upload some first</SelectItem>
                      ) : (
                        pricingGrids.map((grid) => (
                          <SelectItem key={grid.id} value={grid.id}>
                            {grid.name} ({grid.grid_data?.dropRows?.length || 0} × {grid.grid_data?.widthColumns?.length || 0})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {pricingGrids.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ No pricing grids found. Upload CSV pricing grids in the Components tab first.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Calculation Rules Selection */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Select Applicable Calculation Rules
                </CardTitle>
                <CardDescription>
                  Choose which calculation rules from the Calculations tab apply to this product type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Height-Based Pricing Rules */}
                <div>
                  <Label className="text-sm font-medium text-blue-900">Height-Based Pricing Tiers</Label>
                  <p className="text-xs text-blue-700 mb-3">Select which height ranges apply to this product</p>
                  <div className="grid grid-cols-1 gap-2">
                    {availableCalculationRules.heightTiers.map((tier) => (
                      <div key={tier.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={`height-tier-${tier.id}`}
                          checked={formData.calculationRules.heightTiers.includes(tier.id)}
                          onCheckedChange={(checked) => handleCalculationRuleToggle('heightTiers', tier.id, checked)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label htmlFor={`height-tier-${tier.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {tier.name}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {tier.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Construction Complexity Rules */}
                <div>
                  <Label className="text-sm font-medium text-green-900">Construction & Lining Options</Label>
                  <p className="text-xs text-green-700 mb-3">Select which construction types are available for this product</p>
                  <div className="grid grid-cols-1 gap-2">
                    {availableCalculationRules.constructionOptions.map((option) => (
                      <div key={option.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={`construction-${option.id}`}
                          checked={formData.calculationRules.constructionOptions.includes(option.id)}
                          onCheckedChange={(checked) => handleCalculationRuleToggle('constructionOptions', option.id, checked)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label htmlFor={`construction-${option.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {option.name}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seaming Complexity Rules */}
                <div>
                  <Label className="text-sm font-medium text-purple-900">Seaming & Pattern Matching</Label>
                  <p className="text-xs text-purple-700 mb-3">Select which seaming complexities apply to this product</p>
                  <div className="grid grid-cols-1 gap-2">
                    {availableCalculationRules.seamingOptions.map((option) => (
                      <div key={option.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={`seaming-${option.id}`}
                          checked={formData.calculationRules.seamingOptions.includes(option.id)}
                          onCheckedChange={(checked) => handleCalculationRuleToggle('seamingOptions', option.id, checked)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label htmlFor={`seaming-${option.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {option.name}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Pricing Structure Explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Pricing Structure Explanation:</h4>
              <div className="space-y-2 text-sm text-blue-800">
                {requiresPricingGrid ? (
                  <>
                    <p><strong>CSV Pricing Grid Method:</strong></p>
                    <p>• Final price comes directly from your uploaded CSV grid</p>
                    <p>• No additional component costs are added to avoid double pricing</p>
                    <p>• Components selected below are for display purposes only</p>
                    <p>• Perfect for supplier-provided complete pricing</p>
                  </>
                ) : (
                  <>
                    <p><strong>Component-Based Pricing Method:</strong></p>
                    <p>• Base making cost + fabric cost + selected component costs</p>
                    <p>• Each component adds its individual cost to the total</p>
                    <p>• Flexible for mixing and matching components</p>
                    <p>• Perfect for bespoke custom work pricing</p>
                  </>
                )}
              </div>
            </div>

            {/* Making Cost Structure - only show when NOT using pricing grid */}
            {requiresMakingCost && (
              <div className="space-y-4">
                <h4 className="font-medium text-brand-primary">Making Cost Structure</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="baseMakingCost">Base Making Cost *</Label>
                    <Input 
                      id="baseMakingCost" 
                      type="number" 
                      step="0.01" 
                      value={formData.baseMakingCost}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseMakingCost: e.target.value }))}
                      placeholder="45.00" 
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">Per {fabricUnit} up to</span>
                      <Input 
                        type="number" 
                        step="0.1" 
                        value={formData.baseHeightLimit}
                        onChange={(e) => setFormData(prev => ({ ...prev, baseHeightLimit: e.target.value }))}
                        placeholder="2.4" 
                        className="w-16 h-6 text-xs"
                      />
                      <span className="text-xs text-gray-500">{lengthUnit} height</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="showComplexityOption">Complexity Options</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="showComplexityOption" defaultChecked />
                        <label htmlFor="showComplexityOption" className="text-sm">
                          Show complexity multiplier option in calculator
                        </label>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <h5 className="text-sm font-medium">Available Complexity Levels:</h5>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>• Standard (Basic installation)</span>
                            <span>1.0x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Medium (Bay windows, pattern matching)</span>
                            <span>1.2x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Complex (Difficult access, intricate details)</span>
                            <span>1.5x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Custom (User-defined multiplier)</span>
                            <span>Variable</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        ℹ️ Users will see this option in the calculator to adjust pricing based on job complexity
                      </div>
                    </div>
                  </div>
                </div>

                {/* Height Surcharges Toggle */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-1">
                    <h5 className="font-medium text-blue-900">Height-Based Surcharges</h5>
                    <p className="text-sm text-blue-700">Add extra charges for windows above the base height limit</p>
                  </div>
                  <Switch 
                    checked={formData.useHeightSurcharges}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useHeightSurcharges: checked }))}
                  />
                </div>

                {/* Height-based surcharges - only show when enabled */}
                {formData.useHeightSurcharges && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <h5 className="font-medium mb-3">Height-Based Surcharges</h5>
                    
                    {/* Range 1 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Height Range 1</Label>
                      <div className="grid grid-cols-5 gap-2 items-end">
                        <div>
                          <Label htmlFor="range1Start" className="text-xs">From ({lengthUnit})</Label>
                          <Input
                            id="range1Start" 
                            type="number" 
                            step="0.1" 
                            value={formData.heightRange1Start}
                            onChange={(e) => setFormData(prev => ({ ...prev, heightRange1Start: e.target.value }))}
                            placeholder="2.4" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="range1End" className="text-xs">To ({lengthUnit})</Label>
                          <Input
                            id="range1End" 
                            type="number" 
                            step="0.1" 
                            value={formData.heightRange1End}
                            onChange={(e) => setFormData(prev => ({ ...prev, heightRange1End: e.target.value }))}
                            placeholder="3.0" 
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="height1" className="text-xs">Surcharge per {fabricUnit}</Label>
                          <Input
                            id="height1" 
                            type="number" 
                            step="0.01" 
                            value={formData.heightSurcharge1}
                            onChange={(e) => setFormData(prev => ({ ...prev, heightSurcharge1: e.target.value }))}
                            placeholder="5.00" 
                          />
                        </div>
                        <div className="text-xs text-gray-500 self-center">+$ per {fabricUnit}</div>
                      </div>
                    </div>
                    
                    {/* Range 2 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Height Range 2</Label>
                      <div className="grid grid-cols-5 gap-2 items-end">
                        <div>
                          <Label htmlFor="range2Start" className="text-xs">From ({lengthUnit})</Label>
                          <Input
                            id="range2Start" 
                            type="number" 
                            step="0.1" 
                            value={formData.heightRange2Start}
                            onChange={(e) => setFormData(prev => ({ ...prev, heightRange2Start: e.target.value }))}
                            placeholder="3.0" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="range2End" className="text-xs">To ({lengthUnit})</Label>
                          <Input
                            id="range2End" 
                            type="number" 
                            step="0.1" 
                            value={formData.heightRange2End}
                            onChange={(e) => setFormData(prev => ({ ...prev, heightRange2End: e.target.value }))}
                            placeholder="4.0" 
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="height2" className="text-xs">Surcharge per {fabricUnit}</Label>
                          <Input
                            id="height2" 
                            type="number" 
                            step="0.01" 
                            value={formData.heightSurcharge2}
                            onChange={(e) => setFormData(prev => ({ ...prev, heightSurcharge2: e.target.value }))}
                            placeholder="10.00" 
                          />
                        </div>
                        <div className="text-xs text-gray-500 self-center">+$ per {fabricUnit}</div>
                      </div>
                    </div>
                    
                    {/* Range 3 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Height Range 3</Label>
                      <div className="grid grid-cols-4 gap-2 items-end">
                        <div>
                          <Label htmlFor="range3Start" className="text-xs">Above ({lengthUnit})</Label>
                          <Input
                            id="range3Start" 
                            type="number" 
                            step="0.1" 
                            value={formData.heightRange3Start}
                            onChange={(e) => setFormData(prev => ({ ...prev, heightRange3Start: e.target.value }))}
                            placeholder="4.0" 
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="height3" className="text-xs">Surcharge per {fabricUnit}</Label>
                          <Input
                            id="height3" 
                            type="number" 
                            step="0.01" 
                            value={formData.heightSurcharge3}
                            onChange={(e) => setFormData(prev => ({ ...prev, heightSurcharge3: e.target.value }))}
                            placeholder="20.00" 
                          />
                        </div>
                        <div className="text-xs text-gray-500 self-center">+$ per {fabricUnit}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Component Selection */}
            <div className="space-y-4">
              <h4 className="font-medium text-brand-primary">Component Selection</h4>
              <p className="text-sm text-gray-600">
                {requiresPricingGrid 
                  ? "Select components for display purposes only (pricing comes from CSV grid)"
                  : "Select components that will be available for this product (costs will be added to final price)"
                }
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Heading Options</Label>
                  <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                    {headingOptions.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No heading options created yet. Create some in the Components tab.</p>
                    ) : (
                      headingOptions.map((heading) => (
                        <div key={heading.id} className="flex items-center gap-2">
                          <Checkbox 
                            id={`heading-${heading.id}`}
                            checked={formData.selectedComponents.headings[heading.id] || false}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({
                                ...prev,
                                selectedComponents: {
                                  ...prev.selectedComponents,
                                  headings: {
                                    ...prev.selectedComponents.headings,
                                    [heading.id]: checked === true
                                  }
                                }
                              }))
                            }
                          />
                          <label htmlFor={`heading-${heading.id}`} className="text-sm">
                            {heading.name} ({heading.fullness}x) - ${heading.price}/{fabricUnit}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Hardware Options</Label>
                  <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                    {hardwareOptions.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No hardware options created yet. Create some in the Components tab.</p>
                    ) : (
                      hardwareOptions.map((hardware) => (
                        <div key={hardware.id} className="flex items-center gap-2">
                          <Checkbox 
                            id={`hardware-${hardware.id}`}
                            checked={formData.selectedComponents.hardware[hardware.id] || false}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({
                                ...prev,
                                selectedComponents: {
                                  ...prev.selectedComponents,
                                  hardware: {
                                    ...prev.selectedComponents.hardware,
                                    [hardware.id]: checked === true
                                  }
                                }
                              }))
                            }
                          />
                          <label htmlFor={`hardware-${hardware.id}`} className="text-sm">
                            {hardware.name} - ${hardware.price}/{hardware.unit}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lining Options</Label>
                  <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                    {liningOptions.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No lining options created yet. Create some in the Components tab.</p>
                    ) : (
                      liningOptions.map((lining) => (
                        <div key={lining.id} className="flex items-center gap-2">
                          <Checkbox 
                            id={`lining-${lining.id}`}
                            checked={formData.selectedComponents.lining[lining.id] || false}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({
                                ...prev,
                                selectedComponents: {
                                  ...prev.selectedComponents,
                                  lining: {
                                    ...prev.selectedComponents.lining,
                                    [lining.id]: checked === true
                                  }
                                }
                              }))
                            }
                          />
                          <label htmlFor={`lining-${lining.id}`} className="text-sm">
                            {lining.name} - ${lining.price}/{lining.unit}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Additional Services</Label>
                  <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                    {serviceOptions.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No service options created yet. Create some in the Components tab.</p>
                    ) : (
                      serviceOptions.map((service) => (
                        <div key={service.id} className="flex items-center gap-2">
                          <Checkbox 
                            id={`service-${service.id}`}
                            checked={formData.selectedComponents.services[service.id] || false}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({
                                ...prev,
                                selectedComponents: {
                                  ...prev.selectedComponents,
                                  services: {
                                    ...prev.selectedComponents.services,
                                    [service.id]: checked === true
                                  }
                                }
                              }))
                            }
                          />
                          <label htmlFor={`service-${service.id}`} className="text-sm">
                            {service.name} - ${service.price}/{service.unit}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCreateTemplate}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              {editingId ? "Update Template" : "Create Template"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
