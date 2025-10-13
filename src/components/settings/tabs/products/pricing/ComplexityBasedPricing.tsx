import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PricingTier {
  fabric_type: string;
  complexity: string;
  machine_price: number;
  hand_price: number;
}

interface ComplexityBasedPricingProps {
  tiers: PricingTier[];
  offersHandFinished: boolean;
  onTiersChange: (tiers: PricingTier[]) => void;
}

const FABRIC_TYPES = [
  { value: "light", label: "Light (Sheers, Voiles)" },
  { value: "medium", label: "Medium (Standard Cotton, Linen)" },
  { value: "heavy", label: "Heavy (Velvet, Thick Weaves)" },
  { value: "specialty", label: "Specialty (Silk, Delicate)" },
];

const COMPLEXITY_LEVELS = [
  { value: "simple", label: "Simple (Basic heading, no lining)" },
  { value: "standard", label: "Standard (Standard heading, lining)" },
  { value: "complex", label: "Complex (Intricate heading, interlining)" },
  { value: "luxury", label: "Luxury (Hand-pleated, multiple layers)" },
];

export const ComplexityBasedPricing = ({
  tiers,
  offersHandFinished,
  onTiersChange
}: ComplexityBasedPricingProps) => {
  const addTier = () => {
    onTiersChange([
      ...tiers,
      {
        fabric_type: "medium",
        complexity: "standard",
        machine_price: 0,
        hand_price: 0
      }
    ]);
  };

  const removeTier = (index: number) => {
    onTiersChange(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof PricingTier, value: string | number) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    onTiersChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h5 className="font-medium text-sm mb-2">💡 Complexity-Based Pricing</h5>
        <p className="text-xs text-muted-foreground">
          Set different per-metre rates based on fabric type and sewing complexity. 
          The system will automatically select the appropriate rate when creating quotes.
        </p>
      </div>

      <div className="space-y-3">
        {tiers.map((tier, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <h6 className="font-medium text-sm">Pricing Tier {index + 1}</h6>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTier(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Fabric Type</Label>
                <Select
                  value={tier.fabric_type}
                  onValueChange={(value) => updateTier(index, "fabric_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FABRIC_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Complexity Level</Label>
                <Select
                  value={tier.complexity}
                  onValueChange={(value) => updateTier(index, "complexity", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLEXITY_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Machine Price per Metre</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={tier.machine_price}
                  onChange={(e) => updateTier(index, "machine_price", parseFloat(e.target.value) || 0)}
                  placeholder="20.00"
                />
              </div>

              {offersHandFinished && (
                <div>
                  <Label className="text-xs">Hand-Finished Price per Metre</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tier.hand_price}
                    onChange={(e) => updateTier(index, "hand_price", parseFloat(e.target.value) || 0)}
                    placeholder="35.00"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addTier}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Pricing Tier
      </Button>
    </div>
  );
};
