
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calculator, Ruler, Scissors, Settings } from "lucide-react";
import { useCalculationFormulas, CalculationFormula } from "@/hooks/useCalculationFormulas";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

export const CalculationEngineTab = () => {
  const { data: formulas, isLoading, createFormula, updateFormula } = useCalculationFormulas();
  const { toast } = useToast();
  const { getLengthUnitLabel } = useMeasurementUnits();
  const lengthUnit = getLengthUnitLabel();
  const [newFormula, setNewFormula] = useState({
    name: '',
    category: '',
    formula_expression: '',
    description: '',
    active: true,
    variables: []
  });

  const handleSaveFormula = async () => {
    if (!newFormula.name || !newFormula.category || !newFormula.formula_expression) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await createFormula.mutateAsync(newFormula);
      setNewFormula({
        name: '',
        category: '',
        formula_expression: '',
        description: '',
        active: true,
        variables: []
      });
      toast({
        title: "Success",
        description: "Formula created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create formula",
        variant: "destructive"
      });
    }
  };

  const handleToggleFormula = async (formulaId: string, active: boolean) => {
    try {
      await updateFormula.mutateAsync({ id: formulaId, active });
      toast({
        title: "Success",
        description: `Formula ${active ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update formula",
        variant: "destructive"
      });
    }
  };

  // Group formulas by category
  const formulasByCategory = formulas?.reduce((acc, formula) => {
    if (!acc[formula.category]) {
      acc[formula.category] = [];
    }
    acc[formula.category].push(formula);
    return acc;
  }, {} as Record<string, CalculationFormula[]>) || {};

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
              <Label htmlFor="seamAllowance">Seam Allowance ({lengthUnit})</Label>
              <Input id="seamAllowance" type="number" step="0.1" defaultValue="5.0" />
            </div>
            <div>
              <Label htmlFor="hemAllowance">Hem Allowance ({lengthUnit})</Label>
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
                <option value="nearest_unit">Nearest {lengthUnit}</option>
                <option value="nearest_5_units">Nearest 5 {lengthUnit}</option>
                <option value="nearest_10_units">Nearest 10 {lengthUnit}</option>
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
      {isLoading ? (
        <div className="text-center py-4">Loading formulas...</div>
      ) : Object.keys(formulasByCategory).length > 0 ? (
        Object.entries(formulasByCategory).map(([categoryName, categoryFormulas]) => {
          const getIconForCategory = (category: string) => {
            if (category.toLowerCase().includes('fabric')) return Scissors;
            if (category.toLowerCase().includes('hardware')) return Settings;
            return Ruler;
          };
          const IconComponent = getIconForCategory(categoryName);
          
          return (
            <Card key={categoryName}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5 text-brand-primary" />
                  {categoryName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryFormulas.map((formula) => (
                    <div key={formula.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Switch 
                          checked={formula.active} 
                          onCheckedChange={(checked) => handleToggleFormula(formula.id, checked)}
                        />
                        <div>
                          <h4 className="font-medium text-brand-primary">{formula.name}</h4>
                          <p className="text-sm text-brand-neutral font-mono">{formula.formula_expression}</p>
                          {formula.description && (
                            <p className="text-xs text-brand-neutral mt-1">{formula.description}</p>
                          )}
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
        })
      ) : (
        <Card>
          <CardContent className="text-center py-8 text-brand-neutral">
            No formulas configured yet. Create your first formula below.
          </CardContent>
        </Card>
      )}

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
              <Input 
                id="formulaName" 
                placeholder="e.g., Pleated Blind Fabric"
                value={newFormula.name}
                onChange={(e) => setNewFormula(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="formulaCategory">Category</Label>
              <select 
                id="formulaCategory" 
                className="w-full p-2 border rounded-md"
                value={newFormula.category}
                onChange={(e) => setNewFormula(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="">Select category...</option>
                <option value="fabric">Fabric Calculations</option>
                <option value="hardware">Hardware Calculations</option>
                <option value="measurements">Measurement Rules</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="formulaExpression">Formula Expression</Label>
            <Input 
              id="formulaExpression" 
              placeholder="e.g., (width + 10) × (height + 20)"
              value={newFormula.formula_expression}
              onChange={(e) => setNewFormula(prev => ({ ...prev, formula_expression: e.target.value }))}
            />
            <span className="text-xs text-brand-neutral">
              Use variables: width, height, fullness, allowance
            </span>
          </div>

          <div>
            <Label htmlFor="formulaDescription">Description</Label>
            <Textarea 
              id="formulaDescription" 
              placeholder="Explain when and how this formula should be used..."
              value={newFormula.description}
              onChange={(e) => setNewFormula(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <Button 
            className="bg-brand-primary hover:bg-brand-accent"
            onClick={handleSaveFormula}
            disabled={createFormula.isPending}
          >
            {createFormula.isPending ? 'Creating...' : 'Create Formula'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
