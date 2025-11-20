import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FabricLeftoverTotal {
  fabric_id: string;
  total_leftover_cm: number;
  total_leftover_sqm: number;
  piece_count: number;
}

/**
 * Get aggregated leftover fabric totals per fabric for inventory display
 * Shows available leftover only (not used pieces)
 */
export const useInventoryLeftovers = (clientId?: string) => {
  return useQuery({
    queryKey: ['inventory-leftovers', clientId],
    queryFn: async () => {
      let query = supabase
        .from('client_fabric_pool')
        .select('fabric_id, leftover_length_cm, fabric_width_cm, orientation')
        .eq('is_available', true);

      // If clientId provided, filter by it; otherwise get all leftovers
      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Aggregate by fabric_id
      const leftoverMap = new Map<string, FabricLeftoverTotal>();

      (data || []).forEach(item => {
        const existing = leftoverMap.get(item.fabric_id) || {
          fabric_id: item.fabric_id,
          total_leftover_cm: 0,
          total_leftover_sqm: 0,
          piece_count: 0
        };

        // Calculate sqm for this piece
        const lengthM = item.leftover_length_cm / 100;
        const widthM = item.fabric_width_cm / 100;
        const sqm = lengthM * widthM;

        leftoverMap.set(item.fabric_id, {
          fabric_id: item.fabric_id,
          total_leftover_cm: existing.total_leftover_cm + item.leftover_length_cm,
          total_leftover_sqm: existing.total_leftover_sqm + sqm,
          piece_count: existing.piece_count + 1
        });
      });

      return Array.from(leftoverMap.values());
    },
    enabled: true // Always enabled to show all leftovers in inventory
  });
};
