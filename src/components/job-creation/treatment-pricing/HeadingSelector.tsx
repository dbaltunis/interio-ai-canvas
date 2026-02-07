
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useHeadingInventory } from "@/hooks/useHeadingInventory";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface HeadingSelectorProps {
  selectedHeading?: string;
  onHeadingChange: (headingId: string) => void;
  /** Optional: Filter to only show these heading IDs (from template.selected_heading_ids) */
  allowedHeadingIds?: string[];
}

export const HeadingSelector = ({ selectedHeading, onHeadingChange, allowedHeadingIds }: HeadingSelectorProps) => {
  const { data: allHeadingOptions = [], isLoading } = useHeadingInventory();
  const { getFabricUnitLabel, units } = useMeasurementUnits();

  // Filter headings based on template's allowed heading IDs
  const headingOptions = allowedHeadingIds && allowedHeadingIds.length > 0
    ? allHeadingOptions.filter(h => allowedHeadingIds.includes(h.id))
    : allHeadingOptions;

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        <Label>Heading Type</Label>
        <div className="h-10 bg-muted rounded-md" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-fade-in">
      <Label htmlFor="heading">Heading Type</Label>
      <Select 
        value={(() => {
          // Normalize heading value - treat 'standard', empty as 'no-heading' for display
          if (!selectedHeading || selectedHeading === 'standard' || selectedHeading === 'none') return 'no-heading';
          return selectedHeading;
        })()}
        onValueChange={onHeadingChange}
      >
        <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
          <SelectValue placeholder="Select heading type">
            {selectedHeading && selectedHeading !== "no-heading" && selectedHeading !== "standard" && selectedHeading !== "none" ? (
              (() => {
                const selectedOption = headingOptions.find(h => h.id === selectedHeading);
                return selectedOption ? selectedOption.name : selectedHeading;
              })()
            ) : "Standard / No heading"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] bg-popover border-border shadow-lg z-[9999]">
          {/* FIX: Single clear option for no heading */}
          <SelectItem value="no-heading" className="hover:bg-accent/50 transition-colors">Standard / No heading</SelectItem>
          {headingOptions.map((heading) => (
            <SelectItem key={heading.id} value={heading.id} className="hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3 w-full py-1">
                {heading.image_url && (
                  <img 
                    src={heading.image_url} 
                    alt={heading.name}
                    className="w-10 h-10 object-cover rounded border border-border"
                  />
                )}
                <div className="flex items-center justify-between flex-1 gap-2">
                  <span>{heading.name}</span>
                  <div className="flex gap-2 items-center">
                    {heading.fullness_ratio && (
                      <Badge variant="outline" className="text-xs">
                        {heading.fullness_ratio}x
                      </Badge>
                    )}
                    {(heading.price_per_meter || heading.selling_price) && (
                      <Badge variant="secondary" className="text-xs">
                        {units.currency} {(heading.price_per_meter || heading.selling_price).toFixed(2)}
                      </Badge>
                    )}
                    {heading.category && heading.category !== 'heading' && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {heading.category}
                      </Badge>
                    )}
                  </div>
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
