
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Calculator, Ruler } from "lucide-react";

export const CalculatorView = () => {
  const [measurements, setMeasurements] = useState({
    width: "",
    height: "",
    treatmentType: "",
    fabric: "",
    heading: "",
    lining: ""
  });

  const [calculation, setCalculation] = useState({
    fabricRequired: "0",
    totalCost: "0",
    suggestions: []
  });

  const calculateTreatment = () => {
    // AI-powered calculation logic would go here
    const width = parseFloat(measurements.width) || 0;
    const height = parseFloat(measurements.height) || 0;
    
    const fabricRequired = ((width + 0.3) * (height + 0.2) * 1.5).toFixed(2);
    const totalCost = (parseFloat(fabricRequired) * 45).toFixed(2);
    
    setCalculation({
      fabricRequired,
      totalCost,
      suggestions: [
        "Add 15cm to each side for proper coverage",
        "Consider blackout lining for bedrooms",
        "Wave heading recommended for this fabric type"
      ]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Treatment Calculator</h2>
          <p className="text-muted-foreground">
            AI-powered calculations for fabric requirements and pricing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ruler className="mr-2 h-5 w-5" />
              Measurements & Selections
            </CardTitle>
            <CardDescription>Enter window measurements and treatment preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Width (cm)</Label>
                <Input
                  id="width"
                  value={measurements.width}
                  onChange={(e) => setMeasurements({...measurements, width: e.target.value})}
                  placeholder="200"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  value={measurements.height}
                  onChange={(e) => setMeasurements({...measurements, height: e.target.value})}
                  placeholder="250"
                />
              </div>
            </div>

            <div>
              <Label>Treatment Type</Label>
              <Select value={measurements.treatmentType} onValueChange={(value) => setMeasurements({...measurements, treatmentType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curtains">Curtains</SelectItem>
                  <SelectItem value="blinds">Blinds</SelectItem>
                  <SelectItem value="roman-blinds">Roman Blinds</SelectItem>
                  <SelectItem value="shutters">Shutters</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fabric</Label>
              <Select value={measurements.fabric} onValueChange={(value) => setMeasurements({...measurements, fabric: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fabric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="velvet">Velvet</SelectItem>
                  <SelectItem value="linen">Linen</SelectItem>
                  <SelectItem value="cotton">Cotton</SelectItem>
                  <SelectItem value="silk">Silk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Heading Style</Label>
                <Select value={measurements.heading} onValueChange={(value) => setMeasurements({...measurements, heading: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Heading" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wave">Wave</SelectItem>
                    <SelectItem value="pencil-pleat">Pencil Pleat</SelectItem>
                    <SelectItem value="eyelet">Eyelet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lining</Label>
                <Select value={measurements.lining} onValueChange={(value) => setMeasurements({...measurements, lining: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lining" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="blackout">Blackout</SelectItem>
                    <SelectItem value="thermal">Thermal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={calculateTreatment} className="w-full">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Treatment
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Calculation Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{calculation.fabricRequired}m</div>
                  <div className="text-sm text-blue-600">Fabric Required</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${calculation.totalCost}</div>
                  <div className="text-sm text-green-600">Total Cost</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {calculation.suggestions.map((suggestion, index) => (
                  <Badge key={index} variant="outline" className="block w-full text-left p-2 h-auto">
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
