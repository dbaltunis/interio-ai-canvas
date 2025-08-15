import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import type { CurtainTemplate } from "@/hooks/useCurtainTemplates";

interface HeadingOptionsSectionProps {
  template: CurtainTemplate;
  selectedHeading: string;
  onHeadingChange: (headingId: string) => void;
  readOnly?: boolean;
}

export const HeadingOptionsSection = ({
  template,
  selectedHeading,
  onHeadingChange,
  readOnly = false
}: HeadingOptionsSectionProps) => {
  const { units } = useMeasurementUnits();
  const { data: inventory = [], isLoading } = useEnhancedInventory();
  const { data: headingOptionsFromSettings = [] } = useHeadingOptions();

  // Filter heading options from inventory - looking for heading/hardware items
  const inventoryHeadingOptions = inventory.filter(item => 
    item.category?.toLowerCase().includes('heading') || 
    item.category?.toLowerCase().includes('hardware') ||
    item.category?.toLowerCase().includes('pleat') ||
    (template.selected_heading_ids && template.selected_heading_ids.includes(item.id))
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: units.currency
    }).format(price);
  };

  // Get fullness ratio from selected heading option or fallback to template
  const getSelectedFullnessRatio = () => {
    if (selectedHeading === 'standard') {
      return template.fullness_ratio;
    }
    
    const selectedHeadingOption = headingOptionsFromSettings.find(h => h.id === selectedHeading);
    if (selectedHeadingOption) {
      return selectedHeadingOption.fullness;
    }

    return template.fullness_ratio;
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium mb-2 block text-card-foreground">Heading Style</Label>
        <Select 
          value={selectedHeading} 
          onValueChange={onHeadingChange}
          disabled={readOnly}
        >
          <SelectTrigger className="h-10 text-sm container-level-2 border-border">
            <SelectValue placeholder="Choose heading style" />
          </SelectTrigger>
          <SelectContent className="container-level-1 border-2 border-border z-50">
            {isLoading ? (
              <SelectItem value="loading" disabled className="text-card-foreground">
                Loading heading options...
              </SelectItem>
            ) : (
              <>
                <SelectItem value="standard" className="text-card-foreground">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium">Standard {template.heading_name}</span>
                    <span className="text-xs text-primary ml-2 font-semibold">No upcharge</span>
                  </div>
                </SelectItem>
                {headingOptionsFromSettings.map((option) => (
                  <SelectItem key={option.id} value={option.id} className="text-card-foreground">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">{option.name}</span>
                      <span className="text-xs text-primary ml-2 font-semibold">
                        {formatPrice(option.price)}/m
                      </span>
                    </div>
                  </SelectItem>
                ))}
                {inventoryHeadingOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id} className="text-card-foreground">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">{option.name}</span>
                      <span className="text-xs text-primary ml-2 font-semibold">
                        {formatPrice(option.price_per_meter || option.unit_price || 0)}/m
                      </span>
                    </div>
                  </SelectItem>
                ))}
                {headingOptionsFromSettings.length === 0 && inventoryHeadingOptions.length === 0 && (
                  <SelectItem value="no-options" disabled className="text-card-foreground">
                    No heading options in inventory - Add heading items in Settings
                  </SelectItem>
                )}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Compact template info */}
      <div className="container-level-3 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="font-semibold text-card-foreground text-xs mb-1">Fullness</div>
            <div className="text-primary font-bold text-sm">{getSelectedFullnessRatio()}x</div>
          </div>
          <div>
            <div className="font-semibold text-card-foreground text-xs mb-1">Type</div>
            <div className="text-card-foreground font-medium text-sm truncate">{template.manufacturing_type}</div>
          </div>
          {template.heading_upcharge_per_metre && (
            <div>
              <div className="font-semibold text-card-foreground text-xs mb-1">Per meter</div>
              <div className="text-primary font-bold text-sm">{formatPrice(template.heading_upcharge_per_metre)}</div>
            </div>
          )}
          {template.heading_upcharge_per_curtain && (
            <div>
              <div className="font-semibold text-card-foreground text-xs mb-1">Per curtain</div>
              <div className="text-primary font-bold text-sm">{formatPrice(template.heading_upcharge_per_curtain)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};