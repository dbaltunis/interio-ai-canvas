import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Quote = Tables<"quotes">;
type QuoteInsert = TablesInsert<"quotes">;
type QuoteUpdate = TablesUpdate<"quotes">;

export const useQuotes = (projectId?: string) => {
  return useQuery({
    queryKey: ["quotes", projectId],
    queryFn: async () => {
      console.log("useQuotes: Starting fetch");
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log("useQuotes: Auth result", { user: user?.id, authError });
        
        if (authError) {
          console.error("useQuotes: Auth error", authError);
          throw authError;
        }
        
        if (!user) {
          console.log("useQuotes: No user found, returning empty array");
          return [];
        }

        console.log("useQuotes: Fetching quotes for user:", user.id);
        // First try the simple query without complex joins
        console.log("useQuotes: Attempting simple query first");
        let simpleQuery = supabase
          .from("quotes")
          .select("*")
          .eq("user_id", user.id);
        
        if (projectId) {
          simpleQuery = simpleQuery.eq("project_id", projectId);
        }
        
        const { data: simpleData, error: simpleError } = await simpleQuery
          .order("created_at", { ascending: false });

        if (simpleError) {
          console.error("useQuotes: Simple query failed:", simpleError);
          throw simpleError;
        }

        console.log("useQuotes: Simple query successful, got", simpleData?.length, "quotes");

        // Now try to enrich with project and client data
        try {
          console.log("useQuotes: Attempting enriched query");
          let enrichedQuery = supabase
            .from("quotes")
            .select(`
              *,
              projects (
                id,
                name,
                client_id,
                job_number,
                priority,
                status,
                start_date,
                due_date,
                completion_date,
                description
              ),
              clients (
                id,
                name,
                company_name,
                email,
                phone,
                client_type
              )
            `)
            .eq("user_id", user.id);
          
          if (projectId) {
            enrichedQuery = enrichedQuery.eq("project_id", projectId);
          }
          
          const { data, error } = await enrichedQuery
            .order("created_at", { ascending: false });

          if (error) {
            console.warn("useQuotes: Enriched query failed, falling back to simple data:", error);
            // Fall back to simple data if complex query fails
            const quotesWithLock = simpleData?.map(quote => ({
              ...quote,
              is_locked: false,
              projects: null,
              clients: null
            })) || [];
            return quotesWithLock;
          }
          
          console.log("Quotes fetched successfully with enriched data:", data?.length, "quotes");
          const quotesWithLock = data?.map(quote => ({
            ...quote,
            is_locked: false
          })) || [];
          
          return quotesWithLock;
        } catch (enrichError) {
          console.warn("useQuotes: Enriched query threw error, using simple data:", enrichError);
          const quotesWithLock = simpleData?.map(quote => ({
            ...quote,
            is_locked: false,
            projects: null,
            clients: null
          })) || [];
          return quotesWithLock;
        }
      } catch (error) {
        console.error("useQuotes: Error in fetch:", error);
        throw error;
      }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // Reduce aggressive refetching
    refetchOnMount: true,
    retry: 2, // Reduce retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
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
        is_locked: false,
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
      // Invalidate both quotes and projects to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
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
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Quote not found or update failed");
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
