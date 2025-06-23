
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { JobsTable } from "./JobsTable";
import { JobsFilters } from "./JobsFilters";

export const JobsPage = () => {
  const [activeTab, setActiveTab] = useState<"jobs" | "client">("jobs");
  const [showFilters, setShowFilters] = useState(false);
  
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

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
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
            Jobs (43)
          </Button>
          <Button
            variant={activeTab === "client" ? "default" : "ghost"}
            className={`rounded-l-none border-l-0 px-6 py-2 ${
              activeTab === "client" 
                ? "bg-gray-100 text-gray-900 border border-gray-300" 
                : "bg-white text-gray-600 border border-gray-300"
            }`}
            onClick={() => setActiveTab("client")}
          >
            Client (9)
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            className="bg-slate-600 hover:bg-slate-700 text-white px-6"
          >
            New Job
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-slate-500 text-white hover:bg-slate-600 px-4"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters - Show/Hide based on filter button */}
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
          onClearAll={handleClearAll}
        />
      )}
      
      <JobsTable 
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
