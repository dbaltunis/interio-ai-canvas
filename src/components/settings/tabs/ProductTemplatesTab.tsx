import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  const [formData, setFormData] = useState({
    name: "",
    calculationMethod: "",
    pricingUnit: "",
    baseMakingCost: "",
    complexityMultiplier: "standard",
    showComplexityOption: true,
    heightSurcharge1: "",
    heightSurcharge2: "", 
    heightSurcharge3: "",
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

    // Create new template
    const newTemplate = {
      id: templates.length + 1,
      name: formData.name.trim(),
      calculationMethod: formData.calculationMethod,
      pricingUnit: formData.pricingUnit,
      baseMakingCost: parseFloat(formData.baseMakingCost),
      complexityMultiplier: formData.complexityMultiplier,
      showComplexityOption: formData.showComplexityOption,
      active: true,
      components: Object.keys(formData.selectedComponents).filter(key => formData.selectedComponents[key])
    };

    // Add to templates list
    setTemplates(prev => [...prev, newTemplate]);

    // Reset form
    setFormData({
      name: "",
      calculationMethod: "",
      pricingUnit: "",
      baseMakingCost: "",
      complexityMultiplier: "standard",
      showComplexityOption: true,
      heightSurcharge1: "",
      heightSurcharge2: "", 
      heightSurcharge3: "",
      selectedComponents: {
        headings: false,
        hardware: false,
        lining: false,
        services: false
      }
    });

    setIsCreating(false);
    alert("Template created successfully!");
  };

  const handleToggleCreating = () => {
    setIsCreating(!isCreating);
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
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
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
          <CardTitle>Create New Product Template</CardTitle>
          <CardDescription>Define a new window covering product type</CardDescription>
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
                <span className="text-xs text-gray-500">Per linear meter (standard height up to 2.4m)</span>
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

            {/* Height-based surcharges */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-3">Height-Based Surcharges</h5>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <Label htmlFor="height1">2.4m - 3.0m</Label>
                    <Input id="height1" type="number" step="0.01" placeholder="5.00" />
                    <span className="text-xs text-gray-500">+$ per meter</span>
                  </div>
                  <div>
                    <Label htmlFor="height2">3.0m - 4.0m</Label>
                    <Input id="height2" type="number" step="0.01" placeholder="10.00" />
                    <span className="text-xs text-gray-500">+$ per meter</span>
                  </div>
                  <div>
                    <Label htmlFor="height3">4.0m+</Label>
                    <Input id="height3" type="number" step="0.01" placeholder="20.00" />
                    <span className="text-xs text-gray-500">+$ per meter</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Required Components */}
          <div className="space-y-4">
            <h4 className="font-medium text-brand-primary">Required Components</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Heading Options</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="pencil-pleat" defaultChecked />
                    <label htmlFor="pencil-pleat" className="text-sm">Pencil Pleat (2.0x) - $15/m</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="pinch-pleat" />
                    <label htmlFor="pinch-pleat" className="text-sm">Pinch Pleat (2.2x) - $25/m</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="wave" />
                    <label htmlFor="wave" className="text-sm">Wave (2.5x) - $35/m</label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Hardware Options</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="basic-track" />
                    <label htmlFor="basic-track" className="text-sm">Basic Track - $45/m</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="premium-rod" />
                    <label htmlFor="premium-rod" className="text-sm">Premium Rod - $85/m</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Lining Options</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="standard-lining" />
                    <label htmlFor="standard-lining" className="text-sm">Standard Lining - $8.50/m</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="blackout-lining" />
                    <label htmlFor="blackout-lining" className="text-sm">Blackout Lining - $12/m</label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Additional Services</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="installation" />
                    <label htmlFor="installation" className="text-sm">Installation - $25/window</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="measuring" />
                    <label htmlFor="measuring" className="text-sm">Measuring Service - $50/visit</label>
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
            Create Template
          </Button>
        </CardContent>
      </Card>
      )}
    </div>
  );
};
