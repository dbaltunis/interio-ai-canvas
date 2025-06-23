
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Ruler, DollarSign, Package } from "lucide-react";

export const CalculatorView = () => {
  const [measurements, setMeasurements] = useState({
    width: '',
    height: '',
    treatmentType: '',
    fabricType: '',
    quantity: '1'
  });

  const [calculation, setCalculation] = useState({
    fabricYardage: 0,
    laborCost: 0,
    materialCost: 0,
    totalCost: 0
  });

  const treatmentTypes = [
    { value: "curtains", label: "Curtains", multiplier: 2.5, laborRate: 45 },
    { value: "drapes", label: "Drapes", multiplier: 2.0, laborRate: 55 },
    { value: "valances", label: "Valances", multiplier: 1.5, laborRate: 35 },
    { value: "roman-shades", label: "Roman Shades", multiplier: 1.2, laborRate: 65 },
    { value: "blinds", label: "Blinds", multiplier: 1.0, laborRate: 25 },
    { value: "shutters", label: "Shutters", multiplier: 1.0, laborRate: 85 }
  ];

  const fabricTypes = [
    { value: "cotton", label: "Cotton", pricePerYard: 25 },
    { value: "linen", label: "Linen", pricePerYard: 35 },
    { value: "silk", label: "Silk", pricePerYard: 55 },
    { value: "velvet", label: "Velvet", pricePerYard: 45 },
    { value: "polyester", label: "Polyester", pricePerYard: 18 },
    { value: "blackout", label: "Blackout", pricePerYard: 30 }
  ];

  const calculateCosts = () => {
    const width = parseFloat(measurements.width) || 0;
    const height = parseFloat(measurements.height) || 0;
    const quantity = parseInt(measurements.quantity) || 1;

    if (width === 0 || height === 0 || !measurements.treatmentType || !measurements.fabricType) {
      return;
    }

    const treatment = treatmentTypes.find(t => t.value === measurements.treatmentType);
    const fabric = fabricTypes.find(f => f.value === measurements.fabricType);

    if (!treatment || !fabric) return;

    // Calculate fabric yardage needed
    const windowArea = (width * height) / 144; // Convert to square feet
    const fabricYardage = windowArea * treatment.multiplier * quantity;

    // Calculate costs
    const materialCost = fabricYardage * fabric.pricePerYard;
    const laborHours = Math.max(2, windowArea * 0.5); // Minimum 2 hours
    const laborCost = laborHours * treatment.laborRate * quantity;
    const totalCost = materialCost + laborCost;

    setCalculation({
      fabricYardage: Math.ceil(fabricYardage * 10) / 10, // Round up to nearest 0.1
      laborCost,
      materialCost,
      totalCost
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cost Calculator</h2>
          <p className="text-muted-foreground">
            Calculate materials and labor costs for window treatments
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ruler className="mr-2 h-5 w-5" />
              Project Details
            </CardTitle>
            <CardDescription>Enter measurements and treatment specifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Width (inches)</Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="36"
                  value={measurements.width}
                  onChange={(e) => setMeasurements({...measurements, width: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (inches)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="84"
                  value={measurements.height}
                  onChange={(e) => setMeasurements({...measurements, height: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="treatment">Treatment Type</Label>
              <Select value={measurements.treatmentType} onValueChange={(value) => setMeasurements({...measurements, treatmentType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment type" />
                </SelectTrigger>
                <SelectContent>
                  {treatmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fabric">Fabric Type</Label>
              <Select value={measurements.fabricType} onValueChange={(value) => setMeasurements({...measurements, fabricType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fabric type" />
                </SelectTrigger>
                <SelectContent>
                  {fabricTypes.map((fabric) => (
                    <SelectItem key={fabric.value} value={fabric.value}>
                      {fabric.label} - {formatCurrency(fabric.pricePerYard)}/yard
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={measurements.quantity}
                onChange={(e) => setMeasurements({...measurements, quantity: e.target.value})}
              />
            </div>

            <Button onClick={calculateCosts} className="w-full">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Costs
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Cost Breakdown
            </CardTitle>
            <CardDescription>Estimated project costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Material Requirements */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center">
                  <Package className="mr-2 h-4 w-4" />
                  Material Requirements
                </h4>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Fabric Needed</p>
                    <p className="text-lg font-semibold">{calculation.fabricYardage} yards</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Window Size</p>
                    <p className="text-lg font-semibold">
                      {measurements.width}" × {measurements.height}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3">
                <h4 className="font-medium">Cost Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Material Cost</span>
                    <span className="font-medium">{formatCurrency(calculation.materialCost)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Labor Cost</span>
                    <span className="font-medium">{formatCurrency(calculation.laborCost)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-primary/20">
                    <span className="text-lg font-semibold">Total Cost</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(calculation.totalCost)}
                    </span>
                  </div>
                </div>
              </div>

              {calculation.totalCost > 0 && (
                <div className="pt-4">
                  <Button className="w-full" variant="outline">
                    Save to Project
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Guide</CardTitle>
          <CardDescription>Quick reference for different window treatments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {treatmentTypes.map((treatment) => (
              <div key={treatment.value} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{treatment.label}</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Fabric multiplier: {treatment.multiplier}x</p>
                  <p>Labor rate: {formatCurrency(treatment.laborRate)}/hour</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
