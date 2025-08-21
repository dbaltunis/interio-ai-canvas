import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useQuoteVersions = (projectId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all quote versions for a project
  const { data: quoteVersions, isLoading } = useQuery({
    queryKey: ["quote-versions", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("project_id", projectId)
        .order("version", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Create a new quote version (duplicate current quote)
  const duplicateQuote = useMutation({
    mutationFn: async (currentQuote: any) => {
      // Get the highest version number
      const maxVersion = quoteVersions?.reduce((max, quote) => 
        Math.max(max, quote.version || 1), 0) || 0;
      
      const newVersion = maxVersion + 1;
      
      // Generate new quote number with version
      const baseQuoteNumber = currentQuote.quote_number.split('-v')[0]; // Remove existing version suffix
      const newQuoteNumber = `${baseQuoteNumber}-v${newVersion}`;
      
      // Create new quote version
      const { data, error } = await supabase
        .from("quotes")
        .insert({
          ...currentQuote,
          id: undefined, // Let database generate new ID
          quote_number: newQuoteNumber,
          version: newVersion,
          status: 'draft',
          created_at: undefined,
          updated_at: undefined,
          notes: `${currentQuote.notes || ''}\n\nDuplicated from version ${currentQuote.version || 1}`.trim()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newQuote) => {
      queryClient.invalidateQueries({ queryKey: ["quote-versions", projectId] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "Quote Duplicated",
        description: `Created version ${newQuote.version} of this quote.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate quote",
        variant: "destructive"
      });
    },
  });

  // Update quote version
  const updateQuoteVersion = useMutation({
    mutationFn: async ({ quoteId, updates }: { quoteId: string; updates: any }) => {
      const { data, error } = await supabase
        .from("quotes")
        .update(updates)
        .eq("id", quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-versions", projectId] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });

  // Delete quote version
  const deleteQuoteVersion = useMutation({
    mutationFn: async (quoteId: string) => {
      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", quoteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-versions", projectId] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "Quote Version Deleted",
        description: "Quote version has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete quote version",
        variant: "destructive"
      });
    },
  });

  const currentQuote = quoteVersions?.[quoteVersions.length - 1]; // Latest version
  const hasMultipleVersions = (quoteVersions?.length || 0) > 1;

  return {
    quoteVersions: quoteVersions || [],
    currentQuote,
    hasMultipleVersions,
    isLoading,
    duplicateQuote,
    updateQuoteVersion,
    deleteQuoteVersion,
  };
};