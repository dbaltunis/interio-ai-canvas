
import { useState } from "react";
import { JobEditPage } from "../job-editor/JobEditPage";
import { ClientCreateForm } from "../clients/ClientCreateForm";
import { JobsPageTabs } from "./JobsPageTabs";
import { JobsPageActions } from "./JobsPageActions";
import { JobsPageContent } from "./JobsPageContent";
import { NewJobPageSimplified } from "../job-creation/NewJobPageSimplified";
import { useToast } from "@/hooks/use-toast";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";

export const JobsPage = () => {
  const [activeTab, setActiveTab] = useState<"jobs" | "clients" | "emails" | "analytics">("jobs");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewJob, setShowNewJob] = useState(false);
  const { toast } = useToast();
  
  // Get actual data for counts
  const { data: quotes } = useQuotes();
  const { data: clients } = useClients();
  
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

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleClientEdit = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const handleBackToJobs = () => {
    setSelectedJobId(null);
    setSelectedClientId(null);
    setShowNewClient(false);
    setShowNewJob(false);
  };

  const handleNewJob = () => {
    setShowNewJob(true);
  };

  const handleNewClient = () => {
    setShowNewClient(true);
  };

  const handleNewEmail = () => {
    setActiveTab("emails");
  };

  // Calculate actual counts
  const jobsCount = quotes?.length || 0;
  const clientsCount = clients?.length || 0;
  const emailsCount = 45; // Dynamic when email data is available

  // Show simplified new job page
  if (showNewJob) {
    return <NewJobPageSimplified onBack={handleBackToJobs} />;
  }

  // Show new client page
  if (showNewClient) {
    return <ClientCreateForm onBack={handleBackToJobs} />;
  }

  // Show client edit form
  if (selectedClientId) {
    return <ClientCreateForm clientId={selectedClientId} onBack={handleBackToJobs} />;
  }

  // Show job editing page (existing job)
  if (selectedJobId) {
    return <JobEditPage jobId={selectedJobId} onBack={handleBackToJobs} />;
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between">
        <JobsPageTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          jobsCount={jobsCount}
          clientsCount={clientsCount}
          emailsCount={emailsCount}
        />
        
        <JobsPageActions
          activeTab={activeTab}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          onNewJob={handleNewJob}
          onNewClient={handleNewClient}
          onNewEmail={handleNewEmail}
        />
      </div>

      <JobsPageContent
        activeTab={activeTab}
        showFilters={showFilters}
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
        onNewJob={handleNewJob}
        onJobSelect={handleJobSelect}
        onClientEdit={handleClientEdit}
      />
    </div>
  );
};
