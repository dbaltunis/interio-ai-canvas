
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Fabric {
  id: string; // Changed from number to string
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {fabrics.map((fabric) => (
        <Card key={fabric.id} className="hover:shadow-lg transition-shadow">
          <div className="aspect-square overflow-hidden rounded-t-lg">
            <img
              src={fabric.image}
              alt={fabric.name}
              className="w-full h-full object-cover"
            />
          </div>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{fabric.name}</CardTitle>
              <Badge variant="secondary">{fabric.code}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-brand-neutral">Brand:</span>
                <span className="ml-1 font-medium">{fabric.brand}</span>
              </div>
              <div>
                <span className="text-brand-neutral">Type:</span>
                <span className="ml-1 font-medium">{fabric.type}</span>
              </div>
              <div>
                <span className="text-brand-neutral">Color:</span>
                <span className="ml-1 font-medium">{fabric.color}</span>
              </div>
              <div>
                <span className="text-brand-neutral">Pattern:</span>
                <span className="ml-1 font-medium">{fabric.pattern}</span>
              </div>
              <div>
                <span className="text-brand-neutral">Width:</span>
                <span className="ml-1 font-medium">{fabric.width}cm</span>
              </div>
              <div>
                <span className="text-brand-neutral">Price:</span>
                <span className="ml-1 font-medium text-brand-primary">${fabric.price}/m</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
