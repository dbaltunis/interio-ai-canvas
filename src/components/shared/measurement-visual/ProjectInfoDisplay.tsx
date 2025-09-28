import { ProjectData } from "./types";

interface ProjectInfoDisplayProps {
  projectData: ProjectData;
  detailed?: boolean;
  compact?: boolean;
}

export const ProjectInfoDisplay = ({ 
  projectData, 
  detailed = false, 
  compact = false 
}: ProjectInfoDisplayProps) => {
  if (compact) {
    return (
      <div className="text-right text-sm text-muted-foreground">
        {projectData.client?.name && (
          <div className="font-medium">{projectData.client.name}</div>
        )}
        {projectData.room?.name && (
          <div>{projectData.room.name}</div>
        )}
      </div>
    );
  }

  if (!detailed) {
    return (
      <div className="text-right">
        {projectData.client?.name && (
          <div className="text-sm font-medium text-muted-foreground">
            {projectData.client.name}
          </div>
        )}
        {projectData.room?.name && (
          <div className="text-xs text-muted-foreground">
            {projectData.room.name}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Client Information */}
      {projectData.client && (
        <div>
          <h4 className="font-medium text-sm mb-2">Client Details</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{projectData.client.name}</div>
            {projectData.client.company_name && (
              <div>{projectData.client.company_name}</div>
            )}
            {projectData.client.email && (
              <div>{projectData.client.email}</div>
            )}
            {projectData.client.phone && (
              <div>{projectData.client.phone}</div>
            )}
            {projectData.client.address && (
              <div>{projectData.client.address}</div>
            )}
          </div>
        </div>
      )}

      {/* Room Information */}
      {projectData.room && (
        <div>
          <h4 className="font-medium text-sm mb-2">Room Details</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{projectData.room.name}</div>
            {projectData.room.room_type && (
              <div className="capitalize">{projectData.room.room_type}</div>
            )}
          </div>
        </div>
      )}

      {/* Window Information */}
      {projectData.window && (
        <div>
          <h4 className="font-medium text-sm mb-2">Window Details</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="capitalize">{projectData.window.type} Window</div>
            {projectData.window.position && (
              <div>Position: {projectData.window.position}</div>
            )}
            {(projectData.window.width || projectData.window.height) && (
              <div>
                {projectData.window.width && `W: ${projectData.window.width}`}
                {projectData.window.width && projectData.window.height && " × "}
                {projectData.window.height && `H: ${projectData.window.height}`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Information */}
      {projectData.name && (
        <div>
          <h4 className="font-medium text-sm mb-2">Project</h4>
          <div className="text-sm text-muted-foreground">
            {projectData.name}
          </div>
        </div>
      )}
    </div>
  );
};