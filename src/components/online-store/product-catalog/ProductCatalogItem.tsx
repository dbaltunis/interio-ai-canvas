import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Star, Calculator } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useStoreProductCatalog } from "@/hooks/useStoreProductCatalog";
import { ProductImageManager } from "./ProductImageManager";
import { ProductCalculatorPreview } from "./ProductCalculatorPreview";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ProductCatalogItemProps {
  product: any;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

export const ProductCatalogItem = ({ product, isSelected, onSelect }: ProductCatalogItemProps) => {
  const { bulkUpdateVisibility } = useStoreProductCatalog(product.store_id);
  const [showCalculator, setShowCalculator] = useState(false);
  const item = product.inventory_item;

  const handleVisibilityToggle = async () => {
    await bulkUpdateVisibility.mutateAsync({
      ids: [product.id],
      isVisible: !product.is_visible
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        {/* Selection Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="mt-1"
        />

        {/* Product Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">
                  {product.template?.name 
                    ? `${product.template.name} - ${item.name}`
                    : item.name}
                </h3>
                {product.is_featured && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{item.category || 'Uncategorized'}</Badge>
                {product.template && (
                  <Badge variant="secondary" className="text-xs">
                    Template: {product.template.name}
                  </Badge>
                )}
                {item.sku && <Badge variant="secondary">SKU: {item.sku}</Badge>}
                <Badge variant={product.is_visible ? "default" : "secondary"}>
                  {product.is_visible ? "Visible" : "Hidden"}
                </Badge>
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center gap-2">
              {product.is_visible ? (
                <Eye className="h-4 w-4 text-muted-foreground" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Switch
                checked={product.is_visible}
                onCheckedChange={handleVisibilityToggle}
              />
            </div>
          </div>

          {/* Price Display */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Price:</span>
            <span className="text-lg font-semibold">£{(item.selling_price || 0).toFixed(2)}</span>
            {item.unit && <span className="text-sm text-muted-foreground">per {item.unit}</span>}
          </div>

          {/* Image Manager */}
          <ProductImageManager
            productId={product.id}
            images={Array.isArray(product.custom_images) ? product.custom_images : []}
          />

          {/* Calculator Preview */}
          <Collapsible open={showCalculator} onOpenChange={setShowCalculator}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                {showCalculator ? "Hide" : "Show"} Calculator Preview
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <ProductCalculatorPreview item={item} />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </Card>
  );
};
