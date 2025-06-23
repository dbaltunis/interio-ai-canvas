
import { useState } from "react";
import { JobsPageHeader } from "./JobsPageHeader";
import { JobsFilters } from "./JobsFilters";
import { JobsTable } from "./JobsTable";
import { ProjectQuoteTab } from "@/components/job-creation/ProjectQuoteTab";
import { useQuotes } from "@/hooks/useQuotes";

export const JobsPage = () => {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
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

  // If a quote is selected, show the ProjectQuoteTab
  if (selectedQuote) {
    return <ProjectQuoteTab project={selectedQuote} />;
  }

  return (
    <div className="space-y-6">
      <JobsPageHeader onQuoteSelect={setSelectedQuoteId} />
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
      <JobsTable onQuoteSelect={setSelectedQuoteId} />
    </div>
  );
};
