import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { EntityType } from "./useNumberSequences";

/**
 * Hook to preview the next sequence number WITHOUT incrementing it
 * Used for showing recommended number in editable fields
 */
export const usePreviewNextNumber = (entityType: EntityType = 'invoice') => {
  return useQuery({
    queryKey: ["preview-next-number", entityType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get the current sequence settings without incrementing
      const { data: sequence, error } = await supabase
        .from("number_sequences")
        .select("prefix, next_number, padding")
        .eq("user_id", user.id)
        .eq("entity_type", entityType)
        .eq("active", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching sequence:", error);
        return null;
      }

      if (!sequence) {
        // Return a default format if no sequence configured
        const defaultPrefixes: Record<EntityType, string> = {
          draft: 'DFT',
          quote: 'QT',
          order: 'ORD',
          invoice: 'INV',
          job: 'JOB'
        };
        return `${defaultPrefixes[entityType]}-0001`;
      }

      // Format the number with padding
      const paddedNumber = String(sequence.next_number).padStart(sequence.padding, '0');
      return `${sequence.prefix}${paddedNumber}`;
    },
    staleTime: 1000 * 30, // 30 seconds - refresh periodically
  });
};
