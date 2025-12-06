import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, Trash2, Edit2, Check, X } from "lucide-react";
import { useRoomProducts, useUpdateRoomProduct, useDeleteRoomProduct, RoomProduct } from "@/hooks/useRoomProducts";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import { Skeleton } from "@/components/ui/skeleton";

interface RoomProductsListProps {
  roomId: string;
}

export const RoomProductsList = ({ roomId }: RoomProductsListProps) => {
  const { data: products = [], isLoading } = useRoomProducts(roomId);
  const updateProduct = useUpdateRoomProduct();
  const deleteProduct = useDeleteRoomProduct();
  const { units } = useMeasurementUnits();
  const currencySymbol = getCurrencySymbol(units.currency);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(1);

  if (isLoading) {
    return (
      <div className="px-4 py-2 space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const handleStartEdit = (product: RoomProduct) => {
    setEditingId(product.id);
    setEditQuantity(product.quantity);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuantity(1);
  };

  const handleSaveEdit = (product: RoomProduct) => {
    updateProduct.mutate({
      id: product.id,
      roomId: product.room_id,
      quantity: editQuantity,
    });
    setEditingId(null);
  };

  const handleDelete = (product: RoomProduct) => {
    deleteProduct.mutate({
      id: product.id,
      roomId: product.room_id,
    });
  };

  const total = products.reduce((sum, p) => sum + p.total_price, 0);

  return (
    <div className="border-t border-border/50">
      {/* Header */}
      <div className="px-4 py-2 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Package className="h-4 w-4" />
          Products & Services
        </div>
        <div className="text-sm font-medium">
          {currencySymbol}{total.toFixed(2)}
        </div>
      </div>

      {/* Products List */}
      <div className="divide-y divide-border/50">
        {products.map((product) => {
          const isEditing = editingId === product.id;
          const inventoryItem = product.inventory_item;
          const isCustom = product.is_custom;
          
          // For custom items, use product fields; for inventory items, use inventory_item
          const displayName = isCustom ? product.name : (inventoryItem?.name || "Unknown Product");
          const displayImage = isCustom ? product.image_url : inventoryItem?.image_url;
          const displayCategory = isCustom ? "Custom" : inventoryItem?.subcategory;

          return (
            <div
              key={product.id}
              className="px-4 py-3 flex items-center gap-3 hover:bg-muted/20 transition-colors"
            >
              {/* Image or Icon */}
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={displayName || "Product"}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {displayName}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {displayCategory && (
                    <Badge variant={isCustom ? "outline" : "secondary"} className="text-xs capitalize">
                      {displayCategory.replace(/_/g, " ")}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {currencySymbol}{product.unit_price.toFixed(2)} × {product.quantity}
                  </span>
                </div>
                {isCustom && product.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{product.description}</p>
                )}
              </div>

              {/* Quantity Edit */}
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 h-8 text-center text-sm"
                    min={1}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleSaveEdit(product)}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Price */}
                  <div className="text-sm font-medium min-w-[70px] text-right">
                    {currencySymbol}{product.total_price.toFixed(2)}
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleStartEdit(product)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(product)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
