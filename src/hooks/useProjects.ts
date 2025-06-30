
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Project = Tables<"projects">;
type ProjectInsert = TablesInsert<"projects">;

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found for projects query");
          return [];
        }

        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Projects query error:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Error in projects query:", error);
        return [];
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (project: Omit<ProjectInsert, "user_id"> & { client_id?: string | null }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Auth error:", userError);
        throw new Error("Authentication error. Please try logging in again.");
      }
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("You must be logged in to create a project. Please refresh the page and try again.");
      }

      console.log("Creating project for user:", user.id);

      // Allow client_id to be null
      const projectData: ProjectInsert = {
        ...project,
        user_id: user.id,
        client_id: project.client_id || null
      };

      const { data, error } = await supabase
        .from("projects")
        .insert(projectData)
        .select()
        .single();

      if (error) {
        console.error("Create project error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to create project:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });
};
