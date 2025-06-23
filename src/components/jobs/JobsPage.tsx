
import { useState } from "react";
import { JobsPageHeader } from "./JobsPageHeader";
import { JobsFilters } from "./JobsFilters";
import { JobsTable } from "./JobsTable";
import { ProjectJobsTab } from "@/components/job-creation/ProjectJobsTab";
import { useQuotes } from "@/hooks/useQuotes";
import { Button } from "@/components/ui/button";

export const JobsPage = () => {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"jobs" | "client">("jobs");
  const { data: quotes } = useQuotes();
  
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
  
  // Find the selected quote
  const selectedQuote = quotes?.find(q => q.id === selectedQuoteId);

  // If a quote is selected, show the project detail view
  if (selectedQuote) {
    return (
      <ProjectJobsTab 
        project={selectedQuote} 
        onBack={() => setSelectedQuoteId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <JobsPageHeader onQuoteSelect={setSelectedQuoteId} />
      
      {/* Tab Navigation */}
      <div className="flex items-center space-x-4">
        <div className="flex bg-white rounded-lg border">
          <Button
            variant={activeTab === "jobs" ? "default" : "ghost"}
            className={`rounded-r-none ${activeTab === "jobs" ? "bg-gray-200 text-gray-900" : ""}`}
            onClick={() => setActiveTab("jobs")}
          >
            Jobs (42)
          </Button>
          <Button
            variant={activeTab === "client" ? "default" : "ghost"}
            className={`rounded-l-none border-l ${activeTab === "client" ? "bg-gray-200 text-gray-900" : ""}`}
            onClick={() => setActiveTab("client")}
          >
            Client (9)
          </Button>
        </div>
        
        <div className="flex-1" />
        
        <Button 
          className="bg-slate-600 hover:bg-slate-700 text-white"
          onClick={() => {
            // Create new job logic will be handled by JobsPageHeader
          }}
        >
          New Job
        </Button>
        
        <Button variant="outline" className="bg-slate-500 text-white hover:bg-slate-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 2v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </Button>
      </div>

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
      
      <JobsTable 
        onQuoteSelect={setSelectedQuoteId}
        searchClient={searchClient}
        searchJobNumber={searchJobNumber}
        filterStatus={filterStatus}
        filterDeposit={filterDeposit}
        filterOwner={filterOwner}
        filterMaker={filterMaker}
      />
    </div>
  );
};
