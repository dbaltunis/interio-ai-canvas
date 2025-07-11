
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useToast } from "@/hooks/use-toast";
import { JobsStatsCards } from "./JobsStatsCards";
import { JobCard } from "./JobCard";
import { JobsTableView } from "./JobsTableView";
import { KPICustomizer } from "./KPICustomizer";

interface JobsListViewProps {
  onNewJob: () => void;
  onJobSelect: (jobId: string) => void;
  onClientEdit?: (clientId: string) => void;
  onJobCopy?: (jobId: string) => void;
  searchClient: string;
  searchJobNumber: string;
  filterStatus: string;
  filterDeposit: string;
  filterOwner: string;
  filterMaker: string;
}

const ITEMS_PER_PAGE = 20;

export const JobsListView = ({
  onNewJob,
  onJobSelect,
  onClientEdit,
  onJobCopy,
  searchClient,
  searchJobNumber,
  filterStatus,
  filterDeposit,
  filterOwner,
  filterMaker
}: JobsListViewProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: quotes = [], isLoading, error } = useQuotes();
  const { data: clients } = useClients();
  const { data: projects } = useProjects();
  const { data: businessSettings } = useBusinessSettings();
  const { toast } = useToast();

  console.log("=== JOBS LIST VIEW RENDER ===");
  console.log("Quotes data:", quotes);
  console.log("Clients data:", clients);
  console.log("Projects data:", projects);
  console.log("Loading states:", { isLoading, error });

  // Handle loading and error states
  if (isLoading) {
    console.log("JobsListView: Still loading data");
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error("JobsListView: Error loading jobs:", error);
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-4">
          <div className="text-red-500">Error loading jobs: {error.message}</div>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Safe filtering with enhanced error handling and logging
  const filteredQuotes = quotes.filter(quote => {
    if (!quote) {
      console.warn("JobsListView: Found null/undefined quote in quotes array");
      return false;
    }

    try {
      const client = clients?.find(c => c?.id === quote.client_id);
      const clientName = client?.client_type === 'B2B' ? client?.company_name : client?.name;
      
      console.log(`Filtering quote ${quote.id}:`, {
        quote: quote.quote_number,
        clientName,
        status: quote.status,
        searchClient,
        searchJobNumber,
        filterStatus
      });
      
      // Search filters
      if (searchClient && clientName && !clientName.toLowerCase().includes(searchClient.toLowerCase())) {
        console.log(`Quote ${quote.id} filtered out by client search`);
        return false;
      }
      
      if (searchJobNumber && quote.quote_number && !quote.quote_number.toLowerCase().includes(searchJobNumber.toLowerCase())) {
        console.log(`Quote ${quote.id} filtered out by job number search`);
        return false;
      }
      
      // Status filter
      if (filterStatus !== "all" && quote.status !== filterStatus) {
        console.log(`Quote ${quote.id} filtered out by status filter`);
        return false;
      }
      
      console.log(`Quote ${quote.id} passed all filters`);
      return true;
    } catch (error) {
      console.error("Error filtering quote:", quote?.id, error);
      // Include the quote if there's an error to avoid losing data
      return true;
    }
  });

  console.log("Filtered quotes:", filteredQuotes.length, "out of", quotes.length);

  const sortedQuotes = filteredQuotes.sort((a, b) => {
    if (!a || !b) {
      console.warn("JobsListView: Found null quotes in sorting");
      return 0;
    }

    try {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    } catch (error) {
      console.error("Error sorting quotes:", error);
      return 0;
    }
  });

  console.log("Sorted quotes:", sortedQuotes.length);

  // Pagination
  const totalPages = Math.ceil(sortedQuotes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedQuotes = sortedQuotes.slice(startIndex, endIndex);

  console.log("Pagination:", { totalPages, currentPage, startIndex, endIndex, paginatedQuotes: paginatedQuotes.length });

  const handlePageChange = (page: number) => {
    console.log("Page change:", page);
    setCurrentPage(page);
  };

  const handleNewJobClick = () => {
    console.log("New Job button clicked");
    if (onNewJob) {
      onNewJob();
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Job Overview</h2>
      </div>
      <JobsStatsCards quotes={quotes} />

      {/* Jobs Management Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Jobs Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Showing {startIndex + 1}-{Math.min(endIndex, sortedQuotes.length)} of {sortedQuotes.length} jobs
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleNewJobClick} 
                className="bg-primary hover:bg-primary/90"
                type="button"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Job
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {paginatedQuotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No jobs found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {quotes.length === 0 
                  ? "Create your first job to get started!"
                  : "Try adjusting your filters to see more results."
                }
              </p>
              {quotes.length === 0 && (
                <Button onClick={handleNewJobClick} type="button">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Job
                </Button>
              )}
            </div>
          ) : (
            <>
              <JobsTableView
                quotes={paginatedQuotes}
                clients={clients}
                projects={projects}
                onJobSelect={onJobSelect}
                onClientEdit={onClientEdit}
                onJobCopy={onJobCopy}
                businessSettings={businessSettings}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
