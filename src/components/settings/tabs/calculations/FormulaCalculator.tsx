import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, Play, AlertCircle } from "lucide-react";
import { useCalculationFormulas } from "@/hooks/useCalculationFormulas";
import { FormulaEngine } from "@/utils/formulaEngine";

export const FormulaCalculator = () => {
  const { data: formulas = [] } = useCalculationFormulas();
  const [selectedFormula, setSelectedFormula] = useState<string>("");
  const [variables, setVariables] = useState<Record<string, number>>({
    width: 200,
    height: 150,
    quantity: 2,
    fullness: 2.5,
    fabric_width: 137,
    fabric_price: 25
  });
  const [result, setResult] = useState<any>(null);

  const selectedFormulaData = formulas.find(f => f.id === selectedFormula);

  const handleCalculate = () => {
    if (!selectedFormulaData) return;

    const engine = new FormulaEngine();
    engine.setVariables(variables);
    
    const calculationResult = engine.evaluateFormula(selectedFormulaData.formula_expression);
    setResult(calculationResult);
  };

  const handleVariableChange = (name: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const getFormulasByCategory = (category: string) => {
    return formulas.filter(f => f.category === category && f.active);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-primary" />
            Formula Calculator
          </CardTitle>
          <CardDescription>
            Test your calculation formulas with sample inputs to verify they work correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formula Selection */}
          <div className="space-y-2">
            <Label htmlFor="formula-select">Select Formula</Label>
            <Select value={selectedFormula} onValueChange={setSelectedFormula}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a formula to test..." />
              </SelectTrigger>
              <SelectContent>
                {['fabric', 'labor', 'hardware', 'pricing'].map(category => (
                  <div key={category}>
                    <div className="px-2 py-1 text-sm font-medium text-gray-500 capitalize">
                      {category} Formulas
                    </div>
                    {getFormulasByCategory(category).map(formula => (
                      <SelectItem key={formula.id} value={formula.id}>
                        {formula.name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFormulaData && (
            <>
              {/* Formula Details */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-brand-primary">{selectedFormulaData.name}</h4>
                  <p className="text-sm text-brand-neutral">{selectedFormulaData.description}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-xs text-gray-600">Formula Expression</Label>
                  <code className="block mt-1 text-sm font-mono">
                    {selectedFormulaData.formula_expression}
                  </code>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Category: {selectedFormulaData.category}
                  </Badge>
                  {selectedFormulaData.applies_to && selectedFormulaData.applies_to.length > 0 && (
                    <Badge variant="secondary">
                      Applies to: {selectedFormulaData.applies_to.join(', ')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Variable Inputs */}
              <div className="space-y-4">
                <h4 className="font-medium">Test Variables</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={variables.width}
                      onChange={(e) => handleVariableChange('width', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height/Drop (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={variables.height}
                      onChange={(e) => handleVariableChange('height', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={variables.quantity}
                      onChange={(e) => handleVariableChange('quantity', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullness">Fullness Ratio</Label>
                    <Input
                      id="fullness"
                      type="number"
                      step="0.1"
                      value={variables.fullness}
                      onChange={(e) => handleVariableChange('fullness', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fabric_width">Fabric Width (cm)</Label>
                    <Input
                      id="fabric_width"
                      type="number"
                      value={variables.fabric_width}
                      onChange={(e) => handleVariableChange('fabric_width', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fabric_price">Fabric Price (£/yard)</Label>
                    <Input
                      id="fabric_price"
                      type="number"
                      step="0.01"
                      value={variables.fabric_price}
                      onChange={(e) => handleVariableChange('fabric_price', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <Button 
                onClick={handleCalculate}
                className="bg-brand-primary hover:bg-brand-accent"
              >
                <Play className="h-4 w-4 mr-2" />
                Calculate
              </Button>

              {/* Results */}
              {result && (
                <div className="space-y-3">
                  <h4 className="font-medium">Calculation Result</h4>
                  
                  {result.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Error</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-700">
                        £{result.value.toFixed(2)}
                      </div>
                      <p className="text-sm text-green-600 mt-1">{result.breakdown}</p>
                      
                      {result.variables.length > 0 && (
                        <div className="mt-3">
                          <Label className="text-xs text-gray-600">Variables Used</Label>
                          <div className="grid grid-cols-3 gap-2 mt-1">
                            {result.variables.map((variable: any) => (
                              <div key={variable.name} className="text-xs">
                                <span className="font-mono">{variable.name}:</span> {variable.value}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {formulas.length === 0 && (
            <div className="text-center py-8 text-brand-neutral">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No formulas found. Create some calculation formulas first to test them here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
