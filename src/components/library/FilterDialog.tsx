
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: any) => void;
}

export const FilterDialog = ({ open, onOpenChange, onApplyFilters }: FilterDialogProps) => {
  const [filters, setFilters] = useState({
    vendor: "",
    category: "",
    priceMin: "",
    priceMax: "",
    stockStatus: "",
    location: "",
    composition: "",
    collection: "",
    pattern: "",
    tags: [] as string[],
    width: "",
    color: ""
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Available tags for filtering
  const availableTags = [
    "Premium", "Budget", "Sustainable", "Fire Resistant", 
    "Blackout", "Sheer", "Cotton", "Silk", "Linen", 
    "Polyester", "Wool", "Velvet", "Textured", "Plain"
  ];

  const handleApplyFilters = () => {
    const nonEmptyFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    onApplyFilters(nonEmptyFilters);
    console.log("Applied filters:", nonEmptyFilters);
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
      collection: "",
      pattern: "",
      tags: [],
      width: "",
      color: ""
    });
    setActiveFilters([]);
    onApplyFilters({});
  };

  const removeFilter = (filterKey: string) => {
    setFilters(prev => ({ 
      ...prev, 
      [filterKey]: Array.isArray(prev[filterKey as keyof typeof prev]) ? [] : "" 
    }));
    setActiveFilters(prev => prev.filter(f => f !== filterKey));
  };

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    {filter}: {Array.isArray(filters[filter as keyof typeof filters]) 
                      ? (filters[filter as keyof typeof filters] as string[]).join(", ")
                      : filters[filter as keyof typeof filters]}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFilter(filter)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Basic Filters */}
          <div className="grid grid-cols-3 gap-4">
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
                  <SelectItem value="upholstery-fabrics">Upholstery Fabrics</SelectItem>
                  <SelectItem value="drapery-fabrics">Drapery Fabrics</SelectItem>
                  <SelectItem value="blackout-fabrics">Blackout Fabrics</SelectItem>
                  <SelectItem value="curtain-tracks">Curtain Tracks</SelectItem>
                  <SelectItem value="motorized-systems">Motorized Systems</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Collection</Label>
              <Select value={filters.collection} onValueChange={(value) => setFilters(prev => ({ ...prev, collection: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All collections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Collections</SelectItem>
                  <SelectItem value="heritage-collection">Heritage Collection</SelectItem>
                  <SelectItem value="luxury-series">Luxury Series</SelectItem>
                  <SelectItem value="functional-fabrics">Functional Fabrics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range */}
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

          {/* Additional Filters */}
          <div className="grid grid-cols-3 gap-4">
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
              <Label>Pattern</Label>
              <Select value={filters.pattern} onValueChange={(value) => setFilters(prev => ({ ...prev, pattern: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All patterns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Patterns</SelectItem>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="striped">Striped</SelectItem>
                  <SelectItem value="floral">Floral</SelectItem>
                  <SelectItem value="geometric">Geometric</SelectItem>
                  <SelectItem value="textured">Textured</SelectItem>
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

          {/* Fabric Specific Filters */}
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
              <Label htmlFor="width">Fabric Width</Label>
              <Input
                id="width"
                value={filters.width}
                onChange={(e) => setFilters(prev => ({ ...prev, width: e.target.value }))}
                className="mt-1"
                placeholder="e.g., 140cm"
              />
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <Label className="text-base font-medium">Filter by Tags</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag}
                    checked={filters.tags.includes(tag)}
                    onCheckedChange={() => toggleTag(tag)}
                  />
                  <Label htmlFor={tag} className="text-sm font-normal cursor-pointer">
                    {tag}
                  </Label>
                </div>
              ))}
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
              <Button onClick={handleApplyFilters} variant="brand">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
