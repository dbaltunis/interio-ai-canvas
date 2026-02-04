import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImageWithColorFallback } from "@/components/ui/ProductImageWithColorFallback";
import { RecentSelection } from "@/hooks/useRecentMaterialSelections";
import { cn } from "@/lib/utils";

interface RecentSelectionsRowProps {
  items: RecentSelection[];
  getRelativeTime: (timestamp: number) => string;
  onSelect: (itemId: string) => void;
  onClear: () => void;
  className?: string;
}

export const RecentSelectionsRow = ({
  items,
  getRelativeTime,
  onSelect,
  onClear,
  className
}: RecentSelectionsRowProps) => {
  if (items.length === 0) return null;

  return (
    <div className={cn("py-1.5", className)}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-medium text-muted-foreground">Recent</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-5 px-1.5 text-[9px] text-muted-foreground hover:text-destructive"
          onClick={onClear}
        >
          <X className="h-2.5 w-2.5 mr-0.5" />
          Clear
        </Button>
      </div>
      
      <ScrollArea className="w-full">
        <div className="flex gap-1.5 pb-1">
          {items.map((item) => (
            <Card 
              key={item.itemId}
              className="shrink-0 w-24 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => onSelect(item.itemId)}
            >
              <CardContent className="p-1.5">
                <div className="aspect-square w-full relative overflow-hidden rounded-sm bg-muted mb-1">
                  <ProductImageWithColorFallback
                    imageUrl={item.imageUrl}
                    color={item.color}
                    productName={item.name}
                    className="w-full h-full object-cover"
                    fillContainer
                    rounded="sm"
                  />
                </div>
                <p className="text-[10px] font-medium line-clamp-1">{item.name}</p>
                <p className="text-[9px] text-muted-foreground">{getRelativeTime(item.selectedAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
