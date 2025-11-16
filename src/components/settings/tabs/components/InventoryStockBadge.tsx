import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, AlertTriangle } from 'lucide-react';

interface InventoryStockBadgeProps {
  itemId: string;
}

export const InventoryStockBadge = ({ itemId }: InventoryStockBadgeProps) => {
  const { data: item, isLoading } = useQuery({
    queryKey: ['inventory-item', itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .select('quantity, unit, reorder_point, name')
        .eq('id', itemId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!itemId,
  });

  if (isLoading) {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading...
      </Badge>
    );
  }

  // Don't show badge if item doesn't exist or quantity is null/undefined (not tracking)
  if (!item || item.quantity == null) return null;

  const isLowStock = item.quantity <= (item.reorder_point || 0);
  const isOutOfStock = item.quantity <= 0;

  if (isOutOfStock) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Out of Stock
      </Badge>
    );
  }

  if (isLowStock) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 border-orange-500 text-orange-700">
        <AlertTriangle className="h-3 w-3" />
        Low: {item.quantity} {item.unit}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-700">
      <Package className="h-3 w-3" />
      Stock: {item.quantity} {item.unit}
    </Badge>
  );
};
