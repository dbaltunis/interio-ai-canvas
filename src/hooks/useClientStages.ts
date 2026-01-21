import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Use database types directly for type safety
export type ClientStage = Tables<"client_stages">;
export type ClientStageInsert = Omit<TablesInsert<"client_stages">, "user_id">;
export type ClientStageUpdate = TablesUpdate<"client_stages">;

export const useClientStages = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["client_stages", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("client_stages")
        .select("*")
        .eq("user_id", effectiveOwnerId)
        .eq("is_active", true)
        .order("slot_number", { ascending: true });

      if (error) throw error;
      
      return data || [];
    },
    enabled: !!effectiveOwnerId,
    staleTime: 30 * 1000, // 30 seconds for fresher data
    gcTime: 5 * 60 * 1000,
  });
};

export const useAllClientStages = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["client_stages_all", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("client_stages")
        .select("*")
        .eq("user_id", effectiveOwnerId)
        .order("slot_number", { ascending: true });

      if (error) throw error;
      
      return data || [];
    },
    enabled: !!effectiveOwnerId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useCreateClientStage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (stage: ClientStageInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("client_stages")
        .insert({
          ...stage,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_stages"] });
      queryClient.invalidateQueries({ queryKey: ["client_stages_all"] });
      toast({
        title: "Success",
        description: "Client stage created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create client stage",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateClientStage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & ClientStageUpdate) => {
      const { data, error } = await supabase
        .from("client_stages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_stages"] });
      queryClient.invalidateQueries({ queryKey: ["client_stages_all"] });
      toast({
        title: "Success",
        description: "Client stage updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to update client stage",
        variant: "destructive"
      });
    }
  });
};

export const useDeleteClientStage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("client_stages")
        .update({ is_active: false })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_stages"] });
      queryClient.invalidateQueries({ queryKey: ["client_stages_all"] });
      toast({
        title: "Success",
        description: "Client stage deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client stage",
        variant: "destructive"
      });
    }
  });
};

// Helper to get stage by name (for backwards compatibility with existing data)
export const getStageByName = (stages: ClientStage[], name: string) => {
  return stages.find(stage => stage.name === name);
};

// Helper to get default stage
export const getDefaultStage = (stages: ClientStage[]) => {
  return stages.find(stage => stage.is_default) || stages[0];
};
