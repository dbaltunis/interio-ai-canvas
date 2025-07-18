import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, Phone, MapPin, FolderOpen, Building2, User, DollarSign, Calendar, MessageSquare, Edit, Trash2, Mail, ExternalLink } from "lucide-react";
import { useQuotes, useDeleteQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { useProjects, useUpdateProject } from "@/hooks/useProjects";
import { useEmails } from "@/hooks/useEmails";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EnhancedJobsManagementProps {
  onNewJob: () => void;
  onJobSelect: (jobId: string) => void;
  onClientEdit?: (clientId: string) => void;
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
  onClientEdit,
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
  const { data: emails } = useEmails();
  const { data: businessSettings } = useBusinessSettings();
  const deleteQuote = useDeleteQuote();
  const updateQuote = useUpdateQuote();
  const updateProject = useUpdateProject();
  const { toast } = useToast();

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

  const getCommunicationStats = (quoteId: string, clientId?: string) => {
    if (!emails || !clientId) return { emailCount: 0, lastContact: null };
    
    const clientEmails = emails.filter(email => email.client_id === clientId);
    const lastEmail = clientEmails.sort((a, b) => 
      new Date(b.sent_at || b.created_at).getTime() - new Date(a.sent_at || a.created_at).getTime()
    )[0];
    
    return {
      emailCount: clientEmails.length,
      lastContact: lastEmail?.sent_at || lastEmail?.created_at || null
    };
  };

  const formatCurrency = (amount: number) => {
    // Parse measurement_units JSON if it exists, otherwise use defaults
    let currency = 'USD';
    try {
      if (businessSettings?.measurement_units) {
        const units = JSON.parse(businessSettings.measurement_units);
        currency = units.currency || 'USD';
      }
    } catch (e) {
      console.warn('Could not parse measurement units:', e);
    }
    
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$', 
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };

    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const handleSendEmail = (clientId: string, quoteId: string) => {
    const client = clients?.find(c => c.id === clientId);
    if (!client?.email) {
      toast({
        title: "No Email Address",
        description: "This client doesn't have an email address on file.",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to emails with pre-selected client
    window.open(`/jobs?tab=emails&client=${clientId}&quote=${quoteId}`, '_blank');
  };

  const handleViewDocuments = (projectId: string) => {
    // Navigate to project documents
    window.open(`/projects/${projectId}?tab=documents`, '_blank');
  };

  const handleJobClick = (jobId: string) => {
    onJobSelect(jobId);
  };

  const handleClientClick = (clientId: string) => {
    if (onClientEdit) {
      onClientEdit(clientId);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    await deleteQuote.mutateAsync(jobId);
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
                  const commStats = getCommunicationStats(quote.id, client?.id);
                  
                  return (
                    <TableRow 
                      key={quote.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleJobClick(quote.id)}
                    >
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
                            Job #{project?.job_number || 'N/A'}
                          </div>
                          {project?.due_date && (
                            <div className="text-xs text-orange-600 flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              Due: {new Date(project.due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {client ? (
                          <div 
                            className="space-y-1 cursor-pointer hover:bg-blue-50 p-2 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClientClick(client.id);
                            }}
                          >
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
                            <div className="flex items-center space-x-1">
                              <Badge variant="outline" className={`text-xs ${
                                project.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                project.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                project.status === 'planning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-gray-50 text-gray-700 border-gray-200'
                              }`}>
                                {project.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {project.priority && (
                                <Badge variant="outline" className="text-xs">
                                  {project.priority.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No project</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={`${getStatusColor(quote.status)} border-0`} variant="secondary">
                          {quote.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            {formatCurrency(stats.totalValue)}
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
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`text-xs ${
                              commStats.emailCount > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
                              <Mail className="mr-1 h-3 w-3" />
                              {commStats.emailCount} emails
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              <FileText className="mr-1 h-3 w-3" />
                              1 quote
                            </Badge>
                          </div>
                          {commStats.lastContact && (
                            <div className="text-xs text-muted-foreground">
                              Last contact: {new Date(commStats.lastContact).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Edit Job"
                            onClick={(e) => {
                              e.stopPropagation();
                              onJobSelect(quote.id);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Delete Job"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Job</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this job? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteJob(quote.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Send Email"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendEmail(client?.id || '', quote.id);
                            }}
                            disabled={!client?.email}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="View Documents"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocuments(project?.id || '');
                            }}
                            disabled={!project?.id}
                          >
                            <ExternalLink className="h-4 w-4" />
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
