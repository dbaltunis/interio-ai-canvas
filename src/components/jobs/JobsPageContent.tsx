
import { JobsFilters } from "./JobsFilters";
import { JobsListView } from "./JobsListView";
import { EnhancedClientManagement } from "../clients/EnhancedClientManagement";
import { EmailsTab } from "./EmailsTab";

interface JobsPageContentProps {
  activeTab: "jobs" | "clients" | "emails";
  showFilters: boolean;
  searchClient: string;
  setSearchClient: (value: string) => void;
  searchJobNumber: string;
  setSearchJobNumber: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterDeposit: string;
  setFilterDeposit: (value: string) => void;
  filterOwner: string;
  setFilterOwner: (value: string) => void;
  filterMaker: string;
  setFilterMaker: (value: string) => void;
  onClearAll: () => void;
  onNewJob: () => void;
  onJobSelect: (jobId: string) => void;
  onClientEdit: (clientId: string) => void;
  onJobCopy?: (jobId: string) => void;
}

export const JobsPageContent = ({
  activeTab,
  showFilters,
  searchClient,
  setSearchClient,
  searchJobNumber,
  setSearchJobNumber,
  filterStatus,
  setFilterStatus,
  filterDeposit,
  setFilterDeposit,
  filterOwner,
  setFilterOwner,
  filterMaker,
  setFilterMaker,
  onClearAll,
  onNewJob,
  onJobSelect,
  onClientEdit,
  onJobCopy
}: JobsPageContentProps) => {
  console.log("=== JOBS PAGE CONTENT RENDER ===");
  console.log("Active tab:", activeTab);
  console.log("Show filters:", showFilters);

  return (
    <div className="space-y-6">
      {/* Filters - only show for jobs tab */}
      {showFilters && activeTab === "jobs" && (
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
          onClearAll={onClearAll}
        />
      )}
      
      {/* Content based on active tab */}
      {activeTab === "jobs" ? (
        <JobsListView 
          onNewJob={onNewJob}
          onJobSelect={onJobSelect}
          onClientEdit={onClientEdit}
          onJobCopy={onJobCopy}
          searchClient={searchClient}
          searchJobNumber={searchJobNumber}
          filterStatus={filterStatus}
          filterDeposit={filterDeposit}
          filterOwner={filterOwner}
          filterMaker={filterMaker}
        />
      ) : activeTab === "clients" ? (
        <EnhancedClientManagement />
      ) : (
        <EmailsTab />
      )}
    </div>
  );
};
