
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Client = Tables<"clients">;
type ClientInsert = TablesInsert<"clients">;
type ClientUpdate = TablesUpdate<"clients">;

export const useClients = (enabled: boolean = true) => {
  const canViewAllClients = useHasPermission('view_all_clients');
  
  return useQuery({
    queryKey: ["clients", canViewAllClients],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("clients")
        .select("*");
      
      // If user doesn't have view_all_clients permission, filter by user_id
      if (!canViewAllClients) {
        query = query.eq("user_id", user.id);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: enabled && canViewAllClients !== undefined, // Wait for permission to load
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClient = (id: string) => {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (client: Omit<ClientInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("clients")
        .insert({
          ...client,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Success",
        description: "Client created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to create client:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create client. Please try again.",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ClientUpdate>) => {
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to update client:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update client. Please try again.",
        variant: "destructive"
      });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // First, update all projects that reference this client to remove the client reference
      const { error: projectUpdateError } = await supabase
        .from("projects")
        .update({ client_id: null })
        .eq("client_id", id);

      if (projectUpdateError) {
        console.error("Failed to update projects:", projectUpdateError);
        // Continue with client deletion even if project update fails
      }

      // Then delete the client
      const { data, error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      console.log("Client deletion successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      console.log("Queries invalidated, showing toast");
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
      console.log("Toast shown, deletion complete");
    },
    onError: (error: any) => {
      console.error("Failed to delete client:", error);
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateClientStage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ clientId, stage }: { clientId: string; stage: string }) => {
      const { data, error } = await supabase
        .from("clients")
        .update({ 
          funnel_stage: stage,
          stage_changed_at: new Date().toISOString()
        })
        .eq("id", clientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Success",
        description: "Client stage updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to update client stage:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update client stage. Please try again.",
        variant: "destructive"
      });
    },
  });
};
