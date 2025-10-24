import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, MoreVertical, Trash2, StickyNote, Copy, MapPin, DollarSign } from "lucide-react";
import { useQuotes, useDeleteQuote } from "@/hooks/useQuotes";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatJobNumber } from "@/lib/format-job-number";
import { useUserCurrency, formatCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";
import { JobStatusBadge } from "./JobStatusBadge";
import { JobNotesDialog } from "./JobNotesDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
} from "@/components/ui/alert-dialog";

interface MobileJobsViewProps {
  onJobSelect: (quote: any) => void;
  searchTerm: string;
  statusFilter: string;
}

export const MobileJobsView = ({ onJobSelect, searchTerm, statusFilter }: MobileJobsViewProps) => {
  const { data: quotes = [], isLoading } = useQuotes();
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();
  const { toast } = useToast();
  const deleteQuote = useDeleteQuote();
  const userCurrency = useUserCurrency();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<any>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedQuoteForNotes, setSelectedQuoteForNotes] = useState<any>(null);
  const [projectNotes, setProjectNotes] = useState<Record<string, number>>({});

  // Fetch notes count for projects
  useEffect(() => {
    const fetchNotesCount = async () => {
      const projectIds = projects.map(p => p.id);
      if (projectIds.length === 0) return;

      const { data: notesData } = await (supabase as any)
        .from('project_notes')
        .select('project_id', { count: 'exact', head: false })
        .in('project_id', projectIds);

      const notesCount: Record<string, number> = {};
      (notesData || []).forEach((note: any) => {
        notesCount[note.project_id] = (notesCount[note.project_id] || 0) + 1;
      });
      setProjectNotes(notesCount);
    };

    fetchNotesCount();
  }, [projects]);

  const filteredQuotes = quotes.filter((quote) => {
    const project = projects.find((p) => p.id === quote.project_id);
    
    // Get client from multiple possible locations
    let client = clients.find((c) => c.id === quote.client_id);
    if (!client && project?.client_id) {
      client = clients.find((c) => c.id === project.client_id);
    }
    
    const matchesSearch = 
      quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-4 pb-20 animate-fade-in bg-background/50">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse rounded-xl border-border/40">
            <CardContent className="p-4">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getClientName = (quote: any, project: any) => {
    // Check if quote has clients relation
    if (quote.clients?.name) {
      return quote.clients.name;
    }
    
    // Check quote's direct client_id
    if (quote.client_id && clients.length > 0) {
      const client = clients.find(c => c.id === quote.client_id);
      if (client?.name) {
        return client.name;
      }
    }
    
    // Check project's client_id
    if (project?.client_id && clients.length > 0) {
      const client = clients.find(c => c.id === project.client_id);
      if (client?.name) {
        return client.name;
      }
    }
    
    return 'No Client';
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

  const handleDeleteClick = (quote: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuoteToDelete(quote);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quoteToDelete) return;
    
    try {
      await deleteQuote.mutateAsync(quoteToDelete.id);
      toast({
        title: "Success",
        description: "Quote deleted successfully",
      });
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete quote",
        variant: "destructive",
      });
    }
  };

  const handleNotesClick = (quote: any, project: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedQuoteForNotes({ ...quote, project });
    setNotesDialogOpen(true);
  };

  const handleNewQuote = async (project: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { data, error } = await supabase
        .from('quotes')
        .insert([{
          project_id: project.id,
          client_id: project.client_id,
          status: 'draft',
          total_amount: 0,
          user_id: project.user_id,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "New quote created successfully",
      });
      
      onJobSelect(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new quote",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3 p-4 pb-20 animate-fade-in bg-background/50" data-create-project>
      {filteredQuotes.map((quote) => {
        const project = projects.find((p) => p.id === quote.project_id);
        const clientName = getClientName(quote, project);
        const initials = getClientInitials(clientName);
        const avatarColor = getClientAvatarColor(clientName);
        const notesCount = project ? projectNotes[project.id] || 0 : 0;
        
        return (
          <Card 
            key={quote.id} 
            className="overflow-hidden cursor-pointer hover:shadow-md transition-all rounded-xl border-border/40 bg-card"
            onClick={() => onJobSelect(quote)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className={`${avatarColor} text-primary-foreground text-xs font-semibold`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {formatJobNumber(project?.job_number || quote.quote_number)}
                        </span>
                        <JobStatusBadge status={project?.status || quote.status} />
                      </div>
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {clientName.length > 14 ? clientName.substring(0, 14) + '...' : clientName}
                      </h4>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0 relative">
                          {notesCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                              {notesCount}
                            </span>
                          )}
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onJobSelect(quote);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleNotesClick(quote, project, e)}>
                          <StickyNote className="h-4 w-4 mr-2" />
                          Write Note
                          {notesCount > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {notesCount}
                            </Badge>
                          )}
                        </DropdownMenuItem>
                        {project && (
                          <DropdownMenuItem onClick={(e) => handleNewQuote(project, e)}>
                            <Copy className="h-4 w-4 mr-2" />
                            New Quote
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => handleDeleteClick(quote, e)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {project?.name && (
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{project.name}</span>
                      </div>
                    )}
                    {quote.total_amount && (
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="font-semibold">
                          {formatCurrency(quote.total_amount, userCurrency)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Dialogs */}
      <JobNotesDialog
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
        quote={selectedQuoteForNotes}
        project={selectedQuoteForNotes?.project}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quote? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
