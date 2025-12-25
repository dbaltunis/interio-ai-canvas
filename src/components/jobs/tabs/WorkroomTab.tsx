import { WorkroomDocuments } from "@/components/workroom/WorkroomDocuments";
import { useProjects } from "@/hooks/useProjects";
import { useHasPermission } from "@/hooks/usePermissions";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCanEditJob } from "@/hooks/useJobEditPermissions";

interface WorkroomTabProps {
  projectId: string;
}

export const WorkroomTab = ({ projectId }: WorkroomTabProps) => {
  const { data: projects } = useProjects();
  const project = projects?.find(p => p.id === projectId);
  // Use explicit permissions hook for edit checks
  const { canEditJob, isLoading: editPermissionsLoading } = useCanEditJob(project);
  const isReadOnly = !canEditJob || editPermissionsLoading;

  return (
    <main className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Workroom</h2>
      </header>
      <WorkroomDocuments projectId={projectId} isReadOnly={isReadOnly} />
    </main>
  );
};
