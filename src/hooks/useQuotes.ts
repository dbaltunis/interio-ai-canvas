
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Quote = Tables<"quotes">;
type QuoteInsert = TablesInsert<"quotes">;
type QuoteUpdate = TablesUpdate<"quotes">;

export const useQuotes = () => {
  return useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("quotes")
        .select(`
          *,
          projects (
            name,
            client_id,
            job_number
          ),
          clients (
            name,
            company_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnWindowFocus: false,
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quote: Omit<QuoteInsert, "user_id" | "quote_number"> & { quote_number?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate quote number if not provided
      let quoteNumber = quote.quote_number;
      if (!quoteNumber || quoteNumber.trim() === '') {
        // Get the count of existing quotes for this user to generate a sequential number
        const { count } = await supabase
          .from("quotes")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", user.id);
        
        quoteNumber = `QT-${String(((count || 0) + 1)).padStart(4, '0')}`;
      }

      const { data, error } = await supabase
        .from("quotes")
        .insert({
          ...quote,
          user_id: user.id,
          quote_number: quoteNumber
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newQuote) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["quotes"] });
      
      const previousQuotes = queryClient.getQueryData(["quotes"]);
      
      const optimisticQuote = {
        id: `temp-${Date.now()}`,
        ...newQuote,
        user_id: "current-user",
        quote_number: newQuote.quote_number || `QT-TEMP`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData(["quotes"], (old: any) => 
        old ? [optimisticQuote, ...old] : [optimisticQuote]
      );
      
      return { previousQuotes };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousQuotes) {
        queryClient.setQueryData(["quotes"], context.previousQuotes);
      }
      console.error("Failed to create quote:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create quote. Please try again.",
        variant: "destructive"
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["quotes"], (old: any) => {
        if (!old) return [data];
        return old.map((quote: any) => 
          quote.id.toString().startsWith('temp-') ? data : quote
        );
      });
    }
  });
};

export const useUpdateQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<QuoteUpdate>) => {
      const { data, error } = await supabase
        .from("quotes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ["quotes"] });
      
      const previousQuotes = queryClient.getQueryData(["quotes"]);
      
      queryClient.setQueryData(["quotes"], (old: any) => {
        if (!old) return old;
        return old.map((quote: any) => 
          quote.id === id ? { ...quote, ...updates } : quote
        );
      });
      
      return { previousQuotes };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousQuotes) {
        queryClient.setQueryData(["quotes"], context.previousQuotes);
      }
      console.error("Failed to update quote:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update quote. Please try again.",
        variant: "destructive"
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["quotes"], (old: any) => {
        if (!old) return [data];
        return old.map((quote: any) => 
          quote.id === data.id ? data : quote
        );
      });
    }
  });
};

export const useDeleteQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["quotes"] });
      
      const previousQuotes = queryClient.getQueryData(["quotes"]);
      
      queryClient.setQueryData(["quotes"], (old: any) => {
        if (!old) return old;
        return old.filter((quote: any) => quote.id !== id);
      });
      
      return { previousQuotes };
    },
    onError: (error: any, id, context) => {
      if (context?.previousQuotes) {
        queryClient.setQueryData(["quotes"], context.previousQuotes);
      }
      console.error("Failed to delete quote:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete quote. Please try again.",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quote deleted successfully",
      });
    }
  });
};
