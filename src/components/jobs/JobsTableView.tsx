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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Eye, MoreHorizontal, Trash2, StickyNote, User, Copy, Calendar } from "lucide-react";
import { useQuotes, useDeleteQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useUsers } from "@/hooks/useUsers";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { useToast } from "@/hooks/use-toast";
import { formatJobNumber } from "@/lib/format-job-number";
import { supabase } from "@/integrations/supabase/client";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileJobsView } from "./MobileJobsView";

interface JobsTableViewProps {
  onJobSelect: (quote: any) => void;
  searchTerm: string;
  statusFilter: string;
}

const ITEMS_PER_PAGE = 20;

export const JobsTableView = ({ onJobSelect, searchTerm, statusFilter }: JobsTableViewProps) => {
  const isMobile = useIsMobile();
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
  const [projectNotes, setProjectNotes] = useState<Record<string, number>>({});
  const [projectAppointments, setProjectAppointments] = useState<Record<string, any[]>>({});

  // Show loading during initial hydration
  if (isMobile === undefined) {
    return <JobsTableSkeleton />;
  }

  // Return mobile view for mobile devices (AFTER all hooks are called)
  if (isMobile) {
    return <MobileJobsView onJobSelect={onJobSelect} searchTerm={searchTerm} statusFilter={statusFilter} />;
  }

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

  // Fetch notes and appointments count for projects
  useEffect(() => {
    const fetchIndicators = async () => {
      const projectIds = projects.map(p => p.id);
      if (projectIds.length === 0) return;

      // Fetch notes count
      const { data: notesData } = await (supabase as any)
        .from('project_notes')
        .select('project_id', { count: 'exact', head: false })
        .in('project_id', projectIds);

      const notesCount: Record<string, number> = {};
      (notesData || []).forEach((note: any) => {
        notesCount[note.project_id] = (notesCount[note.project_id] || 0) + 1;
      });
      setProjectNotes(notesCount);

      // Fetch appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .in('project_id', projectIds);

      const appointmentsMap: Record<string, any[]> = {};
      (appointmentsData || []).forEach((apt: any) => {
        if (!appointmentsMap[apt.project_id]) {
          appointmentsMap[apt.project_id] = [];
        }
        appointmentsMap[apt.project_id].push(apt);
      });
      setProjectAppointments(appointmentsMap);
    };

    fetchIndicators();
  }, [projects]);

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
      'bg-info',
      'bg-success', 
      'bg-primary',
      'bg-warning',
      'bg-secondary',
      'bg-accent'
    ];
    const index = clientName.length % colors.length;
    return colors[index];
  };

  const getCurrentStatus = (quote: any) => {
    return quote.projects?.status || quote.status || 'draft';
  };

  const getOwnerInfo = (quote: any) => {
    if (!quote.user_id || users.length === 0) {
      return { firstName: 'Unknown', initials: 'UN', color: 'bg-muted' };
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
        'bg-info',
        'bg-success', 
        'bg-primary',
        'bg-warning',
        'bg-secondary',
        'bg-accent',
        'bg-destructive',
        'bg-info',
        'bg-success',
        'bg-primary'
      ];
      const colorIndex = quote.user_id.charCodeAt(0) % colors.length;
      const color = colors[colorIndex];
      
      return { firstName, initials, color };
    }
    
    return { firstName: 'Unknown', initials: 'UN', color: 'bg-muted' };
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
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors font-normal">Job No</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors font-normal">Client</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors font-normal">Total</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors font-normal">Status</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors font-normal">Created</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors font-normal">Emails</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors font-normal">Team</TableHead>
              <TableHead className="w-[70px] font-normal">Actions</TableHead>
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
                    <TableCell>
                      <span 
                        title={project.job_number}
                        className="font-mono text-xs text-muted-foreground whitespace-nowrap"
                      >
                        {formatJobNumber(project.job_number || `JOB-${project.id}`)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={`${getClientAvatarColor(clientName)} text-primary-foreground text-xs font-medium`}>
                            {clientName === 'No Client' ? '—' : getClientInitials(clientName)}
                          </AvatarFallback>
                        </Avatar>
                        {clientName === 'No Client' ? (
                          <span className="text-sm font-medium">—</span>
                        ) : (
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate max-w-[120px]" title={clientName}>
                              {clientName.split(' ')[0]}
                            </span>
                            {clientName.split(' ').length > 1 && (
                              <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={clientName}>
                                {clientName.split(' ').slice(1).join(' ')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
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
                      <JobStatusBadge status={project.status || 'draft'} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        {projectAppointments[project.id] && projectAppointments[project.id].length > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button 
                                className="relative hover:scale-110 transition-transform cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Calendar className="h-3.5 w-3.5 text-green-600" />
                                <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full border border-white" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0 pointer-events-auto z-[200]" align="start">
                              <div className="p-4">
                                <h4 className="font-semibold mb-3">Scheduled Appointments</h4>
                                <div className="space-y-2">
                                  {projectAppointments[project.id].map((appointment: any) => (
                                    <div key={appointment.id} className="p-3 bg-muted rounded-md">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{appointment.title}</p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(appointment.start_time).toLocaleString()}
                                          </p>
                                          {appointment.description && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {appointment.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <EmailStatusDisplay 
                        jobId={project.id}
                        clientEmail={client?.email}
                      />
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
                              <AvatarFallback className={`${ownerInfo.color} text-primary-foreground text-xs font-medium`}>
                                {ownerInfo.initials}
                              </AvatarFallback>
                            );
                          })()}
                        </Avatar>
                        <span className="text-sm text-muted-foreground truncate max-w-[100px]" title={getOwnerInfo({ user_id: project.user_id }).firstName}>
                          {getOwnerInfo({ user_id: project.user_id }).firstName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div onClick={(e) => e.stopPropagation()} className="relative">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                              <MoreHorizontal className="h-4 w-4" />
                              {projectNotes[project.id] > 0 && (
                                <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full border border-white flex items-center justify-center">
                                  <StickyNote className="h-2 w-2 text-white" />
                                </div>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-48 bg-popover text-popover-foreground border shadow-lg z-50">
                             <DropdownMenuItem onClick={() => onJobSelect({ id: project.id, projects: project })}>
                               <Eye className="mr-2 h-4 w-4" />
                               View Job
                             </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleNotesClick({ id: project.id, project: project })} className="relative">
                                 <StickyNote className="mr-2 h-4 w-4" />
                                 Write Note
                                 {projectNotes[project.id] > 0 && (
                                   <div className="ml-auto flex items-center">
                                     <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                                       <span className="text-[10px] font-semibold text-white">{projectNotes[project.id]}</span>
                                     </div>
                                   </div>
                                 )}
                               </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => onJobSelect({ id: project.id, projects: project })}>
                               <Copy className="mr-2 h-4 w-4" />
                               New Quote
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => {
                               setQuoteToDelete({ id: project.id, projects: project });
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
                  
                  {/* Quote Rows - only show if expanded */}
                  {expandedJobs.has(project.id) && quotes.map((quote, index) => (
                    <TableRow 
                      key={`${project.id}-quote-${index}`}
                      className="cursor-pointer hover:bg-muted/20 border-l-2 border-primary/20 bg-muted/5 h-12"
                      onClick={() => onJobSelect(quote)}
                      style={{ marginLeft: '10px' }}
                    >
                      <TableCell className="pl-6 py-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          ├─ Q-{(index + 1).toString().padStart(2, '0')}
                        </span>
                      </TableCell>
                      <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                        <EmailStatusDisplay 
                          jobId={quote.id}
                          clientEmail={getClientForQuote(quote)?.email}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm py-2">
                        Quote #{index + 1}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <JobStatusBadge status={quote.status || 'draft'} />
                          {quote.status === 'sent' && (
                            <Badge variant="outline" className="text-xs">
                              Sent
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        {formatCurrency(quote.total_amount || 0, userCurrency)}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            {(() => {
                              const owner = users.find(user => user.id === quote.user_id);
                              const ownerInfo = getOwnerInfo(quote);
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
                            {getOwnerInfo(quote).firstName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm py-2">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-2">
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
        quote={selectedQuoteForNotes?.id ? selectedQuoteForNotes : null}
        project={selectedQuoteForNotes?.project ? selectedQuoteForNotes.project : selectedQuoteForNotes}
      />
    </>
  );
};
