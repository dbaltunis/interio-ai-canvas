import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import type { CurtainTemplate } from "@/hooks/useCurtainTemplates";
import type { EyeletRing } from "@/hooks/useEyeletRings";

interface HeadingOptionsSectionProps {
  template: CurtainTemplate;
  selectedHeading: string;
  onHeadingChange: (headingId: string) => void;
  selectedEyeletRing?: string;
  onEyeletRingChange?: (ringId: string) => void;
  headingFullness?: number;
  onHeadingFullnessChange?: (fullness: number) => void;
  readOnly?: boolean;
}

export const HeadingOptionsSection = ({
  template,
  selectedHeading,
  onHeadingChange,
  selectedEyeletRing,
  onEyeletRingChange,
  headingFullness,
  onHeadingFullnessChange,
  readOnly = false
}: HeadingOptionsSectionProps) => {
  const { units, getLengthUnitLabel } = useMeasurementUnits();
  const { data: inventory = [], isLoading } = useEnhancedInventory();
  const { data: headingOptionsFromSettings = [] } = useHeadingOptions();
  const [availableRings, setAvailableRings] = useState<EyeletRing[]>([]);

  // Filter heading options from inventory - looking for heading/hardware items
  const inventoryHeadingOptions = inventory.filter(item => 
    item.category?.toLowerCase().includes('heading') || 
    item.category?.toLowerCase().includes('hardware') ||
    item.category?.toLowerCase().includes('pleat') ||
    (template.selected_heading_ids && template.selected_heading_ids.includes(item.id))
  );

  const formatPrice = (price: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    const symbol = currencySymbols[units.currency] || units.currency;
    return `${symbol}${price.toFixed(2)}`;
  };

  // Get fullness ratio from selected heading option or fallback to template
  const getSelectedFullnessRatio = () => {
    if (selectedHeading === 'standard') {
      return template.fullness_ratio;
    }
    
    // If there's a manually set fullness, use that
    if (headingFullness) {
      return headingFullness;
    }
    
    // Check inventory items first for multiple ratios
    const selectedItem = inventory.find(item => item.id === selectedHeading);
    if (selectedItem && selectedItem.metadata) {
      const metadata = selectedItem.metadata as any;
      if (metadata.use_multiple_ratios && metadata.multiple_fullness_ratios && metadata.multiple_fullness_ratios.length > 0) {
        // Return first ratio as default
        return metadata.multiple_fullness_ratios[0];
      }
      if (metadata.fullness_ratio) {
        return metadata.fullness_ratio;
      }
    }
    
    const selectedHeadingOption = headingOptionsFromSettings.find(h => h.id === selectedHeading);
    if (selectedHeadingOption) {
      return selectedHeadingOption.fullness;
    }

    return template.fullness_ratio;
  };

  // Get available fullness ratios for current heading
  const getAvailableFullnessRatios = (): number[] => {
    if (selectedHeading === 'standard') {
      return [];
    }
    
    const selectedItem = inventory.find(item => item.id === selectedHeading);
    if (selectedItem && selectedItem.metadata) {
      const metadata = selectedItem.metadata as any;
      if (metadata.use_multiple_ratios && metadata.multiple_fullness_ratios && metadata.multiple_fullness_ratios.length > 1) {
        return metadata.multiple_fullness_ratios;
      }
    }
    
    return [];
  };

  // Get extra fabric for current heading
  const getExtraFabric = (): number => {
    if (selectedHeading === 'standard') {
      return 0;
    }
    
    const selectedItem = inventory.find(item => item.id === selectedHeading);
    if (selectedItem && selectedItem.metadata) {
      const metadata = selectedItem.metadata as any;
      return metadata.extra_fabric || 0;
    }
    
    return 0;
  };

  // Get advanced settings for current heading
  const getAdvancedSettings = () => {
    if (selectedHeading === 'standard') {
      return null;
    }
    
    const selectedItem = inventory.find(item => item.id === selectedHeading);
    if (selectedItem && selectedItem.metadata) {
      return selectedItem.metadata as any;
    }
    
    return null;
  };

  // Check if selected heading is eyelet type and load available rings
  useEffect(() => {
    if (selectedHeading && selectedHeading !== 'standard') {
      const selectedItem = inventory.find(item => item.id === selectedHeading);
      
      if (selectedItem && selectedItem.metadata) {
        const metadata = selectedItem.metadata as any;
        
        // Check if it's an eyelet heading
        if (metadata.heading_type === 'eyelet' && metadata.eyelet_rings) {
          setAvailableRings(metadata.eyelet_rings);
          // Auto-select first ring if none selected
          if (!selectedEyeletRing && metadata.eyelet_rings.length > 0 && onEyeletRingChange) {
            onEyeletRingChange(metadata.eyelet_rings[0].id);
          }
        } else {
          setAvailableRings([]);
        }
      }
    } else {
      setAvailableRings([]);
    }
  }, [selectedHeading, inventory, selectedEyeletRing, onEyeletRingChange]);

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
                        {formatPrice(option.price_per_meter || option.selling_price || 0)}/m
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

      {/* Eyelet Ring Selection - Only show if eyelet heading selected */}
      {availableRings.length > 0 && onEyeletRingChange && (
        <div>
          <Label className="text-sm font-medium mb-2 block text-card-foreground">Eyelet Ring</Label>
          <Select 
            value={selectedEyeletRing} 
            onValueChange={onEyeletRingChange}
            disabled={readOnly}
          >
            <SelectTrigger className="h-10 text-sm container-level-2 border-border">
              <SelectValue placeholder="Choose eyelet ring" />
            </SelectTrigger>
            <SelectContent className="container-level-1 border-2 border-border z-50">
              {availableRings.map((ring) => (
                <SelectItem key={ring.id} value={ring.id} className="text-card-foreground">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium">{ring.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {ring.color} • {ring.diameter}mm
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Multiple Fullness Ratio Selector */}
      {getAvailableFullnessRatios().length > 0 && onHeadingFullnessChange && (
        <div>
          <Label className="text-sm font-medium mb-2 block text-card-foreground">Fullness Ratio</Label>
          <Select 
            value={headingFullness?.toString() || getAvailableFullnessRatios()[0]?.toString()} 
            onValueChange={(value) => onHeadingFullnessChange(parseFloat(value))}
            disabled={readOnly}
          >
            <SelectTrigger className="h-10 text-sm container-level-2 border-border">
              <SelectValue placeholder="Choose fullness ratio" />
            </SelectTrigger>
            <SelectContent className="container-level-1 border-2 border-border z-50">
              {getAvailableFullnessRatios().map((ratio) => (
                <SelectItem key={ratio} value={ratio.toString()} className="text-card-foreground">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium">{ratio}x Fullness</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Compact template info */}
      <div className="container-level-3 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="font-semibold text-card-foreground text-xs mb-1">Fullness</div>
            <div className="text-primary font-bold text-sm">{typeof getSelectedFullnessRatio() === 'string' ? getSelectedFullnessRatio() : `${getSelectedFullnessRatio()}x`}</div>
          </div>
          <div>
            <div className="font-semibold text-card-foreground text-xs mb-1">Type</div>
            <div className="text-card-foreground font-medium text-sm truncate">{template.manufacturing_type}</div>
          </div>
          {getExtraFabric() > 0 && (
            <div>
              <div className="font-semibold text-card-foreground text-xs mb-1">Extra Fabric</div>
              <div className="text-primary font-bold text-sm">+{getExtraFabric()} {getLengthUnitLabel()}</div>
            </div>
          )}
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
        
        {/* Advanced Settings Display */}
        {getAdvancedSettings() && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs font-semibold text-card-foreground mb-2">Advanced Settings</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {getAdvancedSettings()?.heading_type && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="text-card-foreground font-medium capitalize">{getAdvancedSettings()?.heading_type}</span>
                </div>
              )}
              {getAdvancedSettings()?.spacing && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spacing:</span>
                  <span className="text-card-foreground font-medium">{getAdvancedSettings()?.spacing}cm</span>
                </div>
              )}
              {getAdvancedSettings()?.eyelet_diameter && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Eyelet:</span>
                  <span className="text-card-foreground font-medium">{getAdvancedSettings()?.eyelet_diameter}mm</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};