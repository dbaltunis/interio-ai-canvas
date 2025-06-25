
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Fabric {
  id: number;
  name: string;
  code: string;
  brand: string;
  collection: string;
  type: string;
  color: string;
  pattern: string;
  width: number;
  price: number;
  image: string;
}

interface FabricsGridProps {
  fabrics: Fabric[];
}

export const FabricsGrid = ({ fabrics }: FabricsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {fabrics.map((fabric) => (
        <Card key={fabric.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="aspect-square bg-gray-100 flex items-center justify-center">
            <img
              src={fabric.image}
              alt={fabric.name}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div>
                <h3 className="font-semibold text-brand-primary">{fabric.name}</h3>
                <p className="text-sm text-brand-neutral">Code: {fabric.code}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">{fabric.type}</Badge>
                <Badge variant="secondary" className="text-xs">{fabric.color}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-neutral">{fabric.width}cm wide</span>
                <span className="font-semibold text-brand-primary">${fabric.price}</span>
              </div>
              <p className="text-xs text-brand-neutral">{fabric.brand} - {fabric.collection}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
