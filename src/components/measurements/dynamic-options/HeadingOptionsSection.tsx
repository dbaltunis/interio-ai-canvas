import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
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

  // Filter heading options from inventory - looking for heading/hardware items
  const headingOptions = inventory.filter(item => 
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

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs font-medium mb-1 block text-gray-700">Heading Style</Label>
        <Select 
          value={selectedHeading} 
          onValueChange={onHeadingChange}
          disabled={readOnly}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Choose heading style" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading" disabled>
                Loading heading options...
              </SelectItem>
            ) : (
              <>
                <SelectItem value="standard">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Standard {template.heading_name}</span>
                      <span className="text-xs text-muted-foreground">No upcharge</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Fullness: {template.fullness_ratio}x
                    </span>
                  </div>
                </SelectItem>
                {headingOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatPrice(option.price_per_meter || option.unit_price || 0)}/m
                        </span>
                      </div>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
                {headingOptions.length === 0 && (
                  <SelectItem value="no-options" disabled>
                    No heading options in inventory - Add heading items in Settings
                  </SelectItem>
                )}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Display template heading configuration */}
      <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded text-xs">
        <div>
          <div className="font-medium text-gray-600">Fullness</div>
          <div className="text-gray-800">{template.fullness_ratio}x</div>
        </div>
        <div>
          <div className="font-medium text-gray-600">Type</div>
          <div className="text-gray-800">{template.manufacturing_type}</div>
        </div>
        {template.heading_upcharge_per_metre && (
          <div>
            <div className="font-medium text-gray-600">Per meter</div>
            <div className="text-gray-800">{formatPrice(template.heading_upcharge_per_metre)}</div>
          </div>
        )}
        {template.heading_upcharge_per_curtain && (
          <div>
            <div className="font-medium text-gray-600">Per curtain</div>
            <div className="text-gray-800">{formatPrice(template.heading_upcharge_per_curtain)}</div>
          </div>
        )}
      </div>
    </div>
  );
};