import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PricingMethod {
  id: string;
  name: string;
  pricing_type: string;
  fabric_width_type?: string;
}

interface PricingMethodSelectorProps {
  pricingMethods: PricingMethod[];
  selectedMethodId: string;
  onMethodChange: (methodId: string) => void;
}

export const PricingMethodSelector = ({
  pricingMethods,
  selectedMethodId,
  onMethodChange
}: PricingMethodSelectorProps) => {
  if (!pricingMethods || pricingMethods.length === 0) {
    return null;
  }

  // If only one method, no need to show selector
  if (pricingMethods.length === 1) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="pricing-method">Pricing Method</Label>
      <Select value={selectedMethodId} onValueChange={onMethodChange}>
        <SelectTrigger id="pricing-method">
          <SelectValue placeholder="Select pricing method" />
        </SelectTrigger>
        <SelectContent>
          {pricingMethods.map((method) => (
            <SelectItem key={method.id} value={method.id}>
              {method.name}
              {method.fabric_width_type && ` (${method.fabric_width_type} fabric)`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Choose the appropriate pricing method for this treatment
      </p>
    </div>
  );
};
