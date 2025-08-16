import React, { useState, useEffect } from "react";
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
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useUsers } from "@/hooks/useUsers";
import { useJobStatuses } from "@/hooks/useJobStatuses";
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
import { JobsTableSkeleton } from "./skeleton/JobsTableSkeleton";
import { useUserCurrency, formatCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";
import { JobStatusBadge } from "./JobStatusBadge";

interface JobsTableViewProps {
  onJobSelect: (quote: any) => void;
  searchTerm: string;
  statusFilter: string;
}

const ITEMS_PER_PAGE = 20;

export const JobsTableView = ({ onJobSelect, searchTerm, statusFilter }: JobsTableViewProps) => {
  const { data: quotes = [], isLoading, refetch } = useQuotes();
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();
  const { data: users = [] } = useUsers();
  const { data: jobStatuses = [] } = useJobStatuses();
  const { toast } = useToast();
  const deleteQuote = useDeleteQuote();
  const updateQuote = useUpdateQuote();
  const userCurrency = useUserCurrency();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<any>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedQuoteForNotes, setSelectedQuoteForNotes] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

  const toggleJobExpansion = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Group quotes by project and filter
  const groupedData = projects.map(project => {
    const projectQuotes = quotes.filter(quote => quote.project_id === project.id);
    return {
      project,
      quotes: projectQuotes,
      isMatch: 
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClientName({ projects: project, client_id: project.client_id }).toLowerCase().includes(searchTerm.toLowerCase())
    };
  }).filter(group => {
    if (!group.isMatch && searchTerm) return false;
    if (statusFilter === 'all') return true;
    return group.project.status === statusFilter;
  });

  // Pagination logic  
  const totalItems = groupedData.length;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedGroups = groupedData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    // First check if we have custom status colors from the job_statuses table
    const customStatus = jobStatuses.find(s => s.name.toLowerCase() === status.toLowerCase());
    if (customStatus) {
      const colorMap: Record<string, string> = {
        'gray': 'bg-muted/30 text-muted-foreground border border-border dark:bg-muted/40 dark:text-muted-foreground dark:border-border/60',
        'blue': 'bg-primary/15 text-primary border border-primary/30 dark:bg-primary/25 dark:text-primary dark:border-primary/40', 
        'green': 'bg-accent/15 text-accent border border-accent/30 dark:bg-accent/25 dark:text-accent dark:border-accent/40',
        'yellow': 'bg-secondary/15 text-secondary border border-secondary/30 dark:bg-secondary/25 dark:text-secondary dark:border-secondary/40',
        'orange': 'bg-secondary/15 text-secondary border border-secondary/30 dark:bg-secondary/25 dark:text-secondary dark:border-secondary/40',
        'red': 'bg-destructive/15 text-destructive border border-destructive/30 dark:bg-destructive/25 dark:text-destructive dark:border-destructive/40',
        'primary': 'bg-primary/15 text-primary border border-primary/30 dark:bg-primary/25 dark:text-primary dark:border-primary/40',
      };
      return colorMap[customStatus.color] || 'bg-muted/30 text-muted-foreground border border-border dark:bg-muted/40 dark:text-muted-foreground dark:border-border/60';
    }
    
    // Fallback to default status colors (with improved dark-mode contrast)
    switch (status) {
      case 'draft':
        return 'bg-muted/30 text-muted-foreground border border-border dark:bg-muted/40 dark:text-muted-foreground dark:border-border/60';
      case 'sent':
      case 'planning':
        return 'bg-primary/15 text-primary border border-primary/30 dark:bg-primary/25 dark:text-primary dark:border-primary/40';
      case 'approved':
      case 'completed':
        return 'bg-accent/15 text-accent border border-accent/30 dark:bg-accent/25 dark:text-accent dark:border-accent/40';
      case 'rejected':
      case 'cancelled':
        return 'bg-destructive/15 text-destructive border border-destructive/30 dark:bg-destructive/25 dark:text-destructive dark:border-destructive/40';
      case 'in_progress':
        return 'bg-secondary/15 text-secondary border border-secondary/30 dark:bg-secondary/25 dark:text-secondary dark:border-secondary/40';
      default:
        return 'bg-muted/30 text-muted-foreground border border-border dark:bg-muted/40 dark:text-muted-foreground dark:border-border/60';
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
      'bg-primary',
      'bg-orange-500',
      'bg-secondary',
      'bg-indigo-500'
    ];
    const index = clientName.length % colors.length;
    return colors[index];
  };

  const getCurrentStatus = (quote: any) => {
    return quote.projects?.status || quote.status || 'draft';
  };

  const getOwnerInfo = (quote: any) => {
    if (!quote.user_id || users.length === 0) {
      return { firstName: 'Unknown', initials: 'UN', color: 'bg-gray-500' };
    }
    
    const owner = users.find(user => user.id === quote.user_id);
    if (owner) {
      const firstName = owner.name.split(' ')[0]; // Get only first name
      const initials = owner.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      
      // Generate color based on user ID for consistency
      const colors = [
        'bg-blue-500',
        'bg-green-500', 
        'bg-primary',
        'bg-orange-500',
        'bg-secondary',
        'bg-indigo-500',
        'bg-red-500',
        'bg-yellow-500',
        'bg-teal-500',
        'bg-cyan-500'
      ];
      const colorIndex = quote.user_id.charCodeAt(0) % colors.length;
      const color = colors[colorIndex];
      
      return { firstName, initials, color };
    }
    
    return { firstName: 'Unknown', initials: 'UN', color: 'bg-gray-500' };
  };

  const handleDeleteJob = async (quote: any) => {
    try {
      await deleteQuote.mutateAsync(quote.id);
      
      // Immediately refetch the quotes to update the UI
      await refetch();
      
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
      
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
    } catch (error) {
      console.error("Error deleting job:", error);
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
    return <JobsTableSkeleton />;
  }

  if (groupedData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No jobs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <>
      <div className="liquid-glass rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Job Number</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Emails</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Client</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Status</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Total</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Owner</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedGroups.map((group) => {
              const project = group.project;
              const quotes = group.quotes;
              const clientName = getClientName({ projects: project, client_id: project.client_id });
              const client = clients.find(c => c.id === project.client_id);
              
              return (
                <React.Fragment key={project.id}>
                  {/* Main Job Row */}
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onJobSelect({ id: project.id, projects: project })}
                  >
                    <TableCell className="font-medium">
                      <span 
                        title={project.job_number}
                        className="font-mono text-sm font-bold"
                      >
                        {project.job_number || `JOB-${project.id.slice(-4)}`}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <EmailStatusDisplay 
                        jobId={project.id}
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
                        <span className="text-sm font-medium">{clientName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <JobStatusBadge status={project.status || 'draft'} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {quotes.length > 0 ? formatCurrency(quotes[0].total_amount || 0, userCurrency) : formatCurrency(0, userCurrency)}
                        </span>
                        {quotes.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleJobExpansion(project.id);
                            }}
                          >
                            {expandedJobs.has(project.id) ? '−' : '+'} {quotes.length} quotes
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          {(() => {
                            const owner = users.find(user => user.id === project.user_id);
                            const ownerInfo = getOwnerInfo({ user_id: project.user_id });
                            const avatarUrl = owner?.avatar_url;
                            return avatarUrl ? (
                              <img 
                                src={avatarUrl} 
                                alt={ownerInfo.firstName}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                            ) : (
                              <AvatarFallback className={`${ownerInfo.color} text-white text-xs font-medium`}>
                                {ownerInfo.initials}
                              </AvatarFallback>
                            );
                          })()}
                        </Avatar>
                        <span className="text-sm text-muted-foreground truncate">
                          {getOwnerInfo({ user_id: project.user_id }).firstName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(project.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-popover text-popover-foreground border shadow-lg z-50">
                            <DropdownMenuItem onClick={() => onJobSelect({ id: project.id, projects: project })}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Job
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Quote Rows - only show if expanded */}
                  {expandedJobs.has(project.id) && quotes.map((quote, index) => (
                    <TableRow 
                      key={`${project.id}-quote-${index}`}
                      className="cursor-pointer hover:bg-muted/20 border-l-2 border-primary/20 bg-muted/5"
                      onClick={() => onJobSelect(quote)}
                    >
                      <TableCell className="pl-8">
                        <span className="font-mono text-sm text-muted-foreground">
                          ├─ Q-{(index + 1).toString().padStart(2, '0')}
                        </span>
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        Quote #{index + 1}
                      </TableCell>
                      <TableCell>
                        <JobStatusBadge status={quote.status || 'draft'} />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(quote.total_amount || 0, userCurrency)}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-muted-foreground text-sm">
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
                            <DropdownMenuContent align="end" className="w-48 bg-popover text-popover-foreground border shadow-lg z-50">
                              <DropdownMenuItem onClick={() => onJobSelect(quote)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Quote
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
                                Delete Quote
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
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
