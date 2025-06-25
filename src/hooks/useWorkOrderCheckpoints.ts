
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type WorkOrderCheckpoint = Tables<"work_order_checkpoints">;
type WorkOrderCheckpointInsert = TablesInsert<"work_order_checkpoints">;

export const useWorkOrderCheckpoints = (workOrderId?: string) => {
  return useQuery({
    queryKey: ["work_order_checkpoints", workOrderId],
    queryFn: async () => {
      if (!workOrderId) return [];
      
      const { data, error } = await supabase
        .from("work_order_checkpoints")
        .select("*")
        .eq("work_order_id", workOrderId)
        .order("order_index");
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateWorkOrderCheckpoint = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (checkpoint: Omit<WorkOrderCheckpointInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("work_order_checkpoints")
        .insert({ ...checkpoint, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work_order_checkpoints"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
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
      queryClient.invalidateQueries({ queryKey: ["work_order_checkpoints"] });
    },
  });
};
