
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Settings } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  name: string;
  sku?: string;
  category_id: string;
  base_price?: number;
  variants?: string[];
  options?: string[];
}

interface Category {
  id: string;
  name: string;
}

interface ProductListProps {
  products: Product[];
  categories: Category[];
  selectedCategoryId: string;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onAddProduct: () => void;
}

export const ProductList = ({
  products,
  categories,
  selectedCategoryId,
  onEdit,
  onDelete,
  onAddProduct,
}: ProductListProps) => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-brand-primary" />
            {selectedCategoryId 
              ? `Products in ${categories.find(c => c.id === selectedCategoryId)?.name}`
              : "All Products"
            }
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Bulk Actions
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4" />
              <p>No products found in this category</p>
              <Button 
                className="mt-4" 
                onClick={onAddProduct}
              >
                Add Your First Product
              </Button>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={categories}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
