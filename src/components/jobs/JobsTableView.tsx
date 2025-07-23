import { useState, useEffect } from "react";
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
import { Eye, MoreHorizontal, Trash2, StickyNote, User, Copy } from "lucide-react";
import { useQuotes, useDeleteQuote, useUpdateQuote } from "@/hooks/useQuotes";
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
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { JobNotesDialog } from "./JobNotesDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmailStatusDisplay } from "./EmailStatusDisplay";
import { JobsPagination } from "./JobsPagination";

interface JobsTableViewProps {
  onJobSelect: (quote: any) => void;
  searchTerm: string;
  statusFilter: string;
}

const ITEMS_PER_PAGE = 20;

export const JobsTableView = ({ onJobSelect, searchTerm, statusFilter }: JobsTableViewProps) => {
  const { data: quotes = [], isLoading } = useQuotes();
  const { data: clients = [] } = useClients();
  const { toast } = useToast();
  const deleteQuote = useDeleteQuote();
  const updateQuote = useUpdateQuote();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<any>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedQuoteForNotes, setSelectedQuoteForNotes] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch = 
      quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(quote).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter || quote.projects?.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalItems = filteredQuotes.length;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientName = (quote: any) => {
    if (quote.clients?.name) {
      return quote.clients.name;
    }
    
    if (quote.client_id && clients.length > 0) {
      const client = clients.find(c => c.id === quote.client_id);
      if (client?.name) {
        return client.name;
      }
    }
    
    if (quote.projects?.client_id && clients.length > 0) {
      const client = clients.find(c => c.id === quote.projects.client_id);
      if (client?.name) {
        return client.name;
      }
    }
    
    return 'No Client';
  };

  const getClientForQuote = (quote: any) => {
    if (quote.clients) {
      return quote.clients;
    }
    
    if (quote.client_id && clients.length > 0) {
      const client = clients.find(c => c.id === quote.client_id);
      if (client) {
        return client;
      }
    }
    
    if (quote.projects?.client_id && clients.length > 0) {
      const client = clients.find(c => c.id === quote.projects.client_id);
      if (client) {
        return client;
      }
    }
    
    return null;
  };

  const getClientInitials = (clientName: string) => {
    if (clientName === 'No Client') return 'NC';
    const names = clientName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return clientName.substring(0, 2).toUpperCase();
  };

  const getClientAvatarColor = (clientName: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    const index = clientName.length % colors.length;
    return colors[index];
  };

  const getCurrentStatus = (quote: any) => {
    return quote.projects?.status || quote.status || 'draft';
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

  const handleJobCopy = async (jobId: string) => {
    const quote = quotes.find(q => q.id === jobId);
    if (quote) {
      try {
        console.log("Copying job:", jobId);
        toast({
          title: "Job Copied",
          description: "Job has been copied successfully",
        });
      } catch (error) {
        toast({
          title: "Error", 
          description: "Failed to copy job",
          variant: "destructive"
        });
      }
    }
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

  const handleNotesClick = (quote: any) => {
    setSelectedQuoteForNotes(quote);
    setNotesDialogOpen(true);
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
              <TableHead>Emails</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuotes.map((quote) => {
              const clientName = getClientName(quote);
              const client = getClientForQuote(quote);
              const currentStatus = getCurrentStatus(quote);
              
              return (
                <TableRow 
                  key={quote.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onJobSelect(quote)}
                >
                  <TableCell className="font-medium">
                    {quote.quote_number}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <EmailStatusDisplay 
                      jobId={quote.id}
                      clientEmail={client?.email}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`${getClientAvatarColor(clientName)} text-white text-xs font-medium`}>
                          {getClientInitials(clientName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{clientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(currentStatus)}
                    >
                      {currentStatus?.charAt(0).toUpperCase() + currentStatus?.slice(1).replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ${quote.total_amount?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-brand-primary text-white text-xs">
                          ME
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">You</span>
                    </div>
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
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Job
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => handleNotesClick(quote)}>
                            <StickyNote className="mr-2 h-4 w-4" />
                            Add Note
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
              );
            })}
          </TableBody>
        </Table>

        <JobsPagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      </div>

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

      <JobNotesDialog
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
        quote={selectedQuoteForNotes}
      />
    </>
  );
};
