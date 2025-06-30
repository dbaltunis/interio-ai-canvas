
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calculator, Ruler, DollarSign } from "lucide-react";
import { WindowCoveringPriceCalculator } from "./WindowCoveringPriceCalculator";

interface WindowCovering {
  id: string;
  name: string;
  fabrication_pricing_method: 'per-panel' | 'per-drop' | 'per-meter' | 'per-yard' | 'pricing-grid';
  unit_price: number;
  margin_percentage: number;
  pricing_grid_data?: string;
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

export const WindowCoveringCalculator = () => {
  const [selectedWindowCovering, setSelectedWindowCovering] = useState<WindowCovering | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [availableOptions, setAvailableOptions] = useState<Option[]>([]);

  // Mock data - replace with actual data fetching
  const mockWindowCoverings: WindowCovering[] = [
    {
      id: "1",
      name: "Roman Blind",
      fabrication_pricing_method: 'per-panel',
      unit_price: 45.00,
      margin_percentage: 40,
      pricing_grid_data: undefined
    },
    {
      id: "2", 
      name: "Curtains",
      fabrication_pricing_method: 'per-panel',
      unit_price: 65.00,
      margin_percentage: 45,
      pricing_grid_data: undefined
    },
    {
      id: "3",
      name: "Custom Blinds",
      fabrication_pricing_method: 'pricing-grid',
      unit_price: 0,
      margin_percentage: 40,
      pricing_grid_data: `Drop/Width,100,200,300,400,500
100,23,46,69,92,115
200,46,92,138,184,230
300,69,138,207,276,345
400,92,184,276,368,460
500,115,230,345,460,575`
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
      // Mock options based on window covering - replace with actual data fetching
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
        },
        {
          id: "3",
          option_type: "border",
          name: "Contrast Border",
          cost_type: "per-meter",
          base_cost: 15.00,
          is_required: false,
          is_default: false
        }
      ];
      
      setAvailableOptions(mockOptions);
      setSelectedOptions(mockOptions.filter(o => o.is_default).map(o => o.id));
    }
  }, [selectedWindowCovering]);

  const handleOptionToggle = (optionId: string) => {
    const option = availableOptions.find(o => o.id === optionId);
    if (option?.is_required) return; // Can't toggle required options
    
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const getSelectedOptionsTotal = () => {
    return availableOptions
      .filter(option => selectedOptions.includes(option.id))
      .reduce((total, option) => total + option.base_cost, 0);
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
                        {wc.name} - {wc.fabrication_pricing_method.replace('-', ' ')}
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
            </CardContent>
          </Card>

          {/* Options Selection */}
          {availableOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
                <CardDescription>
                  Choose from available options for this window covering
                </CardDescription>
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
                        <div>
                          <span className="font-medium">{option.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({option.option_type})
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            £{option.base_cost} {option.cost_type}
                          </Badge>
                          {option.is_required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                          {option.is_default && (
                            <Badge variant="default" className="text-xs">Default</Badge>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
                
                {selectedOptions.length > 0 && (
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Selected Options Total:</span>
                      <Badge variant="outline" className="font-bold">
                        £{getSelectedOptionsTotal().toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Calculator Section */}
        <div>
          {selectedWindowCovering ? (
            <WindowCoveringPriceCalculator 
              windowCovering={selectedWindowCovering}
              selectedOptions={selectedOptions}
              availableOptions={availableOptions}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Price Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Select a window covering type to start calculating prices
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
