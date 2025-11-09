import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Plus } from "lucide-react";
import { useStoreProductCatalog } from "@/hooks/useStoreProductCatalog";
import { ProductCatalogItem } from "./ProductCatalogItem";
import { AddProductsDialog } from "./AddProductsDialog";
import { BulkActionsBar } from "./BulkActionsBar";

interface ProductCatalogManagerProps {
  storeId: string;
}

export const ProductCatalogManager = ({ storeId }: ProductCatalogManagerProps) => {
  const { products, isLoading, bulkUpdateVisibility } = useStoreProductCatalog(storeId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  const handleBulkVisibility = async (isVisible: boolean) => {
    await bulkUpdateVisibility.mutateAsync({ ids: selectedIds, isVisible });
    setSelectedIds([]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4">
            <CardTitle>Product Catalog</CardTitle>
            {products.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.length === products.length && products.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  Select All ({products.length})
                </span>
              </div>
            )}
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Products
          </Button>
        </CardHeader>
        <CardContent>
          {selectedIds.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedIds.length}
              onMakeVisible={() => handleBulkVisibility(true)}
              onMakeHidden={() => handleBulkVisibility(false)}
              onClearSelection={() => setSelectedIds([])}
            />
          )}

          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No products in your catalog yet.</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map(product => (
                <ProductCatalogItem
                  key={product.id}
                  product={product}
                  isSelected={selectedIds.includes(product.id)}
                  onSelect={(checked) => handleSelectProduct(product.id, checked)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddProductsDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        storeId={storeId}
      />
    </>
  );
};
