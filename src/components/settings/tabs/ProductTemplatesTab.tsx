import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Settings, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export const ProductTemplatesTab = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Curtains",
      calculationMethod: "width-drop",
      pricingUnit: "per-linear-meter",
      active: true,
      components: ["headings", "fabric", "lining", "hardware"]
    },
    {
      id: 2,
      name: "Roman Blinds",
      calculationMethod: "width-height",
      pricingUnit: "per-sqm",
      active: true,
      components: ["fabric", "hardware", "chain"]
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    calculationMethod: "",
    pricingUnit: "",
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
      headings: false,
      hardware: false,
      lining: false,
      services: false
    }
  });

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
    if (!formData.baseMakingCost) {
      alert("Please enter a base making cost");
      return;
    }

    const templateData = {
      name: formData.name.trim(),
      calculationMethod: formData.calculationMethod,
      pricingUnit: formData.pricingUnit,
      baseMakingCost: parseFloat(formData.baseMakingCost),
      complexityMultiplier: formData.complexityMultiplier,
      showComplexityOption: formData.showComplexityOption,
      active: true,
      components: Object.keys(formData.selectedComponents).filter(key => formData.selectedComponents[key])
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
    setFormData({
      name: "",
      calculationMethod: "",
      pricingUnit: "",
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
        headings: false,
        hardware: false,
        lining: false,
        services: false
      }
    });

    setIsCreating(false);
    setEditingId(null);
  };

  const handleToggleCreating = () => {
    setIsCreating(!isCreating);
    setEditingId(null);
    // Reset form when canceling
    if (isCreating) {
      setFormData({
        name: "",
        calculationMethod: "",
        pricingUnit: "",
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
          headings: false,
          hardware: false,
          lining: false,
          services: false
        }
      });
    }
  };

  const handleEditTemplate = (template) => {
    setEditingId(template.id);
    setIsCreating(true);
    setFormData({
      name: template.name,
      calculationMethod: template.calculationMethod,
      pricingUnit: template.pricingUnit,
      baseMakingCost: template.baseMakingCost?.toString() || "",
      baseHeightLimit: template.baseHeightLimit?.toString() || "2.4",
      useHeightSurcharges: template.useHeightSurcharges || false,
      complexityMultiplier: template.complexityMultiplier || "standard",
      showComplexityOption: template.showComplexityOption !== false,
      heightSurcharge1: "",
      heightSurcharge2: "", 
      heightSurcharge3: "",
      heightRange1Start: "2.4",
      heightRange1End: "3.0",
      heightRange2Start: "3.0", 
      heightRange2End: "4.0",
      heightRange3Start: "4.0",
      selectedComponents: {
        headings: template.components?.includes('headings') || false,
        hardware: template.components?.includes('hardware') || false,
        lining: template.components?.includes('lining') || false,
        services: template.components?.includes('services') || false
      }
    });
  };

  const handleDeleteTemplate = (templateId) => {
    if (confirm("Are you sure you want to delete this template?")) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
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
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-sm mb-2">Required Components:</h4>
                  <div className="flex gap-2 flex-wrap">
                    {template.components.map((component) => (
                      <Badge key={component} variant="outline">
                        {component}
                      </Badge>
                    ))}
                  </div>
                </div>
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
              <Select value={formData.calculationMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, calculationMethod: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="width-drop">Width × Drop (Curtains)</SelectItem>
                  <SelectItem value="width-height">Width × Height (Blinds)</SelectItem>
                  <SelectItem value="csv-pricing-grid">CSV Pricing Grid (Blinds/Complex)</SelectItem>
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
                  <SelectItem value="per-linear-meter">Per Linear Meter</SelectItem>
                  <SelectItem value="per-sqm">Per Square Meter</SelectItem>
                  <SelectItem value="per-panel">Per Panel</SelectItem>
                  <SelectItem value="per-drop">Per Drop</SelectItem>
                  <SelectItem value="csv-grid">From CSV Pricing Grid</SelectItem>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Making Cost Structure */}
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
                  <span className="text-xs text-gray-500">Per linear meter up to</span>
                  <Input 
                    type="number" 
                    step="0.1" 
                    value={formData.baseHeightLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseHeightLimit: e.target.value }))}
                    placeholder="2.4" 
                    className="w-16 h-6 text-xs"
                  />
                  <span className="text-xs text-gray-500">meters height</span>
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
                    <Label htmlFor="range1Start" className="text-xs">From (m)</Label>
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
                    <Label htmlFor="range1End" className="text-xs">To (m)</Label>
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
                    <Label htmlFor="height1" className="text-xs">Surcharge per meter</Label>
                    <Input 
                      id="height1" 
                      type="number" 
                      step="0.01" 
                      value={formData.heightSurcharge1}
                      onChange={(e) => setFormData(prev => ({ ...prev, heightSurcharge1: e.target.value }))}
                      placeholder="5.00" 
                    />
                  </div>
                  <div className="text-xs text-gray-500 self-center">+$ per meter</div>
                </div>
              </div>
              
              {/* Range 2 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Height Range 2</Label>
                <div className="grid grid-cols-5 gap-2 items-end">
                  <div>
                    <Label htmlFor="range2Start" className="text-xs">From (m)</Label>
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
                    <Label htmlFor="range2End" className="text-xs">To (m)</Label>
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
                    <Label htmlFor="height2" className="text-xs">Surcharge per meter</Label>
                    <Input 
                      id="height2" 
                      type="number" 
                      step="0.01" 
                      value={formData.heightSurcharge2}
                      onChange={(e) => setFormData(prev => ({ ...prev, heightSurcharge2: e.target.value }))}
                      placeholder="10.00" 
                    />
                  </div>
                  <div className="text-xs text-gray-500 self-center">+$ per meter</div>
                </div>
              </div>
              
              {/* Range 3 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Height Range 3</Label>
                <div className="grid grid-cols-4 gap-2 items-end">
                  <div>
                    <Label htmlFor="range3Start" className="text-xs">Above (m)</Label>
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
                    <Label htmlFor="height3" className="text-xs">Surcharge per meter</Label>
                    <Input 
                      id="height3" 
                      type="number" 
                      step="0.01" 
                      value={formData.heightSurcharge3}
                      onChange={(e) => setFormData(prev => ({ ...prev, heightSurcharge3: e.target.value }))}
                      placeholder="20.00" 
                    />
                  </div>
                  <div className="text-xs text-gray-500 self-center">+$ per meter</div>
                </div>
              </div>
            </div>
            )}
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-brand-primary">Required Components</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Heading Options</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="pencil-pleat" 
                      checked={formData.selectedComponents.headings}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          selectedComponents: {
                            ...prev.selectedComponents,
                            headings: checked === true
                          }
                        }))
                      }
                    />
                    <label htmlFor="pencil-pleat" className="text-sm">Pencil Pleat (2.0x) - $15/m</label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Hardware Options</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="basic-track" 
                      checked={formData.selectedComponents.hardware}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          selectedComponents: {
                            ...prev.selectedComponents,
                            hardware: checked === true
                          }
                        }))
                      }
                    />
                    <label htmlFor="basic-track" className="text-sm">Basic Track - $45/m</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Lining Options</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="standard-lining" 
                      checked={formData.selectedComponents.lining}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          selectedComponents: {
                            ...prev.selectedComponents,
                            lining: checked === true
                          }
                        }))
                      }
                    />
                    <label htmlFor="standard-lining" className="text-sm">Standard Lining - $8.50/m</label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Additional Services</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="installation" 
                      checked={formData.selectedComponents.services}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          selectedComponents: {
                            ...prev.selectedComponents,
                            services: checked === true
                          }
                        }))
                      }
                    />
                    <label htmlFor="installation" className="text-sm">Installation - $25/window</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Grid Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Select Existing Pricing Grid (Optional)</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a pricing grid or leave blank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Grid - Use Making Costs Below</SelectItem>
                  <SelectItem value="roman-blinds-standard">Roman Blinds - Standard Grid</SelectItem>
                  <SelectItem value="venetian-blinds-wood">Venetian Blinds - Wood Grid</SelectItem>
                  <SelectItem value="roller-blinds-basic">Roller Blinds - Basic Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Grid Represents</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="What does the grid include?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="making-only">Making Costs Only (+ fabric + components)</SelectItem>
                  <SelectItem value="complete-price">Complete Final Price (no additions)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 How This Works:</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Option 1:</strong> Use a Pricing Grid (complete pricing from Components section)</p>
              <p><strong>Option 2:</strong> Use Making Costs + Components (calculated pricing)</p>
              <p><strong>Final Price:</strong> Grid price OR (Making cost + Fabric cost + Component costs) + Your markup</p>
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
