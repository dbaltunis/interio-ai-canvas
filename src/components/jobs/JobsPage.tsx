
import { useState } from "react";
import { JobsPageHeader } from "./JobsPageHeader";
import { JobsFilters } from "./JobsFilters";
import { JobsTable } from "./JobsTable";
import { ProjectJobsTab } from "@/components/job-creation/ProjectJobsTab";
import { useProjects } from "@/hooks/useProjects";

export const JobsPage = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { data: projects } = useProjects();
  
  // Filter state management
  const [searchClient, setSearchClient] = useState("");
  const [searchJobNumber, setSearchJobNumber] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDeposit, setFilterDeposit] = useState("all");
  const [filterOwner, setFilterOwner] = useState("all");
  const [filterMaker, setFilterMaker] = useState("all");

  const handleClearAll = () => {
    setSearchClient("");
    setSearchJobNumber("");
    setFilterStatus("all");
    setFilterDeposit("all");
    setFilterOwner("all");
    setFilterMaker("all");
  };
  
  // Find the selected project
  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  // If a project is selected, show the ProjectJobsTab
  if (selectedProject) {
    return <ProjectJobsTab project={selectedProject} />;
  }

  return (
    <div className="space-y-6">
      <JobsPageHeader onProjectSelect={setSelectedProjectId} />
      <JobsFilters
        searchClient={searchClient}
        setSearchClient={setSearchClient}
        searchJobNumber={searchJobNumber}
        setSearchJobNumber={setSearchJobNumber}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterDeposit={filterDeposit}
        setFilterDeposit={setFilterDeposit}
        filterOwner={filterOwner}
        setFilterOwner={setFilterOwner}
        filterMaker={filterMaker}
        setFilterMaker={setFilterMaker}
        onClearAll={handleClearAll}
      />
      <JobsTable onProjectSelect={setSelectedProjectId} />
    </div>
  );
};
