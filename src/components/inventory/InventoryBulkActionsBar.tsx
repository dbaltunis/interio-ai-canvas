import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, X, QrCode, Tag, FolderPlus, FolderInput, DollarSign } from "lucide-react";
import { QRCodeLabelGenerator } from "./QRCodeLabelGenerator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateCollectionFromSelectionDialog } from "./CreateCollectionFromSelectionDialog";
import { AddToCollectionDialog } from "./AddToCollectionDialog";
import { BulkTagEditor } from "./BulkTagEditor";
import { BulkPriceUpdateDialog } from "./BulkPriceUpdateDialog";

interface InventoryBulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  selectedItems?: any[];
  onRefetch?: () => void;
}

export const InventoryBulkActionsBar = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  selectedItems = [],
  onRefetch,
}: InventoryBulkActionsBarProps) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLabelGenerator, setShowLabelGenerator] = useState(false);
  const [showPriceGroupDialog, setShowPriceGroupDialog] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [showPriceUpdate, setShowPriceUpdate] = useState(false);
  const [priceGroup, setPriceGroup] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedIds = selectedItems.map(item => item.id);

  const handleDelete = () => {
    onBulkDelete();
    setShowDeleteDialog(false);
  };

  const handleSetPriceGroup = async () => {
    if (!priceGroup.trim()) {
      toast({ title: "Please enter a price group", variant: "destructive" });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('enhanced_inventory_items')
        .update({ price_group: priceGroup.trim() })
        .in('id', selectedIds);

      if (error) throw error;

      toast({ 
        title: `Price group "${priceGroup}" applied to ${selectedCount} items`,
        description: "Items will now auto-match with pricing grids using this price group"
      });
      
      setShowPriceGroupDialog(false);
      setPriceGroup("");
      onClearSelection();
      onRefetch?.();
    } catch (error: any) {
      toast({ 
        title: "Failed to update price group", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkSuccess = () => {
    onClearSelection();
    onRefetch?.();
  };

  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{selectedCount} selected</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">Bulk Actions</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateCollection(true)}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Collection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddToCollection(true)}
            >
              <FolderInput className="h-4 w-4 mr-2" />
              Add to Collection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagEditor(true)}
            >
              <Tag className="h-4 w-4 mr-2" />
              Edit Tags
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPriceUpdate(true)}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Update Prices
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPriceGroupDialog(true)}
            >
              <Tag className="h-4 w-4 mr-2" />
              Set Price Group
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLabelGenerator(true)}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Print QR Labels
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Create Collection Dialog */}
      <CreateCollectionFromSelectionDialog
        open={showCreateCollection}
        onOpenChange={setShowCreateCollection}
        selectedItemIds={selectedIds}
        onSuccess={handleBulkSuccess}
      />

      {/* Add to Collection Dialog */}
      <AddToCollectionDialog
        open={showAddToCollection}
        onOpenChange={setShowAddToCollection}
        selectedItemIds={selectedIds}
        onSuccess={handleBulkSuccess}
        onCreateNew={() => {
          setShowAddToCollection(false);
          setShowCreateCollection(true);
        }}
      />

      {/* Bulk Tag Editor */}
      <BulkTagEditor
        open={showTagEditor}
        onOpenChange={setShowTagEditor}
        selectedItemIds={selectedIds}
        selectedItems={selectedItems}
        onSuccess={handleBulkSuccess}
      />

      {/* Bulk Price Update */}
      <BulkPriceUpdateDialog
        open={showPriceUpdate}
        onOpenChange={setShowPriceUpdate}
        selectedItemIds={selectedIds}
        selectedItems={selectedItems}
        onSuccess={handleBulkSuccess}
      />

      {/* Price Group Dialog */}
      <Dialog open={showPriceGroupDialog} onOpenChange={setShowPriceGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Price Group for {selectedCount} Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price-group">Price Group</Label>
              <Input
                id="price-group"
                placeholder="e.g., A, B, Premium, Standard"
                value={priceGroup}
                onChange={(e) => setPriceGroup(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Items with matching price groups will auto-match with your pricing grids
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPriceGroupDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetPriceGroup} disabled={isUpdating}>
              {isUpdating ? "Updating..." : `Apply to ${selectedCount} items`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} items?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected inventory items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <QRCodeLabelGenerator
        open={showLabelGenerator}
        onOpenChange={setShowLabelGenerator}
        items={selectedItems}
      />
    </>
  );
};
