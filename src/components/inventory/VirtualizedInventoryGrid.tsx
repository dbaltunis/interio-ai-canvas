import { useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { ProductImageWithColorFallback } from "@/components/ui/ProductImageWithColorFallback";
import { getCurrencySymbol } from "@/utils/formatCurrency";

interface VirtualizedInventoryGridProps {
  items: any[];
  selectedItemId?: string;
  onItemSelect: (item: any) => void;
  onItemDeselect: () => void;
  units: {
    currency?: string;
    fabric?: string;
    length?: string;
  };
  cardRefMap: React.MutableRefObject<Map<string, HTMLDivElement>>;
}

const CARD_HEIGHT = 180; // Estimated card height in pixels
const CARDS_PER_ROW = 4; // For lg screens
const GAP = 8; // Gap between cards

export const VirtualizedInventoryGrid = ({
  items,
  selectedItemId,
  onItemSelect,
  onItemDeselect,
  units,
  cardRefMap,
}: VirtualizedInventoryGridProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate rows based on screen width (simplified: assume 4 columns for desktop)
  const rowCount = Math.ceil(items.length / CARDS_PER_ROW);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 3, // Render 3 extra rows above/below viewport
  });

  const renderCard = useCallback((item: any) => {
    const isSelected = selectedItemId === item.id;
    const price = item.selling_price || item.price || 0;
    const currencySymbol = getCurrencySymbol(units.currency || 'NZD');
    const lengthUnit = units.fabric || 'm';

    return (
      <Card
        key={item.id}
        ref={(el) => {
          if (el) cardRefMap.current.set(item.id, el);
        }}
        className={`cursor-pointer transition-all duration-200 hover:shadow-md relative group ${
          isSelected 
            ? "ring-2 ring-primary bg-primary/5" 
            : "hover:border-primary/50"
        }`}
        onClick={() => isSelected ? onItemDeselect() : onItemSelect(item)}
      >
        {isSelected && (
          <div className="absolute -top-1.5 -right-1.5 z-10">
            <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-md">
              <Check className="h-3 w-3" />
            </div>
          </div>
        )}

        <CardContent className="p-2 space-y-1">
          {/* Image */}
          <div className="aspect-[4/3] rounded-md overflow-hidden bg-muted relative">
            <ProductImageWithColorFallback
              imageUrl={item.image_url}
              color={item.colors?.[0] || item.color}
              productName={item.name}
              className="w-full h-full object-cover"
            />
            {isSelected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onItemDeselect();
                }}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="space-y-0.5">
            {/* Name and supplier */}
            <div className="flex items-start justify-between gap-1">
              <h4 className="font-medium text-xs leading-tight line-clamp-1 flex-1" title={item.name}>
                {item.name}
              </h4>
            </div>
            
            {item.supplier && (
              <p className="text-[10px] text-muted-foreground line-clamp-1">{item.supplier}</p>
            )}

            {/* Fabric details */}
            {item.fabric_width && (
              <div className="flex gap-1.5 text-[9px] text-muted-foreground">
                <span>W: {item.fabric_width}cm</span>
                {item.pattern_repeat_vertical && item.pattern_repeat_vertical > 0 && (
                  <span>VR: {item.pattern_repeat_vertical}cm</span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between gap-1 pt-0.5">
              <div className="flex flex-col">
                <span className="text-xs font-semibold">
                  {item.price_group || item.pricing_grid_id || item.metadata?.pricing_grid_data ? (
                    <span className="text-primary">Grid Pricing</span>
                  ) : (
                    `${currencySymbol}${price.toFixed(2)}/${lengthUnit}`
                  )}
                </span>
                <span className="text-[8px] text-muted-foreground leading-none">
                  {item.price_group || item.pricing_grid_id || item.metadata?.pricing_grid_data
                    ? `${item.resolved_grid_name || item.price_group || 'Grid assigned'}` 
                    : (item.pricing_method ? item.pricing_method.replace(/_/g, ' ') : 'Per metre')}
                </span>
              </div>
              {item.quantity !== undefined && item.quantity > 0 && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">
                  {item.quantity} {units.fabric || 'm'}
                </Badge>
              )}
            </div>
            
            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-0.5 pt-1">
                {item.tags.slice(0, 2).map((tag: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-[8px] px-1 py-0 h-3.5">
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 2 && (
                  <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5">
                    +{item.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }, [selectedItemId, units, cardRefMap, onItemSelect, onItemDeselect]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      ref={parentRef}
      className="overflow-auto max-h-[60vh] min-h-[400px]"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * CARDS_PER_ROW;
          const rowItems = items.slice(startIndex, startIndex + CARDS_PER_ROW);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pr-3">
                {rowItems.map((item) => renderCard(item))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
