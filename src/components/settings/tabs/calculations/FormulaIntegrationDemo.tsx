
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  ArrowRight, 
  CheckCircle, 
  Cog, 
  FileText,
  Package,
  DollarSign
} from "lucide-react";
import { useCalculationFormulas } from "@/hooks/useCalculationFormulas";
import { CalculationService } from "@/services/calculationService";

export const FormulaIntegrationDemo = () => {
  const { data: formulas = [] } = useCalculationFormulas();
  const [selectedScenario, setSelectedScenario] = useState<string>("curtain");
  const [calculationResult, setCalculationResult] = useState<any>(null);

  const scenarios = {
    curtain: {
      name: "Living Room Curtains",
      description: "Typical curtain project with pleated heading",
      inputs: {
        railWidth: 300,
        curtainDrop: 220,
        quantity: 2,
        headingFullness: 2.5,
        fabricWidth: 137,
        fabricPricePerYard: 28,
        treatmentType: "curtain",
        labor_rate: 85,
        header_hem: 15,
        bottom_hem: 10
      }
    },
    blind: {
      name: "Kitchen Roman Blind",
      description: "Simple roman blind for kitchen window",
      inputs: {
        railWidth: 120,
        curtainDrop: 150,
        quantity: 1,
        headingFullness: 1.1,
        fabricWidth: 137,
        fabricPricePerYard: 22,
        treatmentType: "blind",
        labor_rate: 85,
        header_hem: 5,
        bottom_hem: 5
      }
    },
    commercial: {
      name: "Office Blinds",
      description: "Commercial roller blinds for office space",
      inputs: {
        railWidth: 180,
        curtainDrop: 200,
        quantity: 4,
        headingFullness: 1.0,
        fabricWidth: 150,
        fabricPricePerYard: 18,
        treatmentType: "roller_blind",
        labor_rate: 85,
        header_hem: 3,
        bottom_hem: 3
      }
    }
  };

  const runScenarioCalculation = () => {
    const scenario = scenarios[selectedScenario as keyof typeof scenarios];
    if (!scenario) return;

    console.log("🎯 Running demo calculation for:", scenario.name);
    
    const calculationService = new CalculationService();
    const result = calculationService.calculateTreatmentCost(scenario.inputs, formulas);
    
    setCalculationResult({
      scenario: scenario.name,
      inputs: scenario.inputs,
      result
    });
  };

  const getFormulaStatusForCategory = (category: string) => {
    const categoryFormulas = formulas.filter(f => f.category === category && f.active);
    return {
      count: categoryFormulas.length,
      hasFormulas: categoryFormulas.length > 0,
      formulas: categoryFormulas
    };
  };

  const fabricStatus = getFormulaStatusForCategory('fabric');
  const laborStatus = getFormulaStatusForCategory('labor');
  const hardwareStatus = getFormulaStatusForCategory('hardware');
  const pricingStatus = getFormulaStatusForCategory('pricing');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cog className="h-5 w-5 text-brand-primary" />
            Formula Integration with Jobs
          </CardTitle>
          <CardDescription>
            See how your calculation formulas work in real project scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="status">Formula Status</TabsTrigger>
              <TabsTrigger value="demo">Live Demo</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Fabric Calculations</h4>
                    {fabricStatus.hasFormulas ? 
                      <CheckCircle className="h-5 w-5 text-green-600" /> :
                      <div className="h-5 w-5 rounded-full bg-gray-300" />
                    }
                  </div>
                  <Badge variant={fabricStatus.hasFormulas ? "default" : "secondary"}>
                    {fabricStatus.count} active formula{fabricStatus.count !== 1 ? 's' : ''}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    Calculates fabric requirements based on measurements and fullness
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Labor Calculations</h4>
                    {laborStatus.hasFormulas ? 
                      <CheckCircle className="h-5 w-5 text-green-600" /> :
                      <div className="h-5 w-5 rounded-full bg-gray-300" />
                    }
                  </div>
                  <Badge variant={laborStatus.hasFormulas ? "default" : "secondary"}>
                    {laborStatus.count} active formula{laborStatus.count !== 1 ? 's' : ''}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    Determines making costs based on complexity and time
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Hardware Calculations</h4>
                    {hardwareStatus.hasFormulas ? 
                      <CheckCircle className="h-5 w-5 text-green-600" /> :
                      <div className="h-5 w-5 rounded-full bg-gray-300" />
                    }
                  </div>
                  <Badge variant={hardwareStatus.hasFormulas ? "default" : "secondary"}>
                    {hardwareStatus.count} active formula{hardwareStatus.count !== 1 ? 's' : ''}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    Calculates track, bracket, and accessory costs
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Pricing Calculations</h4>
                    {pricingStatus.hasFormulas ? 
                      <CheckCircle className="h-5 w-5 text-green-600" /> :
                      <div className="h-5 w-5 rounded-full bg-gray-300" />
                    }
                  </div>
                  <Badge variant={pricingStatus.hasFormulas ? "default" : "secondary"}>
                    {pricingStatus.count} active formula{pricingStatus.count !== 1 ? 's' : ''}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    Combines all costs for final quotations
                  </p>
                </Card>
              </div>

              {/* Integration Flow */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3">How Formulas Integrate with Jobs</h4>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span>Product Templates</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-400" />
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-4 w-4 text-blue-600" />
                    <span>Formulas</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-400" />
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>Quotes</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-400" />
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span>Projects</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="demo" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(scenarios).map(([key, scenario]) => (
                  <Card 
                    key={key} 
                    className={`cursor-pointer transition-all ${
                      selectedScenario === key ? 'ring-2 ring-brand-primary bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedScenario(key)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium">{scenario.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        {scenario.inputs.railWidth}cm × {scenario.inputs.curtainDrop}cm
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                onClick={runScenarioCalculation}
                className="w-full bg-brand-primary hover:bg-brand-accent"
                size="lg"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Run Calculation with Current Formulas
              </Button>

              {calculationResult && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">
                      Calculation Result: {calculationResult.scenario}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Input Parameters</h5>
                        <div className="space-y-1 text-sm">
                          <div>Width: {calculationResult.inputs.railWidth}cm</div>
                          <div>Height: {calculationResult.inputs.curtainDrop}cm</div>
                          <div>Quantity: {calculationResult.inputs.quantity}</div>
                          <div>Fabric Price: £{calculationResult.inputs.fabricPricePerYard}/yard</div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Cost Breakdown</h5>
                        <div className="space-y-1 text-sm">
                          <div>Fabric: £{calculationResult.result.fabricCost.toFixed(2)}</div>
                          <div>Labor: £{calculationResult.result.laborCost.toFixed(2)}</div>
                          <div>Hardware: £{calculationResult.result.hardwareCost.toFixed(2)}</div>
                          <div className="font-medium text-lg text-green-700 pt-2 border-t">
                            Total: £{calculationResult.result.totalCost.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <h5 className="font-medium">Formula Details</h5>
                      <div className="space-y-1 text-xs">
                        <div><strong>Fabric:</strong> {calculationResult.result.breakdown.fabric.breakdown}</div>
                        <div><strong>Labor:</strong> {calculationResult.result.breakdown.labor.breakdown}</div>
                        <div><strong>Hardware:</strong> {calculationResult.result.breakdown.hardware.breakdown}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
