import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";
import { generateSequenceNumber, getEntityTypeFromStatusId, shouldRegenerateNumberByIds } from "./useNumberSequenceGeneration";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type { EntityType } from "./useNumberSequences";

type Project = Tables<"projects">;
type ProjectInsert = TablesInsert<"projects">;
type ProjectUpdate = TablesUpdate<"projects">;

export const useProjects = (options?: { enabled?: boolean }) => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ["projects", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      // Let RLS handle filtering - it will return all projects in the account
      // This includes projects created by the account owner AND team members
      // RLS policy checks: get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
      const { data, error } = await supabase
        .from("projects")
        .select("*, clients(name), parent_job_id")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: enabled && !!effectiveOwnerId,
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

      // Get account owner ID for team members (needed for job number generation and status lookup)
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("parent_account_id")
        .eq("user_id", user.id)
        .single();
      
      const accountOwnerId = profile?.parent_account_id || user.id;

      // Generate job number using number sequences if not provided
      let jobNumber = project.job_number;
      if (!jobNumber || jobNumber.trim() === '') {
        const { data: generatedNumber, error: seqError } = await supabase.rpc("get_next_sequence_number", {
          p_user_id: accountOwnerId,
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
      // Use accountOwnerId instead of user.id because job_statuses belong to account owner
      let statusId = project.status_id;
      if (!statusId) {
        const { data: firstStatus } = await supabase
          .from("job_statuses")
          .select("id")
          .eq("user_id", accountOwnerId) // Use accountOwnerId for team members
          .eq("category", "Project")
          .eq("is_active", true)
          .order("slot_number", { ascending: true })
          .limit(1)
          .maybeSingle();
        
        statusId = firstStatus?.id || null;
      }

      // Always set user_id to the current user (not accountOwnerId) so the project belongs to the creator
      const { data, error } = await supabase
        .from("projects")
        .insert({
          ...project,
          user_id: user.id, // Project belongs to the creator
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

// Helper to get the column name for storing a number by entity type
const getNumberColumnForEntityType = (entityType: string): string => {
  switch (entityType) {
    case 'draft': return 'draft_number';
    case 'quote': return 'quote_number';
    case 'order': return 'order_number';
    case 'invoice': return 'invoice_number';
    default: return 'draft_number';
  }
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ProjectUpdate>) => {
      let statusChanged = false;
      let newStatusName = '';
      
      // Check if status is changing and if we need to handle document numbers
      if (updates.status_id) {
        // Fetch ALL stage-specific numbers so we can reuse them
        const { data: oldProject } = await supabase
          .from("projects")
          .select("job_number, status_id, draft_number, quote_number, order_number, invoice_number, job_statuses(name, document_type)")
          .eq("id", id)
          .single();
        
        const { data: newStatus } = await supabase
          .from("job_statuses")
          .select("name, document_type")
          .eq("id", updates.status_id)
          .single();
        
        if (oldProject && newStatus) {
          const oldStatusName = (oldProject as any).job_statuses?.name || '';
          const oldStatusId = oldProject.status_id;
          newStatusName = newStatus.name;
          statusChanged = oldStatusName !== newStatusName;
          
          // IMPORTANT: Always sync the status name field with the status_id
          updates.status = newStatusName;
          
          // Check if document type changed using status IDs
          const shouldRegenerate = await shouldRegenerateNumberByIds(oldStatusId, updates.status_id);
          
          if (shouldRegenerate && newStatus.document_type) {
            const entityType = newStatus.document_type as EntityType;
            const numberColumn = getNumberColumnForEntityType(entityType);
            const existingNumber = (oldProject as any)[numberColumn];
            
            if (existingNumber) {
              // REUSE the existing number for this stage
              updates.job_number = existingNumber;
              console.log(`Reusing existing ${entityType} number: ${existingNumber}`);
            } else {
              // Generate a NEW number and store it for future reuse
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                // Get account owner for team members
                const { data: profile } = await supabase
                  .from("user_profiles")
                  .select("parent_account_id")
                  .eq("user_id", user.id)
                  .single();
                
                const accountOwnerId = profile?.parent_account_id || user.id;
                const newNumber = await generateSequenceNumber(accountOwnerId, entityType, 'DOC');
                updates.job_number = newNumber;
                
                // Store the new number in the appropriate column for future reuse
                (updates as any)[numberColumn] = newNumber;
                console.log(`Generated new ${entityType} number: ${newNumber}, stored in ${numberColumn}`);
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
      // Invalidate dashboard stats when project status changes (affects revenue/active projects)
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats-critical"] });
      queryClient.invalidateQueries({ queryKey: ["revenue-history"] });
      
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
