
import { useState } from "react";
import { JobsPageHeader } from "./JobsPageHeader";
import { JobsFilters } from "./JobsFilters";
import { JobsTable } from "./JobsTable";
import { ProjectJobsTab } from "@/components/job-creation/ProjectJobsTab";
import { useProjects } from "@/hooks/useProjects";

export const JobsPage = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { data: projects } = useProjects();
  
  // Find the selected project
  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  // If a project is selected, show the ProjectJobsTab
  if (selectedProject) {
    return <ProjectJobsTab project={selectedProject} />;
  }

  return (
    <div className="space-y-6">
      <JobsPageHeader onProjectSelect={setSelectedProjectId} />
      <JobsFilters />
      <JobsTable onProjectSelect={setSelectedProjectId} />
    </div>
  );
};
