
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calculator, Ruler, Scissors, Settings } from "lucide-react";

export const CalculationEngineTab = () => {
  const formulaCategories = [
    {
      name: "Fabric Calculations",
      icon: Scissors,
      formulas: [
        { name: "Curtain Fabric", formula: "(Width × Fullness) + Seam Allowance", active: true },
        { name: "Roman Blind Fabric", formula: "Width + (10cm × Folds) + Hem", active: true },
        { name: "Cushion Fabric", formula: "(Width + 5cm) × (Height + 5cm) × 2", active: true }
      ]
    },
    {
      name: "Hardware Calculations", 
      icon: Settings,
      formulas: [
        { name: "Track Length", formula: "Window Width + Extensions", active: true },
        { name: "Bracket Quantity", formula: "Track Length ÷ Support Spacing + 2", active: true },
        { name: "Chain Length", formula: "Drop Height + 30cm", active: true }
      ]
    },
    {
      name: "Measurement Rules",
      icon: Ruler,
      formulas: [
        { name: "Curtain Drop", formula: "Pole Height - Sill Height + Puddle", active: true },
        { name: "Blind Width", formula: "Recess Width - 1cm", active: true },
        { name: "Outside Mount", formula: "Window Width + 15cm each side", active: true }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Calculation Engine</h3>
          <p className="text-sm text-brand-neutral">Configure automatic calculation formulas and rules</p>
        </div>
      </div>

      {/* Global Calculation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-primary" />
            Global Calculation Settings
          </CardTitle>
          <CardDescription>Base settings that affect all calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="defaultFullness">Default Curtain Fullness</Label>
              <Input id="defaultFullness" type="number" step="0.1" defaultValue="2.5" />
              <span className="text-xs text-brand-neutral">Times window width</span>
            </div>
            <div>
              <Label htmlFor="seamAllowance">Seam Allowance (cm)</Label>
              <Input id="seamAllowance" type="number" step="0.1" defaultValue="5.0" />
            </div>
            <div>
              <Label htmlFor="hemAllowance">Hem Allowance (cm)</Label>
              <Input id="hemAllowance" type="number" step="0.1" defaultValue="15.0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fabricWastage">Fabric Wastage (%)</Label>
              <Input id="fabricWastage" type="number" step="0.1" defaultValue="10.0" />
              <span className="text-xs text-brand-neutral">Additional fabric for waste/pattern matching</span>
            </div>
            <div>
              <Label htmlFor="rounding">Measurement Rounding</Label>
              <select id="rounding" className="w-full p-2 border rounded-md">
                <option value="nearest_cm">Nearest cm</option>
                <option value="nearest_5cm">Nearest 5cm</option>
                <option value="nearest_10cm">Nearest 10cm</option>
                <option value="round_up">Always round up</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-calculate fabric requirements</h4>
                <p className="text-sm text-brand-neutral">Automatically calculate fabric needed based on measurements</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Include pattern matching</h4>
                <p className="text-sm text-brand-neutral">Add extra fabric for pattern matching on patterned fabrics</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Validate measurements</h4>
                <p className="text-sm text-brand-neutral">Check for impossible or unusual measurements</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">Save Global Settings</Button>
        </CardContent>
      </Card>

      {/* Formula Categories */}
      {formulaCategories.map((category) => {
        const IconComponent = category.icon;
        return (
          <Card key={category.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconComponent className="h-5 w-5 text-brand-primary" />
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.formulas.map((formula, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Switch checked={formula.active} />
                      <div>
                        <h4 className="font-medium text-brand-primary">{formula.name}</h4>
                        <p className="text-sm text-brand-neutral font-mono">{formula.formula}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Custom Formula Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Create Custom Formula</CardTitle>
          <CardDescription>Build your own calculation formula</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="formulaName">Formula Name</Label>
              <Input id="formulaName" placeholder="e.g., Pleated Blind Fabric" />
            </div>
            <div>
              <Label htmlFor="formulaCategory">Category</Label>
              <select id="formulaCategory" className="w-full p-2 border rounded-md">
                <option value="">Select category...</option>
                <option value="fabric">Fabric Calculations</option>
                <option value="hardware">Hardware Calculations</option>
                <option value="measurements">Measurement Rules</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="formulaExpression">Formula Expression</Label>
            <Input id="formulaExpression" placeholder="e.g., (width + 10) × (height + 20)" />
            <span className="text-xs text-brand-neutral">
              Use variables: width, height, fullness, allowance
            </span>
          </div>

          <div>
            <Label htmlFor="formulaDescription">Description</Label>
            <Textarea id="formulaDescription" placeholder="Explain when and how this formula should be used..." />
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">
            Create Formula
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
