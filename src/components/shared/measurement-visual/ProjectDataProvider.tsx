import { createContext, useContext, ReactNode } from "react";
import { ProjectData } from "./types";

interface ProjectDataContextType {
  projectData: ProjectData | null;
  setProjectData: (data: ProjectData | null) => void;
}

const ProjectDataContext = createContext<ProjectDataContextType | undefined>(undefined);

interface ProjectDataProviderProps {
  children: ReactNode;
  data: ProjectData | null;
  onDataChange?: (data: ProjectData | null) => void;
}

export const ProjectDataProvider = ({ 
  children, 
  data, 
  onDataChange 
}: ProjectDataProviderProps) => {
  const setProjectData = (newData: ProjectData | null) => {
    onDataChange?.(newData);
  };

  return (
    <ProjectDataContext.Provider value={{ projectData: data, setProjectData }}>
      {children}
    </ProjectDataContext.Provider>
  );
};

export const useProjectData = () => {
  const context = useContext(ProjectDataContext);
  if (context === undefined) {
    throw new Error('useProjectData must be used within a ProjectDataProvider');
  }
  return context;
};

// Hook to automatically extract project data from different sources
export const useProjectDataExtractor = (sources: {
  project?: any;
  client?: any;
  room?: any;
  window?: any;
}): ProjectData => {
  const { project, client, room, window: windowData } = sources;

  return {
    id: project?.id,
    name: project?.name || project?.project_name,
    client: client ? {
      id: client.id,
      name: client.name,
      email: client.email,
      company_name: client.company_name,
      address: client.address,
      phone: client.phone,
    } : undefined,
    room: room ? {
      id: room.id,
      name: room.name || room.room_name,
      room_type: room.room_type,
    } : undefined,
    window: windowData ? {
      id: windowData.id,
      type: windowData.type || windowData.window_type || 'standard',
      width: windowData.width,
      height: windowData.height,
      position: windowData.position,
    } : undefined,
  };
};