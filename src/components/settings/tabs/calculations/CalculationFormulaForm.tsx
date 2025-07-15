
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalculationFormulaFormProps {
  formula?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const CalculationFormulaForm = ({ formula, onSave, onCancel }: CalculationFormulaFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'fabric_calculation',
    formula_expression: '',
    description: '',
    formula_type: 'fabric_calculation',
    output_unit: 'meters',
    variables: [],
    applies_to: [],
    conditions: {},
    active: true
  });

  useEffect(() => {
    if (formula) {
      setFormData({
        name: formula.name || '',
        category: formula.category || 'fabric_calculation',
        formula_expression: formula.formula_expression || '',
        description: formula.description || '',
        formula_type: formula.formula_type || 'fabric_calculation',
        output_unit: formula.output_unit || 'meters',
        variables: formula.variables || [],
        applies_to: formula.applies_to || [],
        conditions: formula.conditions || {},
        active: formula.active !== false
      });
    }
  }, [formula]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formula ? 'Edit' : 'Create'} Calculation Formula</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Formula Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Curtain Fabric Usage"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fabric_calculation">Fabric Calculation</SelectItem>
                  <SelectItem value="pricing_calculation">Pricing Calculation</SelectItem>
                  <SelectItem value="labor_calculation">Labor Calculation</SelectItem>
                  <SelectItem value="hardware_calculation">Hardware Calculation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this formula calculates"
            />
          </div>

          <div>
            <Label htmlFor="formula_expression">Formula Expression</Label>
            <Textarea
              id="formula_expression"
              value={formData.formula_expression}
              onChange={(e) => setFormData({ ...formData, formula_expression: e.target.value })}
              placeholder="e.g., (width * fullness * drop) + hem_allowance + pattern_repeat_allowance"
              className="font-mono"
              rows={4}
              required
            />
            <p className="text-xs text-brand-neutral mt-1">
              Use variables like: width, height, fullness, pattern_repeat, etc.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="formula_type">Formula Type</Label>
              <Select 
                value={formData.formula_type} 
                onValueChange={(value) => setFormData({ ...formData, formula_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fabric_calculation">Fabric Calculation</SelectItem>
                  <SelectItem value="pricing_formula">Pricing Formula</SelectItem>
                  <SelectItem value="conditional_logic">Conditional Logic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="output_unit">Output Unit</Label>
              <Select 
                value={formData.output_unit} 
                onValueChange={(value) => setFormData({ ...formData, output_unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meters">Meters</SelectItem>
                  <SelectItem value="yards">Yards</SelectItem>
                  <SelectItem value="units">Units</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-brand-primary hover:bg-brand-accent">
              {formula ? 'Update' : 'Create'} Formula
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
