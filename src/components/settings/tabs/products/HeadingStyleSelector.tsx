import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useHeadingInventory } from "@/hooks/useHeadingInventory";
import { ExternalLink } from "lucide-react";

interface HeadingStyleSelectorProps {
  selectedHeadingIds: string[];
  onSelectionChange: (ids: string[]) => void;
  curtainType: string;
}

export const HeadingStyleSelector = ({ 
  selectedHeadingIds, 
  onSelectionChange,
  curtainType
}: HeadingStyleSelectorProps) => {
  const { data: headingStyles = [] } = useHeadingInventory();

  // Only show for curtains/romans - support both singular and plural values
  const isCurtain = curtainType === 'curtain' || curtainType === 'curtains';
  const isRoman = curtainType === 'roman_blind' || curtainType === 'roman_blinds';
  
  if (!isCurtain && !isRoman) {
    return null;
  }

  const handleToggle = (headingId: string) => {
    if (selectedHeadingIds.includes(headingId)) {
      onSelectionChange(selectedHeadingIds.filter(id => id !== headingId));
    } else {
      onSelectionChange([...selectedHeadingIds, headingId]);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <Label>Available Heading Styles</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Select which heading styles are available for this template
          </p>
        </div>

        {headingStyles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No heading styles found in inventory. Add heading items to your inventory first.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {headingStyles.map((heading) => {
              // Check if heading is from TWC
              const isTwcHeading = heading.metadata && 
                typeof heading.metadata === 'object' && 
                (heading.metadata as any).source === 'twc';
              
              return (
                <div
                  key={heading.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                  onClick={() => handleToggle(heading.id)}
                >
                  <Checkbox
                    checked={selectedHeadingIds.includes(heading.id)}
                    onCheckedChange={() => handleToggle(heading.id)}
                    className="mt-1"
                  />
                  {heading.image_url && (
                    <img 
                      src={heading.image_url} 
                      alt={heading.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{heading.name}</span>
                      {isTwcHeading && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          TWC
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {heading.fullness_ratio && (
                        <Badge variant="outline" className="text-xs">
                          {heading.fullness_ratio}x fullness
                        </Badge>
                      )}
                      {heading.cost_price && (
                        <Badge variant="outline" className="text-xs">
                          ${heading.cost_price}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
