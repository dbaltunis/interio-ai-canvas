import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Package, ExternalLink, Building2, Edit2, Search } from "lucide-react";
import { useCollectionsWithCounts, useUpdateCollection } from "@/hooks/useCollections";
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

interface CollectionsViewProps {
  onSelectCollection: (collectionId: string) => void;
  selectedVendor?: string;
}

export const CollectionsView = ({ onSelectCollection, selectedVendor }: CollectionsViewProps) => {
  const { data: collections = [], isLoading } = useCollectionsWithCounts();
  const updateCollection = useUpdateCollection();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCollection, setEditingCollection] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Filter by vendor if selected, then by search term
  const filteredCollections = collections
    .filter((c: any) => !selectedVendor || c.vendor_id === selectedVendor)
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
      toast.success("Kolekcija atnaujinta");
      setEditingCollection(null);
    } catch (error) {
      toast.error("Nepavyko atnaujinti kolekcijos");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
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
      </div>
    );
  }

  if (filteredCollections.length === 0 && !searchTerm) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Kolekcijų nerasta</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-4">
          {selectedVendor 
            ? "Šis tiekėjas dar neturi kolekcijų. Kolekcijos sukuriamos automatiškai sinchronizuojant produktus."
            : "Kolekcijos padeda tvarkyti inventorių pagal tiekėjų asortimentą. Jos atsiras sinchronizavus produktus iš tiekėjų."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ieškoti kolekcijų..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredCollections.length} kolekcij{filteredCollections.length === 1 ? 'a' : 'os'} 
          {selectedVendor && " iš šio tiekėjo"}
        </p>
      </div>

      {filteredCollections.length === 0 && searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          Nerasta kolekcijų pagal „{searchTerm}"
        </div>
      )}

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
                  <Badge variant="secondary" className="shrink-0">
                    {collection.itemCount} vnt.
                  </Badge>
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
                  Peržiūrėti
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCollection} onOpenChange={(open) => !open && setEditingCollection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redaguoti kolekciją</DialogTitle>
            <DialogDescription>
              Pakeiskite kolekcijos pavadinimą arba aprašymą.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Pavadinimas</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Kolekcijos pavadinimas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Aprašymas</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Trumpas aprašymas"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCollection(null)}>
              Atšaukti
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateCollection.isPending}>
              {updateCollection.isPending ? "Saugoma..." : "Išsaugoti"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};