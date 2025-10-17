import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  user_id: string;
  order_number: string;
  status: 'draft' | 'pending' | 'ordered' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery_date?: string;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  inventory_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity: number;
  notes?: string;
}

export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("purchase_orders")
        .select("*, purchase_order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (PurchaseOrder & { purchase_order_items: PurchaseOrderItem[] })[];
    },
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: { 
      supplier_id: string; 
      items: { inventory_item_id: string; quantity: number; unit_price: number }[];
      expected_delivery_date?: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("User not authenticated");

      // Generate order number
      const orderNumber = `PO-${Date.now()}`;
      
      // Calculate total
      const totalAmount = order.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

      // Create purchase order
      const { data: po, error: poError } = await supabase
        .from("purchase_orders")
        .insert({
          user_id: user.id,
          supplier_id: order.supplier_id,
          order_number: orderNumber,
          status: 'draft',
          order_date: new Date().toISOString(),
          expected_delivery_date: order.expected_delivery_date,
          total_amount: totalAmount,
          notes: order.notes,
        })
        .select()
        .single();

      if (poError) throw poError;

      // Create purchase order items
      const poItems = order.items.map(item => ({
        purchase_order_id: po.id,
        inventory_item_id: item.inventory_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        received_quantity: 0,
      }));

      const { error: itemsError } = await supabase
        .from("purchase_order_items")
        .insert(poItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Purchase order created",
        description: `Order ${orderNumber} has been created`,
      });

      return po;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

export const useUpdatePurchaseOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PurchaseOrder['status'] }) => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // If status is 'received', create inventory transactions
      if (status === 'received') {
        const { data: items } = await supabase
          .from("purchase_order_items")
          .select("*")
          .eq("purchase_order_id", id);

        if (items) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.id) {
            for (const item of items) {
              await supabase.from("inventory_transactions").insert({
                user_id: user.id,
                inventory_item_id: item.inventory_item_id,
                transaction_type: 'purchase',
                quantity: item.received_quantity || item.quantity,
                unit_cost: item.unit_price,
                total_cost: item.total_price,
                reference_type: 'purchase_order',
                reference_id: id,
                notes: `Received from PO ${data.order_number}`,
              });
            }
          }
        }
      }

      toast({
        title: "Status updated",
        description: `Purchase order status changed to ${status}`,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
    },
  });
};
