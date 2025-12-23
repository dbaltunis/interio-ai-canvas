import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "./useUserRole";
import { useClients } from "./useClients";

/**
 * Hook to check if a user can edit a specific job based on explicit permissions
 * 
 * Logic:
 * - Edit Any Job: Can edit any job (if enabled)
 * - Edit Assigned Jobs: Can only edit jobs assigned to them (created by them OR client assigned to them)
 * - Neither enabled: Cannot edit any job
 * 
 * For Owners: Only bypass restrictions if NO explicit permissions exist in table
 * If ANY explicit permissions exist, respect ALL settings (missing = disabled)
 */
export const useCanEditJob = (project: any) => {
  const { user } = useAuth();
  const { data: userRoleData } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  
  // Fetch explicit permissions
  const { data: explicitPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['explicit-user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[useCanEditJob] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });
  
  // Check if user has ANY explicit permissions in the table
  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;
  
  // Check if edit permissions are explicitly enabled
  const hasEditAllJobsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'edit_all_jobs'
  ) ?? false;
  const hasEditAssignedJobsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'edit_assigned_jobs'
  ) ?? false;
  
  // For Owners: Only bypass restrictions if NO explicit permissions exist in table at all
  // If ANY explicit permissions exist, respect ALL settings (missing = disabled)
  const canEditAllJobs = isOwner && !hasAnyExplicitPermissions 
    ? true // Owner with no explicit permissions = full access
    : hasEditAllJobsPermission; // Otherwise respect explicit permissions
  
  const canEditAssignedJobs = isOwner && !hasAnyExplicitPermissions
    ? true // Owner with no explicit permissions = full access
    : hasEditAssignedJobsPermission; // Otherwise respect explicit permissions
  
  // Fetch clients to check assignment
  const { data: clients = [] } = useClients();
  
  // Determine if this specific job can be edited
  const canEditJob = (() => {
    // If both permissions are disabled, cannot edit
    if (!canEditAllJobs && !canEditAssignedJobs) {
      return false;
    }
    
    // If both are enabled, can edit any job
    if (canEditAllJobs && canEditAssignedJobs) {
      return true;
    }
    
    // If only "Edit Any Job" is enabled, can edit any job
    if (canEditAllJobs && !canEditAssignedJobs) {
      return true;
    }
    
    // If only "Edit Assigned Jobs" is enabled, can edit jobs assigned to them
    // (created by them OR client assigned to them)
    if (canEditAssignedJobs && !canEditAllJobs) {
      if (!project || !user) return false;
      
      // Check if job was created by the user
      const isCreatedByUser = project.user_id === user.id;
      
      // Check if client is assigned to the user
      const client = project.client_id ? clients.find((c: any) => c.id === project.client_id) : null;
      const isClientAssignedToUser = client?.assigned_to === user.id;
      
      return isCreatedByUser || isClientAssignedToUser;
    }
    
    return false;
  })();
  
  return {
    canEditJob,
    canEditAllJobs,
    canEditAssignedJobs,
    isLoading: permissionsLoading,
  };
};

