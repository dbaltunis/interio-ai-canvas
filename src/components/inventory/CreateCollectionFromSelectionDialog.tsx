import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderPlus, Loader2 } from "lucide-react";
import { useCreateCollection } from "@/hooks/useCollections";
import { useBulkInventoryUpdate } from "@/hooks/useBulkInventoryUpdate";
import { useVendors } from "@/hooks/useVendors";
import { useToast } from "@/hooks/use-toast";

interface CreateCollectionFromSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItemIds: string[];
  onSuccess?: () => void;
}

export const CreateCollectionFromSelectionDialog = ({
  open,
  onOpenChange,
  selectedItemIds,
  onSuccess
}: CreateCollectionFromSelectionDialogProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [vendorId, setVendorId] = useState<string | undefined>();
  const [season, setSeason] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  const { data: vendors = [] } = useVendors();
  const createCollection = useCreateCollection();
  const bulkUpdate = useBulkInventoryUpdate();
  
  const isLoading = createCollection.isPending || bulkUpdate.isPending;
  
  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a collection name",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create the collection
      const newCollection = await createCollection.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        vendor_id: vendorId || null,
        season: season || null,
        year: year ? parseInt(year) : null,
      });
      
      // Assign selected items to the new collection
      if (newCollection && selectedItemIds.length > 0) {
        await bulkUpdate.mutateAsync({
          ids: selectedItemIds,
          updates: { collection_id: newCollection.id }
        });
      }
      
      toast({
        title: "Collection Created",
        description: `"${name}" created with ${selectedItemIds.length} items`
      });
      
      // Reset form
      setName("");
      setDescription("");
      setVendorId(undefined);
      setSeason("");
      setYear(new Date().getFullYear().toString());
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to create collection:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create collection",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create Collection from {selectedItemIds.length} Items
          </DialogTitle>
          <DialogDescription>
            Create a new collection and add the selected items to it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="collection-name">Collection Name *</Label>
            <Input
              id="collection-name"
              placeholder="e.g., Spring 2024, Client Favorites"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="collection-description">Description</Label>
            <Textarea
              id="collection-description"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vendor (Optional)</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent className="z-[10001]">
                  {vendors.map(vendor => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="collection-year">Year</Label>
              <Input
                id="collection-year"
                type="number"
                placeholder="2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="collection-season">Season (Optional)</Label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger>
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent className="z-[10001]">
                <SelectItem value="spring">Spring</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="autumn">Autumn</SelectItem>
                <SelectItem value="winter">Winter</SelectItem>
                <SelectItem value="all_season">All Season</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading || !name.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Collection
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
