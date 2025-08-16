import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type QuoteItemInsert = TablesInsert<"quote_items">;
type QuoteItemUpdate = TablesUpdate<"quote_items">;

export const useQuoteItems = (quoteId: string | undefined) => {
  return useQuery({
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
};

export const useCreateQuoteItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: QuoteItemInsert) => {
      const { data, error } = await supabase
        .from("quote_items")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quote-items", data.quote_id] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "Success",
        description: "Quote item added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add quote item",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateQuoteItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: QuoteItemUpdate }) => {
      const { data, error } = await supabase
        .from("quote_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quote-items", data.quote_id] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "Success",
        description: "Quote item updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quote item",
        variant: "destructive"
      });
    },
  });
};

export const useDeleteQuoteItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("quote_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "Success",
        description: "Quote item deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete quote item",
        variant: "destructive"
      });
    },
  });
};