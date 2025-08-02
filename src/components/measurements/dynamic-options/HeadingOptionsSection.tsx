import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Heading Options</span>
          <Badge variant="outline">{template.heading_name}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Select Heading Style</Label>
          <Select 
            value={selectedHeading} 
            onValueChange={onHeadingChange}
            disabled={readOnly}
          >
            <SelectTrigger>
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
                    <div className="flex flex-col gap-1">
                      <span>Standard {template.heading_name}</span>
                      <span className="text-xs text-muted-foreground">
                        Fullness: {template.fullness_ratio}x • No upcharge
                      </span>
                    </div>
                  </SelectItem>
                  {headingOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{option.name}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatPrice(option.price_per_meter || option.unit_price || 0)}/m</span>
                          {option.description && <span>• {option.description}</span>}
                        </div>
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
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
          <div className="text-sm">
            <div className="font-medium">Fullness Ratio</div>
            <div className="text-muted-foreground">{template.fullness_ratio}x</div>
          </div>
          <div className="text-sm">
            <div className="font-medium">Manufacturing</div>
            <div className="text-muted-foreground">{template.manufacturing_type}</div>
          </div>
          {template.heading_upcharge_per_metre && (
            <div className="text-sm">
              <div className="font-medium">Upcharge/meter</div>
              <div className="text-muted-foreground">{formatPrice(template.heading_upcharge_per_metre)}</div>
            </div>
          )}
          {template.heading_upcharge_per_curtain && (
            <div className="text-sm">
              <div className="font-medium">Upcharge/curtain</div>
              <div className="text-muted-foreground">{formatPrice(template.heading_upcharge_per_curtain)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};