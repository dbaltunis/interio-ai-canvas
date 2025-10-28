import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type JobStatus = Tables<"job_statuses">;
type JobStatusInsert = TablesInsert<"job_statuses">;
type JobStatusUpdate = TablesUpdate<"job_statuses">;

export const useJobStatuses = () => {
  return useQuery({
    queryKey: ["job_statuses"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("job_statuses")
        .select("*")
        .eq("user_id", user.id)
        .order("slot_number", { ascending: true });

      if (error) throw error;
      
      // Filter out old statuses with slot_numbers to avoid duplicates
      // Keep only statuses without slot_number (new comprehensive set)
      const filteredData = (data || []).filter(status => 
        status.slot_number === null || status.slot_number === undefined
      );
      
      return filteredData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateJobStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (status: Omit<JobStatusInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("job_statuses")
        .insert({
          ...status,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_statuses"] });
      toast({
        title: "Success",
        description: "Job status created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create job status",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<JobStatusUpdate>) => {
      const { data, error } = await supabase
        .from("job_statuses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_statuses"] });
      toast({
        title: "Success",
        description: "Job status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to update job status",
        variant: "destructive"
      });
    }
  });
};

export const useDeleteJobStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("job_statuses")
        .update({ is_active: false })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_statuses"] });
      toast({
        title: "Success",
        description: "Job status deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job status",
        variant: "destructive"
      });
    }
  });
};