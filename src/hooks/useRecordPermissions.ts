import { useHasPermission } from "./usePermissions";

export const useRecordPermissions = () => {
  // View permissions - use correct permission names (assigned, not own)
  const canViewAssignedClients = useHasPermission('view_assigned_clients');
  const canViewAllClients = useHasPermission('view_all_clients');
  const canViewAssignedJobs = useHasPermission('view_assigned_jobs');
  const canViewAllJobs = useHasPermission('view_all_jobs');
  const canViewAllProjects = useHasPermission('view_all_jobs'); // projects inherit from jobs

  // Edit permissions - use correct permission names
  const canEditAssignedClients = useHasPermission('edit_assigned_clients');
  const canEditAllClients = useHasPermission('edit_all_clients');
  const canEditOwnJobs = useHasPermission('edit_own_jobs');
  const canEditAllJobs = useHasPermission('edit_all_jobs');
  const canEditAllProjects = useHasPermission('edit_all_jobs'); // projects inherit from jobs

  // Helper functions to check record-specific permissions
  const canViewClient = (clientUserId?: string, currentUserId?: string) => {
    if (canViewAllClients) return true;
    if (canViewAssignedClients && clientUserId === currentUserId) return true;
    return false;
  };

  const canEditClient = (clientUserId?: string, currentUserId?: string) => {
    if (canEditAllClients) return true;
    if (canEditAssignedClients && clientUserId === currentUserId) return true;
    return false;
  };

  const canViewJob = (jobUserId?: string, currentUserId?: string) => {
    if (canViewAllJobs) return true;
    if (canViewAssignedJobs && jobUserId === currentUserId) return true;
    return false;
  };

  const canEditJob = (jobUserId?: string, currentUserId?: string) => {
    if (canEditAllJobs) return true;
    if (canEditOwnJobs && jobUserId === currentUserId) return true;
    return false;
  };

  const canViewProject = (projectUserId?: string, currentUserId?: string) => {
    if (canViewAllProjects) return true;
    if (canViewAssignedJobs && projectUserId === currentUserId) return true;
    return false;
  };

  const canEditProject = (projectUserId?: string, currentUserId?: string) => {
    if (canEditAllProjects) return true;
    if (canEditOwnJobs && projectUserId === currentUserId) return true;
    return false;
  };

  return {
    // View permissions (keep backward compatible names in return)
    canViewOwnClients: canViewAssignedClients,
    canViewAllClients,
    canViewOwnJobs: canViewAssignedJobs,
    canViewAllJobs,
    canViewOwnProjects: canViewAssignedJobs,
    canViewAllProjects,
    
    // Edit permissions (keep backward compatible names in return)
    canEditOwnClients: canEditAssignedClients,
    canEditAllClients,
    canEditOwnJobs: canEditOwnJobs,
    canEditAllJobs,
    canEditOwnProjects: canEditOwnJobs,
    canEditAllProjects,

    // Helper functions
    canViewClient,
    canEditClient,
    canViewJob,
    canEditJob,
    canViewProject,
    canEditProject,
  };
};