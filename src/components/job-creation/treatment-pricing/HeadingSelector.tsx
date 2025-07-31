
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useHeadingInventory } from "@/hooks/useEnhancedInventory";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface HeadingSelectorProps {
  selectedHeading?: string;
  onHeadingChange: (headingId: string) => void;
}

export const HeadingSelector = ({ selectedHeading, onHeadingChange }: HeadingSelectorProps) => {
  const { data: headingOptions = [], isLoading } = useHeadingInventory();
  const { getFabricUnitLabel } = useMeasurementUnits();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Heading Type</Label>
        <div className="text-sm text-muted-foreground">Loading heading options...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="heading">Heading Type</Label>
      <Select value={selectedHeading} onValueChange={onHeadingChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select heading type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no-heading">No heading</SelectItem>
          {headingOptions.map((heading) => (
            <SelectItem key={heading.id} value={heading.id}>
              <div className="flex items-center justify-between w-full">
                <span>{heading.name}</span>
                <div className="flex gap-2 ml-2">
                  <Badge variant="outline" className="text-xs">
                    {heading.fullness_ratio}x fullness
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ${heading.selling_price}/{getFabricUnitLabel()}
                  </Badge>
                  {heading.category && heading.category !== 'heading' && (
                    <Badge variant="secondary" className="text-xs">
                      {heading.category}
                    </Badge>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedHeading && selectedHeading !== "no-heading" && (
        <div className="text-xs text-muted-foreground">
          {(() => {
            const selectedOption = headingOptions.find(h => h.id === selectedHeading);
            if (!selectedOption) return null;
            
            let description = `${selectedOption.fullness_ratio}x fullness multiplier will be applied for fabric calculations.`;
            
            if (selectedOption.category) {
              description += ` Type: ${selectedOption.category}.`;
            }
            
            if (selectedOption.description) {
              description += ` ${selectedOption.description}`;
            }
            
            return description;
          })()}
        </div>
      )}
    </div>
  );
};
