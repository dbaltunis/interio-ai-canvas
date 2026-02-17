import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { SimplifiedPricingGridStatus } from "./SimplifiedPricingGridStatus";
import { HandFinishedToggle } from "./pricing/HandFinishedToggle";
import { PerMetrePricing } from "./pricing/PerMetrePricing";
import { PerPanelPricing } from "./pricing/PerPanelPricing";
import { PerDropPricing } from "./pricing/PerDropPricing";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import { getUnitLabel } from "@/utils/measurementFormatters";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useHeadingInventory } from "@/hooks/useHeadingInventory";

interface SimplifiedTemplateFormPricingProps {
  formData: any;
  template?: any;
  templateId?: string;
  handleInputChange: (field: string, value: any) => void;
}

export const SimplifiedTemplateFormPricing = ({ 
  formData, 
  template,
  templateId,
  handleInputChange 
}: SimplifiedTemplateFormPricingProps) => {
  const { units } = useMeasurementUnits();
  const { data: headings = [] } = useHeadingInventory();
  
  // Check BOTH treatment_category (plural) and curtain_type (singular) for compatibility
  const isCurtainOrRoman = 
    formData.treatment_category === 'curtains' || 
    formData.treatment_category === 'roman_blinds' ||
    formData.curtain_type === 'curtain' || 
    formData.curtain_type === 'roman_blind';
  
  const isCurtainOnly = formData.treatment_category === 'curtains' || formData.curtain_type === 'curtain';
  
  const isWallpaper = 
    formData.treatment_category === 'wallpaper' ||
    formData.curtain_type === 'wallpaper';
  
  const isBlind = !isCurtainOrRoman && !isWallpaper;
  
  // Unit-aware labels
  const lengthLabel = units.length === 'inches' || units.length === 'feet' ? 'Yard' : 'Metre';
  const currencySymbol = getCurrencySymbol(units.currency || 'USD');
  const unitLabel = getUnitLabel(units.length);
  
  return (
    <div className="space-y-4">
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
                    <SelectItem value="per_metre">Per Running {lengthLabel}</SelectItem>
                    <SelectItem value="per_drop">Per Drop/Width</SelectItem>
                    <SelectItem value="per_panel">Per Panel</SelectItem>
                    <SelectItem value="per_sqm">Per m²</SelectItem>
                    <SelectItem value="pricing_grid">Grid</SelectItem>
                  </>
                )}
                {isWallpaper && (
                  <>
                    <SelectItem value="per_unit">Per Roll</SelectItem>
                    <SelectItem value="per_linear_meter">Per Linear {lengthLabel}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {formData.pricing_type === "pricing_grid" && (
            <div className="space-y-4">
              {/* Auto-matching explanation */}
              <Alert className="bg-primary/5 border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  <strong>Auto-matching enabled:</strong> Pricing grids are automatically matched to materials 
                  based on product type + price group. Upload grids in{" "}
                  <Link to="/settings?tab=pricing" className="text-primary underline inline-flex items-center gap-1">
                    Settings → Pricing <ArrowRight className="h-3 w-3" />
                  </Link>
                </AlertDescription>
              </Alert>
              
              {/* Template-specific grid status */}
              <SimplifiedPricingGridStatus 
                treatmentCategory={formData.treatment_category}
              />
            </div>
          )}

          {formData.pricing_type === "per_metre" && isCurtainOrRoman && (
            <PerMetrePricing
              machinePricePerMetre={formData.machine_price_per_metre}
              handPricePerMetre={formData.hand_price_per_metre}
              offersHandFinished={formData.offers_hand_finished}
              heightPriceRanges={formData.height_price_ranges}
              headingPrices={formData.heading_prices}
              selectedHeadingIds={formData.selected_heading_ids || []}
              headings={headings.map(h => ({ id: h.id, name: h.name }))}
              onInputChange={handleInputChange}
            />
          )}

          {formData.pricing_type === "per_drop" && isCurtainOrRoman && (
            <PerDropPricing
              machinePricePerDrop={formData.machine_price_per_drop}
              handPricePerDrop={formData.hand_price_per_drop}
              offersHandFinished={formData.offers_hand_finished}
              dropHeightRanges={formData.drop_height_ranges}
              machineDropHeightPrices={formData.machine_drop_height_prices}
              handDropHeightPrices={formData.hand_drop_height_prices}
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
              <Label>Price ({currencySymbol}/m²)</Label>
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
              <Label>Price ({currencySymbol}/roll)</Label>
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

      {/* Size Range Section */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-sm font-medium">Typical Size Range (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Values outside this range will show a warning during quoting, but won't block saving
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Typical Min Width ({unitLabel})</Label>
              <Input
                type="number"
                step="1"
                placeholder="—"
                value={formData.minimum_width || ""}
                onChange={(e) => handleInputChange("minimum_width", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Typical Max Width ({unitLabel})</Label>
              <Input
                type="number"
                step="1"
                placeholder="—"
                value={formData.maximum_width || ""}
                onChange={(e) => handleInputChange("maximum_width", e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Typical Min Height ({unitLabel})</Label>
              <Input
                type="number"
                step="1"
                placeholder="—"
                value={formData.minimum_height || ""}
                onChange={(e) => handleInputChange("minimum_height", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Typical Max Height ({unitLabel})</Label>
              <Input
                type="number"
                step="1"
                placeholder="—"
                value={formData.maximum_height || ""}
                onChange={(e) => handleInputChange("maximum_height", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
