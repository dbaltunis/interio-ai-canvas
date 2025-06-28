
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  count: number;
}

interface ProductCategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string;
  totalProducts: number;
  onCategorySelect: (categoryId: string) => void;
}

export const ProductCategoryFilter = ({
  categories,
  selectedCategoryId,
  totalProducts,
  onCategorySelect,
}: ProductCategoryFilterProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-base">Product Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
            !selectedCategoryId 
              ? "bg-brand-primary text-white" 
              : "hover:bg-brand-secondary/10"
          }`}
          onClick={() => onCategorySelect("")}
        >
          <span className="font-medium">All Products</span>
          <Badge variant="secondary" className="text-xs">
            {totalProducts}
          </Badge>
        </div>
        {categories.map((category) => (
          <div
            key={category.id}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
              selectedCategoryId === category.id 
                ? "bg-brand-primary text-white" 
                : "hover:bg-brand-secondary/10"
            }`}
            onClick={() => onCategorySelect(category.id)}
          >
            <span className="font-medium">{category.name}</span>
            <Badge variant="secondary" className="text-xs">
              {category.count}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
