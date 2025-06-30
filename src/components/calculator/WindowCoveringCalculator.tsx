
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator, Ruler, DollarSign } from "lucide-react";
import { WindowCoveringPriceCalculator } from "./WindowCoveringPriceCalculator";
import { useWindowCoverings, type WindowCovering } from "@/hooks/useWindowCoverings";
import { useWindowCoveringOptions, type WindowCoveringOption } from "@/hooks/useWindowCoveringOptions";

interface Fabric {
  id: string;
  name: string;
  width: number;
  price_per_meter: number;
}

export const WindowCoveringCalculator = () => {
  const { windowCoverings, isLoading: windowCoveringsLoading } = useWindowCoverings();
  const [selectedWindowCovering, setSelectedWindowCovering] = useState<WindowCovering | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  const { 
    options: availableOptions, 
    isLoading: optionsLoading 
  } = useWindowCoveringOptions(selectedWindowCovering?.id || '');

  // Mock fabrics - replace with actual data fetching when fabric management is implemented
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
    if (selectedWindowCovering && availableOptions.length > 0) {
      // Auto-select default options
      const defaultOptions = availableOptions
        .filter(option => option.is_default)
        .map(option => option.id);
      setSelectedOptions(defaultOptions);
    }
  }, [selectedWindowCovering, availableOptions]);

  const handleWindowCoveringChange = (windowCoveringId: string) => {
    const wc = windowCoverings.find(w => w.id === windowCoveringId);
    setSelectedWindowCovering(wc || null);
    setSelectedOptions([]); // Reset options when changing window covering
  };

  const handleOptionToggle = (optionId: string) => {
    const option = availableOptions.find(o => o.id === optionId);
    if (option?.is_required) return; // Can't toggle required options
    
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  if (windowCoveringsLoading) {
    return <div className="text-center py-8">Loading window coverings...</div>;
  }

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
                <Select onValueChange={handleWindowCoveringChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select window covering" />
                  </SelectTrigger>
                  <SelectContent>
                    {windowCoverings
                      .filter(wc => wc.active)
                      .map(wc => (
                        <SelectItem key={wc.id} value={wc.id}>
                          {wc.name} - {wc.fabrication_pricing_method?.replace('-', ' ') || 'No pricing method'}
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
          {selectedWindowCovering && availableOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
                <CardDescription>
                  Choose from available options for this window covering
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {optionsLoading ? (
                  <div className="text-center py-4">Loading options...</div>
                ) : (
                  availableOptions.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={option.id}
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => handleOptionToggle(option.id)}
                        disabled={option.is_required}
                        className="rounded border-gray-300"
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
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              £{option.base_cost} {option.cost_type}
                            </span>
                            {option.is_required && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                            )}
                            {option.is_default && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Default</span>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {selectedWindowCovering && availableOptions.length === 0 && !optionsLoading && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No options configured for this window covering.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Calculator Section */}
        <div>
          {selectedWindowCovering ? (
            <WindowCoveringPriceCalculator 
              windowCovering={selectedWindowCovering as any}
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
