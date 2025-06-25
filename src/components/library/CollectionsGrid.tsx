
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Collection {
  id: number;
  name: string;
  brand: string;
  fabrics: number;
}

interface CollectionsGridProps {
  collections: Collection[];
  onAddCollection: () => void;
}

export const CollectionsGrid = ({ collections, onAddCollection }: CollectionsGridProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-brand-primary">Fabric Collections</h2>
        <Button onClick={onAddCollection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Collection
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((collection) => (
          <Card key={collection.id}>
            <CardHeader>
              <CardTitle className="text-lg">{collection.name}</CardTitle>
              <CardDescription>{collection.brand}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <span className="text-sm text-brand-neutral">Fabrics:</span>
                <span className="font-medium">{collection.fabrics}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
