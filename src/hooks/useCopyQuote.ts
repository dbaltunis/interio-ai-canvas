import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCopyQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (originalQuoteId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Fetch the original quote
      const { data: originalQuote, error: quoteError } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", originalQuoteId)
        .single();

      if (quoteError) throw quoteError;

      // Fetch quote items
      const { data: originalItems, error: itemsError } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", originalQuoteId)
        .order("sort_order", { ascending: true });

      if (itemsError) throw itemsError;

      // Generate new quote number
      const { data: existingQuotes } = await supabase
        .from("quotes")
        .select("quote_number")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      let newQuoteNumber = "Q-001";
      if (existingQuotes && existingQuotes.length > 0) {
        const lastNumber = existingQuotes[0].quote_number || "Q-000";
        const numberPart = parseInt(lastNumber.split("-")[1] || "0", 10);
        newQuoteNumber = `Q-${(numberPart + 1).toString().padStart(3, "0")}`;
      }

      // Create new quote
      const { data: newQuote, error: newQuoteError } = await supabase
        .from("quotes")
        .insert({
          user_id: user.id,
          quote_number: newQuoteNumber,
          status: "draft",
          client_id: originalQuote.client_id,
          project_id: originalQuote.project_id,
          subtotal: originalQuote.subtotal,
          tax_amount: originalQuote.tax_amount,
          tax_rate: originalQuote.tax_rate,
          total_amount: originalQuote.total_amount,
          notes: originalQuote.notes,
          valid_until: null, // Reset validity for new quote
        })
        .select()
        .single();

      if (newQuoteError) throw newQuoteError;

      // Copy quote items if they exist
      if (originalItems && originalItems.length > 0) {
        const newItems = originalItems.map(item => ({
          quote_id: newQuote.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          currency: item.currency,
          sort_order: item.sort_order,
          product_details: item.product_details,
          breakdown: item.breakdown,
        }));

        const { error: itemsInsertError } = await supabase
          .from("quote_items")
          .insert(newItems);

        if (itemsInsertError) throw itemsInsertError;
      }

      return newQuote;
    },
    onSuccess: (newQuote) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
      toast({
        title: "Success",
        description: `Quote copied successfully as ${newQuote.quote_number}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to copy quote",
        variant: "destructive"
      });
    },
  });
};