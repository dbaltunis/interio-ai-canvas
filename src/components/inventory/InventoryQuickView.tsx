import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Package, DollarSign, Ruler, Store, Grid3X3 } from "lucide-react";
import { UnifiedInventoryDialog } from "./UnifiedInventoryDialog";
import { useState } from "react";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { ColorSlatPreview, getColorHex } from "./ColorSlatPreview";
import { COLOR_PALETTE } from "@/constants/inventoryCategories";

interface InventoryQuickViewProps {
  item: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const InventoryQuickView = ({ item, open, onOpenChange, onSuccess }: InventoryQuickViewProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { formatCurrency } = useFormattedCurrency();

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowEditDialog(true);
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    onSuccess?.();
  };

  const handleEditDialogClose = (openState: boolean) => {
    if (!openState) {
      setShowEditDialog(false);
    }
  };

  // Get color information from tags
  const itemColors = item.tags?.filter((tag: string) => 
    COLOR_PALETTE.some(color => color.value === tag)
  ) || [];

  // Check if it's a TWC item
  const isTWC = item.supplier?.toUpperCase() === 'TWC' || 
    (item.metadata as any)?.twc_product_id != null;

  // Get price group info
  const priceGroup = item.price_group || (item.metadata as any)?.pricing_group;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="truncate">{item.name}</span>
                {isTWC && (
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 shrink-0">
                    TWC
                  </Badge>
                )}
              </div>
              <Button onClick={handleEditClick} size="sm" variant="outline" className="shrink-0">
                <Edit className="h-4 w-4 mr-2" />
                Edit Full Details
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Large Image or Auto-generated Preview */}
            {item.image_url ? (
              <div className="h-48 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  crossOrigin="anonymous"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : item.category === 'material' && itemColors.length > 0 ? (
              <div className="p-6 rounded-lg bg-muted/30 border flex items-center justify-center">
                <ColorSlatPreview 
                  hexColor={getColorHex(itemColors[0], [...COLOR_PALETTE], [])}
                  slatWidth={(item.specifications as Record<string, any>)?.slat_width}
                  materialType={(item.specifications as Record<string, any>)?.material_type}
                  orientation={item.subcategory === 'vertical' ? 'vertical' : 'horizontal'}
                  size="lg"
                  showLabel
                />
              </div>
            ) : null}

            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">SKU</p>
                <p className="font-medium">{item.sku || 'N/A'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium capitalize">{item.category?.replace(/_/g, ' ') || 'N/A'}</p>
              </div>
              
              {item.subcategory && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Subcategory</p>
                  <p className="font-medium capitalize">{item.subcategory.replace(/_/g, ' ')}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Stock</p>
                <Badge variant={item.quantity && item.quantity > 0 ? "default" : "secondary"}>
                  {item.quantity || 0} {item.unit || 'pieces'}
                </Badge>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-background">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Cost Price</p>
                  <p className="font-bold text-lg">{formatCurrency(item.cost_price || 0)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-background">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Selling Price</p>
                  <p className="font-bold text-lg text-green-600">{formatCurrency(item.selling_price || 0)}</p>
                </div>
              </div>
            </div>

            {/* Price Group for Grid Pricing */}
            {priceGroup && (
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="p-2 rounded-md bg-primary/10">
                  <Grid3X3 className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Price Group (Grid Pricing)</p>
                  <p className="font-bold text-lg text-primary">Group {priceGroup}</p>
                </div>
              </div>
            )}

            {/* Available Colors */}
            {itemColors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Available Colors</p>
                <div className="flex flex-wrap gap-2">
                  {itemColors.map((colorValue: string) => {
                    const colorInfo = COLOR_PALETTE.find(c => c.value === colorValue);
                    if (!colorInfo) return null;
                    return (
                      <div 
                        key={colorValue}
                        className="flex items-center gap-2 px-3 py-2 rounded-md border bg-background"
                      >
                        <div
                          className="w-5 h-5 rounded-full border-2 border-border/50"
                          style={{ backgroundColor: colorInfo.hex }}
                        />
                        <span className="text-sm font-medium">{colorInfo.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-4">
              {item.supplier && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted">
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Supplier</p>
                    <p className="font-medium text-sm">{item.supplier}</p>
                  </div>
                </div>
              )}
              
              {item.location && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium text-sm">{item.location}</p>
                  </div>
                </div>
              )}

              {item.fabric_width && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Fabric Width</p>
                    <p className="font-medium text-sm">{item.fabric_width}cm</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            )}

            {/* All Tags (excluding colors already shown) */}
            {item.tags && item.tags.filter((t: string) => !COLOR_PALETTE.some(c => c.value === t)).length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags
                    .filter((tag: string) => !COLOR_PALETTE.some(c => c.value === tag))
                    .map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - rendered when showEditDialog is true */}
      {showEditDialog && (
        <UnifiedInventoryDialog
          open={showEditDialog}
          onOpenChange={handleEditDialogClose}
          mode="edit"
          item={item}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};
