import { useHasPermission } from "./usePermissions";

export const useRecordPermissions = () => {
  // View permissions - use correct permission names (assigned, not own)
  const canViewAssignedClients = useHasPermission('view_assigned_clients');
  const canViewAllClients = useHasPermission('view_all_clients');
  const canViewAssignedJobs = useHasPermission('view_assigned_jobs');
  const canViewAllJobs = useHasPermission('view_all_jobs');
  const canViewProjects = useHasPermission('view_projects');
  const canViewAllProjects = useHasPermission('view_all_jobs'); // projects inherit from jobs

  // Edit permissions - use correct permission names
  const canEditAssignedClients = useHasPermission('edit_assigned_clients');
  const canEditAllClients = useHasPermission('edit_all_clients');
  const canEditAssignedJobs = useHasPermission('edit_assigned_jobs');
  const canEditAllJobs = useHasPermission('edit_all_jobs');
  const canEditProjects = useHasPermission('edit_projects');
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
    if (canEditAssignedJobs && jobUserId === currentUserId) return true;
    return false;
  };

  const canViewProject = (projectUserId?: string, currentUserId?: string) => {
    if (canViewAllProjects) return true;
    if (canViewProjects && projectUserId === currentUserId) return true;
    return false;
  };

  const canEditProject = (projectUserId?: string, currentUserId?: string) => {
    if (canEditAllProjects) return true;
    if (canEditProjects && projectUserId === currentUserId) return true;
    return false;
  };

  return {
    // View permissions (keep backward compatible names in return)
    canViewOwnClients: canViewAssignedClients,
    canViewAllClients,
    canViewOwnJobs: canViewAssignedJobs,
    canViewAllJobs,
    canViewOwnProjects: canViewProjects,
    canViewAllProjects,
    
    // Edit permissions (keep backward compatible names in return)
    canEditOwnClients: canEditAssignedClients,
    canEditAllClients,
    canEditOwnJobs: canEditAssignedJobs,
    canEditAllJobs,
    canEditOwnProjects: canEditProjects,
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