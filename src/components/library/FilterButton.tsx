import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X, ChevronDown, ChevronUp, DollarSign, Palette } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import { useCollections, useCollectionsByVendor } from "@/hooks/useCollections";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useInventoryTags, useInventoryLocations, useInventoryColors } from "@/hooks/useInventoryTags";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { colorNameToHex } from "@/utils/colorNameToHex";

interface FilterButtonProps {
  selectedVendor?: string;
  selectedCollection?: string;
  selectedTags?: string[];
  selectedStorageLocation?: string;
  selectedColor?: string;
  priceRange?: { min: number; max: number };
  maxPrice?: number;
  onVendorChange: (vendorId?: string) => void;
  onCollectionChange: (collectionId?: string) => void;
  onTagsChange?: (tags: string[]) => void;
  onStorageLocationChange?: (location?: string) => void;
  onColorChange?: (color?: string) => void;
  onPriceRangeChange?: (range: { min: number; max: number } | undefined) => void;
}

export const FilterButton = ({
  selectedVendor,
  selectedCollection,
  selectedTags = [],
  selectedStorageLocation,
  selectedColor,
  priceRange,
  maxPrice = 500,
  onVendorChange,
  onCollectionChange,
  onTagsChange,
  onStorageLocationChange,
  onColorChange,
  onPriceRangeChange,
}: FilterButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { data: vendors } = useVendors();
  const { data: allCollections } = useCollections();
  const { data: vendorCollections } = useCollectionsByVendor(selectedVendor);
  
  const { data: availableTags = [] } = useInventoryTags();
  const { data: availableLocations = [] } = useInventoryLocations();
  const { data: availableColors = [] } = useInventoryColors();

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  const displayCollections = selectedVendor ? vendorCollections : allCollections;
  
  const activeFilterCount = [
    selectedVendor, 
    selectedCollection,
    selectedStorageLocation,
    selectedColor,
    priceRange,
    ...(selectedTags.length > 0 ? ['tags'] : [])
  ].filter(Boolean).length;

  const clearFilters = () => {
    onVendorChange(undefined);
    onCollectionChange(undefined);
    if (onTagsChange) onTagsChange([]);
    if (onStorageLocationChange) onStorageLocationChange(undefined);
    if (onColorChange) onColorChange(undefined);
    if (onPriceRangeChange) onPriceRangeChange(undefined);
  };

  const toggleTag = (tag: string) => {
    if (!onTagsChange) return;
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handlePriceChange = (values: number[]) => {
    if (onPriceRangeChange) {
      onPriceRangeChange({ min: values[0], max: values[1] });
    }
  };

  return (
    <div className="relative">
      <Button 
        ref={buttonRef}
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

      {/* Backdrop for mobile */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-[10000] bg-black/20 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div 
        ref={dropdownRef}
        className={cn(
          "absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-xl overflow-hidden transition-all duration-200 ease-out",
          isExpanded 
            ? "opacity-100 translate-y-0 z-[10001]" 
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h4 className="font-semibold text-sm">Filters</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-auto p-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Vendor Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vendor</label>
              <Select
                value={selectedVendor || "all"}
                onValueChange={(val) => onVendorChange(val === "all" ? undefined : val)}
              >
                <SelectTrigger className="w-full h-9">
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

            {/* Collection Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Collection</label>
              <Select
                value={selectedCollection || "all"}
                onValueChange={(val) => onCollectionChange(val === "all" ? undefined : val)}
                disabled={!displayCollections || displayCollections.length === 0}
              >
                <SelectTrigger className="w-full h-9">
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

            {/* Price Range Filter */}
            {onPriceRangeChange && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Price Range
                  </label>
                  {priceRange && (
                    <span className="text-xs text-foreground font-medium">
                      ${priceRange.min} - ${priceRange.max}
                    </span>
                  )}
                </div>
                <Slider
                  value={priceRange ? [priceRange.min, priceRange.max] : [0, maxPrice]}
                  min={0}
                  max={maxPrice}
                  step={5}
                  onValueChange={handlePriceChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$0</span>
                  <span>${maxPrice}+</span>
                </div>
              </div>
            )}

            {/* Color Filter */}
            {onColorChange && availableColors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Palette className="h-3 w-3" />
                  Color
                </label>
                <div className="flex flex-wrap gap-2 p-2 border border-border rounded-md bg-muted/30 max-h-28 overflow-y-auto">
                  {availableColors.slice(0, 20).map((color) => {
                    const hexColor = colorNameToHex(color);
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => onColorChange(isSelected ? undefined : color)}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all border",
                          isSelected 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-background border-border hover:border-primary/50"
                        )}
                        title={color}
                      >
                        {hexColor && (
                          <span 
                            className="w-3 h-3 rounded-full border border-border/50 shrink-0" 
                            style={{ backgroundColor: hexColor }}
                          />
                        )}
                        <span className="truncate max-w-[60px]">{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location Filter */}
            {onStorageLocationChange && availableLocations.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</label>
                <Select
                  value={selectedStorageLocation || "all"}
                  onValueChange={(val) => onStorageLocationChange(val === "all" ? undefined : val)}
                >
                  <SelectTrigger className="w-full h-9">
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

            {/* Tags Filter */}
            {onTagsChange && availableTags.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</label>
                <div className="max-h-28 overflow-y-auto space-y-1.5 p-2 border border-border rounded-md bg-muted/30">
                  {availableTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => toggleTag(tag)}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer flex-1">
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
