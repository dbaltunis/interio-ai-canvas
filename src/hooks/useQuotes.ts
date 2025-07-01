
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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found for quotes query");
          return [];
        }

        const { data, error } = await supabase
          .from("quotes")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Quotes query error:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Error in quotes query:", error);
        return [];
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quote: Omit<QuoteInsert, "user_id"> & { client_id?: string | null }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Auth error:", userError);
        throw new Error("Authentication error. Please try logging in again.");
      }
      
      if (!user) {
        throw new Error("You must be logged in to create a quote");
      }

      console.log("Creating quote with data:", quote);

      const quoteData: QuoteInsert = {
        ...quote,
        user_id: user.id,
        client_id: quote.client_id || null
      };

      console.log("Final quote data to insert:", quoteData);

      const { data, error } = await supabase
        .from("quotes")
        .insert(quoteData)
        .select()
        .single();

      if (error) {
        console.error("Create quote error:", error);
        throw error;
      }
      
      console.log("Quote created successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "Success",
        description: "Quote created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to create quote:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create quote. Please try again.",
        variant: "destructive",
      });
    },
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

      if (error) {
        console.error("Update quote error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
    onError: (error: any) => {
      console.error("Failed to update quote:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update quote. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "Success",
        description: "Quote deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete quote",
        variant: "destructive",
      });
    },
  });
};
