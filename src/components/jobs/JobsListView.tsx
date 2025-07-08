
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Grid, List, Eye, Edit, Trash2, Mail, FileText, Calendar, DollarSign, User, Building2, MapPin, Phone } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useToast } from "@/hooks/use-toast";
import { JobsStatsCards } from "./JobsStatsCards";
import { JobCard } from "./JobCard";
import { JobsTableView } from "./JobsTableView";

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

  const { data: quotes, isLoading } = useQuotes();
  const { data: clients } = useClients();
  const { data: projects } = useProjects();
  const { data: businessSettings } = useBusinessSettings();
  const { toast } = useToast();

  // Filter and sort quotes
  const filteredAndSortedQuotes = quotes?.filter(quote => {
    const client = clients?.find(c => c.id === quote.client_id);
    const clientName = client?.client_type === 'B2B' ? client?.company_name : client?.name;
    
    // Search filters
    if (searchClient && clientName && !clientName.toLowerCase().includes(searchClient.toLowerCase())) {
      return false;
    }
    
    if (searchJobNumber && !quote.quote_number.toLowerCase().includes(searchJobNumber.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (filterStatus !== "all" && quote.status !== filterStatus) {
      return false;
    }
    
    return true;
  })?.sort((a, b) => {
    const aValue = a[sortBy as keyof typeof a];
    const bValue = b[sortBy as keyof typeof b];
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <JobsStatsCards quotes={quotes} />

      {/* Jobs Management Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Jobs Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredAndSortedQuotes.length} job{filteredAndSortedQuotes.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Sort Controls */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="quote_number">Job Number</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="total_amount">Value</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>

              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>

              <Button onClick={onNewJob} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                New Job
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredAndSortedQuotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No jobs found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {quotes?.length === 0 
                  ? "Create your first job to get started!"
                  : "Try adjusting your filters to see more results."
                }
              </p>
              {quotes?.length === 0 && (
                <Button onClick={onNewJob}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Job
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedQuotes.map((quote) => (
                <JobCard
                  key={quote.id}
                  quote={quote}
                  client={clients?.find(c => c.id === quote.client_id)}
                  project={projects?.find(p => p.id === quote.project_id)}
                  onJobSelect={onJobSelect}
                  onClientEdit={onClientEdit}
                  onJobCopy={onJobCopy}
                  businessSettings={businessSettings}
                />
              ))}
            </div>
          ) : (
            <JobsTableView
              quotes={filteredAndSortedQuotes}
              clients={clients}
              projects={projects}
              onJobSelect={onJobSelect}
              onClientEdit={onClientEdit}
              onJobCopy={onJobCopy}
              businessSettings={businessSettings}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
