
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, DollarSign } from "lucide-react";
import { WindowCoveringPriceCalculator } from "./WindowCoveringPriceCalculator";
import { WindowCoveringSelector } from "./WindowCoveringSelector";
import { OptionsSelector } from "./OptionsSelector";
import { useWindowCoverings, type WindowCovering } from "@/hooks/useWindowCoverings";
import { useWindowCoveringOptions } from "@/hooks/useWindowCoveringOptions";

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
    hierarchicalOptions,
    isLoading: optionsLoading 
  } = useWindowCoveringOptions(selectedWindowCovering?.id || '');

  useEffect(() => {
    if (selectedWindowCovering && availableOptions.length > 0) {
      // Auto-select default and required options
      const autoSelectOptions = availableOptions
        .filter(option => option.is_default || option.is_required)
        .map(option => option.id);
      setSelectedOptions(autoSelectOptions);
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
          <WindowCoveringSelector 
            windowCoverings={windowCoverings}
            onWindowCoveringChange={handleWindowCoveringChange}
            onFabricChange={setSelectedFabric}
          />

          {/* Options Selection */}
          {selectedWindowCovering && (
            <OptionsSelector 
              availableOptions={availableOptions}
              hierarchicalOptions={hierarchicalOptions}
              selectedOptions={selectedOptions}
              onOptionToggle={handleOptionToggle}
              isLoading={optionsLoading}
            />
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
