import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ManualQuoteItem {
  id: string;
  quote_id: string;
  user_id: string;
  item_name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  tax_rate: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useManualQuoteItems = (quoteId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['manual-quote-items', quoteId],
    enabled: !!quoteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manual_quote_items')
        .select('*')
        .eq('quote_id', quoteId!)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as ManualQuoteItem[];
    },
  });

  const addItem = useMutation({
    mutationFn: async (item: Omit<ManualQuoteItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('manual_quote_items')
        .insert({
          ...item,
          user_id: user.id,
          total_price: item.quantity * item.unit_price,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-quote-items', quoteId] });
      toast({
        title: 'Item added',
        description: 'Quote item has been added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error adding item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ManualQuoteItem> }) => {
      // Recalculate total if quantity or unit_price changed
      if (updates.quantity !== undefined || updates.unit_price !== undefined) {
        const item = items?.find(i => i.id === id);
        if (item) {
          const quantity = updates.quantity ?? item.quantity;
          const unitPrice = updates.unit_price ?? item.unit_price;
          updates.total_price = quantity * unitPrice;
        }
      }

      const { data, error } = await supabase
        .from('manual_quote_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-quote-items', quoteId] });
      toast({
        title: 'Item updated',
        description: 'Quote item has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('manual_quote_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-quote-items', quoteId] });
      toast({
        title: 'Item deleted',
        description: 'Quote item has been deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const reorderItems = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => 
        supabase
          .from('manual_quote_items')
          .update({ sort_order: index })
          .eq('id', id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-quote-items', quoteId] });
    },
  });

  const totalAmount = items?.reduce((sum, item) => sum + item.total_price, 0) || 0;
  const totalTax = items?.reduce((sum, item) => sum + (item.total_price * item.tax_rate / 100), 0) || 0;
  const grandTotal = totalAmount + totalTax;

  return {
    items: items || [],
    isLoading,
    addItem: addItem.mutate,
    updateItem: updateItem.mutate,
    deleteItem: deleteItem.mutate,
    reorderItems: reorderItems.mutate,
    totalAmount,
    totalTax,
    grandTotal,
  };
};
