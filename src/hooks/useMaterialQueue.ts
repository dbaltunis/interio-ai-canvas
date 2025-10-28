import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MaterialQueueItem {
  id: string;
  user_id: string;
  quote_id?: string;
  project_id?: string;
  client_id?: string;
  inventory_item_id?: string;
  material_name: string;
  material_type: string;
  quantity: number;
  unit: string;
  supplier_id?: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  needed_by_date?: string;
  status: 'pending' | 'in_batch' | 'ordered' | 'received' | 'cancelled';
  unit_cost: number;
  total_cost: number;
  notes?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface MaterialQueueFilters {
  supplier_id?: string;
  material_type?: string;
  priority?: string;
  status?: string;
  quote_id?: string;
}

export const useMaterialQueue = (filters?: MaterialQueueFilters) => {
  return useQuery({
    queryKey: ['material-queue-v2', filters],
    queryFn: async () => {
      console.log('[useMaterialQueue] Fetching with filters:', filters);
      
      let query = supabase
        .from('material_order_queue')
        .select(`
          *,
          vendors:supplier_id(id, name),
          quotes(id, quote_number, client_id),
          projects!material_order_queue_project_id_fkey(id, job_number, name, client_id),
          clients(id, name),
          inventory_items:inventory_item_id(id, name, sku, description, image_url)
        `)
        .order('needed_by_date', { ascending: true, nullsFirst: false });

      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }
      if (filters?.material_type) {
        query = query.eq('material_type', filters.material_type);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.quote_id) {
        query = query.eq('quote_id', filters.quote_id);
      }

      const { data, error } = await query;

      console.log('[useMaterialQueue] Query result:', { 
        dataCount: data?.length, 
        error,
        firstItem: data?.[0]
      });

      if (error) {
        console.error('[useMaterialQueue] Query error:', error);
        throw error;
      }
      return data as any[];
    },
  });
};

export const useMaterialQueueStats = () => {
  return useQuery({
    queryKey: ['material-queue-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('material_order_queue')
        .select('status, priority, supplier_id, total_cost')
        .in('status', ['pending', 'in_batch']);

      if (error) throw error;

      const stats = {
        totalItems: data.length,
        totalValue: data.reduce((sum, item) => sum + Number(item.total_cost || 0), 0),
        byStatus: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        bySupplier: {} as Record<string, number>,
      };

      data.forEach(item => {
        stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
        stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
        if (item.supplier_id) {
          stats.bySupplier[item.supplier_id] = (stats.bySupplier[item.supplier_id] || 0) + 1;
        }
      });

      return stats;
    },
  });
};

export const useCreateMaterialQueueItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Partial<MaterialQueueItem>) => {
      const { data, error } = await supabase
        .from('material_order_queue')
        .insert([item] as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-queue-v2'] });
      queryClient.invalidateQueries({ queryKey: ['material-queue-stats'] });
      toast.success('Material added to queue');
    },
    onError: (error: any) => {
      toast.error('Failed to add material to queue: ' + error.message);
    },
  });
};

export const useUpdateMaterialQueueItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MaterialQueueItem> }) => {
      const { data, error } = await supabase
        .from('material_order_queue')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-queue-v2'] });
      queryClient.invalidateQueries({ queryKey: ['material-queue-stats'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update material: ' + error.message);
    },
  });
};

export const useDeleteMaterialQueueItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('material_order_queue')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-queue-v2'] });
      queryClient.invalidateQueries({ queryKey: ['material-queue-stats'] });
      toast.success('Material removed from queue');
    },
    onError: (error: any) => {
      toast.error('Failed to remove material: ' + error.message);
    },
  });
};

export const useBulkAddToQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Partial<MaterialQueueItem>[]) => {
      console.log('[useBulkAddToQueue] Inserting items:', items);
      
      // Check for duplicates before inserting
      const treatmentMaterialIds = items
        .map(item => item.metadata?.treatment_material_id)
        .filter(Boolean) as string[];
      
      if (treatmentMaterialIds.length > 0) {
        // Check if any of these materials are already in the queue
        const { data: existingItems } = await supabase
          .from('material_order_queue')
          .select('id, metadata')
          .not('status', 'in', '(received,cancelled)')
          .or(`metadata->treatment_material_id.in.(${treatmentMaterialIds.map(id => `"${id}"`).join(',')})`);
        
        if (existingItems && existingItems.length > 0) {
          const existingIds = new Set(
            existingItems
              .map(item => {
                const metadata = item.metadata as any;
                return metadata?.treatment_material_id;
              })
              .filter(Boolean)
          );
          
          // Filter out items that are already in queue
          const newItems = items.filter(
            item => !existingIds.has(item.metadata?.treatment_material_id)
          );
          
          if (newItems.length === 0) {
            throw new Error('All selected materials are already in the purchasing queue');
          }
          
          if (newItems.length < items.length) {
            const skippedCount = items.length - newItems.length;
            toast.info(`${skippedCount} material${skippedCount > 1 ? 's' : ''} already in queue (skipped)`);
          }
          
          items = newItems;
        }
      }
      
      const { data, error } = await supabase
        .from('material_order_queue')
        .insert(items as any)
        .select();

      if (error) {
        console.error('[useBulkAddToQueue] Insert failed:', {
          error,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('[useBulkAddToQueue] Insert successful:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['material-queue-v2'] });
      queryClient.invalidateQueries({ queryKey: ['material-queue-stats'] });
      queryClient.invalidateQueries({ queryKey: ['treatment-materials-status'] });
    },
    onError: (error: any) => {
      console.error('[useBulkAddToQueue] Mutation error:', error);
    },
  });
};
