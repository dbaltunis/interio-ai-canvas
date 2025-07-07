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
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="basePrice">Base Making Cost</Label>
              <Input id="basePrice" type="number" step="0.01" placeholder="0.00" />
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
