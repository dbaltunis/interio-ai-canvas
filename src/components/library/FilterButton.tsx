import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import { useCollections, useCollectionsByVendor } from "@/hooks/useCollections";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useInventoryTags, useInventoryLocations } from "@/hooks/useInventoryTags";
import { cn } from "@/lib/utils";

interface FilterButtonProps {
  selectedVendor?: string;
  selectedCollection?: string;
  selectedTags?: string[];
  selectedStorageLocation?: string;
  onVendorChange: (vendorId?: string) => void;
  onCollectionChange: (collectionId?: string) => void;
  onTagsChange?: (tags: string[]) => void;
  onStorageLocationChange?: (location?: string) => void;
}

export const FilterButton = ({
  selectedVendor,
  selectedCollection,
  selectedTags = [],
  selectedStorageLocation,
  onVendorChange,
  onCollectionChange,
  onTagsChange,
  onStorageLocationChange,
}: FilterButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: vendors } = useVendors();
  const { data: allCollections } = useCollections();
  const { data: vendorCollections } = useCollectionsByVendor(selectedVendor);
  
  const { data: availableTags = [] } = useInventoryTags();
  const { data: availableLocations = [] } = useInventoryLocations();

  const displayCollections = selectedVendor ? vendorCollections : allCollections;
  
  const activeFilterCount = [
    selectedVendor, 
    selectedCollection,
    selectedStorageLocation,
    ...(selectedTags.length > 0 ? ['tags'] : [])
  ].filter(Boolean).length;

  const clearFilters = () => {
    onVendorChange(undefined);
    onCollectionChange(undefined);
    if (onTagsChange) onTagsChange([]);
    if (onStorageLocationChange) onStorageLocationChange(undefined);
  };

  const toggleTag = (tag: string) => {
    if (!onTagsChange) return;
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {activeFilterCount}
          </Badge>
        )}
        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>

      <div className={cn(
        "absolute right-0 top-full mt-2 w-72 bg-background border border-border rounded-md shadow-lg overflow-hidden transition-all duration-200 ease-in-out",
        isExpanded ? "max-h-[500px] opacity-100 z-[10001]" : "max-h-0 opacity-0 pointer-events-none"
      )}>
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Filters</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Vendor</label>
              <Select
                value={selectedVendor || "all"}
                onValueChange={(val) => onVendorChange(val === "all" ? undefined : val)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent className="z-[10002]">
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors?.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Collection</label>
              <Select
                value={selectedCollection || "all"}
                onValueChange={(val) => onCollectionChange(val === "all" ? undefined : val)}
                disabled={!displayCollections || displayCollections.length === 0}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="All Collections" />
                </SelectTrigger>
                <SelectContent className="z-[10002]">
                  <SelectItem value="all">All Collections</SelectItem>
                  {displayCollections?.map((collection: any) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {onStorageLocationChange && availableLocations.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Location</label>
                <Select
                  value={selectedStorageLocation || "all"}
                  onValueChange={(val) => onStorageLocationChange(val === "all" ? undefined : val)}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent className="z-[10002]">
                    <SelectItem value="all">All Locations</SelectItem>
                    {availableLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {onTagsChange && availableTags.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Tags</label>
                <div className="max-h-28 overflow-y-auto space-y-1.5 p-2 border border-border rounded-md bg-muted/30">
                  {availableTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => toggleTag(tag)}
                        className="h-3.5 w-3.5"
                      />
                      <label htmlFor={`tag-${tag}`} className="text-xs cursor-pointer flex-1">
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
