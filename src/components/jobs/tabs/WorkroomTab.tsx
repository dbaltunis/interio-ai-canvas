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
  const canEditJob = canEditAllJobs || (canEditAssignedJobs && project?.user_id === user?.id);
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
