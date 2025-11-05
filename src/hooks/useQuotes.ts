import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";
import { generateSequenceNumber, getEntityTypeFromStatus, shouldRegenerateNumber } from "./useNumberSequenceGeneration";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Quote = Tables<"quotes">;
type QuoteInsert = TablesInsert<"quotes">;
type QuoteUpdate = TablesUpdate<"quotes">;

export const useQuotes = (projectId?: string) => {
  return useQuery({
    queryKey: ["quotes", projectId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("quotes")
        .select(`
          *,
          clients (
            id,
            name,
            email
          ),
          projects (
            id,
            name,
            status,
            client_id,
            clients (
              id,
              name,
              email
            )
          )
        `);
      
      if (projectId) {
        query = query.eq("project_id", projectId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quote: Omit<QuoteInsert, "user_id" | "quote_number"> & { quote_number?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate quote number using number sequences based on status
      let quoteNumber = quote.quote_number;
      if (!quoteNumber || quoteNumber.trim() === '') {
        // Determine entity type based on quote status
        let entityType: 'draft' | 'quote' | 'invoice' = 'draft';
        if (quote.status === 'sent' || quote.status === 'approved') {
          entityType = 'quote';
        } else if (quote.status === 'invoiced' || quote.status === 'invoice') {
          entityType = 'invoice';
        }
        
        const { data: generatedNumber, error: seqError } = await supabase.rpc("get_next_sequence_number", {
          p_user_id: user.id,
          p_entity_type: entityType,
        });
        
        if (seqError) {
          console.error("Error generating quote number:", seqError);
          // Fallback to old method if sequence generation fails
          const { count } = await supabase
            .from("quotes")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", user.id);
          
          quoteNumber = `QT-${String(((count || 0) + 1)).padStart(4, '0')}`;
        } else {
          quoteNumber = generatedNumber || `QT-${Date.now()}`;
        }
      }

      // Get first Quote status (slot 1) if status_id not provided
      let statusId = quote.status_id;
      if (!statusId) {
        const { data: firstStatus } = await supabase
          .from("job_statuses")
          .select("id")
          .eq("user_id", user.id)
          .eq("category", "Quote")
          .eq("is_active", true)
          .order("slot_number", { ascending: true })
          .limit(1)
          .maybeSingle();
        
        statusId = firstStatus?.id || null;
      }

      const { data, error } = await supabase
        .from("quotes")
        .insert({
          ...quote,
          user_id: user.id,
          quote_number: quoteNumber,
          status_id: statusId,
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
      // Check if status is changing and if we need to regenerate the number
      if (updates.status_id) {
        const { data: oldQuote } = await supabase
          .from("quotes")
          .select("quote_number, status_id, job_statuses(name)")
          .eq("id", id)
          .single();
        
        const { data: newStatus } = await supabase
          .from("job_statuses")
          .select("name")
          .eq("id", updates.status_id)
          .single();
        
        if (oldQuote && newStatus) {
          const oldStatusName = (oldQuote as any).job_statuses?.name || '';
          const newStatusName = newStatus.name;
          
          if (shouldRegenerateNumber(oldStatusName, newStatusName)) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const entityType = getEntityTypeFromStatus(newStatusName);
              if (entityType) {
                const newNumber = await generateSequenceNumber(user.id, entityType, 'QT');
                updates.quote_number = newNumber;
              }
            }
          }
        }
      }
      
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
      // Invalidate all quote-related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote-versions"] });
      if (data.project_id) {
        queryClient.invalidateQueries({ queryKey: ["quotes", data.project_id] });
      }
    }
  });
};

export const useDeleteQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get quote details first to know what to clean up
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .select("project_id")
        .eq("id", id)
        .single();
      
      if (quoteError) throw quoteError;
      
      // STEP 1: Delete quote_items first (child records)
      const { error: itemsError } = await supabase
        .from("quote_items")
        .delete()
        .eq("quote_id", id);
      
      if (itemsError) {
        console.error("Error deleting quote items:", itemsError);
        // Continue even if this fails (items might not exist)
      }
      
      // STEP 2: Delete treatments associated with the project
      if (quote.project_id) {
        const { error: treatmentsError } = await supabase
          .from("treatments")
          .delete()
          .eq("project_id", quote.project_id);
        
        if (treatmentsError) {
          console.error("Error deleting treatments:", treatmentsError);
          // Continue even if this fails
        }
        
        // STEP 3: Delete surfaces associated with the project
        const { error: surfacesError } = await supabase
          .from("surfaces")
          .delete()
          .eq("project_id", quote.project_id);
        
        if (surfacesError) {
          console.error("Error deleting surfaces:", surfacesError);
          // Continue even if this fails
        }
      }
      
      // STEP 4: Finally delete the quote
      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id };
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
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      queryClient.invalidateQueries({ queryKey: ["surfaces"] });
      
      toast({
        title: "Success",
        description: "Quote deleted successfully",
      });
    }
  });
};
