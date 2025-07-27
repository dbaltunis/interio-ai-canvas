import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

export const InventoryFilters = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium">Advanced Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Stock Level</Label>
          <Select>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Level</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Supplier</Label>
          <Select>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Supplier</SelectItem>
              <SelectItem value="fabric-world">Fabric World</SelectItem>
              <SelectItem value="hardware-supplies">Hardware Supplies</SelectItem>
              <SelectItem value="premium-textiles">Premium Textiles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Location</Label>
          <Select>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Location</SelectItem>
              <SelectItem value="warehouse-a">Warehouse A</SelectItem>
              <SelectItem value="warehouse-b">Warehouse B</SelectItem>
              <SelectItem value="showroom">Showroom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Price Range</Label>
          <div className="flex gap-1">
            <Input placeholder="Min" className="h-8 text-xs" />
            <Input placeholder="Max" className="h-8 text-xs" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Actions</Label>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 flex-1">
              Apply
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Active filters:</span>
        <Badge variant="secondary" className="gap-1">
          Category: Fabrics
          <X className="h-3 w-3 cursor-pointer" />
        </Badge>
        <Badge variant="secondary" className="gap-1">
          Stock: Low
          <X className="h-3 w-3 cursor-pointer" />
        </Badge>
      </div>
    </div>
  );
};