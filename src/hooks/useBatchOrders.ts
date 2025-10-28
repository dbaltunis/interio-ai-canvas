import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BatchOrder {
  id: string;
  user_id: string;
  batch_number: string;
  supplier_id: string;
  status: 'draft' | 'ready' | 'sent' | 'acknowledged' | 'in_transit' | 'delivered' | 'completed' | 'cancelled';
  order_schedule_date?: string;
  total_items: number;
  total_amount: number;
  sent_date?: string;
  acknowledged_date?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  tracking_number?: string;
  notes?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface BatchOrderItem {
  id: string;
  batch_order_id: string;
  material_queue_id: string;
  quote_id?: string;
  project_id?: string;
  client_name?: string;
  material_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  received_quantity: number;
  notes?: string;
  created_at: string;
}

export const useBatchOrders = (filters?: { status?: string; supplier_id?: string }) => {
  return useQuery({
    queryKey: ['batch-orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('batch_orders')
        .select(`
          *,
          vendors:supplier_id(id, name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as any[];
    },
  });
};

export const useBatchOrderItems = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-order-items', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_order_items')
        .select(`
          *,
          material_order_queue(
            material_type, 
            metadata,
            projects!material_order_queue_project_id_fkey(id, job_number, name, client_id),
            clients(id, name)
          ),
          quotes(project_name)
        `)
        .eq('batch_order_id', batchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!batchId,
  });
};

export const useCreateBatchOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batch: Partial<BatchOrder>) => {
      // Generate batch number
      const { data: batchNumber } = await supabase
        .rpc('generate_batch_number', { p_user_id: batch.user_id });

      const { data, error } = await supabase
        .from('batch_orders')
        .insert([{ ...batch, batch_number: batchNumber } as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-orders'] });
      toast.success('Batch order created');
    },
    onError: (error: any) => {
      toast.error('Failed to create batch: ' + error.message);
    },
  });
};

export const useUpdateBatchOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BatchOrder> }) => {
      const { data, error } = await supabase
        .from('batch_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-orders'] });
      toast.success('Batch order updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update batch: ' + error.message);
    },
  });
};

export const useDeleteBatchOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('batch_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-orders'] });
      toast.success('Batch order deleted');
    },
    onError: (error: any) => {
      toast.error('Failed to delete batch: ' + error.message);
    },
  });
};

export const useAddItemsToBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ batchId, items }: { batchId: string; items: Partial<BatchOrderItem>[] }) => {
      // Add items to batch
      const { data: batchItems, error: itemsError } = await supabase
        .from('batch_order_items')
        .insert(items.map(item => ({ ...item, batch_order_id: batchId })) as any)
        .select();

      if (itemsError) throw itemsError;

      // Update queue items status
      const queueIds = items.map(item => item.material_queue_id).filter(Boolean);
      if (queueIds.length > 0) {
        const { error: queueError } = await supabase
          .from('material_order_queue')
          .update({ status: 'in_batch' })
          .in('id', queueIds);

        if (queueError) throw queueError;
      }

      // Update batch totals
      const totalItems = batchItems.length;
      const totalAmount = batchItems.reduce((sum, item) => sum + Number(item.total_price || 0), 0);

      const { error: batchError } = await supabase
        .from('batch_orders')
        .update({ total_items: totalItems, total_amount: totalAmount })
        .eq('id', batchId);

      if (batchError) throw batchError;

      return batchItems;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-orders'] });
      queryClient.invalidateQueries({ queryKey: ['batch-order-items'] });
      queryClient.invalidateQueries({ queryKey: ['material-queue'] });
      toast.success('Items added to batch');
    },
    onError: (error: any) => {
      toast.error('Failed to add items: ' + error.message);
    },
  });
};

export const useSendBatchOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batchId: string) => {
      const { data, error } = await supabase
        .from('batch_orders')
        .update({
          status: 'sent',
          sent_date: new Date().toISOString(),
        })
        .eq('id', batchId)
        .select()
        .single();

      if (error) throw error;

      // Update queue items to ordered
      const { data: items } = await supabase
        .from('batch_order_items')
        .select('material_queue_id')
        .eq('batch_order_id', batchId);

      if (items && items.length > 0) {
        const queueIds = items.map(item => item.material_queue_id);
        await supabase
          .from('material_order_queue')
          .update({ status: 'ordered' })
          .in('id', queueIds);
      }

      // Add tracking history
      await supabase
        .from('order_tracking_history')
        .insert({
          batch_order_id: batchId,
          status: 'sent',
          notes: 'Order sent to supplier',
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-orders'] });
      queryClient.invalidateQueries({ queryKey: ['material-queue'] });
      toast.success('Order sent to supplier');
    },
    onError: (error: any) => {
      toast.error('Failed to send order: ' + error.message);
    },
  });
};

export const useReceiveBatchOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ batchId, receivedItems }: { batchId: string; receivedItems: { item_id: string; quantity: number }[] }) => {
      // Update batch status
      const { data: batch, error: batchError } = await supabase
        .from('batch_orders')
        .update({
          status: 'delivered',
          actual_delivery_date: new Date().toISOString(),
        })
        .eq('id', batchId)
        .select()
        .single();

      if (batchError) throw batchError;

      // Update item received quantities
      for (const item of receivedItems) {
        await supabase
          .from('batch_order_items')
          .update({ received_quantity: item.quantity })
          .eq('id', item.item_id);
      }

      // Record lead time
      if (batch.sent_date && batch.actual_delivery_date) {
        await supabase
          .from('supplier_lead_times')
          .insert({
            user_id: batch.user_id,
            supplier_id: batch.supplier_id,
            material_type: 'mixed',
            order_date: new Date(batch.sent_date).toISOString().split('T')[0],
            delivery_date: new Date(batch.actual_delivery_date).toISOString().split('T')[0],
            batch_order_id: batchId,
          });
      }

      // Add tracking history
      await supabase
        .from('order_tracking_history')
        .insert({
          batch_order_id: batchId,
          status: 'delivered',
          notes: 'Order received and inventory updated',
        });

      return batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-orders'] });
      queryClient.invalidateQueries({ queryKey: ['batch-order-items'] });
      toast.success('Order marked as received');
    },
    onError: (error: any) => {
      toast.error('Failed to receive order: ' + error.message);
    },
  });
};
