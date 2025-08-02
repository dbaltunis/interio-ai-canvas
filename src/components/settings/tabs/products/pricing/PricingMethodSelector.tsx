import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PricingMethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const PricingMethodSelector = ({ value, onChange }: PricingMethodSelectorProps) => {
  return (
    <div>
      <Label htmlFor="pricing_type">Pricing Method</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select pricing method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="per_metre">Per Running Metre/Yard</SelectItem>
          <SelectItem value="per_drop">Per Drop - Price multiplies by fabric pieces needed</SelectItem>
          <SelectItem value="per_panel">Per Panel - Fixed price per finished curtain</SelectItem>
          <SelectItem value="pricing_grid">Pricing Grid (Upload)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};