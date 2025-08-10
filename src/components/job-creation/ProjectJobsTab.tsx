// import { SimplifiedProjectJobsTab } from "./SimplifiedProjectJobsTab";

interface ProjectJobsTabProps {
  project: any;
  onProjectUpdate?: (updatedProject: any) => void;
}

export const ProjectJobsTab = ({ project, onProjectUpdate }: ProjectJobsTabProps) => {
  return (
    <div className="liquid-glass rounded-xl p-6 space-y-2">
      <h2 className="text-xl font-semibold text-foreground">Project Jobs - {project?.name}</h2>
      <p className="text-muted-foreground">Jobs management coming soon…</p>
    </div>
  );
};