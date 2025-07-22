
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Trash2, Eye, Search, Calendar, User, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuotes, useDeleteQuote } from "@/hooks/useQuotes";
import { useDeleteProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { JobActionsMenu } from "./JobActionsMenu";

interface JobsTableViewProps {
  onJobSelect: (quote: any) => void;
  showFilters?: boolean;
}

export const JobsTableView = ({ onJobSelect, showFilters = false }: JobsTableViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: quotes = [], isLoading } = useQuotes();
  const { data: clients = [] } = useClients();
  const deleteQuote = useDeleteQuote();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.clients?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteJob = async (quote: any) => {
    try {
      console.log("Deleting job:", quote);
      
      // Delete the quote first
      if (quote.id) {
        await deleteQuote.mutateAsync(quote.id);
      }
      
      // Then delete the associated project if it exists
      if (quote.project_id) {
        await deleteProject.mutateAsync(quote.project_id);
      } else if (quote.projects?.id) {
        await deleteProject.mutateAsync(quote.projects.id);
      }
      
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "planning":
        return "bg-yellow-100 text-yellow-800";
      case "on_hold":
        return "bg-orange-100 text-orange-800";
      case "draft":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getDisplayStatus = (quote: any) => {
    // First check the project status if available
    if (quote.projects?.status) {
      return quote.projects.status.replace('_', ' ').toUpperCase();
    }
    // Fall back to quote status
    return quote.status?.replace('_', ' ').toUpperCase() || 'DRAFT';
  };

  const getClientDisplayName = (quote: any) => {
    // First try to get client from the quote's clients relationship
    if (quote.clients) {
      if (quote.clients.client_type === 'B2B' && quote.clients.company_name) {
        return quote.clients.company_name;
      }
      return quote.clients.name || 'Unknown Client';
    }
    
    // If no client in the relationship, try to find by client_id from our clients data
    if (quote.client_id && clients.length > 0) {
      const client = clients.find(c => c.id === quote.client_id);
      if (client) {
        if (client.client_type === 'B2B' && client.company_name) {
          return client.company_name;
        }
        return client.name || 'Unknown Client';
      }
    }
    
    // If project has client_id, try to find that client
    if (quote.projects?.client_id && clients.length > 0) {
      const client = clients.find(c => c.id === quote.projects.client_id);
      if (client) {
        if (client.client_type === 'B2B' && client.company_name) {
          return client.company_name;
        }
        return client.name || 'Unknown Client';
      }
    }
    
    return 'No Client';
  };

  const getClientForQuote = (quote: any) => {
    // First try to get client from the quote's clients relationship
    if (quote.clients) {
      return quote.clients;
    }
    
    // If no client in the relationship, try to find by client_id from our clients data
    if (quote.client_id && clients.length > 0) {
      const client = clients.find(c => c.id === quote.client_id);
      if (client) {
        return client;
      }
    }
    
    // If project has client_id, try to find that client
    if (quote.projects?.client_id && clients.length > 0) {
      const client = clients.find(c => c.id === quote.projects.client_id);
      if (client) {
        return client;
      }
    }
    
    return null;
  };

  const handleJobCopy = (jobId: string) => {
    console.log("Copying job:", jobId);
    toast({
      title: "Job Copied",
      description: "Job has been copied successfully",
    });
  };

  const handleJobEdit = (jobId: string) => {
    const quote = quotes.find(q => q.id === jobId);
    if (quote) {
      onJobSelect(quote);
    }
  };

  const handleJobView = (jobId: string) => {
    const quote = quotes.find(q => q.id === jobId);
    if (quote) {
      onJobSelect(quote);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Number</TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="text-gray-500 space-y-2">
                    <FileText className="h-8 w-8 mx-auto opacity-50" />
                    <p>No jobs found</p>
                    <p className="text-sm">Create your first job to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotes.map((quote) => (
                <TableRow 
                  key={quote.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onJobSelect(quote)}
                >
                  <TableCell className="font-medium">
                    #{quote.projects?.job_number || quote.quote_number || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {quote.projects?.name || 'Untitled Project'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {getClientDisplayName(quote)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quote.projects?.status || quote.status)}>
                      {getDisplayStatus(quote)}
                    </Badge>
                  </TableCell>
                  <TableCell>${quote.total_amount?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    {new Date(quote.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div onClick={(e) => e.stopPropagation()}>
                      <JobActionsMenu
                        quote={quote}
                        client={getClientForQuote(quote)}
                        project={quote.projects}
                        onJobCopy={handleJobCopy}
                        onJobEdit={handleJobEdit}
                        onJobView={handleJobView}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
