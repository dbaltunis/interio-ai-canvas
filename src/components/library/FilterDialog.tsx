
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FilterDialog = ({ open, onOpenChange }: FilterDialogProps) => {
  const [filters, setFilters] = useState({
    brand: "",
    collection: "",
    priceMin: "",
    priceMax: "",
    stock: "",
    material: "",
  });

  const handleReset = () => {
    setFilters({
      brand: "",
      collection: "",
      priceMin: "",
      priceMax: "",
      stock: "",
      material: "",
    });
  };

  const handleApply = () => {
    console.log("Applied filters:", filters);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Options</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="filterBrand">Brand</Label>
            <Select value={filters.brand} onValueChange={(value) => setFilters(prev => ({ ...prev, brand: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="fibre-naturelle">Fibre Naturelle</SelectItem>
                <SelectItem value="kd-design">KD Design</SelectItem>
                <SelectItem value="dekoma">DEKOMA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filterCollection">Collection</Label>
            <Select value={filters.collection} onValueChange={(value) => setFilters(prev => ({ ...prev, collection: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collections</SelectItem>
                <SelectItem value="spring-2024">Spring 2024</SelectItem>
                <SelectItem value="autumn-2024">Autumn 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceMin">Min Price</Label>
              <Input
                id="priceMin"
                type="number"
                placeholder="0"
                value={filters.priceMin}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="priceMax">Max Price</Label>
              <Input
                id="priceMax"
                type="number"
                placeholder="1000"
                value={filters.priceMax}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="filterStock">Stock Status</Label>
            <Select value={filters.stock} onValueChange={(value) => setFilters(prev => ({ ...prev, stock: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select stock status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filterMaterial">Material</Label>
            <Select value={filters.material} onValueChange={(value) => setFilters(prev => ({ ...prev, material: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Materials</SelectItem>
                <SelectItem value="cotton">Cotton</SelectItem>
                <SelectItem value="linen">Linen</SelectItem>
                <SelectItem value="silk">Silk</SelectItem>
                <SelectItem value="wool">Wool</SelectItem>
                <SelectItem value="synthetic">Synthetic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="button" onClick={handleApply} className="bg-slate-600 hover:bg-slate-700">
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
