import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ExternalLink, Building2 } from "lucide-react";
import { useCollectionsWithCounts } from "@/hooks/useCollections";

interface CollectionsViewProps {
  onSelectCollection: (collectionId: string) => void;
  selectedVendor?: string;
}

export const CollectionsView = ({ onSelectCollection, selectedVendor }: CollectionsViewProps) => {
  const { data: collections = [], isLoading } = useCollectionsWithCounts();

  // Filter by vendor if selected
  const filteredCollections = selectedVendor
    ? collections.filter((c: any) => c.vendor_id === selectedVendor)
    : collections;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="relative">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredCollections.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Collections Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-4">
          {selectedVendor 
            ? "This vendor doesn't have any collections yet. Collections are created when products are synced from suppliers like TWC."
            : "Collections help you organize inventory by vendor ranges like 'SKYE', 'Serengetti', or 'Heritage 2024'. They'll appear here once you sync products from vendors."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredCollections.length} collection{filteredCollections.length !== 1 ? 's' : ''} 
          {selectedVendor && " from this vendor"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCollections.map((collection: any) => (
          <Card 
            key={collection.id} 
            className="group hover:shadow-lg transition-all cursor-pointer border-border hover:border-primary/50"
            onClick={() => onSelectCollection(collection.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                  {collection.name}
                </CardTitle>
                <Badge variant="secondary" className="shrink-0 ml-2">
                  {collection.itemCount} items
                </Badge>
              </div>
              {collection.vendor && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  {collection.vendor.name}
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {collection.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {collection.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {collection.season && (
                    <Badge variant="outline" className="text-xs">
                      {collection.season}
                    </Badge>
                  )}
                  {collection.year && (
                    <Badge variant="outline" className="text-xs">
                      {collection.year}
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCollection(collection.id);
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
