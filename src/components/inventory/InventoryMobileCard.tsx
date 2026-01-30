import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Edit, Trash2, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PricingCell } from "./PricingCell";

interface InventoryMobileCardProps {
  item: {
    id: string;
    name: string;
    sku?: string | null;
    supplier?: string | null;
    image_url?: string | null;
    quantity?: number | null;
    selling_price?: number | null;
    price_per_meter?: number | null;
    price_group?: string | null;
    tags?: string[];
    color?: string | null;
  };
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  formatPrice?: (price: number) => string;
  stockUnit?: string;
  showPriceGroup?: boolean;
  renderImage?: () => React.ReactNode;
}

export const InventoryMobileCard = ({
  item,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onClick,
  formatPrice = (p) => `$${p.toFixed(2)}`,
  stockUnit = "units",
  showPriceGroup = false,
  renderImage,
}: InventoryMobileCardProps) => {
  return (
    <div
      className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      {/* Checkbox */}
      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="h-4 w-4"
        />
      </div>

      {/* Image */}
      <div className="shrink-0">
        {renderImage ? (
          renderImage()
        ) : item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{item.name}</span>
          {item.supplier?.toUpperCase() === 'TWC' && (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] px-1 py-0 shrink-0">
              TWC
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {item.sku && <span>{item.sku}</span>}
          {item.sku && item.supplier && <span>•</span>}
          {item.supplier && <span>{item.supplier}</span>}
        </div>
        <div className="flex items-center gap-2">
          <PricingCell item={item} className="text-xs font-medium text-primary" />
          <Badge
            variant={item.quantity && item.quantity > 0 ? "default" : "secondary"}
            className="text-[10px] h-5"
          >
            {item.quantity || 0} {stockUnit}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};
