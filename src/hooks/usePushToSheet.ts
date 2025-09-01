import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePushToSheet = () => {
  return useMutation({
    mutationFn: async (rowId: string) => {
      // Add to push queue for worker to process
      const { data, error } = await supabase
        .from("crm_push_queue")
        .insert({
          row_id: rowId,
          status: 'pending',
          next_run_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });
};