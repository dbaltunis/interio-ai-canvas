import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useHeadingInventory } from "@/hooks/useHeadingInventory";

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

  // Only show for curtains/romans
  if (curtainType !== 'curtain' && curtainType !== 'roman_blind') {
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
            {headingStyles.map((heading) => (
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
                  <div className="font-medium text-sm">{heading.name}</div>
                  {heading.cost_price && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {heading.cost_price}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
