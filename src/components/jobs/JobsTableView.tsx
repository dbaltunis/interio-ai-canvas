import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Search, StickyNote, UserPlus, Lock, Unlock } from "lucide-react";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import type { MenuItem } from "@/components/ui/three-dot-menu";
import { JobNotesDialog } from "./JobNotesDialog";
import { JobTeamInviteDialog } from "./JobTeamInviteDialog";
import { useQuotes } from "@/hooks/useQuotes";

interface JobsTableViewProps {
  onJobSelect: (jobId: string) => void;
  showFilters?: boolean;
}

export const JobsTableView = ({ onJobSelect, showFilters = false }: JobsTableViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobForNotes, setSelectedJobForNotes] = useState<any>(null);
  const [selectedJobForInvite, setSelectedJobForInvite] = useState<any>(null);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { data: projects = [], isLoading } = useProjects();
  const { data: quotes = [] } = useQuotes();
  const { data: clients = [] } = useClients();

  // Create lookup maps for better performance
  const clientsMap = clients.reduce((acc, client) => {
    acc[client.id] = client;
    return acc;
  }, {} as Record<string, any>);

  const projectsMap = projects.reduce((acc, project) => {
    acc[project.id] = project;
    return acc;
  }, {} as Record<string, any>);

  const filteredQuotes = quotes.filter(quote => {
    const project = projectsMap[quote.project_id];
    const client = clientsMap[quote.client_id];
    const searchString = `${quote.quote_number} ${client?.name || ''} ${project?.name || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const toggleJobLock = async (quote: any) => {
    try {
      // TODO: Implement job lock/unlock functionality
      console.log('Toggle lock for job:', quote.id);
      // This would update the database with the new lock status
    } catch (error) {
      console.error('Error toggling job lock:', error);
    }
  };

  const handleMenuAction = (action: () => void, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Use setTimeout to prevent UI freezing
    setTimeout(() => {
      try {
        action();
      } catch (error) {
        console.error('Error executing menu action:', error);
      }
    }, 0);
  };

  const getMenuItems = (quote: any, project: any): MenuItem[] => [
    {
      label: "View Job",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => handleMenuAction(() => onJobSelect(quote.id))
    },
    {
      label: "Add Note",
      icon: <StickyNote className="h-4 w-4" />,
      onClick: () => handleMenuAction(() => {
        setSelectedJobForNotes({ quote, project });
        setShowNotesDialog(true);
      })
    },
    {
      label: "Invite Team Member",
      icon: <UserPlus className="h-4 w-4" />,
      onClick: () => handleMenuAction(() => {
        setSelectedJobForInvite({ quote, project });
        setShowInviteDialog(true);
      })
    },
    {
      label: quote.is_locked ? "Unlock Job" : "Lock Job",
      icon: quote.is_locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />,
      onClick: () => handleMenuAction(() => toggleJobLock(quote))
    },
    {
      label: "Copy Job",
      onClick: () => handleMenuAction(() => console.log('Copy job:', quote.id))
    },
    {
      label: "Delete Job",
      onClick: () => handleMenuAction(() => console.log('Delete job:', quote.id)),
      variant: "destructive"
    }
  ];

  const handleRowClick = (quoteId: string) => {
    onJobSelect(quoteId);
  };

  // Get currency symbol from settings (defaulting to USD for now)
  const getCurrencySymbol = () => {
    // TODO: Get this from business settings
    // For now, defaulting to USD
    return '$';
  };

  const formatCurrency = (amount: number) => {
    const currencySymbol = getCurrencySymbol();
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount).replace(/^/, currencySymbol);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          {showFilters && <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>}
        </div>
        <div className="border rounded-lg">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">All Jobs ({filteredQuotes.length})</h3>
          {showFilters && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>

        {/* Jobs Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Job Details</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Quote Total</TableHead>
                <TableHead>Team Member</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm ? "No jobs found matching your search" : "No jobs created yet"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotes.map((quote) => {
                  const project = projectsMap[quote.project_id];
                  const client = clientsMap[quote.client_id];
                  
                  return (
                    <TableRow 
                      key={quote.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(quote.id)}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center space-x-2">
                            <span>{quote.quote_number}</span>
                            {quote.is_locked && (
                              <Lock className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                          {project && (
                            <div className="text-sm text-gray-500">
                              {project.name} • Job #{project.job_number || 'N/A'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {client ? (
                          <div className="space-y-1">
                            <div className="font-medium">
                              {client.client_type === 'B2B' ? client.company_name : client.name}
                            </div>
                            {client.email && (
                              <div className="text-sm text-gray-500">{client.email}</div>
                            )}
                            {client.client_type && (
                              <Badge variant="outline" className="text-xs">
                                {client.client_type}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No client assigned</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium text-green-600">
                          {formatCurrency(quote.total_amount || 0)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                              {getInitials("InterioApp Admin")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">InterioApp Admin</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant={
                            quote.status === 'approved' ? 'default' :
                            quote.status === 'completed' ? 'secondary' :
                            'outline'
                          }
                        >
                          {quote.status}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-500">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </TableCell>
                      
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <ThreeDotMenu items={getMenuItems(quote, project)} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Notes Dialog */}
      <JobNotesDialog 
        open={showNotesDialog}
        onOpenChange={setShowNotesDialog}
        quote={selectedJobForNotes?.quote}
        project={selectedJobForNotes?.project}
      />

      {/* Team Invite Dialog */}
      <JobTeamInviteDialog 
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        quote={selectedJobForInvite?.quote}
        project={selectedJobForInvite?.project}
      />
    </>
  );
};
