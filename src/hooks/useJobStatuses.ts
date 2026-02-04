import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFriendlyToast } from "@/hooks/use-friendly-toast";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";
import { getEffectiveOwnerForMutation } from "@/utils/getEffectiveOwnerForMutation";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type JobStatus = Tables<"job_statuses">;
type JobStatusInsert = TablesInsert<"job_statuses">;
type JobStatusUpdate = TablesUpdate<"job_statuses">;

export const useJobStatuses = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["job_statuses", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("job_statuses")
        .select("*")
        .eq("user_id", effectiveOwnerId)
        .eq("is_active", true)
        .order("slot_number", { ascending: true });

      if (error) throw error;
      
      return data || [];
    },
    enabled: !!effectiveOwnerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateJobStatus = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useFriendlyToast();

  return useMutation({
    mutationFn: async (status: Omit<JobStatusInsert, "user_id">) => {
      // FIX: Use effectiveOwnerId for multi-tenant support
      const { effectiveOwnerId } = await getEffectiveOwnerForMutation();

      const { data, error } = await supabase
        .from("job_statuses")
        .insert({
          ...status,
          user_id: effectiveOwnerId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_statuses"] });
      showSuccess("Status created", "Job status created successfully");
    },
    onError: (error: unknown) => {
      showError(error, { context: 'create job status' });
    }
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useFriendlyToast();

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
      showSuccess("Status updated", "Job status updated successfully");
    },
    onError: (error: unknown) => {
      showError(error, { context: 'update job status' });
    }
  });
};

export const useDeleteJobStatus = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useFriendlyToast();

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
      showSuccess("Status deleted", "Job status deleted successfully");
    },
    onError: (error: unknown) => {
      showError(error, { context: 'delete job status' });
    }
  });
};