
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { JobsFilters } from "./JobsFilters";
import { JobEditPage } from "../job-editor/JobEditPage";
import { NewJobPage } from "../job-creation/NewJobPage";
import { EnhancedClientManagement } from "../clients/EnhancedClientManagement";
import { EnhancedJobsManagement } from "./EnhancedJobsManagement";
import { ClientCreateForm } from "../clients/ClientCreateForm";
import { useToast } from "@/hooks/use-toast";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";

export const JobsPage = () => {
  const [activeTab, setActiveTab] = useState<"jobs" | "clients">("jobs");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showNewJob, setShowNewJob] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
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

  const handleBackToJobs = () => {
    setSelectedJobId(null);
    setShowNewJob(false);
    setShowNewClient(false);
  };

  const handleNewJob = () => {
    try {
      setShowNewJob(true);
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

  // If creating a new job, show the new job page
  if (showNewJob) {
    return <NewJobPage onBack={handleBackToJobs} />;
  }

  // If creating a new client, show the new client page
  if (showNewClient) {
    return <ClientCreateForm onBack={handleBackToJobs} />;
  }

  // If a job is selected, show the job editing page
  if (selectedJobId) {
    return <JobEditPage jobId={selectedJobId} onBack={handleBackToJobs} />;
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation - Always visible */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-0">
          <Button
            variant={activeTab === "jobs" ? "default" : "ghost"}
            className={`rounded-r-none px-6 py-2 ${
              activeTab === "jobs" 
                ? "bg-gray-100 text-gray-900 border border-gray-300" 
                : "bg-white text-gray-600 border border-gray-300"
            }`}
            onClick={() => setActiveTab("jobs")}
          >
            Jobs ({jobsCount})
          </Button>
          <Button
            variant={activeTab === "clients" ? "default" : "ghost"}
            className={`rounded-l-none border-l-0 px-6 py-2 ${
              activeTab === "clients" 
                ? "bg-gray-100 text-gray-900 border border-gray-300" 
                : "bg-white text-gray-600 border border-gray-300"
            }`}
            onClick={() => setActiveTab("clients")}
          >
            Clients ({clientsCount})
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          {activeTab === "jobs" ? (
            <Button 
              className="bg-slate-600 hover:bg-slate-700 text-white px-6"
              onClick={handleNewJob}
            >
              New Job
            </Button>
          ) : (
            <Button 
              className="bg-slate-600 hover:bg-slate-700 text-white px-6"
              onClick={handleNewClient}
            >
              New Client
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="bg-slate-500 text-white hover:bg-slate-600 px-4"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

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
          onClearAll={handleClearAll}
        />
      )}
      
      {/* Content based on active tab */}
      {activeTab === "jobs" ? (
        <EnhancedJobsManagement 
          onNewJob={handleNewJob}
          onJobSelect={handleJobSelect}
          searchClient={searchClient}
          searchJobNumber={searchJobNumber}
          filterStatus={filterStatus}
          filterDeposit={filterDeposit}
          filterOwner={filterOwner}
          filterMaker={filterMaker}
        />
      ) : (
        <EnhancedClientManagement />
      )}
    </div>
  );
};
