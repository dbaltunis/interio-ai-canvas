
import { EnhancedRoomView } from "@/components/room-management/EnhancedRoomView";
import { useProjects } from "@/hooks/useProjects";

interface RoomsTabProps {
  projectId: string;
}

export const RoomsTab = ({ projectId }: RoomsTabProps) => {
  const { data: projects } = useProjects();
  const project = projects?.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Rooms & Treatments</h2>
          <p className="text-muted-foreground">
            Manage rooms and configure window treatments for this project
          </p>
        </div>
      </div>

      <EnhancedRoomView project={project} />
    </div>
  );
};
