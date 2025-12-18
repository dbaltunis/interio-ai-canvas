import { WorkroomDocuments } from "@/components/workroom/WorkroomDocuments";
import { useProjects } from "@/hooks/useProjects";
import { useHasPermission } from "@/hooks/usePermissions";
import { useAuth } from "@/components/auth/AuthProvider";

interface WorkroomTabProps {
  projectId: string;
}

export const WorkroomTab = ({ projectId }: WorkroomTabProps) => {
  const { data: projects } = useProjects();
  const { user } = useAuth();
  const project = projects?.find(p => p.id === projectId);
  const canEditAllJobs = useHasPermission('edit_all_jobs');
  const canEditAssignedJobs = useHasPermission('edit_assigned_jobs');
  // If both permissions are disabled, no job should be editable
  // If both are enabled, all jobs are editable
  // If only "Edit Any Job" is enabled, only jobs created by the user should be editable
  // If only "Edit Assigned Jobs" is enabled, only assigned jobs should be editable
  const canEditJob = (!canEditAllJobs && !canEditAssignedJobs) 
    ? false 
    : (canEditAllJobs && canEditAssignedJobs) 
      ? true 
      : (canEditAllJobs && !canEditAssignedJobs) 
        ? project?.user_id === user?.id 
        : (canEditAssignedJobs && !canEditAllJobs) 
          ? project?.user_id === user?.id 
          : false;
  const isReadOnly = !canEditJob;

  return (
    <main className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Workroom</h2>
      </header>
      <WorkroomDocuments projectId={projectId} isReadOnly={isReadOnly} />
    </main>
  );
};
