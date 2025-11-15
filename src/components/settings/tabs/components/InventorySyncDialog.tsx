import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/hooks/useInventoryManagement";
import { Loader2, Search } from "lucide-react";

interface InventorySyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSync: (selectedIds: string[], pricingMode: 'selling' | 'cost' | 'cost_with_markup', markupPercentage: number) => Promise<boolean>;
  title: string;
  description: string;
}

export const InventorySyncDialog = ({
  open,
  onOpenChange,
  onSync,
  title,
  description,
}: InventorySyncDialogProps) => {
  const { data: inventoryItems = [], isLoading } = useInventory();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [pricingMode, setPricingMode] = useState<'selling' | 'cost' | 'cost_with_markup'>('selling');
  const [markupPercentage, setMarkupPercentage] = useState<number>(30);
  const [isSyncing, setIsSyncing] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(inventoryItems.map(item => item.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [inventoryItems]);

  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [inventoryItems, searchQuery, categoryFilter]);

  const handleToggleItem = (itemId: string) => {
    setSelectedIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(item => item.id));
    }
  };

  const handleSync = async () => {
    if (selectedIds.length === 0) return;
    
    setIsSyncing(true);
    const success = await onSync(selectedIds, pricingMode, markupPercentage);
    setIsSyncing(false);
    
    if (success) {
      setSelectedIds([]);
      setSearchQuery("");
      setCategoryFilter("all");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pricing Configuration */}
          <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
            <Label>Pricing Mode</Label>
            <Select value={pricingMode} onValueChange={(v: any) => setPricingMode(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="selling">Use Selling Price</SelectItem>
                <SelectItem value="cost">Use Cost Price</SelectItem>
                <SelectItem value="cost_with_markup">Cost Price + Markup</SelectItem>
              </SelectContent>
            </Select>

            {pricingMode === 'cost_with_markup' && (
              <div className="space-y-2">
                <Label>Markup Percentage</Label>
                <Input
                  type="number"
                  value={markupPercentage}
                  onChange={(e) => setMarkupPercentage(Number(e.target.value))}
                  min={0}
                  max={500}
                />
              </div>
            )}
          </div>

          {/* Item Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Select Items ({selectedIds.length} selected)
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedIds.length === filteredItems.length ? "Deselect All" : "Select All"}
              </Button>
            </div>

            <ScrollArea className="h-80 border rounded-lg">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No items found
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleToggleItem(item.id)}
                    >
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={() => handleToggleItem(item.id)}
                      />
                      {/* Image placeholder - inventory items don't have image_url yet */}
                      <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center text-xs font-medium">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        )}
                        <div className="flex gap-2 mt-1">
                          {item.category && (
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          )}
                          {item.unit && (
                            <Badge variant="secondary" className="text-xs">{item.unit}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          £{item.selling_price?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Cost: £{item.cost_price?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSync}
            disabled={selectedIds.length === 0 || isSyncing}
          >
            {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sync {selectedIds.length} Item{selectedIds.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
