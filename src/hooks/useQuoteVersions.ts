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
    staleTime: 0, // Always fetch fresh data, never use cached data
  });

  // Create a new quote version (duplicate current quote with rooms and treatments)
  const duplicateQuote = useMutation({
    mutationFn: async ({ currentQuote, duplicateContent = true }: { currentQuote: any; duplicateContent?: boolean }) => {
      console.log('🔄 Starting quote duplication...', { quoteId: currentQuote.id, version: currentQuote.version });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get the highest version number
      const maxVersion = quoteVersions?.reduce((max, quote) => 
        Math.max(max, (quote as any).version || 1), 0) || 0;
      
      const newVersion = maxVersion + 1;
      console.log('📊 Version info:', { maxVersion, newVersion });
      
      // Generate new quote number using number sequence system
      const { generateSequenceNumber } = await import('./useNumberSequenceGeneration');
      const newBaseNumber = await generateSequenceNumber(user.id, 'quote', 'QT');
      
      // Append version suffix if this is version 2 or higher
      const newQuoteNumber = newVersion === 1 ? newBaseNumber : `${newBaseNumber}-v${newVersion}`;
      console.log('🔢 Quote numbers:', { newBaseNumber, newQuoteNumber, version: newVersion });

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
      console.log('➕ Creating new quote...');
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

      if (quoteError) {
        console.error('❌ Failed to create quote:', quoteError);
        throw quoteError;
      }
      
      console.log('✅ Quote created:', newQuote.id);
      
      // If duplicateContent is false, skip room and treatment duplication
      if (!duplicateContent) {
        console.log('ℹ️ Skipping content duplication (fresh start)');
        return newQuote;
      }
      
      // Duplicate rooms linked to the current quote (by quote_id)
      console.log('🏠 Fetching rooms for quote:', currentQuote.id);
      const { data: rooms, error: roomsFetchError } = await supabase
        .from("rooms")
        .select("*")
        .eq("quote_id", currentQuote.id);
      
      if (roomsFetchError) {
        console.error('❌ Failed to fetch rooms:', roomsFetchError);
        throw new Error(`Failed to fetch rooms: ${roomsFetchError.message}`);
      }
      
      console.log('📦 Found rooms:', rooms?.length || 0);
      
      if (rooms && rooms.length > 0) {
        const roomsToInsert = rooms.map(room => ({
          project_id: room.project_id,
          quote_id: newQuote.id,
          name: room.name,
          room_type: room.room_type,
          notes: room.notes,
          user_id: room.user_id,
        }));
        
        console.log('🏗️ Inserting rooms:', roomsToInsert.length);
        const { data: newRooms, error: roomsError } = await supabase
          .from("rooms")
          .insert(roomsToInsert)
          .select();
        
        if (roomsError) {
          console.error('❌ Failed to duplicate rooms:', roomsError);
          throw new Error(`Failed to duplicate rooms: ${roomsError.message}`);
        }
        
        console.log('✅ Rooms duplicated:', newRooms?.length || 0);
        
        // Create room ID mapping for treatments
        if (newRooms && newRooms.length > 0) {
          const roomIdMap = new Map();
          rooms.forEach((oldRoom, index) => {
            if (newRooms[index]) {
              roomIdMap.set(oldRoom.id, newRooms[index].id);
              console.log(`🔗 Room mapping: ${oldRoom.name} (${oldRoom.id}) -> (${newRooms[index].id})`);
            }
          });
          
          // Duplicate treatments (by quote_id)
          console.log('🎨 Fetching treatments for quote:', currentQuote.id);
          const { data: treatments, error: treatmentsFetchError } = await supabase
            .from("treatments")
            .select("*")
            .eq("quote_id", currentQuote.id);
          
          if (treatmentsFetchError) {
            console.error('❌ Failed to fetch treatments:', treatmentsFetchError);
            throw new Error(`Failed to fetch treatments: ${treatmentsFetchError.message}`);
          }
          
          console.log('📦 Found treatments:', treatments?.length || 0);
          
          if (treatments && treatments.length > 0) {
            const treatmentsToInsert = treatments.map(treatment => ({
              project_id: treatment.project_id,
              quote_id: newQuote.id,
              room_id: roomIdMap.get(treatment.room_id) || treatment.room_id,
              window_id: treatment.window_id,
              treatment_type: treatment.treatment_type,
              product_name: treatment.product_name,
              quantity: treatment.quantity,
              unit_price: treatment.unit_price,
              total_price: treatment.total_price,
              material_cost: treatment.material_cost,
              labor_cost: treatment.labor_cost,
              measurements: treatment.measurements,
              fabric_details: treatment.fabric_details,
              treatment_details: treatment.treatment_details,
              calculation_details: treatment.calculation_details,
              notes: treatment.notes,
              user_id: treatment.user_id,
              color: treatment.color,
              fabric_type: treatment.fabric_type,
              hardware: treatment.hardware,
            }));
            
            console.log('🎨 Inserting treatments:', treatmentsToInsert.length);
            const { error: treatmentsError } = await supabase
              .from("treatments")
              .insert(treatmentsToInsert);
            
            if (treatmentsError) {
              console.error('❌ Failed to duplicate treatments:', treatmentsError);
              throw new Error(`Failed to duplicate treatments: ${treatmentsError.message}`);
            }
            
            console.log('✅ Treatments duplicated successfully');
          } else {
            console.log('ℹ️ No treatments to duplicate');
          }
        } else {
          console.log('⚠️ No new rooms created, skipping treatment duplication');
        }
      } else {
        console.log('ℹ️ No rooms to duplicate');
      }

      console.log('🎉 Quote duplication completed successfully');
      return newQuote;
    },
    onSuccess: (newQuote, variables) => {
      // Invalidate quote queries
      queryClient.invalidateQueries({ queryKey: ["quote-versions", projectId] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      
      // CRITICAL: Invalidate rooms and treatments to prevent showing stale data
      queryClient.invalidateQueries({ queryKey: ["rooms", projectId] });
      queryClient.invalidateQueries({ queryKey: ["treatments", projectId] });
      
      const action = variables.duplicateContent ? "Duplicated" : "Created";
      toast({
        title: `Quote ${action}`,
        description: `${action} version ${(newQuote as any).version} of this quote.`,
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

  const currentQuote = quoteVersions?.[0]; // First version (original)
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