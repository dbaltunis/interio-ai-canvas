import { useHasPermission } from "./usePermissions";

export const useRecordPermissions = () => {
  // View permissions
  const canViewOwnClients = useHasPermission('view_own_clients');
  const canViewAllClients = useHasPermission('view_all_clients');
  const canViewOwnJobs = useHasPermission('view_own_jobs');
  const canViewAllJobs = useHasPermission('view_all_jobs');
  const canViewOwnProjects = useHasPermission('view_own_projects');
  const canViewAllProjects = useHasPermission('view_all_projects');

  // Edit permissions
  const canEditOwnClients = useHasPermission('edit_own_clients');
  const canEditAllClients = useHasPermission('edit_all_clients');
  const canEditOwnJobs = useHasPermission('edit_own_jobs');
  const canEditAllJobs = useHasPermission('edit_all_jobs');
  const canEditOwnProjects = useHasPermission('edit_own_projects');
  const canEditAllProjects = useHasPermission('edit_all_projects');

  // Helper functions to check record-specific permissions
  const canViewClient = (clientUserId?: string, currentUserId?: string) => {
    if (canViewAllClients) return true;
    if (canViewOwnClients && clientUserId === currentUserId) return true;
    return false;
  };

  const canEditClient = (clientUserId?: string, currentUserId?: string) => {
    if (canEditAllClients) return true;
    if (canEditOwnClients && clientUserId === currentUserId) return true;
    return false;
  };

  const canViewJob = (jobUserId?: string, currentUserId?: string) => {
    if (canViewAllJobs) return true;
    if (canViewOwnJobs && jobUserId === currentUserId) return true;
    return false;
  };

  const canEditJob = (jobUserId?: string, currentUserId?: string) => {
    if (canEditAllJobs) return true;
    if (canEditOwnJobs && jobUserId === currentUserId) return true;
    return false;
  };

  const canViewProject = (projectUserId?: string, currentUserId?: string) => {
    if (canViewAllProjects) return true;
    if (canViewOwnProjects && projectUserId === currentUserId) return true;
    return false;
  };

  const canEditProject = (projectUserId?: string, currentUserId?: string) => {
    if (canEditAllProjects) return true;
    if (canEditOwnProjects && projectUserId === currentUserId) return true;
    return false;
  };

  return {
    // View permissions
    canViewOwnClients,
    canViewAllClients,
    canViewOwnJobs,
    canViewAllJobs,
    canViewOwnProjects,
    canViewAllProjects,
    
    // Edit permissions
    canEditOwnClients,
    canEditAllClients,
    canEditOwnJobs,
    canEditAllJobs,
    canEditOwnProjects,
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