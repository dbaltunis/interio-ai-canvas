
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
          .from("surfaces")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at");
        
        if (error) throw error;
        console.log("Fetched surfaces (no project):", data);
        return data;
      }
      
      const { data, error } = await supabase
        .from("surfaces")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at");
      
      if (error) throw error;
      console.log("Fetched surfaces for project:", projectId, "data:", data);
      return data;
    },
    enabled: !!projectId, // Only run query if projectId exists
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export const useCreateSurface = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (surface: any) => {
      console.log("=== MUTATION START ===");
      console.log("Surface data being sent:", surface);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("surfaces")
        .insert({ ...surface, user_id: user.id })
        .select()
        .single();

      console.log("Database response:", { data, error });
      
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
      
      // Immediately update the cache with the new surface
      queryClient.setQueryData(["surfaces", data.project_id], (oldData: any) => {
        console.log("Updating cache with new surface:", data);
        const newData = oldData ? [...oldData, data] : [data];
        console.log("New cache data:", newData);
        return newData;
      });
      
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["surfaces", data.project_id] });
      
      // Invalidate rooms query to ensure consistency
      if (data.project_id) {
        queryClient.invalidateQueries({ queryKey: ["rooms", data.project_id] });
      }
      
      toast({
        title: "Success",
        description: "Window created successfully",
      });
    },
    onError: (error) => {
      console.error("=== MUTATION ERROR ===");
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
      // Update cache immediately
      queryClient.setQueryData(["surfaces", data.project_id], (oldData: any) => {
        if (!oldData) return [data];
        return oldData.map((surface: any) => 
          surface.id === data.id ? data : surface
        );
      });
      
      queryClient.invalidateQueries({ queryKey: ["surfaces", data.project_id] });
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
      // Update cache immediately by removing the deleted surface
      queryClient.setQueriesData(
        { queryKey: ["surfaces"] },
        (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((surface: any) => surface.id !== deletedId);
        }
      );
      
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
