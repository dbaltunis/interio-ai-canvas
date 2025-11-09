import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useStoreProductCatalog } from "@/hooks/useStoreProductCatalog";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { Search } from "lucide-react";

interface AddProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
}

export const AddProductsDialog = ({ open, onOpenChange, storeId }: AddProductsDialogProps) => {
  const { data: items = [], isLoading } = useEnhancedInventory();
  const { data: templates = [] } = useCurtainTemplates();
  const { products, bulkAddProducts } = useStoreProductCatalog(storeId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Filter out items already in the store
  const existingItemIds = products.map(p => p.inventory_item_id);
  const availableItems = items.filter(item => !existingItemIds.includes(item.id));

  // Filter by search query
  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, itemId]);
    } else {
      setSelectedIds(selectedIds.filter(id => id !== itemId));
    }
  };

  const handleAddProducts = async () => {
    await bulkAddProducts.mutateAsync({
      itemIds: selectedIds,
      templates: selectedTemplates
    });
    setSelectedIds([]);
    setSelectedTemplates({});
    onOpenChange(false);
  };

  const isFabricItem = (item: any) => {
    const category = item.category?.toLowerCase() || '';
    return category === 'fabric' || category.includes('fabric');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Products to Store</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selection count */}
          {selectedIds.length > 0 && (
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-sm font-semibold">{selectedIds.length} items selected</p>
            </div>
          )}

          {/* Items list */}
          <div className="border rounded-lg max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {availableItems.length === 0
                  ? "All inventory items are already in your store."
                  : "No items match your search."}
              </div>
            ) : (
              <div className="divide-y">
                {filteredItems.map(item => {
                  const isFabric = isFabricItem(item);
                  const categoryTemplates = templates.filter(t => {
                    if (!isFabric) return false;
                    const itemCat = item.subcategory?.toLowerCase() || '';
                    const templateCat = t.treatment_category?.toLowerCase() || '';
                    return itemCat && templateCat && itemCat.includes(templateCat.replace('_', ' '));
                  });

                  return (
                    <div key={item.id} className="p-4 flex flex-col gap-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={(checked) => handleToggleItem(item.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{item.category}</Badge>
                            {item.subcategory && <Badge variant="secondary">{item.subcategory}</Badge>}
                            {item.sku && <Badge variant="secondary">SKU: {item.sku}</Badge>}
                            <Badge variant="default">£{(item.selling_price || 0).toFixed(2)}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      {isFabric && selectedIds.includes(item.id) && (
                        <div className="ml-9 space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Select Template (optional - display as finished product)
                          </Label>
                          <Select
                            value={selectedTemplates[item.id] || ""}
                            onValueChange={(value) => setSelectedTemplates(prev => ({
                              ...prev,
                              [item.id]: value
                            }))}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="No template (fabric only)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No template (fabric only)</SelectItem>
                              {categoryTemplates.map(template => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedTemplates[item.id] && (
                            <p className="text-xs text-muted-foreground">
                              Will display as: <span className="font-medium">
                                {templates.find(t => t.id === selectedTemplates[item.id])?.name} - {item.name}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddProducts}
            disabled={selectedIds.length === 0 || bulkAddProducts.isPending}
          >
            Add {selectedIds.length > 0 && `(${selectedIds.length})`} Products
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
