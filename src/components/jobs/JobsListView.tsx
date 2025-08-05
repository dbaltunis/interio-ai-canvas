
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { useUsers } from "@/hooks/useUsers";
import { JobsHeader } from "./JobsHeader";
import { JobGridView } from "./JobGridView";
import { JobListView } from "./JobListView";
import { JobsFilters } from "./JobsFilters";
import { JobsGridSkeleton } from "./skeleton/JobsGridSkeleton";
import { JobsListSkeleton } from "./skeleton/JobsListSkeleton";

interface JobsListViewProps {
  onNewJob: () => void;
  onJobSelect: (jobId: string) => void;
  onClientEdit: (clientId: string) => void;
  onJobCopy?: (jobId: string) => void;
  searchClient: string;
  searchJobNumber: string;
  filterStatus: string;
  filterDeposit: string;
  filterOwner: string;
  filterMaker: string;
}

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_created");
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: quotes, isLoading: quotesLoading, error: quotesError } = useQuotes();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: users, isLoading: usersLoading } = useUsers();

  // Create lookup maps for performance
  const clientsMap = useMemo(() => {
    if (!clients) return {};
    return clients.reduce((acc, client) => {
      acc[client.id] = client;
      return acc;
    }, {} as Record<string, any>);
  }, [clients]);

  const usersMap = useMemo(() => {
    if (!users) return {};
    return users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, any>);
  }, [users]);

  // Filter and process quotes with error handling
  const processedJobs = useMemo(() => {
    if (!quotes || quotes.length === 0) {
      return [];
    }

    try {
      const processed = quotes
        .map(quote => {
          const client = quote.client_id ? clientsMap[quote.client_id] : null;
          const project = null;
          const owner = quote.user_id ? usersMap[quote.user_id] : null;
          
          return {
            ...quote,
            client,
            project,
            owner,
            name: project?.name || quote.quote_number || `Quote ${quote.id?.slice(0, 8)}`,
            status: project?.status || quote.status || 'draft',
            priority: project?.priority || 'medium',
            total_amount: quote.total_amount || 0,
            job_number: project?.job_number || quote.quote_number || `QUOTE-${quote.id?.slice(0, 8)}`,
            start_date: project?.start_date,
            due_date: project?.due_date,
            completion_date: project?.completion_date,
            description: project?.description || quote.notes,
          };
        })
        .filter(job => {
          // Apply search filters
          const matchesSearch = !searchTerm || 
            job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesClient = !searchClient || 
            job.client?.name?.toLowerCase().includes(searchClient.toLowerCase());

          const matchesJobNumber = !searchJobNumber || 
            job.job_number?.toLowerCase().includes(searchJobNumber.toLowerCase());

          const matchesStatus = filterStatus === 'all' || job.status === filterStatus;

          return matchesSearch && matchesClient && matchesJobNumber && matchesStatus;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case "job_number":
              return (a.job_number || '').localeCompare(b.job_number || '');
            case "client_name":
              return (a.client?.name || '').localeCompare(b.client?.name || '');
            case "status":
              return a.status.localeCompare(b.status);
            case "value":
              return (b.total_amount || 0) - (a.total_amount || 0);
            case "date_created":
            default:
              return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          }
        });

      return processed;
    } catch (error) {
      console.error("Error processing jobs:", error);
      return [];
    }
  }, [quotes, clientsMap, usersMap, searchTerm, searchClient, searchJobNumber, filterStatus, sortBy]);

  const handleJobEdit = (jobId: string) => {
    onJobSelect(jobId);
  };

  const handleJobView = (jobId: string) => {
    onJobSelect(jobId);
  };

  if (quotesLoading || clientsLoading || usersLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16">
          {/* Header skeleton placeholder */}
        </div>
        {viewMode === 'grid' ? <JobsGridSkeleton /> : <JobsListSkeleton />}
      </div>
    );
  }

  if (quotesError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <p className="text-red-600">Error loading jobs</p>
          <p className="text-sm text-gray-500">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <JobsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onNewJob={onNewJob}
        jobsCount={processedJobs.length}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <JobsFilters
            searchClient={searchClient}
            setSearchClient={() => {}}
            searchJobNumber={searchJobNumber}
            setSearchJobNumber={() => {}}
            filterStatus={filterStatus}
            setFilterStatus={() => {}}
            filterDeposit={filterDeposit}
            setFilterDeposit={() => {}}
            filterOwner={filterOwner}
            setFilterOwner={() => {}}
            filterMaker={filterMaker}
            setFilterMaker={() => {}}
            onClearAll={() => {}}
          />
        </div>
      )}

      {/* Jobs Display */}
      {processedJobs.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium">No jobs found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || searchClient || searchJobNumber ? 
                'No jobs match your current filters.' : 
                'Get started by creating your first job.'
              }
            </p>
            <Button onClick={onNewJob} className="bg-brand-primary hover:bg-brand-accent text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {viewMode === 'grid' ? (
            <JobGridView
              jobs={processedJobs}
              onJobEdit={handleJobEdit}
              onJobView={handleJobView}
              onJobCopy={onJobCopy}
            />
          ) : (
            <JobListView
              jobs={processedJobs}
              onJobEdit={handleJobEdit}
              onJobView={handleJobView}
              onJobCopy={onJobCopy}
            />
          )}
        </div>
      )}
    </div>
  );
};
