import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { PricingMethodSelector } from "./PricingMethodSelector";
import { FabricWidthSelector } from "./FabricWidthSelector";
import { PerMetrePricing } from "./PerMetrePricing";
import { PerDropPricing } from "./PerDropPricing";
import { PerPanelPricing } from "./PerPanelPricing";
import { ComplexityBasedPricing } from "./ComplexityBasedPricing";

interface PricingMethod {
  id: string;
  name: string;
  pricing_type: 'per_metre' | 'per_drop' | 'per_panel' | 'complexity_based' | 'pricing_grid';
  fabric_width_type?: 'wide' | 'narrow';
  machine_price_per_metre?: number;
  hand_price_per_metre?: number;
  machine_price_per_drop?: number;
  hand_price_per_drop?: number;
  machine_price_per_panel?: number;
  hand_price_per_panel?: number;
  complexity_pricing_tiers?: any[];
  height_price_ranges?: Array<{
    min_height: number;
    max_height: number;
    price: number;
  }>;
}

interface MultiplePricingMethodsManagerProps {
  pricingMethods: PricingMethod[];
  offersHandFinished: boolean;
  onPricingMethodsChange: (methods: PricingMethod[]) => void;
  onSave?: () => void;
}

export const MultiplePricingMethodsManager = ({
  pricingMethods,
  offersHandFinished,
  onPricingMethodsChange,
  onSave
}: MultiplePricingMethodsManagerProps) => {
  const addPricingMethod = () => {
    const newMethod: PricingMethod = {
      id: `method-${Date.now()}`,
      name: `Pricing Method ${pricingMethods.length + 1}`,
      pricing_type: 'per_metre',
      fabric_width_type: 'wide',
      machine_price_per_metre: 0,
      hand_price_per_metre: 0,
    };
    onPricingMethodsChange([...pricingMethods, newMethod]);
  };

  const removePricingMethod = (id: string) => {
    onPricingMethodsChange(pricingMethods.filter(m => m.id !== id));
  };

  const updatePricingMethod = (id: string, updates: Partial<PricingMethod>) => {
    onPricingMethodsChange(
      pricingMethods.map(m => m.id === id ? { ...m, ...updates } : m)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Pricing Methods</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPricingMethod}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Pricing Method
        </Button>
      </div>

      {pricingMethods.length === 0 && (
        <Card className="p-4 text-center text-muted-foreground text-sm">
          No pricing methods added. Click "Add Pricing Method" to create one.
        </Card>
      )}

      {pricingMethods.map((method, index) => (
        <Card key={method.id} className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Pricing Method {index + 1}</h4>
            {pricingMethods.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePricingMethod(method.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor={`method-name-${method.id}`}>Method Name</Label>
              <Input
                id={`method-name-${method.id}`}
                value={method.name}
                onChange={(e) => updatePricingMethod(method.id, { name: e.target.value })}
                placeholder="e.g., Wide Fabric, Narrow Fabric, Premium"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This name will appear in the dropdown when creating quotes
              </p>
            </div>

            <PricingMethodSelector
              value={method.pricing_type}
              onChange={(value) => updatePricingMethod(method.id, { pricing_type: value as any })}
            />

            {method.pricing_type === 'per_drop' && (
              <FabricWidthSelector
                value={method.fabric_width_type || 'wide'}
                onChange={(value) => updatePricingMethod(method.id, { fabric_width_type: value as any })}
              />
            )}

            {method.pricing_type === 'per_metre' && (
              <PerMetrePricing
                machinePricePerMetre={method.machine_price_per_metre?.toString() || ''}
                handPricePerMetre={method.hand_price_per_metre?.toString() || ''}
                offersHandFinished={offersHandFinished}
                heightPriceRanges={method.height_price_ranges || []}
                onInputChange={(field, value) => {
                  if (field === 'machine_price_per_metre') {
                    updatePricingMethod(method.id, { machine_price_per_metre: parseFloat(value) || 0 });
                  } else if (field === 'hand_price_per_metre') {
                    updatePricingMethod(method.id, { hand_price_per_metre: parseFloat(value) || 0 });
                  } else if (field === 'height_price_ranges') {
                    updatePricingMethod(method.id, { height_price_ranges: JSON.parse(value) });
                  }
                }}
              />
            )}

            {method.pricing_type === 'per_drop' && (
              <PerDropPricing
                machinePricePerDrop={method.machine_price_per_drop?.toString() || ''}
                handPricePerDrop={method.hand_price_per_drop?.toString() || ''}
                offersHandFinished={offersHandFinished}
                dropHeightRanges={[]}
                machineDropHeightPrices={[]}
                handDropHeightPrices={[]}
                onInputChange={(field, value) => {
                  if (field === 'machine_price_per_drop') {
                    updatePricingMethod(method.id, { machine_price_per_drop: parseFloat(value) || 0 });
                  } else if (field === 'hand_price_per_drop') {
                    updatePricingMethod(method.id, { hand_price_per_drop: parseFloat(value) || 0 });
                  }
                }}
              />
            )}

            {method.pricing_type === 'per_panel' && (
              <PerPanelPricing
                machinePricePerPanel={method.machine_price_per_panel?.toString() || ''}
                handPricePerPanel={method.hand_price_per_panel?.toString() || ''}
                offersHandFinished={offersHandFinished}
                onInputChange={(field, value) => {
                  if (field === 'machine_price_per_panel') {
                    updatePricingMethod(method.id, { machine_price_per_panel: parseFloat(value) || 0 });
                  } else if (field === 'hand_price_per_panel') {
                    updatePricingMethod(method.id, { hand_price_per_panel: parseFloat(value) || 0 });
                  }
                }}
              />
            )}

            {method.pricing_type === 'complexity_based' && (
              <ComplexityBasedPricing
                tiers={method.complexity_pricing_tiers || []}
                offersHandFinished={offersHandFinished}
                onTiersChange={(tiers) => updatePricingMethod(method.id, { complexity_pricing_tiers: tiers })}
              />
            )}
          </div>
        </Card>
      ))}

      {pricingMethods.length > 0 && onSave && (
        <div className="flex justify-end pt-4">
          <Button onClick={onSave} className="gap-2">
            Save Pricing Methods
          </Button>
        </div>
      )}
    </div>
  );
};
