
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Plus, Edit, Settings, Trash2, Info } from "lucide-react";
import { useState } from "react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CalculationsTab = () => {
  const { getLengthUnitLabel } = useMeasurementUnits();
  const lengthUnit = getLengthUnitLabel();
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
            Fabric Calculation Settings
          </CardTitle>
          <CardDescription>Base allowances and settings for fabric calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Hem Allowances Section */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-brand-primary">Hem Allowances ({lengthUnit})</h4>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2 text-sm">
                  <p><strong>Important:</strong> All hem values are per side/edge, not total.</p>
                  <p><strong>Header Hem:</strong> Top of curtain - folded once for heading tape or rod pocket</p>
                  <p><strong>Bottom Hem:</strong> Bottom of curtain - typically double-folded for weight</p>
                  <p><strong>Side Hems:</strong> Left and right edges - each side gets this allowance</p>
                  <p><strong>Seam Allowance:</strong> When joining fabric widths - added to each edge being joined</p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="headerHem">Header Hem (per top edge)</Label>
                <Input id="headerHem" type="number" step="0.5" defaultValue="15.0" />
                <p className="text-xs text-gray-500 mt-1">Added once to the top of each panel</p>
              </div>
              <div>
                <Label htmlFor="bottomHem">Bottom Hem (per bottom edge)</Label>
                <Input id="bottomHem" type="number" step="0.5" defaultValue="10.0" />
                <p className="text-xs text-gray-500 mt-1">Added once to the bottom of each panel</p>
              </div>
              <div>
                <Label htmlFor="sideHem">Side Hem (per side edge)</Label>
                <Input id="sideHem" type="number" step="0.5" defaultValue="5.0" />
                <p className="text-xs text-gray-500 mt-1">Added to EACH side (left + right = 2x this value)</p>
              </div>
              <div>
                <Label htmlFor="seamAllowance">Seam Allowance (per join edge)</Label>
                <Input id="seamAllowance" type="number" step="0.1" defaultValue="1.5" />
                <p className="text-xs text-gray-500 mt-1">Added to EACH edge when joining widths (2x per seam)</p>
              </div>
            </div>

            {/* Visual Example */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">📏 Example Calculation:</h5>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Panel Width:</strong> 150{lengthUnit} + Side Hems (5{lengthUnit} × 2) = 160{lengthUnit}</p>
                <p><strong>Panel Drop:</strong> 250{lengthUnit} + Header (15{lengthUnit}) + Bottom (10{lengthUnit}) = 275{lengthUnit}</p>
                <p><strong>If 2 widths joined:</strong> Add seam allowance (1.5{lengthUnit} × 2 edges × 2 widths) = 6{lengthUnit} extra</p>
              </div>
            </div>
          </div>

          {/* Fabric Usage Settings */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-brand-primary">Fabric Usage Calculation</h4>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2 text-sm">
                  <p><strong>Fabric Wastage:</strong> Extra fabric percentage to account for cutting mistakes, pattern matching, and unusable fabric ends.</p>
                  <p><strong>Pattern Repeat:</strong> Additional fabric needed when patterns must align across seams.</p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fabricWastage">Fabric Wastage (%)</Label>
                <Input id="fabricWastage" type="number" step="0.1" defaultValue="5.0" />
                <p className="text-xs text-gray-500 mt-1">Typical range: 3-10% depending on fabric type</p>
              </div>
              <div>
                <Label htmlFor="patternRepeat">Default Pattern Repeat ({lengthUnit})</Label>
                <Input id="patternRepeat" type="number" step="0.5" defaultValue="0.0" />
                <p className="text-xs text-gray-500 mt-1">Set to 0 for plain fabrics, actual repeat for patterned</p>
              </div>
            </div>
          </div>

          {/* Measurement Rounding */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-brand-primary">Measurement Rounding</h4>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2 text-sm">
                  <p><strong>Rounding:</strong> How to round fabric measurements to standard cutting increments.</p>
                  <p><strong>Purpose:</strong> Ensures measurements are practical for cutting and ordering.</p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rounding">Fabric Measurement Rounding</Label>
                <Select defaultValue="round_up_5">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exact">No rounding (exact calculation)</SelectItem>
                    <SelectItem value="round_up_5">Round up to nearest 5{lengthUnit}</SelectItem>
                    <SelectItem value="round_up_10">Round up to nearest 10{lengthUnit}</SelectItem>
                    <SelectItem value="round_up_25">Round up to nearest 25{lengthUnit}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Recommended: Round up to nearest 5{lengthUnit}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-brand-primary" />
            Pricing Calculation Settings
          </CardTitle>
          <CardDescription>Markup and pricing rules for cost calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2 text-sm">
                <p><strong>Default Markup:</strong> This is your profit margin added to making costs and materials.</p>
                <p><strong>Important:</strong> This markup is automatically applied to making costs, NOT to final quotes.</p>
                <p><strong>Use Case:</strong> Set your standard profit margin that will be applied across all calculations.</p>
              </div>
            </AlertDescription>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultMarkup">Default Making Cost Markup (%)</Label>
              <Input id="defaultMarkup" type="number" step="0.1" defaultValue="40.0" />
              <p className="text-xs text-gray-500 mt-1">Applied to: making costs, labor, components</p>
            </div>
            <div>
              <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
              <Input id="taxRate" type="number" step="0.1" defaultValue="10.0" />
              <p className="text-xs text-gray-500 mt-1">Applied to final quote totals</p>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-medium text-green-900 mb-2">💰 Pricing Flow Example:</h5>
            <div className="text-sm text-green-800 space-y-1">
              <p><strong>Making Cost:</strong> $100</p>
              <p><strong>With 40% Markup:</strong> $100 × 1.40 = $140</p>
              <p><strong>Add Materials:</strong> $140 + $50 = $190</p>
              <p><strong>Final with 10% Tax:</strong> $190 × 1.10 = $209</p>
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
