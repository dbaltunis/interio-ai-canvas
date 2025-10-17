import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface LeadSource {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  color: string;
  icon: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useLeadSources = () => {
  return useQuery({
    queryKey: ["lead-sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_sources")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as LeadSource[];
    },
  });
};

export const useAllLeadSources = () => {
  return useQuery({
    queryKey: ["all-lead-sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_sources")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as LeadSource[];
    },
  });
};

export const useCreateLeadSource = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (source: Omit<LeadSource, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("lead_sources")
        .insert({ ...source, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-sources"] });
      queryClient.invalidateQueries({ queryKey: ["all-lead-sources"] });
      toast({
        title: "Success",
        description: "Lead source created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create lead source",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateLeadSource = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeadSource> & { id: string }) => {
      const { data, error } = await supabase
        .from("lead_sources")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-sources"] });
      queryClient.invalidateQueries({ queryKey: ["all-lead-sources"] });
      toast({
        title: "Success",
        description: "Lead source updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update lead source",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteLeadSource = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lead_sources")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-sources"] });
      queryClient.invalidateQueries({ queryKey: ["all-lead-sources"] });
      toast({
        title: "Success",
        description: "Lead source deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete lead source",
        variant: "destructive",
      });
    },
  });
};