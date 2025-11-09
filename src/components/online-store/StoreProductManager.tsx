import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useStoreProducts } from "@/hooks/useStoreProducts";
import { Package, Star, Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StoreProductManagerProps {
  storeId: string;
}

export const StoreProductManager = ({ storeId }: StoreProductManagerProps) => {
  const { data: products, isLoading, toggleVisibility, toggleFeatured } = useStoreProducts(storeId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Store Products
        </CardTitle>
        <CardDescription>
          Control which products appear on your online store
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products?.map((product: any) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{product.inventory_item?.name || 'Unknown Product'}</p>
                    {product.is_featured && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {product.inventory_item?.category || 'No category'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star
                    className={`h-4 w-4 cursor-pointer transition-colors ${
                      product.is_featured ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    }`}
                    onClick={() => toggleFeatured.mutate({ id: product.id, isFeatured: !product.is_featured })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  {product.is_visible ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    checked={product.is_visible}
                    onCheckedChange={(checked) =>
                      toggleVisibility.mutate({ id: product.id, isVisible: checked })
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          {(!products || products.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No products available</p>
              <p className="text-sm">Add products to your inventory first</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
