
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FilterDialog = ({ open, onOpenChange }: FilterDialogProps) => {
  const [filters, setFilters] = useState({
    vendor: "",
    category: "",
    priceMin: "",
    priceMax: "",
    stockStatus: "",
    location: "",
    composition: "",
    collection: ""
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleApplyFilters = () => {
    console.log("Applied filters:", filters);
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    setFilters({
      vendor: "",
      category: "",
      priceMin: "",
      priceMax: "",
      stockStatus: "",
      location: "",
      composition: "",
      collection: ""
    });
    setActiveFilters([]);
  };

  const removeFilter = (filterKey: string) => {
    setFilters(prev => ({ ...prev, [filterKey]: "" }));
    setActiveFilters(prev => prev.filter(f => f !== filterKey));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Filter Inventory</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="space-y-2">
              <Label>Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                    {filter}: {filters[filter as keyof typeof filters]}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFilter(filter)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Vendor/Supplier</Label>
              <Select value={filters.vendor} onValueChange={(value) => setFilters(prev => ({ ...prev, vendor: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Vendors</SelectItem>
                  <SelectItem value="fibre-naturelle">Fibre Naturelle</SelectItem>
                  <SelectItem value="kd-design">KD Design</SelectItem>
                  <SelectItem value="hunter-douglas">Hunter Douglas</SelectItem>
                  <SelectItem value="silent-gliss">Silent Gliss</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="fabrics">Fabrics</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="tracks">Tracks</SelectItem>
                  <SelectItem value="motors">Motors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceMin">Min Price</Label>
              <Input
                id="priceMin"
                type="number"
                step="0.01"
                value={filters.priceMin}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                className="mt-1"
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="priceMax">Max Price</Label>
              <Input
                id="priceMax"
                type="number"
                step="0.01"
                value={filters.priceMax}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                className="mt-1"
                placeholder="1000.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Stock Status</Label>
              <Select value={filters.stockStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, stockStatus: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All stock levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Stock Levels</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Storage Location</Label>
              <Input
                id="location"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1"
                placeholder="e.g., Warehouse A"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="composition">Fabric Composition</Label>
              <Input
                id="composition"
                value={filters.composition}
                onChange={(e) => setFilters(prev => ({ ...prev, composition: e.target.value }))}
                className="mt-1"
                placeholder="e.g., Linen, Cotton, Silk"
              />
            </div>

            <div>
              <Label htmlFor="collection">Collection</Label>
              <Input
                id="collection"
                value={filters.collection}
                onChange={(e) => setFilters(prev => ({ ...prev, collection: e.target.value }))}
                className="mt-1"
                placeholder="Collection name"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear All Filters
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleApplyFilters} className="bg-slate-600 hover:bg-slate-700">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
