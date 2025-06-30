
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calculator, Ruler, DollarSign } from "lucide-react";

interface WindowCovering {
  id: string;
  name: string;
  base_making_cost: number;
  fabric_calculation_method: string;
  fabric_multiplier: number;
  margin_percentage: number;
}

interface Option {
  id: string;
  option_type: string;
  name: string;
  cost_type: string;
  base_cost: number;
  is_required: boolean;
  is_default: boolean;
}

interface Fabric {
  id: string;
  name: string;
  width: number;
  price_per_meter: number;
}

interface CalculationResult {
  fabric_usage: number;
  fabric_waste: number;
  fabric_cost: number;
  making_cost: number;
  options_cost: number;
  total_cost: number;
  margin_amount: number;
  selling_price: number;
}

export const WindowCoveringCalculator = () => {
  const [selectedWindowCovering, setSelectedWindowCovering] = useState<WindowCovering | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [drop, setDrop] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [availableOptions, setAvailableOptions] = useState<Option[]>([]);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);

  // Mock data - replace with actual data fetching
  const mockWindowCoverings: WindowCovering[] = [
    {
      id: "1",
      name: "Roman Blind",
      base_making_cost: 45.00,
      fabric_calculation_method: "standard",
      fabric_multiplier: 1.2,
      margin_percentage: 40
    },
    {
      id: "2", 
      name: "Curtains",
      base_making_cost: 65.00,
      fabric_calculation_method: "gathered",
      fabric_multiplier: 2.5,
      margin_percentage: 45
    }
  ];

  const mockFabrics: Fabric[] = [
    {
      id: "1",
      name: "Cotton Canvas",
      width: 1.37,
      price_per_meter: 25.50
    },
    {
      id: "2",
      name: "Linen Blend",
      width: 1.50,
      price_per_meter: 35.00
    }
  ];

  useEffect(() => {
    if (selectedWindowCovering) {
      // Mock options - replace with actual data fetching
      const mockOptions: Option[] = [
        {
          id: "1",
          option_type: "heading",
          name: "Pinch Pleat",
          cost_type: "per-meter",
          base_cost: 8.50,
          is_required: true,
          is_default: true
        },
        {
          id: "2",
          option_type: "lining",
          name: "Blackout Lining",
          cost_type: "per-sqm",
          base_cost: 12.00,
          is_required: false,
          is_default: false
        }
      ];
      
      setAvailableOptions(mockOptions);
      setSelectedOptions(mockOptions.filter(o => o.is_default).map(o => o.id));
    }
  }, [selectedWindowCovering]);

  const calculateResult = () => {
    if (!selectedWindowCovering || !selectedFabric || !width || !drop) return;

    const fabricWidthMeters = selectedFabric.width;
    const windowWidthMeters = width / 100; // Convert cm to meters
    const windowDropMeters = drop / 100; // Convert cm to meters

    // Calculate fabric usage based on method
    let fabricUsage = 0;
    if (selectedWindowCovering.fabric_calculation_method === 'gathered') {
      fabricUsage = (windowWidthMeters * selectedWindowCovering.fabric_multiplier * windowDropMeters) / fabricWidthMeters;
    } else {
      fabricUsage = (windowWidthMeters * windowDropMeters * selectedWindowCovering.fabric_multiplier) / fabricWidthMeters;
    }

    // Add waste calculation (typically 10-15%)
    const wastePercentage = 0.12;
    const fabricWaste = fabricUsage * wastePercentage;
    const totalFabricNeeded = fabricUsage + fabricWaste;

    const fabricCost = totalFabricNeeded * selectedFabric.price_per_meter;
    const makingCost = selectedWindowCovering.base_making_cost;

    // Calculate options cost
    const optionsCost = availableOptions
      .filter(option => selectedOptions.includes(option.id))
      .reduce((total, option) => {
        let cost = 0;
        switch (option.cost_type) {
          case 'per-meter':
            cost = option.base_cost * windowWidthMeters;
            break;
          case 'per-sqm':
            cost = option.base_cost * (windowWidthMeters * windowDropMeters);
            break;
          case 'fixed':
            cost = option.base_cost;
            break;
          default:
            cost = option.base_cost;
        }
        return total + cost;
      }, 0);

    const totalCost = fabricCost + makingCost + optionsCost;
    const marginAmount = (totalCost * selectedWindowCovering.margin_percentage) / 100;
    const sellingPrice = totalCost + marginAmount;

    const result: CalculationResult = {
      fabric_usage: fabricUsage,
      fabric_waste: fabricWaste,
      fabric_cost: fabricCost,
      making_cost: makingCost,
      options_cost: optionsCost,
      total_cost: totalCost,
      margin_amount: marginAmount,
      selling_price: sellingPrice
    };

    setCalculation(result);
  };

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6 text-brand-primary" />
        <h2 className="text-2xl font-semibold text-brand-primary">Window Covering Calculator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Product Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Window Covering Type</Label>
                <Select onValueChange={(value) => {
                  const wc = mockWindowCoverings.find(w => w.id === value);
                  setSelectedWindowCovering(wc || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select window covering" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWindowCoverings.map(wc => (
                      <SelectItem key={wc.id} value={wc.id}>
                        {wc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fabric</Label>
                <Select onValueChange={(value) => {
                  const fabric = mockFabrics.find(f => f.id === value);
                  setSelectedFabric(fabric || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fabric" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockFabrics.map(fabric => (
                      <SelectItem key={fabric.id} value={fabric.id}>
                        {fabric.name} - £{fabric.price_per_meter}/m
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={width || ''}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    placeholder="150"
                  />
                </div>
                <div>
                  <Label htmlFor="drop">Drop (cm)</Label>
                  <Input
                    id="drop"
                    type="number"
                    value={drop || ''}
                    onChange={(e) => setDrop(Number(e.target.value))}
                    placeholder="200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options Selection */}
          {availableOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableOptions.map(option => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={() => handleOptionToggle(option.id)}
                      disabled={option.is_required}
                    />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>{option.name}</span>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            £{option.base_cost} {option.cost_type}
                          </Badge>
                          {option.is_required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={calculateResult} 
            className="w-full bg-brand-primary hover:bg-brand-accent"
            disabled={!selectedWindowCovering || !selectedFabric || !width || !drop}
          >
            Calculate
          </Button>
        </div>

        {/* Results Section */}
        <div>
          {calculation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Calculation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-brand-neutral">Fabric Usage</Label>
                    <p className="font-semibold">{calculation.fabric_usage.toFixed(2)}m</p>
                  </div>
                  <div>
                    <Label className="text-brand-neutral">Fabric Waste</Label>
                    <p className="font-semibold">{calculation.fabric_waste.toFixed(2)}m</p>
                  </div>
                  <div>
                    <Label className="text-brand-neutral">Fabric Cost</Label>
                    <p className="font-semibold">£{calculation.fabric_cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-brand-neutral">Making Cost</Label>
                    <p className="font-semibold">£{calculation.making_cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-brand-neutral">Options Cost</Label>
                    <p className="font-semibold">£{calculation.options_cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-brand-neutral">Total Cost</Label>
                    <p className="font-semibold">£{calculation.total_cost.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-brand-neutral">Margin ({selectedWindowCovering?.margin_percentage}%)</Label>
                      <p className="font-semibold text-green-600">£{calculation.margin_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-brand-neutral">Selling Price</Label>
                      <p className="text-xl font-bold text-brand-primary">£{calculation.selling_price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
