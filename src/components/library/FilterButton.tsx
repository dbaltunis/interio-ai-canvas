import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import { useCollections, useCollectionsByVendor } from "@/hooks/useCollections";
import { Badge } from "@/components/ui/badge";

interface FilterButtonProps {
  selectedVendor?: string;
  selectedCollection?: string;
  onVendorChange: (vendorId?: string) => void;
  onCollectionChange: (collectionId?: string) => void;
}

export const FilterButton = ({
  selectedVendor,
  selectedCollection,
  onVendorChange,
  onCollectionChange,
}: FilterButtonProps) => {
  const { data: vendors } = useVendors();
  const { data: allCollections } = useCollections();
  const { data: vendorCollections } = useCollectionsByVendor(selectedVendor);

  // Show vendor-specific collections if vendor is selected, otherwise show all
  const displayCollections = selectedVendor ? vendorCollections : allCollections;
  
  // Count active filters
  const activeFilterCount = [selectedVendor, selectedCollection].filter(Boolean).length;

  const clearFilters = () => {
    onVendorChange(undefined);
    onCollectionChange(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-background border-border shadow-lg z-50" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Filter Options</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Vendor</label>
              <Select
                value={selectedVendor || "all"}
                onValueChange={(val) => onVendorChange(val === "all" ? undefined : val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors?.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Collection</label>
              <Select
                value={selectedCollection || "all"}
                onValueChange={(val) => onCollectionChange(val === "all" ? undefined : val)}
                disabled={!displayCollections || displayCollections.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Collections" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  <SelectItem value="all">All Collections</SelectItem>
                  {displayCollections?.map((collection: any) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                      {!selectedVendor && collection.vendor && ` (${collection.vendor.name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
