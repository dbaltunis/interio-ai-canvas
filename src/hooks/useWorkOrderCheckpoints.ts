
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WorkOrderCheckpoint {
  id: string;
  work_order_id: string;
  title: string;
  description?: string;
  completed: boolean;
  completed_at?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useWorkOrderCheckpoints = (workOrderId?: string) => {
  return useQuery({
    queryKey: ["work-order-checkpoints", workOrderId],
    queryFn: async () => {
      let query = supabase.from("work_order_checkpoints").select("*");
      
      if (workOrderId) {
        query = query.eq("work_order_id", workOrderId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WorkOrderCheckpoint[];
    },
    enabled: !!workOrderId,
  });
};

export const useUpdateWorkOrderCheckpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkOrderCheckpoint> & { id: string }) => {
      const { data, error } = await supabase
        .from("work_order_checkpoints")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-order-checkpoints"] });
    },
  });
};
