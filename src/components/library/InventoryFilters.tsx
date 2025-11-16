import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import { useCollections, useCollectionsByVendor } from "@/hooks/useCollections";

interface InventoryFiltersProps {
  selectedVendor?: string;
  selectedCollection?: string;
  searchTerm?: string;
  onVendorChange: (vendorId?: string) => void;
  onCollectionChange: (collectionId?: string) => void;
  onSearchChange: (search: string) => void;
}

export const InventoryFilters = ({
  selectedVendor,
  selectedCollection,
  searchTerm,
  onVendorChange,
  onCollectionChange,
  onSearchChange,
}: InventoryFiltersProps) => {
  const { data: vendors } = useVendors();
  const { data: allCollections } = useCollections();
  const { data: vendorCollections } = useCollectionsByVendor(selectedVendor);

  // Show vendor-specific collections if vendor is selected, otherwise show all
  const displayCollections = selectedVendor ? vendorCollections : allCollections;

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, SKU, or description..."
          value={searchTerm || ""}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={selectedVendor || "all"} onValueChange={(val) => onVendorChange(val === "all" ? undefined : val)}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Vendors" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Vendors</SelectItem>
          {vendors?.map((vendor) => (
            <SelectItem key={vendor.id} value={vendor.id}>
              {vendor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedCollection || "all"}
        onValueChange={(val) => onCollectionChange(val === "all" ? undefined : val)}
        disabled={!displayCollections || displayCollections.length === 0}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Collections" />
        </SelectTrigger>
        <SelectContent>
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
  );
};
