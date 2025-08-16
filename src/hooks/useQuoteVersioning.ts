import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useQuoteVersions = (quoteId: string | undefined) => {
  return {
    queryKey: ["quote-versions", quoteId],
    queryFn: async () => {
      if (!quoteId) return [];
      
      // Get original quote info first
      const { data: originalQuote } = await supabase
        .from("quotes")
        .select("project_id, client_id")
        .eq("id", quoteId)
        .single();

      if (!originalQuote) return [];

      // Find all quotes for the same project/client combination
      const { data: versions, error } = await supabase
        .from("quotes")
        .select(`
          *,
          clients(name, email),
          projects(name)
        `)
        .eq("project_id", originalQuote.project_id)
        .eq("client_id", originalQuote.client_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return versions || [];
    },
    enabled: !!quoteId,
  };
};

export const useCreateQuoteVersion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      originalQuoteId, 
      versionType = "revision",
      changes = {}
    }: { 
      originalQuoteId: string; 
      versionType?: "revision" | "alternative" | "update";
      changes?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get original quote
      const { data: originalQuote, error: quoteError } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", originalQuoteId)
        .single();

      if (quoteError) throw quoteError;

      // Get original quote items
      const { data: originalItems, error: itemsError } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", originalQuoteId)
        .order("sort_order", { ascending: true });

      if (itemsError) throw itemsError;

      // Generate new version number
      const { data: existingVersions } = await supabase
        .from("quotes")
        .select("quote_number")
        .eq("project_id", originalQuote.project_id)
        .eq("client_id", originalQuote.client_id)
        .order("created_at", { ascending: false });

      const baseNumber = originalQuote.quote_number?.split("-")[1] || "001";
      const versionCount = existingVersions?.length || 1;
      const versionSuffix = versionType === "revision" ? "R" : versionType === "alternative" ? "A" : "U";
      const newQuoteNumber = `Q-${baseNumber}-${versionSuffix}${versionCount}`;

      // Create new quote version
      const { data: newQuote, error: newQuoteError } = await supabase
        .from("quotes")
        .insert({
          user_id: user.id,
          project_id: originalQuote.project_id,
          client_id: originalQuote.client_id,
          quote_number: newQuoteNumber,
          status: "draft",
          subtotal: changes.subtotal ?? originalQuote.subtotal,
          tax_rate: changes.tax_rate ?? originalQuote.tax_rate,
          tax_amount: changes.tax_amount ?? originalQuote.tax_amount,
          total_amount: changes.total_amount ?? originalQuote.total_amount,
          notes: changes.notes ?? `${versionType.charAt(0).toUpperCase() + versionType.slice(1)} of ${originalQuote.quote_number}`,
          valid_until: changes.valid_until ?? null,
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

      return { newQuote, versionType };
    },
    onSuccess: ({ newQuote, versionType }) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
      queryClient.invalidateQueries({ queryKey: ["quote-versions"] });
      toast({
        title: "Version Created",
        description: `New ${versionType} ${newQuote.quote_number} created successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create quote version",
        variant: "destructive"
      });
    },
  });
};