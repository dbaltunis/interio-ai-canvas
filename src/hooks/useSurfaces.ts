
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { checkProjectStatusAsync } from "@/contexts/ProjectStatusContext";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Surface = Tables<"surfaces">;
type SurfaceInsert = TablesInsert<"surfaces">;

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
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useCreateSurface = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (surface: Omit<SurfaceInsert, "user_id">) => {
      console.log("=== CREATING SURFACE ===");
      console.log("Surface data being sent:", surface);
      
      // Check project status before creating
      if (surface.project_id) {
        const status = await checkProjectStatusAsync(surface.project_id);
        if (status.isLocked || status.isViewOnly) {
          throw new Error(`Cannot add window: Project is in "${status.statusName}" status`);
        }
      }

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
      
      // Invalidate multiple related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["surfaces"] });
      queryClient.invalidateQueries({ queryKey: ["surfaces", data.project_id] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["rooms", data.project_id] });
      
      // Force refetch with fresh data
      queryClient.refetchQueries({ queryKey: ["surfaces", data.project_id] });
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
    mutationFn: async ({ id, ...updates }: Partial<Surface> & { id: string }) => {
      // Get surface to check project status
      const { data: surface } = await supabase
        .from("surfaces")
        .select("project_id")
        .eq("id", id)
        .single();

      if (surface?.project_id) {
        const status = await checkProjectStatusAsync(surface.project_id);
        if (status.isLocked || status.isViewOnly) {
          throw new Error(`Cannot update window: Project is in "${status.statusName}" status`);
        }
      }

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
      console.log("=== DELETING SURFACE, MATERIALS, AND QUOTE ITEMS ===");
      console.log("Surface ID:", id);

      // First, get the surface to find its project_id
      const { data: surface } = await supabase
        .from("surfaces")
        .select("project_id")
        .eq("id", id)
        .single();

      // Check project status before deleting
      if (surface?.project_id) {
        const status = await checkProjectStatusAsync(surface.project_id);
        if (status.isLocked || status.isViewOnly) {
          throw new Error(`Cannot delete window: Project is in "${status.statusName}" status`);
        }
      }

      // Delete the surface
      const { error: surfaceError } = await supabase
        .from("surfaces")
        .delete()
        .eq("id", id);

      if (surfaceError) throw surfaceError;

      if (surface?.project_id) {
        // Delete related materials from queue (only pending/in_batch status)
        const { error: materialsError } = await supabase
          .from("material_order_queue")
          .delete()
          .eq("project_id", surface.project_id)
          .in("status", ["pending", "in_batch"]);

        if (materialsError) {
          console.error("Error deleting materials:", materialsError);
        } else {
          console.log("Deleted related materials from queue");
        }

        // Delete orphaned quote items (those with empty breakdown or no treatments)
        const { data: projectQuote } = await supabase
          .from("quotes")
          .select("id")
          .eq("project_id", surface.project_id)
          .maybeSingle();

        if (projectQuote) {
          // Delete quote items with empty breakdown
          const { error: quoteItemsError } = await supabase
            .from("quote_items")
            .delete()
            .eq("quote_id", projectQuote.id)
            .or("breakdown.eq.{},breakdown.is.null");

          if (quoteItemsError) {
            console.error("Error deleting orphaned quote items:", quoteItemsError);
          } else {
            console.log("Deleted orphaned quote items");
          }
        }
      }

      return id;
    },
    onSuccess: (deletedId) => {
      // Force immediate cache invalidation
      queryClient.invalidateQueries({ queryKey: ["surfaces"] });
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
      queryClient.invalidateQueries({ queryKey: ["project-window-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["material-queue-v2"] });
      queryClient.invalidateQueries({ queryKey: ["material-queue-stats"] });
      
      // Force refetch with updated data
      queryClient.refetchQueries({ queryKey: ["quotes"] });
      queryClient.refetchQueries({ queryKey: ["surfaces"] });
      queryClient.refetchQueries({ queryKey: ["treatments"] });
      
      // Reset query cache to force fresh data
      queryClient.resetQueries({ queryKey: ["quotes"] });
      
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
