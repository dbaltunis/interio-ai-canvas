import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { TemplateGridManager } from "./TemplateGridManager";

interface SimplifiedTemplateFormPricingProps {
  formData: any;
  template?: any;
  handleInputChange: (field: string, value: any) => void;
}

export const SimplifiedTemplateFormPricing = ({ 
  formData, 
  template,
  handleInputChange 
}: SimplifiedTemplateFormPricingProps) => {
  const { units } = useMeasurementUnits();
  
  // Determine available pricing methods based on treatment type
  const isCurtainOrRoman = formData.curtain_type === 'curtain' || formData.curtain_type === 'roman_blind';
  const isBlind = !isCurtainOrRoman;
  
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Pricing Method Selection */}
        <div>
          <Label htmlFor="pricing_method">Pricing Method</Label>
          <Select 
            value={formData.pricing_type} 
            onValueChange={(value) => handleInputChange("pricing_type", value)}
          >
            <SelectTrigger id="pricing_method">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {isBlind && (
                <>
                  <SelectItem value="pricing_grid">Pricing Grid</SelectItem>
                  <SelectItem value="per_sqm">Per Square Metre</SelectItem>
                </>
              )}
              {isCurtainOrRoman && (
                <>
                  <SelectItem value="per_metre">Per Linear Metre</SelectItem>
                  <SelectItem value="per_sqm">Per Square Metre</SelectItem>
                  <SelectItem value="pricing_grid">Pricing Grid</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Pricing Grid Configuration */}
        {formData.pricing_type === "pricing_grid" && (
          <>
            <TemplateGridManager
              productType={formData.curtain_type || ""}
              systemType={formData.system_type || ""}
            />
          </>
        )}

        {/* Per Square Metre */}
        {formData.pricing_type === "per_sqm" && (
          <div>
            <Label htmlFor="unit_price">Price per m² ({units.currency})</Label>
            <Input
              id="unit_price"
              type="number"
              step="0.01"
              value={formData.unit_price}
              onChange={(e) => handleInputChange("unit_price", e.target.value)}
              placeholder="150"
            />
          </div>
        )}

        {/* Per Linear Metre */}
        {formData.pricing_type === "per_metre" && (
          <div>
            <Label htmlFor="machine_price_per_metre">Price per metre ({units.currency})</Label>
            <Input
              id="machine_price_per_metre"
              type="number"
              step="0.01"
              value={formData.machine_price_per_metre}
              onChange={(e) => handleInputChange("machine_price_per_metre", e.target.value)}
              placeholder="50"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
