import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.inventory_item?.category).filter(Boolean)));
  
  // Filter products by category and search
  const filteredProducts = products.filter(product => {
    const item = product.inventory_item;
    const matchesCategory = selectedCategory === "all" || item?.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
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
        <CardHeader className="space-y-4">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Product Catalog</CardTitle>
              <Badge variant="secondary">{products.length} total products</Badge>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Products
            </Button>
          </div>
          
          {products.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search products by name, SKU, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {filteredProducts.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select All Visible ({filteredProducts.length})
              </span>
            </div>
          )}
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

          {filteredProducts.length === 0 && products.length > 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No products match your filters.</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}>
                Clear Filters
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No products in your catalog yet.</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map(product => (
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
