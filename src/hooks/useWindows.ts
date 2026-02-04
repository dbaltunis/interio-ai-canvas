import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";
import { getEffectiveOwnerForMutation } from "@/utils/getEffectiveOwnerForMutation";
import { showFriendlyError } from "@/hooks/use-friendly-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Surface = Tables<"surfaces">;
type SurfaceInsert = TablesInsert<"surfaces">;

export const useWindows = (projectId?: string) => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["surfaces", effectiveOwnerId, projectId],
    queryFn: async () => {
      if (!projectId) {
        if (!effectiveOwnerId) return [];

        const { data, error } = await supabase
          .from("surfaces")
          .select("*")
          .eq("user_id", effectiveOwnerId)
          .order("created_at");
        
        if (error) throw error;
        return data;
      }
      
      const { data, error } = await supabase
        .from("surfaces")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at");
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId || !!effectiveOwnerId,
  });
};

export const useCreateWindow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (surface: Omit<SurfaceInsert, "user_id">) => {
      // FIX: Use effectiveOwnerId for multi-tenant support
      const { effectiveOwnerId } = await getEffectiveOwnerForMutation();

      const { data, error } = await supabase
        .from("surfaces")
        .insert({ ...surface, user_id: effectiveOwnerId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["surfaces"] });
    },
    onError: (error) => {
      console.error("Create surface error:", error);
      showFriendlyError(error, 'create window');
    },
  });
};

export const useUpdateWindow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Surface> & { id: string }) => {
      const { data, error } = await supabase
        .from("surfaces")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["surfaces", data.room_id] });
    },
    onError: (error) => {
      showFriendlyError(error, 'update window');
    },
  });
};

export const useDeleteWindow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("surfaces")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surfaces"] });
    },
    onError: (error) => {
      showFriendlyError(error, 'delete window');
    },
  });
};
