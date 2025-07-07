import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useHeadingOptions } from "@/hooks/useHeadingOptions";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface HeadingSelectorProps {
  selectedHeading?: string;
  onHeadingChange: (headingId: string) => void;
}

export const HeadingSelector = ({ selectedHeading, onHeadingChange }: HeadingSelectorProps) => {
  const { data: headingOptions = [], isLoading } = useHeadingOptions();
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
                    {heading.fullness}x fullness
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ${heading.price}/{getFabricUnitLabel()}
                  </Badge>
                  {heading.type !== 'standard' && (
                    <Badge variant="secondary" className="text-xs">
                      {heading.type}
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
            
            let description = `${selectedOption.fullness}x fullness multiplier will be applied for fabric calculations.`;
            
            if (selectedOption.extras?.eyeletRings) {
              description += ` Includes eyelet rings.`;
            }
            
            if (selectedOption.extras?.customOptions?.length > 0) {
              description += ` ${selectedOption.type} system options available.`;
            }
            
            return description;
          })()}
        </div>
      )}
    </div>
  );
};