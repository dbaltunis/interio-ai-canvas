import React, { createContext, useContext, useMemo } from "react";
import { ProjectData, MeasurementData, TreatmentData } from "./types";

interface ProjectDataContextValue {
  projectData: ProjectData | null;
  measurements: MeasurementData | null;
  treatmentData: TreatmentData | null;
}

const ProjectDataContext = createContext<ProjectDataContextValue>({
  projectData: null,
  measurements: null,
  treatmentData: null,
});

interface ProjectDataProviderProps {
  projectData?: ProjectData;
  measurements?: MeasurementData;
  treatmentData?: TreatmentData;
  children: React.ReactNode;
}

export const ProjectDataProvider = ({
  projectData,
  measurements,
  treatmentData,
  children,
}: ProjectDataProviderProps) => {
  const value = useMemo(() => ({
    projectData: projectData || null,
    measurements: measurements || null,
    treatmentData: treatmentData || null,
  }), [projectData, measurements, treatmentData]);

  return (
    <ProjectDataContext.Provider value={value}>
      {children}
    </ProjectDataContext.Provider>
  );
};

export const useProjectData = () => {
  return useContext(ProjectDataContext);
};

export const useProjectDataExtractor = () => {
  const { projectData, measurements, treatmentData } = useProjectData();
  return { projectData, measurements, treatmentData };
};
