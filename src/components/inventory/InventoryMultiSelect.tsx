import { useState, useMemo, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search, Package, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  subcategory?: string;
  selling_price?: number;
  quantity?: number;
}

interface InventoryMultiSelectProps {
  allInventory: InventoryItem[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  currencySymbol?: string;
  categoryFilter?: string;
  label?: string;
  placeholder?: string;
}

export const InventoryMultiSelect = ({
  allInventory,
  selectedIds,
  onSelectionChange,
  currencySymbol = "$",
  categoryFilter = "hardware",
  label = "Select Components",
  placeholder = "Search 12,000+ items..."
}: InventoryMultiSelectProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter inventory based on category
  const categoryInventory = useMemo(() => {
    return allInventory.filter(item => item.category === categoryFilter);
  }, [allInventory, categoryFilter]);

  // Get unique subcategories
  const subcategories = useMemo(() => {
    const subs = new Set(categoryInventory.map(item => item.subcategory).filter(Boolean));
    return Array.from(subs).sort();
  }, [categoryInventory]);

  // Filter and search inventory
  const filteredInventory = useMemo(() => {
    let filtered = categoryInventory;

    // Apply subcategory filter
    if (subcategoryFilter && subcategoryFilter !== "all") {
      filtered = filtered.filter(item => item.subcategory === subcategoryFilter);
    }

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query)
      );
    }

    // Limit to 100 results for performance
    return filtered.slice(0, 100);
  }, [categoryInventory, subcategoryFilter, debouncedSearch]);

  // Get selected items
  const selectedItems = useMemo(() => {
    return allInventory.filter(item => selectedIds.includes(item.id));
  }, [allInventory, selectedIds]);

  const toggleItem = (itemId: string) => {
    if (selectedIds.includes(itemId)) {
      onSelectionChange(selectedIds.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedIds, itemId]);
    }
  };

  const removeItem = (itemId: string) => {
    onSelectionChange(selectedIds.filter(id => id !== itemId));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="space-y-2 relative">
      <Label className="text-sm">{label}</Label>
      
      {/* Selected Items Display */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
          {selectedItems.map(item => (
            <Badge 
              key={item.id} 
              variant="secondary" 
              className="pl-3 pr-1 py-1.5 gap-2 text-sm"
            >
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground">
                {item.sku ? `${item.sku} • ` : ''}{currencySymbol}{item.selling_price || 0}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive/20"
                onClick={() => removeItem(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {selectedItems.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              onClick={clearAll}
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-10"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-[99999] w-full mt-1 bg-background border rounded-lg shadow-lg">
          {/* Quick Filters */}
          <div className="p-3 border-b flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Filter by:</Label>
            <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
              <SelectTrigger className="h-8 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {subcategories.map(sub => (
                  <SelectItem key={sub} value={sub || "other"}>
                    {sub || "Other"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {debouncedSearch && (
              <span className="text-xs text-muted-foreground ml-auto">
                Showing {filteredInventory.length} of {categoryInventory.length} results
              </span>
            )}
          </div>

          {/* Results List */}
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {filteredInventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {debouncedSearch ? "No items found" : "Start typing to search..."}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredInventory.map(item => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-md hover:bg-muted/50 transition-colors",
                          isSelected && "bg-primary/10 border border-primary/20"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{item.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {item.sku && <span>{item.sku} • </span>}
                              {item.subcategory && <span className="capitalize">{item.subcategory} • </span>}
                              <span className="font-medium">{currencySymbol}{item.selling_price || 0}</span>
                              {item.quantity !== undefined && (
                                <span className="ml-2">
                                  Stock: {item.quantity}
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <Badge variant="default" className="shrink-0">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          {filteredInventory.length > 0 && (
            <div className="p-2 border-t bg-muted/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{selectedIds.length} components selected</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setIsOpen(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
