
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Settings } from "lucide-react";
import { ProductType } from "@/hooks/useProductTypes";

interface ProductTypeListProps {
  productTypes: ProductType[];
  onEdit: (productType: ProductType) => void;
  onDelete: (id: string) => void;
}

export const ProductTypeList = ({ productTypes, onEdit, onDelete }: ProductTypeListProps) => {
  if (productTypes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No product types configured yet. Create your first product type to get started.
        </CardContent>
      </Card>
    );
  }

  const groupedByCategory = productTypes.reduce((acc, productType) => {
    if (!acc[productType.category]) {
      acc[productType.category] = [];
    }
    acc[productType.category].push(productType);
    return acc;
  }, {} as Record<string, ProductType[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedByCategory).map(([category, types]) => (
        <div key={category} className="space-y-4">
          <h4 className="font-semibold text-lg capitalize">{category}s</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {types.map((productType) => (
              <Card key={productType.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{productType.name}</CardTitle>
                      <CardDescription>{productType.description}</CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(productType)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(productType.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={productType.active ? "default" : "secondary"}>
                      {productType.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">
                      {productType.default_calculation_method.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      {productType.default_fullness_ratio}x fullness
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>Waste: {productType.default_waste_percentage}%</div>
                    <div>Hem: {productType.default_hem_allowance}cm</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 text-xs">
                    {productType.requires_track_measurement && (
                      <Badge variant="outline" className="text-xs">Track</Badge>
                    )}
                    {productType.requires_drop_measurement && (
                      <Badge variant="outline" className="text-xs">Drop</Badge>
                    )}
                    {productType.requires_pattern_repeat && (
                      <Badge variant="outline" className="text-xs">Pattern</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
