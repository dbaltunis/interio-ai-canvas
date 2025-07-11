
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Treatment = Tables<"treatments">;
type TreatmentInsert = TablesInsert<"treatments">;

export const useTreatments = (projectId?: string) => {
  return useQuery({
    queryKey: ["treatments", projectId],
    queryFn: async () => {
      if (!projectId) {
        // Fetch all treatments for the user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
          .from("treatments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at");
        
        if (error) throw error;
        return data;
      }
      
      console.log("Fetching treatments for project:", projectId);
      const { data, error } = await supabase
        .from("treatments")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at");
      
      if (error) {
        console.error("Error fetching treatments:", error);
        throw error;
      }
      
      console.log("Treatments fetched successfully:", data?.length, "treatments for project", projectId);
      console.log("Treatment details:", data);
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 2 * 1000, // 2 seconds - very short cache for immediate updates
    gcTime: 30 * 1000, // 30 seconds cache time
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};

export const useCreateTreatment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (treatment: Omit<TreatmentInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      console.log("Creating treatment with data:", { ...treatment, user_id: user.id });

      const { data, error } = await supabase
        .from("treatments")
        .insert({ ...treatment, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error("Treatment creation error:", error);
        throw error;
      }
      
      console.log("Treatment created successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate all treatment queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      // Also invalidate room and project queries that might show treatment counts
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["surfaces"] });
      
      toast({
        title: "Success",
        description: "Treatment created successfully",
      });
    },
    onError: (error) => {
      console.error("Create treatment error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTreatment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Treatment> & { id: string }) => {
      const { data, error } = await supabase
        .from("treatments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
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

export const useDeleteTreatment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("treatments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      toast({
        title: "Success",
        description: "Treatment deleted successfully",
      });
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
