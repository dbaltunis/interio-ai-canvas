import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PriceGroupInfo {
  price_group: string;
  count: number;
  subcategories: string[];
}

/**
 * Hook to fetch all unique price groups from inventory items
 * Used for autocomplete suggestions in pricing grid upload
 */
export const useInventoryPriceGroups = () => {
  return useQuery({
    queryKey: ['inventory-price-groups'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get all unique price_groups with counts from enhanced_inventory_items
      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .select('price_group, subcategory')
        .eq('user_id', user.id)
        .not('price_group', 'is', null);

      if (error) throw error;

      // Group by price_group and count
      const groupMap = new Map<string, { count: number; subcategories: Set<string> }>();
      
      data?.forEach(item => {
        if (item.price_group) {
          const existing = groupMap.get(item.price_group);
          if (existing) {
            existing.count++;
            if (item.subcategory) existing.subcategories.add(item.subcategory);
          } else {
            groupMap.set(item.price_group, {
              count: 1,
              subcategories: new Set(item.subcategory ? [item.subcategory] : [])
            });
          }
        }
      });

      // Convert to array sorted by group name
      const priceGroups: PriceGroupInfo[] = Array.from(groupMap.entries())
        .map(([price_group, info]) => ({
          price_group,
          count: info.count,
          subcategories: Array.from(info.subcategories)
        }))
        .sort((a, b) => a.price_group.localeCompare(b.price_group));

      return priceGroups;
    },
    staleTime: 30000 // 30 seconds
  });
};

interface MaterialMatch {
  id: string;
  name: string;
  price_group: string | null;
  subcategory: string | null;
  vendor_id: string | null;
}

/**
 * Hook to count materials that will match a specific grid configuration
 */
export const useMaterialMatchCount = (
  supplierId: string | null,
  productType: string | null,
  priceGroup: string | null
) => {
  return useQuery({
    queryKey: ['material-match-count', supplierId, productType, priceGroup],
    queryFn: async (): Promise<{ count: number; materials: MaterialMatch[] }> => {
      if (!priceGroup) return { count: 0, materials: [] };

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .select('id, name, price_group, subcategory, vendor_id')
        .eq('user_id', user.id)
        .ilike('price_group', priceGroup.trim())
        .limit(100);

      if (error) throw error;

      // Filter by supplier/vendor client-side if needed
      let materials = (data || []) as MaterialMatch[];
      if (supplierId) {
        materials = materials.filter(m => m.vendor_id === supplierId);
      }

      return {
        count: materials.length,
        materials: materials.slice(0, 10) // Return first 10 for preview
      };
    },
    enabled: !!priceGroup && priceGroup.length > 0,
    staleTime: 10000
  });
};
