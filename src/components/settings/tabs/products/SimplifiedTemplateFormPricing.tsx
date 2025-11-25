import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { TemplateGridManager } from "./TemplateGridManager";
import { HandFinishedToggle } from "./pricing/HandFinishedToggle";
import { PerMetrePricing } from "./pricing/PerMetrePricing";
import { PerPanelPricing } from "./pricing/PerPanelPricing";

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
  
  const isCurtainOrRoman = formData.curtain_type === 'curtain' || formData.curtain_type === 'roman_blind';
  const isWallpaper = formData.curtain_type === 'wallpaper';
  const isBlind = !isCurtainOrRoman && !isWallpaper;
  
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {isCurtainOrRoman && (
          <HandFinishedToggle
            value={formData.offers_hand_finished}
            onChange={(checked) => handleInputChange("offers_hand_finished", checked)}
          />
        )}

        <div>
          <Label>Method</Label>
          <Select 
            value={formData.pricing_type} 
            onValueChange={(value) => handleInputChange("pricing_type", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {isBlind && (
                <>
                  <SelectItem value="pricing_grid">Grid</SelectItem>
                  <SelectItem value="per_sqm">Per m²</SelectItem>
                </>
              )}
              {isCurtainOrRoman && (
                <>
                  <SelectItem value="per_metre">Per Metre</SelectItem>
                  <SelectItem value="per_panel">Per Panel</SelectItem>
                  <SelectItem value="per_sqm">Per m²</SelectItem>
                  <SelectItem value="pricing_grid">Grid</SelectItem>
                </>
              )}
              {isWallpaper && (
                <>
                  <SelectItem value="per_unit">Per Roll</SelectItem>
                  <SelectItem value="per_sqm">Per m²</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {formData.pricing_type === "pricing_grid" && (
          <TemplateGridManager
            productType={formData.curtain_type || ""}
            systemType={formData.system_type || formData.curtain_type || ""}
          />
        )}

        {formData.pricing_type === "per_metre" && isCurtainOrRoman && (
          <PerMetrePricing
            machinePricePerMetre={formData.machine_price_per_metre}
            handPricePerMetre={formData.hand_price_per_metre}
            offersHandFinished={formData.offers_hand_finished}
            heightPriceRanges={formData.height_price_ranges}
            onInputChange={handleInputChange}
          />
        )}

        {formData.pricing_type === "per_panel" && isCurtainOrRoman && (
          <PerPanelPricing
            machinePricePerPanel={formData.machine_price_per_panel}
            handPricePerPanel={formData.hand_price_per_panel}
            offersHandFinished={formData.offers_hand_finished}
            onInputChange={handleInputChange}
          />
        )}

        {formData.pricing_type === "per_sqm" && (
          <div>
            <Label>Price ({units.currency}/m²)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.unit_price}
              onChange={(e) => handleInputChange("unit_price", e.target.value)}
            />
          </div>
        )}

        {formData.pricing_type === "per_unit" && isWallpaper && (
          <div>
            <Label>Price ({units.currency}/roll)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.unit_price}
              onChange={(e) => handleInputChange("unit_price", e.target.value)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
