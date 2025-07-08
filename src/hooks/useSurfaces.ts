import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSurfaces = (projectId?: string) => {
  return useQuery({
    queryKey: ["surfaces", projectId],
    queryFn: async () => {
      console.log("=== FETCHING SURFACES ===");
      console.log("Project ID:", projectId);
      
      if (!projectId) {
        console.log("No project ID provided, returning empty array");
        return [];
      }
      
      const { data, error } = await supabase
        .from("surfaces")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at");
      
      if (error) {
        console.error("Error fetching surfaces:", error);
        throw error;
      }
      
      console.log("Fetched surfaces for project:", projectId, "data:", data);
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 0, // Always consider data stale
  });
};

export const useCreateSurface = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (surface: any) => {
      console.log("=== CREATING SURFACE ===");
      console.log("Surface data being sent:", surface);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("surfaces")
        .insert({ ...surface, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      console.log("Surface created successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("=== SURFACE CREATION SUCCESS ===");
      console.log("Created surface data:", data);
      
      // Invalidate and refetch surfaces for this project
      queryClient.invalidateQueries({ queryKey: ["surfaces", data.project_id] });
      
      // Also invalidate rooms query to ensure consistency
      if (data.project_id) {
        queryClient.invalidateQueries({ queryKey: ["rooms", data.project_id] });
      }
      
      toast({
        title: "Success",
        description: "Window created successfully",
      });
    },
    onError: (error) => {
      console.error("=== SURFACE CREATION ERROR ===");
      console.error("Create surface error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSurface = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
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
      queryClient.invalidateQueries({ queryKey: ["surfaces", data.project_id] });
      
      toast({
        title: "Success",
        description: "Surface updated successfully",
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

export const useDeleteSurface = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("surfaces")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["surfaces"] });
      
      toast({
        title: "Success",
        description: "Surface deleted successfully",
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
