
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Brand {
  id: string; // Changed from number to string
  name: string;
  collections: number;
  fabrics: number;
}

interface BrandsGridProps {
  brands: Brand[];
  onAddBrand: () => void;
}

export const BrandsGrid = ({ brands, onAddBrand }: BrandsGridProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-brand-primary">Fabric Brands</h2>
        <Button onClick={onAddBrand}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <Card key={brand.id}>
            <CardHeader>
              <CardTitle className="text-lg">{brand.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-brand-neutral">Collections:</span>
                  <span className="font-medium">{brand.collections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-brand-neutral">Fabrics:</span>
                  <span className="font-medium">{brand.fabrics}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
