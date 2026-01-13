import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "./useEffectiveAccountOwner";
import { startOfDay, endOfDay } from "date-fns";

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  projectName: string;
  clientName: string;
  treatmentType: string;
  assignedTo: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  estimatedHours: number | null;
  progress: number;
  projectId: string;
}

export const useWorkOrders = () => {
  const { effectiveOwnerId, isLoading: isOwnerLoading } = useEffectiveAccountOwner();

  const { data: workOrders, isLoading, error } = useQuery({
    queryKey: ['work-orders', effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      // Query projects that are in work order stages (e.g., in_production, manufacturing, etc.)
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          status,
          priority,
          due_date,
          job_number,
          client_id,
          clients (
            name
          )
        `)
        .eq('user_id', effectiveOwnerId)
        .in('status', ['in_production', 'manufacturing', 'pending_production', 'ready_for_install', 'scheduled'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useWorkOrders] Error fetching projects:', error);
        throw error;
      }

      // Get treatments for these projects to show treatment type
      const projectIds = projects?.map(p => p.id) || [];
      
      let treatmentsMap: Record<string, string> = {};
      if (projectIds.length > 0) {
        const { data: treatments } = await supabase
          .from('treatments')
          .select('project_id, treatment_type')
          .in('project_id', projectIds);
        
        if (treatments) {
          treatmentsMap = treatments.reduce((acc, t) => {
            if (!acc[t.project_id]) {
              acc[t.project_id] = t.treatment_type || 'Unknown';
            }
            return acc;
          }, {} as Record<string, string>);
        }
      }

      // Map to WorkOrder interface
      const workOrdersList: WorkOrder[] = (projects || []).map((project, index) => ({
        id: project.id,
        workOrderNumber: project.job_number || `WO-${String(index + 1).padStart(3, '0')}`,
        projectName: project.name || 'Untitled Project',
        clientName: (project.clients as any)?.name || 'Unknown Client',
        treatmentType: treatmentsMap[project.id] || 'Mixed',
        assignedTo: null, // Would need team assignment data
        status: mapProjectStatusToWorkOrderStatus(project.status),
        priority: project.priority || 'Medium',
        dueDate: project.due_date,
        estimatedHours: null, // Would need work order specific data
        progress: calculateProgress(project.status),
        projectId: project.id
      }));

      return workOrdersList;
    },
    enabled: !!effectiveOwnerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Calculate stats
  const stats = {
    activeOrders: workOrders?.filter(wo => wo.status !== 'completed').length || 0,
    completedToday: 0, // Will query separately
    pendingOrders: workOrders?.filter(wo => wo.status === 'pending').length || 0,
    inProgressOrders: workOrders?.filter(wo => wo.status === 'in-progress').length || 0,
  };

  // Query for completed today
  const { data: completedTodayCount } = useQuery({
    queryKey: ['work-orders-completed-today', effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return 0;

      const today = new Date();
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', effectiveOwnerId)
        .eq('status', 'completed')
        .gte('updated_at', startOfDay(today).toISOString())
        .lte('updated_at', endOfDay(today).toISOString());

      if (error) {
        console.error('[useWorkOrders] Error counting completed today:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!effectiveOwnerId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    workOrders: workOrders || [],
    stats: {
      ...stats,
      completedToday: completedTodayCount || 0,
    },
    isLoading: isOwnerLoading || isLoading,
    error,
  };
};

function mapProjectStatusToWorkOrderStatus(projectStatus: string | null): string {
  switch (projectStatus) {
    case 'in_production':
    case 'manufacturing':
      return 'in-progress';
    case 'pending_production':
    case 'scheduled':
      return 'pending';
    case 'ready_for_install':
      return 'completed';
    case 'completed':
      return 'completed';
    default:
      return 'pending';
  }
}

function calculateProgress(status: string | null): number {
  switch (status) {
    case 'pending_production':
    case 'scheduled':
      return 0;
    case 'in_production':
      return 50;
    case 'manufacturing':
      return 75;
    case 'ready_for_install':
    case 'completed':
      return 100;
    default:
      return 0;
  }
}
