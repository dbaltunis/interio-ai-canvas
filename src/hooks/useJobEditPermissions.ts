import { useHasPermission, useUserPermissions } from "./usePermissions";
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

  // Check if permissions query has errored (all retries failed)
  const { isError: permissionsError } = useUserPermissions();

  // Fetch clients to check assignment
  const { data: clients = [] } = useClients();

  // Loading state - permissions are still being fetched
  // If permissions query errored, stop loading to prevent permanent lock
  const isLoading = !permissionsError && (canEditAllJobs === undefined || canEditAssignedJobs === undefined);

  // Determine if this specific job can be edited
  const canEditJob = (() => {
    // Still loading permissions - default to ALLOW editing to prevent UI lock
    if (isLoading) {
      return true;
    }

    // If permissions failed to load, default to allowing editing
    // (better to allow editing than permanently lock the UI)
    if (permissionsError) {
      console.warn('[useCanEditJob] Permissions failed to load, defaulting to allow editing');
      return true;
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

      // Check if job is directly assigned to the user (assigned_to or assigned_manager)
      const isDirectlyAssigned = project.assigned_to === user.id || project.assigned_manager === user.id;

      return isCreatedByUser || isClientAssignedToUser || isDirectlyAssigned;
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
