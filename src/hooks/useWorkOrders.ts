
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WorkOrder {
  id: string;
  order_number: string;
  treatment_type: string;
  project_id: string;
  status: string;
  priority: string;
  due_date: string;
  instructions: string;
  notes?: string;
  estimated_hours: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useWorkOrders = (projectId?: string) => {
  return useQuery({
    queryKey: ["work-orders", projectId],
    queryFn: async () => {
      let query = supabase.from("work_orders").select("*");
      
      if (projectId) {
        query = query.eq("project_id", projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WorkOrder[];
    },
    enabled: true,
  });
};

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workOrder: Omit<WorkOrder, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("work_orders")
        .insert([{ ...workOrder, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
    },
  });
};

export const useUpdateWorkOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from("work_orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
    },
  });
};
