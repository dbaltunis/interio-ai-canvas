import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";
import { generateSequenceNumber, getEntityTypeFromStatus, shouldRegenerateNumber } from "./useNumberSequenceGeneration";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Project = Tables<"projects">;
type ProjectInsert = TablesInsert<"projects">;
type ProjectUpdate = TablesUpdate<"projects">;

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Simply select all projects including parent_job_id - RLS policies will handle filtering
      const { data, error } = await supabase
        .from("projects")
        .select("*, clients(name), parent_job_id")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (project: Omit<ProjectInsert, "user_id" | "job_number"> & { job_number?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate job number using number sequences if not provided
      let jobNumber = project.job_number;
      if (!jobNumber || jobNumber.trim() === '') {
        const { data: generatedNumber, error: seqError } = await supabase.rpc("get_next_sequence_number", {
          p_user_id: user.id,
          p_entity_type: "job",
        });
        
        if (seqError) {
          console.error("Error generating job number:", seqError);
          // Fallback to old method if sequence generation fails
          const { count } = await supabase
            .from("projects")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", user.id);
          
          jobNumber = `JOB-${String(((count || 0) + 1)).padStart(4, '0')}`;
        } else {
          jobNumber = generatedNumber || `JOB-${Date.now()}`;
        }
      }

      // Get first Project status (slot 5) if status_id not provided
      let statusId = project.status_id;
      if (!statusId) {
        const { data: firstStatus } = await supabase
          .from("job_statuses")
          .select("id")
          .eq("user_id", user.id)
          .eq("category", "Project")
          .eq("is_active", true)
          .order("slot_number", { ascending: true })
          .limit(1)
          .maybeSingle();
        
        statusId = firstStatus?.id || null;
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
          ...project,
          user_id: user.id,
          job_number: jobNumber,
          status_id: statusId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ProjectUpdate>) => {
      let statusChanged = false;
      let newStatusName = '';
      
      // Check if status is changing and if we need to regenerate the number
      if (updates.status_id) {
        const { data: oldProject } = await supabase
          .from("projects")
          .select("job_number, status_id, job_statuses(name)")
          .eq("id", id)
          .single();
        
        const { data: newStatus } = await supabase
          .from("job_statuses")
          .select("name")
          .eq("id", updates.status_id)
          .single();
        
        if (oldProject && newStatus) {
          const oldStatusName = (oldProject as any).job_statuses?.name || '';
          newStatusName = newStatus.name;
          statusChanged = oldStatusName !== newStatusName;
          
          if (shouldRegenerateNumber(oldStatusName, newStatusName)) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const entityType = getEntityTypeFromStatus(newStatusName);
              if (entityType) {
                const newNumber = await generateSequenceNumber(user.id, entityType, 'JOB');
                updates.job_number = newNumber;
              }
            }
          }
        }
      }
      
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      return { project: data, statusChanged, newStatusName };
    },
    onSuccess: ({ project, statusChanged, newStatusName }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      
      // Trigger inventory deduction event for external handling
      if (statusChanged && newStatusName && project.status_id) {
        window.dispatchEvent(new CustomEvent('project-status-changed', {
          detail: { 
            projectId: project.id, 
            newStatus: newStatusName,
            newStatusId: project.status_id
          }
        }));
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive"
      });
    },
  });
};