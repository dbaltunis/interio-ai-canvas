import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Plus, Edit, Settings, Trash2 } from "lucide-react";
import { useState } from "react";

export const CalculationsTab = () => {
  const [calculationRules] = useState([
    {
      id: 1,
      name: "Curtain Fabric Calculation",
      type: "fabric",
      formula: "(width × fullness + allowances) × (drop + hems)",
      active: true,
      description: "Calculate fabric needed for curtains including fullness and allowances"
    },
    {
      id: 2,
      name: "Pooling Addition",
      type: "measurement",
      formula: "base_drop + pooling_cm",
      active: true,
      description: "Add pooling length to curtain drop"
    },
    {
      id: 3,
      name: "Making Cost Markup",
      type: "pricing",
      formula: "base_cost × (1 + markup_percentage / 100)",
      active: true,
      description: "Apply markup to making costs"
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Calculation Rules</h3>
          <p className="text-sm text-brand-neutral">Define how measurements and pricing are calculated</p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-accent">
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Global Calculation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-primary" />
            Global Settings
          </CardTitle>
          <CardDescription>Base settings that affect all calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="seamAllowance">Seam Allowance (cm)</Label>
              <Input id="seamAllowance" type="number" step="0.1" defaultValue="5.0" />
            </div>
            <div>
              <Label htmlFor="hemAllowance">Hem Allowance (cm)</Label>
              <Input id="hemAllowance" type="number" step="0.1" defaultValue="15.0" />
            </div>
            <div>
              <Label htmlFor="fabricWastage">Fabric Wastage (%)</Label>
              <Input id="fabricWastage" type="number" step="0.1" defaultValue="10.0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rounding">Measurement Rounding</Label>
              <Select defaultValue="nearest_cm">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest_cm">Nearest cm</SelectItem>
                  <SelectItem value="nearest_5cm">Nearest 5cm</SelectItem>
                  <SelectItem value="nearest_10cm">Nearest 10cm</SelectItem>
                  <SelectItem value="round_up">Always round up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
              <Input id="defaultMarkup" type="number" step="0.1" defaultValue="40.0" />
            </div>
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">Save Settings</Button>
        </CardContent>
      </Card>

      {/* Calculation Rules */}
      <div className="space-y-3">
        <h4 className="font-medium">Active Calculation Rules</h4>
        {calculationRules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Switch checked={rule.active} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-brand-primary">{rule.name}</h5>
                      <Badge variant="secondary">{rule.type}</Badge>
                    </div>
                    <p className="text-sm text-brand-neutral mb-1">{rule.description}</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {rule.formula}
                    </code>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Rule */}
      <Card>
        <CardHeader>
          <CardTitle>Create Calculation Rule</CardTitle>
          <CardDescription>Define a custom calculation formula</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ruleName">Rule Name</Label>
              <Input id="ruleName" placeholder="e.g., Border Fabric Calculation" />
            </div>
            <div>
              <Label htmlFor="ruleType">Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fabric">Fabric Calculation</SelectItem>
                  <SelectItem value="pricing">Pricing Rule</SelectItem>
                  <SelectItem value="measurement">Measurement Rule</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="formula">Formula Expression</Label>
            <Input 
              id="formula" 
              placeholder="e.g., width * height * multiplier"
              className="font-mono"
            />
            <p className="text-xs text-brand-neutral mt-1">
              Available variables: width, height, drop, fullness, quantity
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Explain when and how this rule is applied..."
            />
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">
            Create Rule
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};