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
import { Eye, MoreHorizontal, Trash2, StickyNote, User, Copy, Calendar, Columns3, FileDown, Archive, Workflow } from "lucide-react";
import { useQuotes, useDeleteQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { useProjects, useUpdateProject, useCreateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useUsers } from "@/hooks/useUsers";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { useToast } from "@/hooks/use-toast";
import { formatJobNumber } from "@/lib/format-job-number";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { generateQuotePDF } from "@/utils/generateQuotePDF";
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
import { useIsTablet } from "@/hooks/use-tablet";
import { MobileJobsView } from "./MobileJobsView";
import { useHasPermission } from "@/hooks/usePermissions";
import { useJobDuplicates } from "@/hooks/useJobDuplicates";
import { DuplicateJobIndicator } from "./DuplicateJobIndicator";

interface JobsTableViewProps {
  onJobSelect: (quote: any) => void;
  searchTerm: string;
  statusFilter: string;
  visibleColumns: Array<{ id: string; label: string; visible: boolean; order: number }>;
}

const ITEMS_PER_PAGE = 20;

export const JobsTableView = ({ onJobSelect, searchTerm, statusFilter, visibleColumns }: JobsTableViewProps) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { data: quotes = [], isLoading, refetch } = useQuotes();
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();
  const { data: users = [] } = useUsers();
  const { data: jobStatuses = [] } = useJobStatuses();
  const { toast } = useToast();
  const deleteQuote = useDeleteQuote();
  const updateQuote = useUpdateQuote();
  const queryClient = useQueryClient();
  const userCurrency = useUserCurrency();
  const canDeleteJobs = useHasPermission('delete_jobs');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<any>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedQuoteForNotes, setSelectedQuoteForNotes] = useState<any>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [projectToArchive, setProjectToArchive] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectNotes, setProjectNotes] = useState<Record<string, number>>({});
  const [projectAppointments, setProjectAppointments] = useState<Record<string, any[]>>({});
  const [duplicateData, setDuplicateData] = useState<Record<string, any>>({});
  const updateProject = useUpdateProject();
  const createProject = useCreateProject();

  // Filter columns for tablet view - show only 5 most important columns
  const tabletImportantColumns = ['job_no', 'client', 'status', 'total', 'actions'];
  const displayColumns = isTablet 
    ? visibleColumns.filter(col => tabletImportantColumns.includes(col.id))
    : visibleColumns;

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Fetch notes, appointments, and duplicate info for projects - OPTIMIZED
  useEffect(() => {
    const fetchIndicators = async () => {
      const projectIds = projects.map(p => p.id);
      if (projectIds.length === 0) return;

      // Batch ALL queries in parallel using Promise.all for maximum performance
      const [notesResult, appointmentsResult, duplicateChildrenResult] = await Promise.all([
        // Fetch notes count
        (supabase as any)
          .from('project_notes')
          .select('project_id', { count: 'exact', head: false })
          .in('project_id', projectIds),
        
        // Fetch appointments
        supabase
          .from('appointments')
          .select('*')
          .in('project_id', projectIds),
        
        // Fetch ALL duplicate children in ONE query instead of looping
        supabase
          .from('projects')
          .select('parent_job_id')
          .in('parent_job_id', projectIds)
          .not('parent_job_id', 'is', null)
      ]);

      // Process notes count
      const notesCount: Record<string, number> = {};
      (notesResult.data || []).forEach((note: any) => {
        notesCount[note.project_id] = (notesCount[note.project_id] || 0) + 1;
      });
      setProjectNotes(notesCount);

      // Process appointments
      const appointmentsMap: Record<string, any[]> = {};
      (appointmentsResult.data || []).forEach((apt: any) => {
        if (!appointmentsMap[apt.project_id]) {
          appointmentsMap[apt.project_id] = [];
        }
        appointmentsMap[apt.project_id].push(apt);
      });
      setProjectAppointments(appointmentsMap);

      // Process duplicates efficiently
      const duplicatesMap: Record<string, any> = {};
      
      // Count children for each project from the single batched query
      const childrenCounts: Record<string, number> = {};
      (duplicateChildrenResult.data || []).forEach((child: any) => {
        if (child.parent_job_id) {
          childrenCounts[child.parent_job_id] = (childrenCounts[child.parent_job_id] || 0) + 1;
        }
      });
      
      // Build duplicates map
      projects.forEach(project => {
        duplicatesMap[project.id] = {
          isDuplicate: !!project.parent_job_id,
          duplicateCount: childrenCounts[project.id] || 0
        };
      });
      
      setDuplicateData(duplicatesMap);
    };

    fetchIndicators();
  }, [projects]);

  // Realtime subscription for note updates
  useEffect(() => {
    const channel = supabase
      .channel('project-notes-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_notes'
        },
        (payload: any) => {
          const projectId = payload.new.project_id;
          if (projectId) {
            setProjectNotes(prev => ({
              ...prev,
              [projectId]: (prev[projectId] || 0) + 1
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'project_notes'
        },
        (payload: any) => {
          const projectId = payload.old.project_id;
          if (projectId) {
            setProjectNotes(prev => ({
              ...prev,
              [projectId]: Math.max((prev[projectId] || 0) - 1, 0)
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Helper function to get client name
  const getClientName = (quote: any) => {
    try {
      if (quote?.clients?.name) {
        return quote.clients.name;
      }
      
      if (quote?.client_id && clients.length > 0) {
        const client = clients.find(c => c?.id === quote.client_id);
        if (client?.name) {
          return client.name;
        }
      }
      
      if (quote?.projects?.client_id && clients.length > 0) {
        const client = clients.find(c => c?.id === quote.projects.client_id);
        if (client?.name) {
          return client.name;
        }
      }
      
      return 'No Client';
    } catch (error) {
      console.error('Error getting client name:', error);
      return 'No Client';
    }
  };

  // Group quotes by project and filter with error handling
  const groupedData = projects.map(project => {
    try {
      if (!project?.id) return null;
      
      const projectQuotes = quotes.filter(quote => quote?.project_id === project.id);
      const clientName = getClientName({ projects: project, client_id: project.client_id });
      
      return {
        project,
        quotes: projectQuotes,
        isMatch: 
          project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clientName.toLowerCase().includes(searchTerm.toLowerCase())
      };
    } catch (error) {
      console.error('Error processing project:', project?.id, error);
      return null;
    }
  }).filter(group => {
    if (!group) return false;
    if (!group.isMatch && searchTerm) return false;
    if (statusFilter === 'all') return true;
    return group.project?.status === statusFilter;
  }) as Array<{ project: any; quotes: any[]; isMatch: boolean }>;

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
      const projectId = quote.id; // This is actually the project ID
      
      // STEP 1: Delete quotes and quote_items first (prevents FK constraint violations)
      const { data: quotes, error: quotesListError } = await supabase
        .from('quotes')
        .select('id')
        .eq('project_id', projectId);
      
      if (quotes && quotes.length > 0) {
        // Delete quote_items first
        for (const q of quotes) {
          await supabase.from('quote_items').delete().eq('quote_id', q.id);
        }
        // Then delete quotes
        await supabase.from('quotes').delete().eq('project_id', projectId);
      }

      // STEP 2: Delete workshop_items associated with this project
      await supabase.from('workshop_items').delete().eq('project_id', projectId);

      // STEP 3: Delete treatments (including orphaned ones with null room_id)
      await supabase.from('treatments').delete().eq('project_id', projectId);

      // STEP 4: Delete surfaces
      await supabase.from('surfaces').delete().eq('project_id', projectId);

      // STEP 5: Delete rooms
      await supabase.from('rooms').delete().eq('project_id', projectId);

      // STEP 6: Finally delete the project itself
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (projectError) throw projectError;
      
      // Invalidate and refetch both quotes and projects
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["quotes"] });
      await queryClient.invalidateQueries({ queryKey: ["treatments"] });
      await queryClient.invalidateQueries({ queryKey: ["surfaces"] });
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      await queryClient.invalidateQueries({ queryKey: ["project-window-summaries"] });
      await refetch();
      
      toast({
        title: "Job Deleted",
        description: "Job and all associated data have been deleted",
        importance: 'silent',
      });
      
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
    } catch (error: any) {
      console.error("Error deleting job:", error);
      toast({
        title: "Failed to Delete",
        description: error.message || "Could not delete job. Please try again.",
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

  const handleDuplicateJob = async (project: any) => {
    try {
      toast({ title: "Duplicating job...", description: "This may take a moment" });
      
      // Duplicate the project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert([{
          ...project,
          id: undefined,
          created_at: undefined,
          updated_at: undefined,
          job_number: `${project.job_number}-COPY`,
          name: `${project.name} (Copy)`
        }])
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      // Copy rooms, surfaces, treatments, quotes etc
      const { data: rooms } = await supabase
        .from('rooms')
        .select('*')
        .eq('project_id', project.id);
      
      if (rooms && rooms.length > 0) {
        const roomsCopy = rooms.map(r => ({
          ...r,
          id: undefined,
          project_id: newProject.id
        }));
        await supabase.from('rooms').insert(roomsCopy);
      }
      
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["quotes"] });
      
      toast({
        title: "✓ Job Duplicated Successfully",
        description: `Created copy of job. Opening new job...`
      });
      
      window.location.href = `/?tab=projects&jobId=${newProject.id}`;
    } catch (error) {
      console.error('Error duplicating job:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate job. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportPDF = async (project: any) => {
    toast({
      title: "Export PDF",
      description: "Please open the job details to export PDF",
    });
  };

  const handleWorkflows = () => {
    toast({
      title: "Workflows",
      description: "Feature coming soon"
    });
  };

  const handleArchiveJob = async () => {
    if (!projectToArchive) return;
    
    try {
      const { data: archivedStatus } = await supabase
        .from("job_statuses")
        .select("id")
        .eq("user_id", projectToArchive.user_id)
        .eq("category", "Project")
        .eq("is_active", true)
        .ilike("name", "%completed%")
        .order("slot_number", { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (archivedStatus) {
        await updateProject.mutateAsync({
          id: projectToArchive.id,
          status_id: archivedStatus.id
        });

        toast({
          title: "Success",
          description: "Job archived successfully"
        });
        
        setArchiveDialogOpen(false);
        setProjectToArchive(null);
      } else {
        toast({
          title: "Info",
          description: "No 'Completed' status found. Create one in Settings to archive jobs.",
          variant: "default"
        });
        setArchiveDialogOpen(false);
      }
    } catch (error) {
      console.error('Error archiving job:', error);
      toast({
        title: "Error",
        description: "Failed to archive job. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleNoteSaved = (projectId: string) => {
    setProjectNotes(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || 0) + 1
    }));
  };

  const handleNoteDeleted = (projectId: string) => {
    setProjectNotes(prev => ({
      ...prev,
      [projectId]: Math.max((prev[projectId] || 0) - 1, 0)
    }));
  };

  // Show skeleton only for initial load, not on refetches (improves perceived performance)
  // The Index.tsx already shows JobsPageSkeleton during component load
  // So we skip showing another skeleton here to avoid double-loading states
  if (isLoading && groupedData.length === 0) {
    return <JobsTableSkeleton />;
  }

  // Return mobile view for mobile devices (AFTER all hooks are called)
  if (isMobile) {
    return <MobileJobsView onJobSelect={onJobSelect} searchTerm={searchTerm} statusFilter={statusFilter} />;
  }

  if (groupedData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No jobs found matching your criteria.</p>
      </div>
    );
  }

  // Helper function to render cell content
  const renderCellContent = (columnId: string, project: any, quotes: any[], clientName: string, client: any) => {
    switch (columnId) {
      case 'job_no':
        const dupInfo = duplicateData[project.id];
        return (
          <div className="flex items-center gap-1.5">
            <span 
              title={project.job_number}
              className="font-mono text-xs text-muted-foreground whitespace-nowrap"
            >
              {formatJobNumber(project.job_number)}
            </span>
            {dupInfo && dupInfo.isDuplicate && (
              <Copy className="h-3 w-3 text-orange-500 dark:text-orange-400" strokeWidth={2.5} />
            )}
            {dupInfo && dupInfo.duplicateCount > 0 && (
              <div className="flex items-center gap-0.5">
                <Copy className="h-3 w-3 text-blue-500 dark:text-blue-400" strokeWidth={2.5} />
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{dupInfo.duplicateCount}</span>
              </div>
            )}
          </div>
        );
      
      case 'client':
        return (
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
        );
      
      case 'total':
        // Show the project's quote total
        const convertedQuote = quotes.find(q => q.status && q.status.toLowerCase() !== 'draft');
        const displayQuote = convertedQuote || quotes[0];
        const totalAmount = displayQuote?.total_amount || 0;
        return (
          <span className="font-medium">
            {formatCurrency(totalAmount, userCurrency)}
          </span>
        );
      
      case 'status':
        return <JobStatusBadge statusId={project.status_id || null} fallbackText={project.status || "No Status"} />;
      
      case 'created':
        return (
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
        );
      
      case 'emails':
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <EmailStatusDisplay 
              jobId={project.id}
              clientEmail={client?.email}
            />
          </div>
        );
      
      case 'team':
        return (
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
        );
      
      case 'actions':
        return (
          <div onClick={(e) => e.stopPropagation()} className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                  {projectNotes[project.id] > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                      {projectNotes[project.id]}
                    </span>
                  )}
                  <MoreHorizontal className="h-4 w-4" />
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
                    <Badge variant="secondary" className="ml-auto">
                      {projectNotes[project.id]}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDuplicateJob(project)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate Job
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportPDF(project)}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export to PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleWorkflows}>
                  <Workflow className="mr-2 h-4 w-4" />
                  Workflows
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    setProjectToArchive(project);
                    setArchiveDialogOpen(true);
                  }}
                  className="text-orange-600 focus:text-orange-600"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Job
                </DropdownMenuItem>
                {canDeleteJobs && (
                  <DropdownMenuItem onClick={() => {
                    setQuoteToDelete({ id: project.id, projects: project });
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Job
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {displayColumns.map((column) => (
                <TableHead 
                  key={column.id}
                  className={`cursor-pointer hover:bg-muted/50 transition-colors font-normal ${column.id === 'actions' ? 'w-[70px]' : ''}`}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedGroups.map((group) => {
              const project = group.project;
              const quotes = group.quotes;
              const clientName = getClientName({ projects: project, client_id: project.client_id });
              const client = clients.find(c => c.id === project.client_id);
              
              return (
                <TableRow 
                  key={project.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onJobSelect({ id: project.id, projects: project })}
                >
                  {displayColumns.map((column) => (
                    <TableCell key={column.id}>
                      {renderCellContent(column.id, project, quotes, clientName, client)}
                    </TableCell>
                  ))}
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

      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this job? This will move it to Completed status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setArchiveDialogOpen(false);
              setProjectToArchive(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchiveJob}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <JobNotesDialog
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
        quote={selectedQuoteForNotes?.id ? selectedQuoteForNotes : null}
        project={selectedQuoteForNotes?.project ? selectedQuoteForNotes.project : selectedQuoteForNotes}
        onNoteSaved={handleNoteSaved}
        onNoteDeleted={handleNoteDeleted}
      />
    </>
  );
};
