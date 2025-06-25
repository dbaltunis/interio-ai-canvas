
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, Phone, MapPin, FolderOpen, Building2, User, DollarSign, Calendar, MessageSquare, Edit } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { NewJobPage } from "../job-creation/NewJobPage";
import { JobEditPage } from "../job-editor/JobEditPage";

interface EnhancedJobsManagementProps {
  onNewJob: () => void;
  onJobSelect: (jobId: string) => void;
  searchClient: string;
  searchJobNumber: string;
  filterStatus: string;
  filterDeposit: string;
  filterOwner: string;
  filterMaker: string;
}

export const EnhancedJobsManagement = ({
  onNewJob,
  onJobSelect,
  searchClient,
  searchJobNumber,
  filterStatus,
  filterDeposit,
  filterOwner,
  filterMaker
}: EnhancedJobsManagementProps) => {
  const { data: quotes, isLoading } = useQuotes();
  const { data: clients } = useClients();
  const { data: projects } = useProjects();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getClientInfo = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    return client;
  };

  const getProjectInfo = (projectId: string) => {
    const project = projects?.find(p => p.id === projectId);
    return project;
  };

  const getJobStats = (quoteId: string) => {
    const quote = quotes?.find(q => q.id === quoteId);
    const project = quote ? projects?.find(p => p.id === quote.project_id) : null;
    const client = quote ? clients?.find(c => c.id === quote.client_id) : null;
    
    return {
      totalValue: quote?.total_amount || 0,
      project,
      client,
      status: quote?.status || 'draft'
    };
  };

  // Apply filters
  const filteredQuotes = quotes?.filter(quote => {
    const client = getClientInfo(quote.client_id);
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
  }) || [];

  // Calculate stats
  const totalJobs = quotes?.length || 0;
  const activeJobs = quotes?.filter(q => q.status === 'approved').length || 0;
  const pendingJobs = quotes?.filter(q => q.status === 'pending').length || 0;
  const thisMonthJobs = quotes?.filter(quote => {
    const createdAt = new Date(quote.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdAt > thirtyDaysAgo;
  }).length || 0;

  if (isLoading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Pending Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{thisMonthJobs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Management</CardTitle>
          <CardDescription>Complete overview of your jobs and quotes</CardDescription>
        </CardHeader>
        <CardContent>
          {!filteredQuotes || filteredQuotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="mx-auto h-12 w-12 mb-4" />
              <p>No jobs found. Create your first job to get started!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Info</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Communication</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => {
                  const stats = getJobStats(quote.id);
                  const client = stats.client;
                  const project = stats.project;
                  
                  return (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {quote.quote_number}
                          </div>
                          {quote.notes && (
                            <div className="text-sm text-muted-foreground">
                              {quote.notes.length > 50 ? `${quote.notes.substring(0, 50)}...` : quote.notes}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground flex items-center">
                            <FileText className="mr-1 h-3 w-3" />
                            Quote #{quote.quote_number}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {client ? (
                          <div className="space-y-1">
                            <div className="font-medium">
                              {client.client_type === 'B2B' ? client.company_name : client.name}
                            </div>
                            {client.client_type === 'B2B' && client.contact_person && (
                              <div className="text-sm text-muted-foreground">
                                Contact: {client.contact_person}
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Badge className={`${client.client_type === 'B2B' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'} border-0 flex items-center space-x-1 w-fit`} variant="secondary">
                                {client.client_type === 'B2B' ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                <span>{client.client_type || 'B2C'}</span>
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No client</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {project ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {project.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {project.status}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No project</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={`${getStatusColor(quote.status)} border-0`} variant="secondary">
                          {quote.status}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            {stats.totalValue.toLocaleString('en-US', { 
                              style: 'currency', 
                              currency: 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            })}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {new Date(quote.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {quote.valid_until ? `Valid until ${new Date(quote.valid_until).toLocaleDateString()}` : 'No expiry'}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            0 emails
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <FileText className="mr-1 h-3 w-3" />
                            1 quote
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Edit Job"
                            onClick={() => onJobSelect(quote.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Send Email">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="View Documents">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
