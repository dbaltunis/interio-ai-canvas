
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Edit, Trash2 } from "lucide-react";

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

interface ProductCardProps {
  product: Product;
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const ProductCard = ({ product, categories, onEdit, onDelete }: ProductCardProps) => {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-brand-primary">{product.name}</h4>
          <p className="text-sm text-brand-neutral">
            SKU: {product.sku || "N/A"} | 
            Category: {categories.find(c => c.id === product.category_id)?.name || "Unknown"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">${product.base_price || 0}</span>
          <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(product.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {((Array.isArray(product.variants) && product.variants.length > 0) || 
        (Array.isArray(product.options) && product.options.length > 0)) && (
        <div className="grid grid-cols-2 gap-4">
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <div>
              <Label className="text-xs font-medium text-brand-neutral">VARIANTS</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {product.variants.map((variant: string) => (
                  <Badge key={variant} variant="outline" className="text-xs">
                    {variant}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(product.options) && product.options.length > 0 && (
            <div>
              <Label className="text-xs font-medium text-brand-neutral">OPTIONS</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {product.options.map((option: string) => (
                  <Badge key={option} variant="secondary" className="text-xs">
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
