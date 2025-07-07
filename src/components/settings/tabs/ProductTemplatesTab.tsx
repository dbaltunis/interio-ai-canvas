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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Product Templates</h3>
          <p className="text-sm text-brand-neutral">Define how different window covering products are calculated</p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-accent">
          <Plus className="h-4 w-4 mr-2" />
          Add Template
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

      {/* New Template Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Product Template</CardTitle>
          <CardDescription>Define a new window covering product type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="templateName">Product Name</Label>
              <Input id="templateName" placeholder="e.g., Curtains, Roman Blinds" />
            </div>
            <div>
              <Label htmlFor="calculationMethod">Calculation Method</Label>
              <Select>
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
              <Label htmlFor="pricingUnit">Pricing Unit</Label>
              <Select>
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
            <div>
              <Label htmlFor="basePrice">
                Base Labor Cost (per unit)
                <span className="text-xs text-gray-500 block font-normal">
                  Your making/sewing cost only (fabric cost added separately)
                </span>
              </Label>
              <Input id="basePrice" type="number" step="0.01" placeholder="45.00" />
            </div>
          </div>

          {/* CSV Grid Selection - shown when CSV pricing is selected */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 How This Works:</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Base Labor Cost:</strong> Your making/sewing charge per unit (e.g., $45/linear meter for curtains)</p>
              <p><strong>CSV Pricing Grid:</strong> For complex products like blinds where price varies by size combinations</p>
              <p><strong>Final Price:</strong> Base cost + Fabric cost + Component costs + Your markup</p>
            </div>
          </div>

          {/* CSV Grid Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="text-center space-y-2">
              <h4 className="font-medium">Upload CSV Pricing Grid (Optional)</h4>
              <p className="text-sm text-gray-600">
                For products with complex size-based pricing like Roman blinds
              </p>
              <div className="flex items-center justify-center gap-2">
                <Input type="file" accept=".csv" className="max-w-xs" />
                <Button variant="outline" size="sm">Upload CSV</Button>
              </div>
              <p className="text-xs text-gray-500">
                Format: Width ranges (columns) × Height ranges (rows) = Prices
              </p>
            </div>
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">
            Create Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
