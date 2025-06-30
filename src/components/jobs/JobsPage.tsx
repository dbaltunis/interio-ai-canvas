
import { useState } from "react";
import { JobEditPage } from "../job-editor/JobEditPage";
import { ClientCreateForm } from "../clients/ClientCreateForm";
import { JobsPageTabs } from "./JobsPageTabs";
import { JobsPageActions } from "./JobsPageActions";
import { JobsPageContent } from "./JobsPageContent";
import { useToast } from "@/hooks/use-toast";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";

export const JobsPage = () => {
  const [activeTab, setActiveTab] = useState<"jobs" | "clients" | "emails">("jobs");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [isNewJob, setIsNewJob] = useState(false);
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
    setIsNewJob(false);
  };

  const handleClientEdit = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const handleBackToJobs = () => {
    setSelectedJobId(null);
    setSelectedClientId(null);
    setShowNewClient(false);
    setIsNewJob(false);
  };

  const handleNewJob = () => {
    try {
      setIsNewJob(true);
      setSelectedJobId("new"); // Use "new" to indicate creating a new job
    } catch (error) {
      console.error("Error starting new job:", error);
      toast({
        title: "Error",
        description: "Failed to start new job. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleNewClient = () => {
    try {
      setShowNewClient(true);
    } catch (error) {
      console.error("Error starting new client:", error);
      toast({
        title: "Error",
        description: "Failed to start new client. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Calculate actual counts
  const jobsCount = quotes?.length || 0;
  const clientsCount = clients?.length || 0;
  const emailsCount = 45; // This will be dynamic once we have email data

  // If creating a new client, show the new client page
  if (showNewClient) {
    return <ClientCreateForm onBack={handleBackToJobs} />;
  }

  // If editing a client, show the client edit form
  if (selectedClientId) {
    return <ClientCreateForm clientId={selectedClientId} onBack={handleBackToJobs} />;
  }

  // If a job is selected (new or existing), show the job editing page
  if (selectedJobId) {
    return <JobEditPage jobId={selectedJobId} onBack={handleBackToJobs} />;
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation - Always visible */}
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
