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

  // Create a new quote version (duplicate current quote with rooms and treatments)
  const duplicateQuote = useMutation({
    mutationFn: async (currentQuote: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get the highest version number
      const maxVersion = quoteVersions?.reduce((max, quote) => 
        Math.max(max, (quote as any).version || 1), 0) || 0;
      
      const newVersion = maxVersion + 1;
      
      // Generate new quote number with version
      // Always use the first quote's base number to ensure consistency
      const firstQuote = quoteVersions?.[0];
      const baseQuoteNumber = firstQuote?.quote_number?.split('-v')[0] || currentQuote.quote_number.split('-v')[0];
      const newQuoteNumber = newVersion === 1 ? baseQuoteNumber : `${baseQuoteNumber}-v${newVersion}`;

      // Get first "Quote" category status as default (Draft status)
      let firstQuoteStatus = await supabase
        .from("job_statuses")
        .select("id")
        .eq("user_id", user.id)
        .eq("category", "Quote")
        .ilike("name", "Draft")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      
      // Fallback: try finding any Quote category status if Draft not found
      if (!firstQuoteStatus.data) {
        firstQuoteStatus = await supabase
          .from("job_statuses")
          .select("id")
          .eq("user_id", user.id)
          .eq("category", "Quote")
          .eq("is_active", true)
          .order("slot_number", { ascending: true })
          .limit(1)
          .maybeSingle();
      }
      
      // Create new quote version
      const { data: newQuote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          project_id: currentQuote.project_id,
          client_id: currentQuote.client_id,
          quote_number: newQuoteNumber,
          version: newVersion,
          status: 'draft',
          status_id: firstQuoteStatus?.data?.id || null,
          total_amount: currentQuote.total_amount,
          user_id: user.id,
          notes: `${currentQuote.notes || ''}\n\nDuplicated from version ${(currentQuote as any).version || 1}`.trim()
        })
        .select()
        .single();

      if (quoteError) throw quoteError;
      
      // Duplicate rooms linked to the current quote (by quote_id)
      const { data: rooms } = await supabase
        .from("rooms")
        .select("*")
        .eq("quote_id", currentQuote.id);
      
      if (rooms && rooms.length > 0) {
        const roomsToInsert = rooms.map(room => ({
          ...room,
          id: undefined,
          quote_id: newQuote.id,
          created_at: undefined,
          updated_at: undefined,
        }));
        
        const { data: newRooms, error: roomsError } = await supabase
          .from("rooms")
          .insert(roomsToInsert)
          .select();
        
        if (roomsError) console.error("Error duplicating rooms:", roomsError);
        
        // Create room ID mapping for treatments
        if (newRooms) {
          const roomIdMap = new Map();
          rooms.forEach((oldRoom, index) => {
            roomIdMap.set(oldRoom.id, newRooms[index]?.id);
          });
          
          // Duplicate treatments (by quote_id)
          const { data: treatments } = await supabase
            .from("treatments")
            .select("*")
            .eq("quote_id", currentQuote.id);
          
          if (treatments && treatments.length > 0) {
            const treatmentsToInsert = treatments.map(treatment => ({
              ...treatment,
              id: undefined,
              quote_id: newQuote.id,
              room_id: roomIdMap.get(treatment.room_id) || treatment.room_id,
              created_at: undefined,
              updated_at: undefined,
            }));
            
            const { error: treatmentsError } = await supabase
              .from("treatments")
              .insert(treatmentsToInsert);
            
            if (treatmentsError) console.error("Error duplicating treatments:", treatmentsError);
          }
        }
      }

      return newQuote;
    },
    onSuccess: (newQuote) => {
      queryClient.invalidateQueries({ queryKey: ["quote-versions", projectId] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "Quote Duplicated",
        description: `Created version ${(newQuote as any).version} of this quote.`,
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