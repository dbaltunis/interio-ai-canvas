
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, Calendar, DollarSign, User } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { EnhancedJobsView } from "./EnhancedJobsView";

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
  const [viewMode, setViewMode] = useState<'list' | 'enhanced'>('enhanced');
  const [searchTerm, setSearchTerm] = useState("");
  
  console.log("=== JOBS LIST VIEW RENDER ===");
  console.log("Applied filters:", {
    searchClient,
    searchJobNumber,
    filterStatus,
    filterDeposit,
    filterOwner,
    filterMaker
  });

  const { data: quotes, isLoading: quotesLoading, error: quotesError } = useQuotes();
  const { data: clients, isLoading: clientsLoading } = useClients();

  // Create client lookup for performance
  const clientsMap = useMemo(() => {
    if (!clients) return {};
    return clients.reduce((acc, client) => {
      acc[client.id] = client;
      return acc;
    }, {} as Record<string, any>);
  }, [clients]);

  // Filter and process quotes with error handling
  const processedJobs = useMemo(() => {
    console.log("Processing jobs with quotes:", quotes?.length || 0);
    console.log("Raw quotes data:", quotes);
    
    if (!quotes || quotes.length === 0) {
      console.log("No quotes available");
      return [];
    }

    try {
      const processed = quotes
        .map(quote => {
          console.log("Processing quote:", quote.id, quote);
          
          const client = quote.client_id ? clientsMap[quote.client_id] : null;
          console.log("Found client for quote:", client);
          
          return {
            ...quote,
            client,
            // Ensure we have required fields with defaults
            name: quote.name || quote.project_name || `Project ${quote.id?.slice(0, 8)}`,
            status: quote.status || 'planning',
            priority: quote.priority || 'medium',
            total_amount: quote.total_amount || 0,
            job_number: quote.job_number || `JOB-${quote.id?.slice(0, 8)}`,
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

          console.log("Filter matches for job", job.id, {
            matchesSearch,
            matchesClient,
            matchesJobNumber,
            matchesStatus
          });

          return matchesSearch && matchesClient && matchesJobNumber && matchesStatus;
        })
        .sort((a, b) => {
          // Sort by created date, newest first
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });

      console.log("Processed jobs count:", processed.length);
      return processed;
    } catch (error) {
      console.error("Error processing jobs:", error);
      return [];
    }
  }, [quotes, clientsMap, searchTerm, searchClient, searchJobNumber, filterStatus]);

  const handleJobEdit = (jobId: string) => {
    console.log("Editing job:", jobId);
    onJobSelect(jobId);
  };

  const handleJobView = (jobId: string) => {
    console.log("Viewing job details:", jobId);
    onJobSelect(jobId);
  };

  if (quotesLoading || clientsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (quotesError) {
    console.error("Jobs loading error:", quotesError);
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
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search jobs, clients, or job numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'enhanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('enhanced')}
          >
            Enhanced View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button onClick={onNewJob} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        </div>
      </div>

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
            <Button onClick={onNewJob} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Job
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {viewMode === 'enhanced' ? (
            // Enhanced Card View
            processedJobs.map((job) => (
              <EnhancedJobsView
                key={job.id}
                job={job}
                onEdit={handleJobEdit}
                onViewDetails={handleJobView}
              />
            ))
          ) : (
            // Simple List View
            processedJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{job.name}</h3>
                        <Badge variant="outline">{job.job_number}</Badge>
                        <Badge className={`${
                          job.status === 'completed' ? 'bg-green-100 text-green-800' :
                          job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {job.client?.name || 'No client'}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${(job.total_amount || 0).toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'No date'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleJobView(job.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleJobEdit(job.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
