
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Project = Tables<"projects">;
type ProjectInsert = TablesInsert<"projects">;
type ProjectUpdate = TablesUpdate<"projects">;

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

        console.log("Fetching projects for user:", user.id);
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Projects query error:", error);
          throw error;
        }
        
        console.log("Projects fetched successfully:", data?.length || 0, "projects");
        return data || [];
      } catch (error) {
        console.error("Error in projects query:", error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (project: Omit<ProjectInsert, "user_id">) => {
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
      console.log("Project data:", project);

      const projectData: ProjectInsert = {
        ...project,
        user_id: user.id
      };

      console.log("Final project data to insert:", projectData);

      const { data, error } = await supabase
        .from("projects")
        .insert(projectData)
        .select()
        .single();

      if (error) {
        console.error("Create project error:", error);
        throw error;
      }
      
      console.log("Project created successfully:", data);
      return data;
    },
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      
      const previousProjects = queryClient.getQueryData(["projects"]);
      
      const optimisticProject = {
        id: `temp-${Date.now()}`,
        ...newProject,
        user_id: "current-user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData(["projects"], (old: any) => 
        old ? [optimisticProject, ...old] : [optimisticProject]
      );
      
      return { previousProjects };
    },
    onError: (err, newProject, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects);
      }
      console.error("Failed to create project:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ProjectUpdate>) => {
      console.log("Updating project:", id, "with updates:", updates);
      
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Update project error:", error);
        throw new Error(`Failed to update project: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("Project not found or update failed");
      }
      
      console.log("Project updated successfully:", data);
      return data;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      
      const previousProjects = queryClient.getQueryData(["projects"]);
      
      queryClient.setQueryData(["projects"], (old: any) => {
        if (!old) return old;
        return old.map((project: any) => 
          project.id === id ? { ...project, ...updates } : project
        );
      });
      
      return { previousProjects, id, updates };
    },
    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects);
      }
      console.error("Failed to update project:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update project. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["projects"], (old: any) => {
        if (!old) return [data];
        return old.map((project: any) => 
          project.id === data.id ? data : project
        );
      });
      
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    },
  });
};
