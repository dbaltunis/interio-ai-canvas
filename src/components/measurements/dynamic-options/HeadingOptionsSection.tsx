import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import type { CurtainTemplate } from "@/hooks/useCurtainTemplates";

interface HeadingOptionsSectionProps {
  template: CurtainTemplate;
  selectedHeading: string;
  onHeadingChange: (headingId: string) => void;
  inventory: any[];
  readOnly?: boolean;
}

export const HeadingOptionsSection = ({
  template,
  selectedHeading,
  onHeadingChange,
  inventory,
  readOnly = false
}: HeadingOptionsSectionProps) => {
  const { units } = useMeasurementUnits();

  // Get heading options from template's selected_heading_ids and match with inventory
  const headingOptions = template.selected_heading_ids?.map(headingId => {
    const inventoryItem = inventory.find(item => item.id === headingId);
    return inventoryItem ? {
      id: headingId,
      name: inventoryItem.name,
      price: inventoryItem.price_per_meter || inventoryItem.unit_price || 0,
      description: inventoryItem.description
    } : null;
  }).filter(Boolean) || [];

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
                      <span>{formatPrice(option.price)}/m</span>
                      {option.description && <span>• {option.description}</span>}
                    </div>
                  </div>
                </SelectItem>
              ))}
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