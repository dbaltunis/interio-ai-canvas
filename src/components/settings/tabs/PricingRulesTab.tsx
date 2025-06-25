
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Percent, Calculator, TrendingUp, Settings } from "lucide-react";

export const PricingRulesTab = () => {
  const pricingRules = [
    {
      id: 1,
      name: "Standard Curtain Markup",
      category: "Curtains",
      type: "percentage",
      value: 45,
      condition: "All standard curtain treatments",
      active: true
    },
    {
      id: 2,
      name: "Motorised Track Premium",
      category: "Hardware",
      type: "fixed_amount",
      value: 150,
      condition: "All motorised track systems",
      active: true
    },
    {
      id: 3,
      name: "Large Window Surcharge",
      category: "All",
      type: "percentage",
      value: 15,
      condition: "Windows over 3m wide",
      active: true
    },
    {
      id: 4,
      name: "Bulk Fabric Discount",
      category: "Fabrics",
      type: "percentage",
      value: -10,
      condition: "Orders over 50m of fabric",
      active: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Pricing Rules & Markup</h3>
          <p className="text-sm text-brand-neutral">Configure automatic pricing calculations and markups</p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-accent">
          <Plus className="h-4 w-4 mr-2" />
          Add Pricing Rule
        </Button>
      </div>

      {/* Global Pricing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-primary" />
            Global Pricing Settings
          </CardTitle>
          <CardDescription>Base settings that apply to all calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
              <Input id="defaultMarkup" type="number" step="0.1" defaultValue="40.0" />
            </div>
            <div>
              <Label htmlFor="laborMarkup">Labor Markup (%)</Label>
              <Input id="laborMarkup" type="number" step="0.1" defaultValue="25.0" />
            </div>
            <div>
              <Label htmlFor="materialMarkup">Material Markup (%)</Label>
              <Input id="materialMarkup" type="number" step="0.1" defaultValue="50.0" />
            </div>
            <div>
              <Label htmlFor="minimumMargin">Minimum Margin (%)</Label>
              <Input id="minimumMargin" type="number" step="0.1" defaultValue="20.0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Dynamic Pricing</h4>
                <p className="text-sm text-brand-neutral">Adjust prices based on market conditions</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Quantity Discounts</h4>
                <p className="text-sm text-brand-neutral">Apply automatic bulk discounts</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">Save Global Settings</Button>
        </CardContent>
      </Card>

      {/* Active Pricing Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-primary" />
            Active Pricing Rules
          </CardTitle>
          <CardDescription>Rules are applied in order of priority</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pricingRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Switch checked={rule.active} />
                    <div>
                      <h4 className="font-semibold text-brand-primary">{rule.name}</h4>
                      <p className="text-sm text-brand-neutral">{rule.condition}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{rule.category}</Badge>
                    <div className="text-right">
                      <div className="font-semibold">
                        {rule.type === 'percentage' ? `${rule.value}%` : `$${rule.value}`}
                      </div>
                      <div className="text-xs text-brand-neutral">
                        {rule.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category-Specific Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-brand-primary" />
            Category-Specific Markup
          </CardTitle>
          <CardDescription>Set different markup rates for product categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="curtainMarkup">Curtains & Drapes (%)</Label>
              <Input id="curtainMarkup" type="number" step="0.1" defaultValue="45.0" />
            </div>
            <div>
              <Label htmlFor="blindMarkup">Blinds (%)</Label>
              <Input id="blindMarkup" type="number" step="0.1" defaultValue="40.0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shutterMarkup">Shutters (%)</Label>
              <Input id="shutterMarkup" type="number" step="0.1" defaultValue="55.0" />
            </div>
            <div>
              <Label htmlFor="hardwareMarkup">Hardware (%)</Label>
              <Input id="hardwareMarkup" type="number" step="0.1" defaultValue="35.0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fabricMarkup">Fabrics (%)</Label>
              <Input id="fabricMarkup" type="number" step="0.1" defaultValue="50.0" />
            </div>
            <div>
              <Label htmlFor="installationMarkup">Installation (%)</Label>
              <Input id="installationMarkup" type="number" step="0.1" defaultValue="25.0" />
            </div>
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">Save Category Pricing</Button>
        </CardContent>
      </Card>

      {/* Quick Add Pricing Rule */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Pricing Rule</CardTitle>
          <CardDescription>Add a custom pricing rule for specific conditions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ruleName">Rule Name</Label>
              <Input id="ruleName" placeholder="e.g., Premium Fabric Surcharge" />
            </div>
            <div>
              <Label htmlFor="ruleCategory">Category</Label>
              <Input id="ruleCategory" placeholder="e.g., Fabrics, Hardware, All" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ruleType">Type</Label>
              <select id="ruleType" className="w-full p-2 border rounded-md">
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
              </select>
            </div>
            <div>
              <Label htmlFor="ruleValue">Value</Label>
              <Input id="ruleValue" type="number" step="0.1" placeholder="0.0" />
            </div>
            <div className="flex items-end">
              <Button className="bg-brand-primary hover:bg-brand-accent w-full">
                Add Rule
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="ruleCondition">Condition</Label>
            <Input id="ruleCondition" placeholder="e.g., When fabric cost > $50/m" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
