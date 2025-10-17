import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface InventoryTransaction {
  id: string;
  inventory_item_id: string;
  user_id: string;
  transaction_type: 'purchase' | 'sale' | 'adjustment' | 'allocation' | 'return';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_at: string;
}

export const useInventoryTransactions = (inventoryItemId?: string) => {
  return useQuery({
    queryKey: ["inventory-transactions", inventoryItemId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("User not authenticated");

      let query = supabase
        .from("inventory_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (inventoryItemId) {
        query = query.eq("inventory_item_id", inventoryItemId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as InventoryTransaction[];
    },
  });
};

export const useCreateInventoryTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Omit<InventoryTransaction, "id" | "user_id" | "created_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("User not authenticated");

      // Start a transaction to update inventory quantity and create transaction record
      const { data: currentItem, error: fetchError } = await supabase
        .from("enhanced_inventory_items")
        .select("quantity")
        .eq("id", transaction.inventory_item_id)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new quantity based on transaction type
      let quantityChange = transaction.quantity;
      if (transaction.transaction_type === 'sale' || transaction.transaction_type === 'allocation') {
        quantityChange = -Math.abs(transaction.quantity); // Deduct
      } else if (transaction.transaction_type === 'purchase' || transaction.transaction_type === 'return') {
        quantityChange = Math.abs(transaction.quantity); // Add
      }

      const newQuantity = (currentItem.quantity || 0) + quantityChange;

      // Update inventory quantity
      const { error: updateError } = await supabase
        .from("enhanced_inventory_items")
        .update({ quantity: newQuantity })
        .eq("id", transaction.inventory_item_id);

      if (updateError) throw updateError;

      // Create transaction record
      const { data, error } = await supabase
        .from("inventory_transactions")
        .insert({
          user_id: user.id,
          inventory_item_id: transaction.inventory_item_id,
          transaction_type: transaction.transaction_type,
          quantity: transaction.quantity,
          unit_cost: transaction.unit_cost,
          total_cost: transaction.total_cost,
          reference_type: transaction.reference_type,
          reference_id: transaction.reference_id,
          notes: transaction.notes,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Transaction recorded",
        description: `${transaction.transaction_type} transaction created successfully`,
      });

      return data as InventoryTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
    },
  });
};
