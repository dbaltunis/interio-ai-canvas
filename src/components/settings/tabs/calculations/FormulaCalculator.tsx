
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, Play, AlertCircle, Info } from "lucide-react";
import { useCalculationFormulas } from "@/hooks/useCalculationFormulas";
import { FormulaEngine } from "@/utils/formulaEngine";

export const FormulaCalculator = () => {
  const { data: formulas = [] } = useCalculationFormulas();
  const [selectedFormula, setSelectedFormula] = useState<string>("");
  const [variables, setVariables] = useState<Record<string, number>>({
    width: 250,
    height: 180,
    quantity: 2,
    fullness: 2.5,
    fabric_width: 137,
    fabric_price: 25,
    header_hem: 15,
    bottom_hem: 10,
    labor_rate: 85,
    track_price_per_meter: 25,
    bracket_price: 5,
    glider_price: 0.15
  });
  const [result, setResult] = useState<any>(null);

  const selectedFormulaData = formulas.find(f => f.id === selectedFormula);

  const handleCalculate = () => {
    if (!selectedFormulaData) return;

    console.log("🧮 Testing formula:", selectedFormulaData.name);
    console.log("📊 Input variables:", variables);

    const engine = new FormulaEngine();
    engine.setVariables(variables);
    
    try {
      const calculationResult = engine.evaluateFormula(selectedFormulaData.formula_expression);
      console.log("✅ Formula result:", calculationResult);
      setResult(calculationResult);
    } catch (error) {
      console.error("❌ Formula calculation error:", error);
      setResult({
        value: 0,
        breakdown: "Formula calculation failed",
        variables: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleVariableChange = (name: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setVariables(prev => ({
      ...prev,
      [name]: numValue
    }));
    console.log(`🔧 Variable updated: ${name} = ${numValue}`);
  };

  const getFormulasByCategory = (category: string) => {
    return formulas.filter(f => f.category === category && f.active);
  };

  const getVariableDescription = (varName: string) => {
    const descriptions: Record<string, string> = {
      width: "Window/rail width in cm",
      height: "Window height/drop in cm", 
      quantity: "Number of panels/blinds",
      fullness: "Curtain fullness ratio (e.g., 2.5x)",
      fabric_width: "Fabric width in cm",
      fabric_price: "Fabric price per yard in £",
      header_hem: "Header hem allowance in cm",
      bottom_hem: "Bottom hem allowance in cm",
      labor_rate: "Labor rate per hour in £",
      track_price_per_meter: "Track price per meter in £",
      bracket_price: "Bracket price per piece in £",
      glider_price: "Glider/hook price per piece in £"
    };
    return descriptions[varName] || "Custom variable";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-primary" />
            Formula Calculator & Tester
          </CardTitle>
          <CardDescription>
            Test your calculation formulas with realistic inputs to verify they work correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formula Selection */}
          <div className="space-y-2">
            <Label htmlFor="formula-select">Select Formula to Test</Label>
            <Select value={selectedFormula} onValueChange={setSelectedFormula}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a formula to test..." />
              </SelectTrigger>
              <SelectContent>
                {['fabric', 'labor', 'hardware', 'pricing'].map(category => {
                  const categoryFormulas = getFormulasByCategory(category);
                  if (categoryFormulas.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <div className="px-2 py-1 text-sm font-medium text-gray-500 capitalize">
                        {category} Formulas ({categoryFormulas.length})
                      </div>
                      {categoryFormulas.map(formula => (
                        <SelectItem key={formula.id} value={formula.id}>
                          {formula.name}
                        </SelectItem>
                      ))}
                    </div>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedFormulaData && (
            <>
              {/* Formula Details */}
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-brand-primary mb-2">{selectedFormulaData.name}</h4>
                  <p className="text-sm text-brand-neutral mb-3">{selectedFormulaData.description}</p>
                  
                  <div className="bg-white p-3 rounded border">
                    <Label className="text-xs font-medium text-gray-600">Formula Expression</Label>
                    <code className="block mt-1 text-sm font-mono text-blue-800">
                      {selectedFormulaData.formula_expression}
                    </code>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
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
              </div>

              {/* Variable Inputs */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Test Variables
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(variables).map(([varName, value]) => (
                    <div key={varName}>
                      <Label htmlFor={varName} className="text-sm font-medium">
                        {varName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                      <Input
                        id={varName}
                        type="number"
                        step={varName.includes('price') || varName.includes('rate') ? "0.01" : varName === 'fullness' ? "0.1" : "1"}
                        value={value}
                        onChange={(e) => handleVariableChange(varName, e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {getVariableDescription(varName)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <Button 
                onClick={handleCalculate}
                className="w-full bg-brand-primary hover:bg-brand-accent"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Calculate & Test Formula
              </Button>

              {/* Results */}
              {result && (
                <div className="space-y-3">
                  <h4 className="font-medium">Calculation Result</h4>
                  
                  {result.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Formula Error</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                      <p className="text-xs text-red-500 mt-2">
                        Check your formula syntax and variable names
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-3xl font-bold text-green-700 mb-2">
                        {selectedFormulaData.category === 'fabric' ? `${result.value.toFixed(2)} yards` :
                         selectedFormulaData.category === 'pricing' ? `£${result.value.toFixed(2)}` :
                         selectedFormulaData.category === 'labor' ? `£${result.value.toFixed(2)}` :
                         `${result.value.toFixed(2)} units`}
                      </div>
                      <p className="text-sm text-green-600 mb-3">{result.breakdown}</p>
                      
                      {result.variables && result.variables.length > 0 && (
                        <div>
                          <Label className="text-xs text-gray-600 mb-2 block">Variables Used in Calculation</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {result.variables.map((variable: any) => (
                              <div key={variable.name} className="text-xs bg-white p-2 rounded border">
                                <span className="font-mono font-medium">{variable.name}:</span> {variable.value}
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
              <p className="text-lg font-medium">No formulas found</p>
              <p className="text-sm">Create some calculation formulas first to test them here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Formula Integration with Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-700">
            <p>
              <strong>How formulas connect to real projects:</strong>
            </p>
            <ul className="space-y-2 ml-4 list-disc">
              <li>Formulas are automatically used in the <strong>Jobs → Calculator</strong> section</li>
              <li><strong>Fabric formulas</strong> calculate material requirements based on window measurements</li>
              <li><strong>Labor formulas</strong> determine making costs based on complexity and time</li>
              <li><strong>Hardware formulas</strong> calculate track, bracket, and accessory costs</li>
              <li><strong>Pricing formulas</strong> combine all costs for final quotations</li>
            </ul>
            <div className="bg-white p-3 rounded border border-blue-300 mt-4">
              <p className="font-medium">Next: Go to <strong>Jobs → Create Project → Calculator</strong> to see formulas in action!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
