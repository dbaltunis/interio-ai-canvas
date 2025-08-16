import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { TablesInsert } from "@/integrations/supabase/types";

type QuoteInsert = TablesInsert<"quotes">;

export const useCreateQuoteVersion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      quoteConfig 
    }: { 
      projectId: string; 
      quoteConfig: any 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get existing quotes for this project to determine version number
      const { data: existingQuotes } = await supabase
        .from("quotes")
        .select("quote_number")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      const versionNumber = (existingQuotes?.length || 0) + 1;
      const quoteNumber = `Q-${versionNumber.toString().padStart(2, '0')}`;

      // Build quote line items based on selected rooms and treatments
      const lineItems = await buildQuoteLineItems(projectId, quoteConfig);
      
      // Calculate totals
      const subtotal = lineItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
      const markupAmount = subtotal * (quoteConfig.markupPercentage / 100);
      const taxableAmount = subtotal + markupAmount;
      const taxAmount = taxableAmount * (quoteConfig.taxRate / 100);
      const totalAmount = taxableAmount + taxAmount;

      const quoteData: Omit<QuoteInsert, "user_id"> = {
        project_id: projectId,
        quote_number: quoteNumber,
        status: 'draft',
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: quoteConfig.description || '',
        valid_until: quoteConfig.validUntil || null,
        // Store additional data in notes field as JSON for now
        // TODO: Add proper fields to quotes table if needed
      };

      const { data, error } = await supabase
        .from("quotes")
        .insert({
          ...quoteData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Success",
        description: "Quote version created successfully",
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

async function buildQuoteLineItems(projectId: string, quoteConfig: any) {
  // Fetch all treatments for the project
  const { data: treatments } = await supabase
    .from("treatments")
    .select("*")
    .eq("project_id", projectId)
    .in("room_id", quoteConfig.includedRooms);

  if (!treatments) return [];

  // Fetch room names for display
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name")
    .eq("project_id", projectId)
    .in("id", quoteConfig.includedRooms);

  const roomMap = new Map(rooms?.map(r => [r.id, r.name]) || []);

  // Build line items from treatments
  return treatments.map((treatment, index) => {
    const override = quoteConfig.treatmentOverrides[treatment.id];
    const roomName = roomMap.get(treatment.room_id) || 'Unknown Room';
    
    return {
      id: `line-${index + 1}`,
      description: `${roomName} - Window Treatment`,
      room_name: roomName,
      room_id: treatment.room_id,
      treatment_id: treatment.id,
      quantity: treatment.quantity || 1,
      unit_price: treatment.unit_price || 0,
      total_amount: treatment.total_price || 0,
      fabric_override: override?.fabricId || null,
      notes: treatment.notes || '',
      category: 'treatment'
    };
  });
}

export const useSendQuotes = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ quoteIds, clientEmail }: { quoteIds: string[]; clientEmail?: string }) => {
      // Update quote statuses to 'sent'
      const { error } = await supabase
        .from("quotes")
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .in("id", quoteIds);

      if (error) throw error;

      // TODO: Implement actual email sending logic
      console.log('Sending quotes:', quoteIds, 'to:', clientEmail);
      
      return { quoteIds, clientEmail };
    },
    onSuccess: ({ quoteIds }) => {
      toast({
        title: "Success",
        description: `${quoteIds.length} quote${quoteIds.length !== 1 ? 's' : ''} sent successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send quotes",
        variant: "destructive"
      });
    },
  });
};