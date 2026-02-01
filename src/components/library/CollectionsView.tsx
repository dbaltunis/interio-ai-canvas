import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Package, ExternalLink, Building2, Edit2, Search, PanelLeftClose, PanelLeft } from "lucide-react";
import { useCollectionsWithCounts, useUpdateCollection, useVendorsWithCollections } from "@/hooks/useCollections";
import { BrandCollectionsSidebar } from "./BrandCollectionsSidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CollectionsViewProps {
  onSelectCollection: (collectionId: string) => void;
  selectedVendor?: string;
}

export const CollectionsView = ({ onSelectCollection, selectedVendor: externalVendor }: CollectionsViewProps) => {
  const { data: collections = [], isLoading } = useCollectionsWithCounts();
  const { data: vendorsWithCollections = [] } = useVendorsWithCollections();
  const updateCollection = useUpdateCollection();
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingCollection, setEditingCollection] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(externalVendor || null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Get the selected brand's name for display
  const selectedBrandName = selectedBrand
    ? vendorsWithCollections.find((v) => v.vendor?.id === selectedBrand)?.vendor?.name || "Unassigned"
    : "All Brands";

  // Filter by selected brand, then by search term
  const filteredCollections = collections
    .filter((c: any) => {
      if (!selectedBrand) return true;
      if (selectedBrand === "unassigned") return !c.vendor_id;
      return c.vendor_id === selectedBrand;
    })
    .filter((c: any) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        c.name?.toLowerCase().includes(search) ||
        c.description?.toLowerCase().includes(search) ||
        c.vendor?.name?.toLowerCase().includes(search)
      );
    });

  const handleEditClick = (e: React.MouseEvent, collection: any) => {
    e.stopPropagation();
    setEditingCollection(collection);
    setEditName(collection.name || "");
    setEditDescription(collection.description || "");
  };

  const handleSaveEdit = async () => {
    if (!editingCollection) return;
    
    try {
      await updateCollection.mutateAsync({
        id: editingCollection.id,
        name: editName,
        description: editDescription,
      });
      toast.success("Collection updated");
      setEditingCollection(null);
    } catch (error) {
      toast.error("Failed to update collection");
    }
  };

  // Sidebar component for both mobile sheet and desktop
  const SidebarContent = (
    <BrandCollectionsSidebar
      selectedBrand={selectedBrand}
      onSelectBrand={(brand) => {
        setSelectedBrand(brand);
        setMobileSheetOpen(false);
      }}
      onSelectCollection={(collectionId) => {
        onSelectCollection(collectionId);
        setMobileSheetOpen(false);
      }}
      className="w-full h-full"
    />
  );

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)]">
        <div className="w-72 border-r">
          <Skeleton className="h-full" />
        </div>
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* Desktop Sidebar */}
      {!isMobile && !sidebarCollapsed && (
        <div className="w-72 shrink-0 relative">
          {SidebarContent}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 z-10"
            onClick={() => setSidebarCollapsed(true)}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b bg-background">
          {/* Mobile: Sheet trigger / Desktop: Expand button */}
          {isMobile ? (
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Building2 className="h-4 w-4 mr-2" />
                  {selectedBrandName}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                {SidebarContent}
              </SheetContent>
            </Sheet>
          ) : sidebarCollapsed ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed(false)}
            >
              <PanelLeft className="h-4 w-4 mr-2" />
              {selectedBrandName}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{selectedBrandName}</span>
            </div>
          )}

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredCollections.length} collection{filteredCollections.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Collections Grid */}
        <div className="flex-1 overflow-auto p-4">
          {filteredCollections.length === 0 && !searchTerm ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Collections Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                {selectedBrand 
                  ? "This brand has no collections yet. Collections are created automatically when syncing products."
                  : "Collections help organize inventory by vendor assortment. They will appear when products are synced from vendors."
                }
              </p>
            </div>
          ) : filteredCollections.length === 0 && searchTerm ? (
            <div className="text-center py-8 text-muted-foreground">
              No collections found for "{searchTerm}"
            </div>
          ) : (
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
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground shrink-0">
                          {collection.itemCount === 1 ? '1 item' : `${collection.itemCount} items`}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleEditClick(e, collection)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {collection.vendor && !selectedBrand && (
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
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCollection} onOpenChange={(open) => !open && setEditingCollection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Change the collection name or description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Collection name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Short description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCollection(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateCollection.isPending}>
              {updateCollection.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
