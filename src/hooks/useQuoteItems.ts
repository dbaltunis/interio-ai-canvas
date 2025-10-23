import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuoteItem {
  id?: string;
  quote_id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_details?: any;
  breakdown?: any;
  currency?: string;
  sort_order?: number;
}

/**
 * Hook to manage quote items - fetch, create, update, delete
 */
export const useQuoteItems = (quoteId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch quote items for a specific quote
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["quote-items", quoteId],
    queryFn: async () => {
      if (!quoteId) return [];
      
      const { data, error } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", quoteId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!quoteId,
  });

  // Batch save quote items (replaces all items for a quote)
  const saveItems = useMutation({
    mutationFn: async ({ quoteId, items }: { quoteId: string; items: any[] }) => {
      // First, delete all existing items for this quote
      const { error: deleteError } = await supabase
        .from("quote_items")
        .delete()
        .eq("quote_id", quoteId);

      if (deleteError) throw deleteError;

      // Then insert new items
      const itemsToInsert = items.map((item, index) => ({
        quote_id: quoteId,
        name: item.name,
        description: item.description || item.treatment_type || "",
        quantity: item.quantity || 1,
        unit_price: item.unit_price || item.total || 0,
        total_price: item.total || 0,
        product_details: {
          room_id: item.room_id,
          room_name: item.room_name,
          surface_name: item.surface_name,
          treatment_type: item.treatment_type,
          image_url: item.image_url,
          hasChildren: item.hasChildren || false,
          children: item.children || [],
        },
        breakdown: item.breakdown || {},
        currency: item.currency || "GBP",
        sort_order: index,
      }));

      if (itemsToInsert.length === 0) return [];

      const { data, error } = await supabase
        .from("quote_items")
        .insert(itemsToInsert)
        .select();

      if (error) {
        console.error("Error saving quote items:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
      console.log("✅ Quote items saved successfully");
    },
    onError: (error) => {
      console.error("Failed to save quote items:", error);
      toast({
        title: "Error saving quote items",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  // Add a single item
  const addItem = useMutation({
    mutationFn: async (item: Omit<QuoteItem, "id">) => {
      const { data, error } = await supabase
        .from("quote_items")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
    },
  });

  // Update an item
  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<QuoteItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("quote_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
    },
  });

  // Delete an item
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("quote_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
    },
  });

  return {
    items,
    isLoading,
    saveItems,
    addItem,
    updateItem,
    deleteItem,
  };
};
