import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectMaterialsStatus {
  totalMaterials: number;
  inQueue: number;
  inBatch: number;
  ordered: number;
  received: number;
  hasAnyActivity: boolean;
}

/**
 * Hook to get aggregated materials status for a project
 */
export const useProjectMaterialsStatus = (projectId?: string) => {
  return useQuery({
    queryKey: ['project-materials-status', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('material_order_queue')
        .select('status')
        .eq('project_id', projectId);

      if (error) throw error;

      const status: ProjectMaterialsStatus = {
        totalMaterials: data.length,
        inQueue: data.filter(m => m.status === 'pending').length,
        inBatch: data.filter(m => m.status === 'in_batch').length,
        ordered: data.filter(m => m.status === 'ordered').length,
        received: data.filter(m => m.status === 'received').length,
        hasAnyActivity: data.length > 0,
      };

      return status;
    },
    enabled: !!projectId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Hook to get materials status for multiple projects at once
 */
export const useMultipleProjectsMaterialsStatus = (projectIds: string[]) => {
  return useQuery({
    queryKey: ['multiple-projects-materials-status', projectIds],
    queryFn: async () => {
      if (!projectIds || projectIds.length === 0) return {};

      const { data, error } = await supabase
        .from('material_order_queue')
        .select('project_id, status')
        .in('project_id', projectIds);

      if (error) throw error;

      // Group by project_id
      const statusByProject: Record<string, ProjectMaterialsStatus> = {};
      
      projectIds.forEach(projectId => {
        const projectMaterials = data.filter(m => m.project_id === projectId);
        statusByProject[projectId] = {
          totalMaterials: projectMaterials.length,
          inQueue: projectMaterials.filter(m => m.status === 'pending').length,
          inBatch: projectMaterials.filter(m => m.status === 'in_batch').length,
          ordered: projectMaterials.filter(m => m.status === 'ordered').length,
          received: projectMaterials.filter(m => m.status === 'received').length,
          hasAnyActivity: projectMaterials.length > 0,
        };
      });

      return statusByProject;
    },
    enabled: projectIds && projectIds.length > 0,
    refetchInterval: 30000,
  });
};

/**
 * Hook to get material status for individual treatment materials
 * Maps treatment materials to their queue status
 */
export const useTreatmentMaterialsStatus = (projectId?: string) => {
  return useQuery({
    queryKey: ['treatment-materials-status', projectId],
    queryFn: async () => {
      if (!projectId) return {};

      const { data, error } = await supabase
        .from('material_order_queue')
        .select('metadata, status')
        .eq('project_id', projectId);

      if (error) throw error;

      // Map treatment material ID to status
      const statusMap: Record<string, string> = {};
      
      data.forEach(item => {
        const metadata = item.metadata as any;
        if (metadata?.treatment_material_id) {
          statusMap[metadata.treatment_material_id] = item.status;
        }
      });

      return statusMap;
    },
    enabled: !!projectId,
    refetchInterval: 30000,
  });
};
