
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type WorkOrder = Tables<"work_orders">;
type WorkOrderInsert = TablesInsert<"work_orders">;

export const useWorkOrders = (projectId?: string) => {
  return useQuery({
    queryKey: ["work_orders", projectId],
    queryFn: async () => {
      console.log("Fetching work orders for project:", projectId);
      
      try {
        if (!projectId) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.log("No user found for work orders");
            return [];
          }

          const { data, error } = await supabase
            .from("work_orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          
          if (error) {
            console.error("Work orders query error:", error);
            throw error;
          }
          
          console.log("Work orders fetched:", data?.length || 0, "orders");
          return data || [];
        }
        
        const { data, error } = await supabase
          .from("work_orders")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Work orders project query error:", error);
          throw error;
        }
        
        console.log("Project work orders fetched:", data?.length || 0, "orders for project", projectId);
        return data || [];
      } catch (error) {
        console.error("Error in work orders query:", error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30 * 1000,
  });
};

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workOrder: Omit<WorkOrderInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      console.log("Creating work order:", workOrder);

      const { data, error } = await supabase
        .from("work_orders")
        .insert({ ...workOrder, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error("Create work order error:", error);
        throw error;
      }
      
      console.log("Work order created successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work_orders"] });
      toast({
        title: "Success",
        description: "Work order created successfully",
      });
    },
    onError: (error) => {
      console.error("Create work order error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkOrder> & { id: string }) => {
      console.log("Updating work order:", id, updates);
      
      const { data, error } = await supabase
        .from("work_orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Update work order error:", error);
        throw error;
      }
      
      console.log("Work order updated successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work_orders"] });
    },
    onError: (error) => {
      console.error("Update work order error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
