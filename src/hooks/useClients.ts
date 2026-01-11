import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Client = Tables<"clients">;
type ClientInsert = TablesInsert<"clients">;
type ClientUpdate = TablesUpdate<"clients">;

export const useClients = (enabled: boolean = true) => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["clients", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      // DEFENSE-IN-DEPTH: Explicit effectiveOwnerId filter for multi-tenant support
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", effectiveOwnerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: enabled && !!effectiveOwnerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for dealers to fetch only their own clients
 * Returns clients that are either:
 * 1. Created by the dealer (created_by === user.id)
 * 2. Linked to projects the dealer created
 */
export const useDealerOwnClients = () => {
  const { user } = useAuth();
  const { effectiveOwnerId } = useEffectiveAccountOwner();

  return useQuery({
    queryKey: ["dealer-clients", user?.id, effectiveOwnerId],
    queryFn: async () => {
      if (!user || !effectiveOwnerId) return [];

      // First, get project client IDs from dealer's own projects
      const { data: projects, error: projectError } = await supabase
        .from("projects")
        .select("client_id")
        .eq("user_id", user.id)
        .not("client_id", "is", null);

      if (projectError) {
        console.error("[useDealerOwnClients] Error fetching projects:", projectError);
      }

      const projectClientIds = projects?.map(p => p.client_id).filter(Boolean) || [];

      // Get clients created by dealer OR linked to their projects
      let query = supabase
        .from("clients")
        .select("*")
        .eq("user_id", effectiveOwnerId)
        .order("created_at", { ascending: false });

      // Build OR filter for created_by and project client IDs
      const orConditions: string[] = [];
      orConditions.push(`created_by.eq.${user.id}`);
      
      if (projectClientIds.length > 0) {
        orConditions.push(`id.in.(${projectClientIds.join(",")})`);
      }

      if (orConditions.length > 0) {
        query = query.or(orConditions.join(","));
      }

      const { data, error } = await query;

      if (error) {
        console.error("[useDealerOwnClients] Error fetching clients:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && !!effectiveOwnerId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useClient = (id: string) => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["clients", id, effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return null;
      
      // DEFENSE-IN-DEPTH: Explicit effectiveOwnerId filter for multi-tenant support
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .eq("user_id", effectiveOwnerId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!effectiveOwnerId,
  });
};

// Fetch client for display purposes only (no ownership filter)
// Use when project ownership is already verified (e.g., job detail page)
// This handles cases where client might have ownership mismatch with project
export const useClientForJobDisplay = (clientId: string | null) => {
  return useQuery({
    queryKey: ["client-for-display", clientId],
    queryFn: async () => {
      if (!clientId) return null;
      
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { effectiveOwnerId, currentUserId } = useEffectiveAccountOwner();

  return useMutation({
    mutationFn: async (client: Omit<ClientInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (!effectiveOwnerId) {
        throw new Error("Unable to determine account owner");
      }

      // If assigned_to is not explicitly provided and current user is a team member,
      // assign the client to the current user so they can see it
      const assignedTo = client.assigned_to !== undefined 
        ? client.assigned_to 
        : (currentUserId && currentUserId !== effectiveOwnerId ? currentUserId : null);

      const { data, error } = await supabase
        .from("clients")
        .insert({
          ...client,
          user_id: effectiveOwnerId,
          assigned_to: assignedTo
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      // Removed unnecessary success toast
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
      // Removed unnecessary success toast
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
      }

      // Update quotes to remove client reference
      const { error: quotesUpdateError } = await supabase
        .from("quotes")
        .update({ client_id: null })
        .eq("client_id", id);

      if (quotesUpdateError) {
        console.error("Failed to update quotes:", quotesUpdateError);
      }

      // Update appointments to remove client reference
      const { error: appointmentsUpdateError } = await supabase
        .from("appointments")
        .update({ client_id: null })
        .eq("client_id", id);

      if (appointmentsUpdateError) {
        console.error("Failed to update appointments:", appointmentsUpdateError);
      }

      // Delete client activity logs
      const { error: activityLogError } = await supabase
        .from("client_activity_log")
        .delete()
        .eq("client_id", id);

      if (activityLogError) {
        console.error("Failed to delete activity logs:", activityLogError);
      }

      // Delete client files
      const { error: filesError } = await supabase
        .from("client_files")
        .delete()
        .eq("client_id", id);

      if (filesError) {
        console.error("Failed to delete client files:", filesError);
      }

      // Delete client measurements
      const { error: measurementsError } = await supabase
        .from("client_measurements")
        .delete()
        .eq("client_id", id);

      if (measurementsError) {
        console.error("Failed to delete client measurements:", measurementsError);
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
      console.log("Queries invalidated, deletion complete");
      // Removed unnecessary success toast
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
    mutationFn: async ({ clientId, stage, previousStage }: { clientId: string; stage: string; previousStage?: string }) => {
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
      
      // Log stage change activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const stageLabel = stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          const prevLabel = previousStage ? previousStage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
          await supabase.from("client_activity_log").insert({
            client_id: clientId,
            user_id: user.id,
            activity_type: "stage_changed",
            title: `Stage changed to ${stageLabel}`,
            description: previousStage ? `Changed from ${prevLabel} to ${stageLabel}` : `Stage set to ${stageLabel}`,
          });
        } catch (err) {
          console.warn("Failed to log stage change:", err);
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client-activities"] });
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
