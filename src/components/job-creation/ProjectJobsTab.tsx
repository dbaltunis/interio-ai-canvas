import { SimplifiedProjectJobsTab } from "./SimplifiedProjectJobsTab";

interface ProjectJobsTabProps {
  project: any;
  onProjectUpdate?: (updatedProject: any) => void;
}

export const ProjectJobsTab = ({ project, onProjectUpdate }: ProjectJobsTabProps) => {
  // Use the new simplified interface
  return <SimplifiedProjectJobsTab project={project} onProjectUpdate={onProjectUpdate} />;
};