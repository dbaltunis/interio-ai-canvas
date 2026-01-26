import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FolderInput, Loader2, Plus, Building2 } from "lucide-react";
import { useCollectionsWithCounts } from "@/hooks/useCollections";
import { useBulkInventoryUpdate } from "@/hooks/useBulkInventoryUpdate";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItemIds: string[];
  onSuccess?: () => void;
  onCreateNew?: () => void;
}

export const AddToCollectionDialog = ({
  open,
  onOpenChange,
  selectedItemIds,
  onSuccess,
  onCreateNew
}: AddToCollectionDialogProps) => {
  const { toast } = useToast();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  
  const { data: collections = [], isLoading: collectionsLoading } = useCollectionsWithCounts();
  const bulkUpdate = useBulkInventoryUpdate();
  
  const isLoading = bulkUpdate.isPending;
  
  const handleAdd = async () => {
    if (!selectedCollectionId) {
      toast({
        title: "Select Collection",
        description: "Please select a collection to add items to",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await bulkUpdate.mutateAsync({
        ids: selectedItemIds,
        updates: { collection_id: selectedCollectionId }
      });
      
      const collection = collections.find(c => c.id === selectedCollectionId);
      toast({
        title: "Items Added",
        description: `${selectedItemIds.length} items added to "${collection?.name}"`
      });
      
      setSelectedCollectionId(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to add to collection:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add items to collection",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveFromCollection = async () => {
    try {
      await bulkUpdate.mutateAsync({
        ids: selectedItemIds,
        updates: { collection_id: null }
      });
      
      toast({
        title: "Items Removed",
        description: `${selectedItemIds.length} items removed from their collections`
      });
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to remove from collection:', error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderInput className="h-5 w-5" />
            Add {selectedItemIds.length} Items to Collection
          </DialogTitle>
          <DialogDescription>
            Select an existing collection or create a new one.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {collectionsLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading collections...
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">No collections yet</p>
              <Button onClick={onCreateNew} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create First Collection
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Select Collection</Label>
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-2">
                  {collections.map(collection => (
                    <div
                      key={collection.id}
                      onClick={() => setSelectedCollectionId(collection.id)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        selectedCollectionId === collection.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{collection.name}</p>
                          {collection.vendor && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3 w-3" />
                              {collection.vendor.name}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {collection.itemCount} items
                        </Badge>
                      </div>
                      {collection.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={onCreateNew}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Collection
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="ghost" 
            onClick={handleRemoveFromCollection} 
            disabled={isLoading}
            className="text-muted-foreground"
          >
            Remove from Collection
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={isLoading || !selectedCollectionId}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <FolderInput className="h-4 w-4 mr-2" />
                Add to Collection
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
