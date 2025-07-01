
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { ProjectJobsHeader } from "./ProjectJobsHeader";
import { ProjectJobsContent } from "./ProjectJobsContent";
import { useProjectJobsActions } from "./hooks/useProjectJobsActions";

interface ProjectJobsTabProps {
  project: any;
  onProjectUpdate?: (updatedProject: any) => void;
}

export const ProjectJobsTab = ({ project, onProjectUpdate }: ProjectJobsTabProps) => {
  const { data: rooms = [] } = useRooms(project?.id);
  const { data: surfaces = [] } = useSurfaces();
  
  const {
    isCreatingRoom,
    handleCreateRoom,
    handleUpdateProjectName
  } = useProjectJobsActions({
    project,
    rooms,
    onProjectUpdate
  });

  return (
    <div className="p-6 space-y-6">
      <ProjectJobsHeader
        project={project}
        onUpdateName={handleUpdateProjectName}
        onCreateRoom={handleCreateRoom}
        isCreatingRoom={isCreatingRoom}
      />

      <ProjectJobsContent
        rooms={rooms}
        project={project}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
};
