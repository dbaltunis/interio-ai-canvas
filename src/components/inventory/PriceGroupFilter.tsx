import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface PriceGroupFilterProps {
  priceGroups: { group: string; count: number }[];
  selectedGroup: string | null;
  onGroupChange: (group: string | null) => void;
  className?: string;
}

export const PriceGroupFilter = ({
  priceGroups,
  selectedGroup,
  onGroupChange,
  className
}: PriceGroupFilterProps) => {
  if (priceGroups.length === 0) return null;

  const totalCount = priceGroups.reduce((sum, g) => sum + g.count, 0);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-muted-foreground">Price Group:</span>
        <Badge variant="outline" className="text-[10px]">
          {totalCount} items
        </Badge>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-1.5 pb-2">
          <Button
            variant={selectedGroup === null ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs whitespace-nowrap"
            onClick={() => onGroupChange(null)}
          >
            All Materials ({totalCount})
          </Button>
          {priceGroups.map(({ group, count }) => (
            <Button
              key={group}
              variant={selectedGroup === group ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs whitespace-nowrap"
              onClick={() => onGroupChange(group)}
            >
              {group} ({count})
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
