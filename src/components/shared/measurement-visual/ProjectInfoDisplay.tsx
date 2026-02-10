import { ProjectData } from "./types";

interface ProjectInfoDisplayProps {
  projectData: ProjectData;
  detailed?: boolean;
}

export const ProjectInfoDisplay = ({
  projectData,
  detailed = false,
}: ProjectInfoDisplayProps) => {
  return (
    <div className="space-y-2">
      {projectData.name && (
        <div>
          <p className="text-sm text-muted-foreground">Project</p>
          <p className="font-medium">{projectData.name}</p>
        </div>
      )}
      {projectData.client && (
        <div>
          <p className="text-sm text-muted-foreground">Client</p>
          <p className="font-medium">{projectData.client.name}</p>
          {detailed && projectData.client.company_name && (
            <p className="text-xs text-muted-foreground">{projectData.client.company_name}</p>
          )}
        </div>
      )}
      {projectData.room && (
        <div>
          <p className="text-sm text-muted-foreground">Room</p>
          <p className="font-medium">{projectData.room.name}</p>
        </div>
      )}
      {projectData.window && (
        <div>
          <p className="text-sm text-muted-foreground">Window</p>
          <p className="font-medium">{projectData.window.type}</p>
        </div>
      )}
    </div>
  );
};
