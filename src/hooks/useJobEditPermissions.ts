import { useHasPermission } from "./usePermissions";
import { useAuth } from "@/components/auth/AuthProvider";
import { useClients } from "./useClients";

/**
 * Hook to check if a user can edit a specific job based on permissions
 * 
 * Logic:
 * - edit_all_jobs: Can edit any job
 * - edit_assigned_jobs: Can only edit jobs assigned to them (created by them OR client assigned to them)
 * - Neither enabled: Cannot edit any job
 * 
 * Uses the unified permission system that merges role-based + custom permissions
 */
export const useCanEditJob = (project: any) => {
  const { user } = useAuth();
  
  // Use unified permission system (handles role-based + custom permissions)
  const canEditAllJobs = useHasPermission('edit_all_jobs');
  const canEditAssignedJobs = useHasPermission('edit_assigned_jobs');
  
  // Fetch clients to check assignment
  const { data: clients = [] } = useClients();
  
  // Loading state - permissions are still being fetched
  const isLoading = canEditAllJobs === undefined || canEditAssignedJobs === undefined;
  
  // Determine if this specific job can be edited
  const canEditJob = (() => {
    // Still loading permissions
    if (isLoading) {
      return false;
    }
    
    // If both permissions are disabled, cannot edit
    if (!canEditAllJobs && !canEditAssignedJobs) {
      return false;
    }
    
    // If "Edit All Jobs" is enabled, can edit any job
    if (canEditAllJobs) {
      return true;
    }
    
    // If only "Edit Assigned Jobs" is enabled, check assignment
    if (canEditAssignedJobs) {
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
    canEditAllJobs: canEditAllJobs ?? false,
    canEditAssignedJobs: canEditAssignedJobs ?? false,
    isLoading,
  };
};
