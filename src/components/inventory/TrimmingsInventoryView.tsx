import { useEnhancedInventoryByCategory } from "@/hooks/useEnhancedInventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Sparkles, FileSpreadsheet, QrCode } from "lucide-react";
import { AddInventoryDialog } from "./AddInventoryDialog";
import { UnifiedInventoryDialog } from "./UnifiedInventoryDialog";
import { CategoryImportExport } from "./CategoryImportExport";
import { useToast } from "@/hooks/use-toast";
import { useDeleteEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { useBulkInventorySelection } from "@/hooks/useBulkInventorySelection";
import { InventoryBulkActionsBar } from "./InventoryBulkActionsBar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TrimmingsInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
}

export const TrimmingsInventoryView = ({ searchQuery, viewMode }: TrimmingsInventoryViewProps) => {
  const { data: trimmings = [], refetch } = useEnhancedInventoryByCategory('trimming');
  const deleteItem = useDeleteEnhancedInventoryItem();
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<any>(null);

  const {
    selectedItems,
    selectItem,
    selectAll,
    clearSelection,
    selectionStats,
  } = useBulkInventorySelection(trimmings);

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedItems.map(id => deleteItem.mutateAsync(id)));
      toast({ title: `${selectedItems.length} items deleted successfully` });
      clearSelection();
    } catch (error) {
      toast({ title: "Failed to delete some items", variant: "destructive" });
    }
  };

  const filteredTrimmings = trimmings.filter(trimming =>
    trimming.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trimming.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trimming.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete ${name}?`)) {
      try {
        await deleteItem.mutateAsync(id);
        toast({ title: "Trimming deleted successfully" });
      } catch (error) {
        toast({ title: "Failed to delete trimming", variant: "destructive" });
      }
    }
  };

  if (filteredTrimmings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Trimmings Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "No trimmings match your search." : "Add fringe, tassels, borders, piping, and braids to your inventory."}
          </p>
          <AddInventoryDialog
            trigger={<Button>Add Trimming</Button>}
            onSuccess={refetch}
            initialCategory="trimming"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {selectedItems.length > 0 && (
          <InventoryBulkActionsBar
            selectedCount={selectedItems.length}
            onClearSelection={clearSelection}
            onBulkDelete={handleBulkDelete}
            selectedItems={filteredTrimmings.filter(item => selectedItems.includes(item.id))}
          />
        )}

        <div className="flex justify-between items-center gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground">
            {filteredTrimmings.length} trimming{filteredTrimmings.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Import/Export
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Import/Export Trimmings</DialogTitle>
                </DialogHeader>
                <CategoryImportExport category="trimmings" onImportComplete={refetch} />
              </DialogContent>
            </Dialog>
            <AddInventoryDialog
              trigger={<Button>Add Trimming</Button>}
              onSuccess={refetch}
              initialCategory="trimming"
            />
          </div>
        </div>

        <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
          {filteredTrimmings.map((trimming) => (
            <Card key={trimming.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{trimming.name}</CardTitle>
                    {trimming.subcategory && (
                      <Badge variant="secondary" className="mt-1 text-xs capitalize">
                        {trimming.subcategory}
                      </Badge>
                    )}
                    {trimming.description && (
                      <CardDescription className="text-xs mt-2">{trimming.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto">
                        <QRCodeDisplay
                          itemId={trimming.id}
                          itemName={trimming.name}
                          size={150}
                          showActions={false}
                        />
                      </PopoverContent>
                    </Popover>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setEditingItem(trimming)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(trimming.id, trimming.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {trimming.image_url && (
                  <div className="w-full h-24 rounded-md overflow-hidden bg-muted mb-2">
                    <img 
                      src={trimming.image_url} 
                      alt={trimming.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Price per meter:</span>
                  <span className="font-semibold">${trimming.price_per_meter?.toFixed(2) || '0.00'}</span>
                </div>
                {trimming.quantity && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">In stock:</span>
                    <Badge variant={trimming.quantity > 0 ? "default" : "destructive"}>
                      {trimming.quantity}m
                    </Badge>
                  </div>
                )}
                {trimming.supplier && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Supplier:</span>
                    <span className="text-xs">{trimming.supplier}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {editingItem && (
        <UnifiedInventoryDialog
          mode="edit"
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onSuccess={() => {
            setEditingItem(null);
            refetch();
          }}
        />
      )}
    </>
  );
};
