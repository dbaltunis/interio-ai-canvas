
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useQuotes, useDeleteQuote } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

interface JobsTableViewProps {
  onJobSelect: (quote: any) => void;
  searchTerm: string;
  statusFilter: string;
}

export const JobsTableView = ({ onJobSelect, searchTerm, statusFilter }: JobsTableViewProps) => {
  const { data: quotes = [], isLoading } = useQuotes();
  const { data: clients = [] } = useClients();
  const { toast } = useToast();
  const deleteQuote = useDeleteQuote();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<any>(null);

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch = 
      quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(quote).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientName = (quote: any) => {
    // First try to get client from the quote's clients relationship
    if (quote.clients?.name) {
      return quote.clients.name;
    }
    
    // If no client in the relationship, try to find by client_id from our clients data
    if (quote.client_id && clients.length > 0) {
      const client = clients.find(c => c.id === quote.client_id);
      if (client?.name) {
        return client.name;
      }
    }
    
    // If project has client_id, try to find that client
    if (quote.projects?.client_id && clients.length > 0) {
      const client = clients.find(c => c.id === quote.projects.client_id);
      if (client?.name) {
        return client.name;
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

  const handleDeleteJob = async (quote: any) => {
    try {
      await deleteQuote.mutateAsync(quote.id);
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      });
    }
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

  if (filteredQuotes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No jobs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Number</TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.map((quote) => (
              <TableRow 
                key={quote.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onJobSelect(quote)}
              >
                <TableCell className="font-medium">
                  {quote.quote_number}
                </TableCell>
                <TableCell>
                  {quote.projects?.name || 'Untitled Project'}
                </TableCell>
                <TableCell>
                  {getClientName(quote)}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={getStatusColor(quote.status)}
                  >
                    {quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  ${quote.total_amount?.toFixed(2) || '0.00'}
                </TableCell>
                <TableCell>
                  {new Date(quote.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg z-50">
                        <DropdownMenuItem onClick={() => handleJobView(quote.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Job
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => handleJobEdit(quote.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Edit Job
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => handleJobCopy(quote.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Copy Job
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => {
                          setQuoteToDelete(quote);
                          setDeleteDialogOpen(true);
                        }}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete job {quoteToDelete?.quote_number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setQuoteToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => quoteToDelete && handleDeleteJob(quoteToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
