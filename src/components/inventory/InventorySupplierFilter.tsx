import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";

interface InventorySupplierFilterProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
  showCounts?: boolean;
  itemCounts?: Record<string, number>;
}

export const InventorySupplierFilter = ({
  value,
  onChange,
  className = "",
  showCounts = false,
  itemCounts = {}
}: InventorySupplierFilterProps) => {
  const { data: vendors = [] } = useVendors();

  const handleChange = (newValue: string) => {
    onChange(newValue === "all" ? undefined : newValue);
  };

  // Sort vendors: TWC first, then alphabetically
  const sortedVendors = [...vendors].sort((a, b) => {
    const aIsTWC = a.name?.toUpperCase() === 'TWC';
    const bIsTWC = b.name?.toUpperCase() === 'TWC';
    if (aIsTWC && !bIsTWC) return -1;
    if (!aIsTWC && bIsTWC) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <Select value={value || "all"} onValueChange={handleChange}>
      <SelectTrigger className={`w-auto min-w-[160px] h-9 text-sm gap-2 ${className}`}>
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder="All Suppliers" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <div className="flex items-center justify-between w-full gap-3">
            <span>All Suppliers</span>
            {showCounts && (
              <Badge variant="secondary" className="text-[10px] ml-2">
                {Object.values(itemCounts).reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </div>
        </SelectItem>
        {sortedVendors.map(vendor => (
          <SelectItem key={vendor.id} value={vendor.id}>
            <div className="flex items-center gap-2">
              <span>{vendor.name}</span>
              {vendor.name?.toUpperCase() === 'TWC' && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] px-1 py-0">
                  TWC
                </Badge>
              )}
              {showCounts && itemCounts[vendor.id] && (
                <Badge variant="secondary" className="text-[10px] ml-1">
                  {itemCounts[vendor.id]}
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
