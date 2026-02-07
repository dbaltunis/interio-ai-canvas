import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings2, Info } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface SystemTypeSelectorProps {
  productType: string; // e.g., "roller_blinds", "venetian_blinds"
  priceGroup?: string; // e.g., "A", "B", "1", "2"
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Hook to fetch available system types from pricing grids
 * Based on the product type and optionally price group
 */
const useAvailableSystemTypes = (productType: string, priceGroup?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['available-system-types', productType, priceGroup, user?.id],
    queryFn: async () => {
      if (!user?.id || !productType) return [];

      // Fetch unique system types from pricing_grid_rules table
      let query = supabase
        .from('pricing_grid_rules')
        .select('system_type')
        .eq('user_id', user.id)
        .eq('product_type', productType)
        .eq('active', true)
        .not('system_type', 'is', null);

      if (priceGroup) {
        query = query.eq('price_group', priceGroup);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching system types:', error);
        return [];
      }

      // Get unique system types
      const uniqueTypes = [...new Set(data?.map(d => d.system_type).filter(Boolean))] as string[];
      return uniqueTypes.sort();
    },
    enabled: !!user?.id && !!productType,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Common system types for each product category
 * Used as fallback when no custom types are configured
 */
const DEFAULT_SYSTEM_TYPES: Record<string, string[]> = {
  roller_blinds: ['Standard', 'Cassette', 'Open Roll', 'Motorized'],
  venetian_blinds: ['25mm', '50mm', 'Wood'],
  vertical_blinds: ['89mm', '127mm'],
  cellular_shades: ['Single Cell', 'Double Cell', 'Blackout'],
  roman_blinds: ['Standard', 'Hobbled', 'Flat Fold'],
  shutters: ['Full Height', 'Tier on Tier', 'Café Style', 'Solid'],
};

export const SystemTypeSelector = ({
  productType,
  priceGroup,
  value,
  onChange,
  disabled = false,
}: SystemTypeSelectorProps) => {
  const { data: availableTypes = [], isLoading } = useAvailableSystemTypes(productType, priceGroup);

  // Use available types from database, or fall back to defaults
  const systemTypes = availableTypes.length > 0
    ? availableTypes
    : DEFAULT_SYSTEM_TYPES[productType] || [];

  // Don't show if no system types available
  if (!isLoading && systemTypes.length === 0) {
    return null;
  }

  const formatSystemType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="system-type" className="text-sm font-medium">
          System Type
        </Label>
        {availableTypes.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {availableTypes.length} options
          </Badge>
        )}
      </div>

      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="system-type" className="w-full">
          <SelectValue placeholder={isLoading ? "Loading..." : "Select system type"} />
        </SelectTrigger>
        <SelectContent>
          {systemTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {formatSystemType(type)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!value && systemTypes.length > 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          Select a system type to ensure correct pricing grid is used
        </p>
      )}
    </div>
  );
};
