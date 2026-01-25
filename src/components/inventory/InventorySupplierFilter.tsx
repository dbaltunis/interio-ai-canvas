import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useMemo } from "react";
import { useIsDealer } from "@/hooks/useIsDealer";

interface InventorySupplierFilterProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
  showCounts?: boolean;
  itemCounts?: Record<string, number>;
  category?: string; // Optional: filter counts by category
}

// CRITICAL: Helper to match items by vendor_id OR supplier field
// This fixes TWC items that have supplier="TWC" but vendor_id=NULL
export const matchesSupplierFilter = (item: any, selectedVendor: string | undefined, vendors: any[] = []): boolean => {
  if (!selectedVendor) return true;
  
  // Direct vendor_id match
  if (item.vendor_id === selectedVendor) return true;
  
  // Find vendor name for the selected vendor ID
  const vendor = vendors.find(v => v.id === selectedVendor);
  if (vendor && item.supplier?.toLowerCase() === vendor.name?.toLowerCase()) {
    return true;
  }
  
  return false;
};

export const InventorySupplierFilter = ({
  value,
  onChange,
  className = "",
  showCounts = false,
  itemCounts = {},
  category
}: InventorySupplierFilterProps) => {
  const { data: vendors = [] } = useVendors();
  const { data: inventory = [] } = useEnhancedInventory();
  const { data: isDealer } = useIsDealer();

  // Calculate counts per vendor (considering both vendor_id AND supplier field)
  // MUST be called before any conditional returns (React Rules of Hooks)
  const vendorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Filter by category if provided
    const items = category 
      ? inventory.filter(i => i.category === category)
      : inventory;
    
    vendors.forEach(vendor => {
      // Count items that match by vendor_id OR by supplier name
      counts[vendor.id] = items.filter(item => 
        item.vendor_id === vendor.id || 
        item.supplier?.toLowerCase() === vendor.name?.toLowerCase()
      ).length;
    });
    
    return counts;
  }, [inventory, vendors, category]);

  // Dealers should not see the supplier filter at all
  if (isDealer) {
    return null;
  }

  const handleChange = (newValue: string) => {
    onChange(newValue === "all" ? undefined : newValue);
  };

  // Sort vendors: TWC first, then by count (descending), then alphabetically
  const sortedVendors = [...vendors].sort((a, b) => {
    const aIsTWC = a.name?.toUpperCase() === 'TWC';
    const bIsTWC = b.name?.toUpperCase() === 'TWC';
    if (aIsTWC && !bIsTWC) return -1;
    if (!aIsTWC && bIsTWC) return 1;
    
    // Then by count
    const aCount = vendorCounts[a.id] || 0;
    const bCount = vendorCounts[b.id] || 0;
    if (aCount !== bCount) return bCount - aCount;
    
    return (a.name || '').localeCompare(b.name || '');
  });

  // Calculate total items
  const totalItems = Object.values(vendorCounts).reduce((a, b) => a + b, 0);

  return (
    <Select value={value || "all"} onValueChange={handleChange}>
      <SelectTrigger className={`w-auto min-w-[180px] h-9 text-sm gap-2 ${className}`}>
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder="All Suppliers" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <div className="flex items-center justify-between w-full gap-3">
            <span>All Suppliers</span>
            {showCounts && (
              <Badge variant="secondary" className="text-[10px] ml-2">
                {totalItems}
              </Badge>
            )}
          </div>
        </SelectItem>
        {sortedVendors.map(vendor => {
          const count = vendorCounts[vendor.id] || 0;
          // Only show vendors with items (unless showing all)
          if (count === 0 && !showCounts) return null;
          
          return (
            <SelectItem key={vendor.id} value={vendor.id}>
              <div className="flex items-center gap-2">
                <span>{vendor.name}</span>
                {vendor.name?.toUpperCase() === 'TWC' && (
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] px-1 py-0">
                    TWC
                  </Badge>
                )}
                {showCounts && count > 0 && (
                  <Badge variant="secondary" className="text-[10px] ml-1">
                    {count}
                  </Badge>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};