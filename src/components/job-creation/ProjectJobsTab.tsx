// import { SimplifiedProjectJobsTab } from "./SimplifiedProjectJobsTab";

interface ProjectJobsTabProps {
  project: any;
  onProjectUpdate?: (updatedProject: any) => void;
}

export const ProjectJobsTab = ({ project, onProjectUpdate }: ProjectJobsTabProps) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Project Jobs - {project?.name}</h2>
      <div className="text-center text-muted-foreground">
        Project jobs management coming soon...
      </div>
    </div>
  );
};