
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CalculationFormulaFormProps {
  formula?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const CalculationFormulaForm = ({ formula, onSave, onCancel }: CalculationFormulaFormProps) => {
  const { toast } = useToast();
  const [isGeneratingFormula, setIsGeneratingFormula] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  
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

  const generateFormulaWithAI = async () => {
    if (!formData.description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a description of what you want to calculate first.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingFormula(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-formula', {
        body: {
          description: formData.description,
          category: formData.category,
          outputUnit: formData.output_unit
        }
      });

      if (error) throw error;

      if (data?.formula) {
        setFormData(prev => ({
          ...prev,
          formula_expression: data.formula
        }));
        toast({
          title: "Formula Generated",
          description: "AI has generated a formula based on your description."
        });
      }
    } catch (error) {
      console.error('Error generating formula:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate formula. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingFormula(false);
    }
  };

  const generateDescriptionWithAI = async () => {
    if (!formData.category) {
      toast({
        title: "Category Required",
        description: "Please select a category first.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-description', {
        body: {
          category: formData.category,
          name: formData.name
        }
      });

      if (error) throw error;

      if (data?.description) {
        setFormData(prev => ({
          ...prev,
          description: data.description
        }));
        toast({
          title: "Description Generated",
          description: "AI has generated a description for this formula category."
        });
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

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
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="description">Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateDescriptionWithAI}
                disabled={isGeneratingDescription}
                className="text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
              </Button>
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this formula calculates or what you want to achieve"
              className="min-h-20"
            />
            <p className="text-xs text-brand-neutral mt-1">
              Describe what you want to calculate and AI can generate the formula for you
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="formula_expression">Formula Expression</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateFormulaWithAI}
                disabled={isGeneratingFormula || !formData.description.trim()}
                className="text-xs"
              >
                <Wand2 className="h-3 w-3 mr-1" />
                {isGeneratingFormula ? 'Generating...' : 'AI Generate Formula'}
              </Button>
            </div>
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
              Use variables like: width, height, fullness, pattern_repeat, etc. AI can generate this based on your description above.
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
