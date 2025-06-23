
import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { NewJobPage } from "@/components/job-creation/NewJobPage";
import { JobsPageHeader } from "./JobsPageHeader";
import { JobsFilters } from "./JobsFilters";
import { JobsTable } from "./JobsTable";

export const JobsPage = () => {
  const { data: projects, isLoading } = useProjects();
  const { data: clients } = useClients();
  const [activeTab, setActiveTab] = useState("jobs");
  const [searchClient, setSearchClient] = useState("");
  const [searchJobNumber, setSearchJobNumber] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDeposit, setFilterDeposit] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [filterMaker, setFilterMaker] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showNewJob, setShowNewJob] = useState(false);

  // Show new job page if user clicked "New Job"
  if (showNewJob) {
    return <NewJobPage onBack={() => setShowNewJob(false)} />;
  }

  const generateJobNumber = (index: number) => {
    return `QUOTE-${String(1000 + index).padStart(4, '0')}`;
  };

  const filteredProjects = projects?.filter(project => {
    const clientName = clients?.find(c => c.id === project.client_id)?.name || '';
    
    if (searchClient && !clientName.toLowerCase().includes(searchClient.toLowerCase())) {
      return false;
    }
    if (searchJobNumber && !generateJobNumber(0).includes(searchJobNumber)) {
      return false;
    }
    if (filterStatus && filterStatus !== "all" && project.status !== filterStatus) {
      return false;
    }
    return true;
  }) || [];

  const handleClearAllFilters = () => {
    setSearchClient("");
    setSearchJobNumber("");
    setFilterStatus("");
    setFilterDeposit("");
    setFilterOwner("");
    setFilterMaker("");
  };

  if (isLoading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div className="space-y-6">
      <JobsPageHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectsCount={projects?.length || 0}
        clientsCount={clients?.length || 0}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onNewJob={() => setShowNewJob(true)}
      />

      {showFilters && (
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
          onClearAll={handleClearAllFilters}
        />
      )}

      <JobsTable 
        projects={filteredProjects} 
        clients={clients || []} 
      />
    </div>
  );
};
