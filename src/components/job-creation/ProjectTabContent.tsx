
import { ProjectJobsTab } from "./ProjectJobsTab";
import { ProjectClientTab } from "./ProjectClientTab";
import { ProjectQuoteTab } from "./ProjectQuoteTab";
import { ProjectWorkshopTab } from "./ProjectWorkshopTab";

interface ProjectTabContentProps {
  activeTab: string;
  project: any;
  onBack: () => void;
}

export const ProjectTabContent = ({ activeTab, project, onBack }: ProjectTabContentProps) => {
  if (!project) return null;

  switch (activeTab) {
    case "client":
      return <ProjectClientTab project={project} />;
    case "jobs":
      return <ProjectJobsTab project={project} onBack={onBack} />;
    case "quote":
      return <ProjectQuoteTab project={project} />;
    case "workshop":
      return <ProjectWorkshopTab project={project} />;
    default:
      return <ProjectJobsTab project={project} onBack={onBack} />;
  }
};
