import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Send, 
  Eye, 
  MoreHorizontal,
  FileText,
  Copy,
  Trash2
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserCurrency, formatCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";

interface JobsListWithQuotesProps {
  onJobSelect: (jobId: string) => void;
  onCreateQuoteVersion: (projectId: string) => void;
  searchTerm: string;
  statusFilter: string;
}

export const JobsListWithQuotes = ({ 
  onJobSelect, 
  onCreateQuoteVersion, 
  searchTerm, 
  statusFilter 
}: JobsListWithQuotesProps) => {
  const { data: projects = [] } = useProjects();
  const { data: quotes = [] } = useQuotes();
  const { data: clients = [] } = useClients();
  const userCurrency = useUserCurrency();
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());

  // Filter projects based on search and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(project).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getClientName = (project: any) => {
    if (project.clients?.name) return project.clients.name;
    
    const client = clients.find(c => c.id === project.client_id);
    return client?.name || 'No Client';
  };

  const getProjectQuotes = (projectId: string) => {
    return quotes.filter(quote => quote.project_id === projectId);
  };

  const toggleJobExpansion = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  const toggleQuoteSelection = (quoteId: string) => {
    const newSelected = new Set(selectedQuotes);
    if (newSelected.has(quoteId)) {
      newSelected.delete(quoteId);
    } else {
      newSelected.add(quoteId);
    }
    setSelectedQuotes(newSelected);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'sent':
        return 'secondary';
      case 'accepted':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getQuoteVersion = (quotes: any[], index: number) => {
    return `Q-${(index + 1).toString().padStart(2, '0')}`;
  };

  const sendSelectedQuotes = () => {
    if (selectedQuotes.size === 0) return;
    
    // Implementation for sending multiple quotes
    console.log('Sending quotes:', Array.from(selectedQuotes));
    // TODO: Implement batch quote sending
  };

  return (
    <div className="space-y-4">
      {/* Batch Actions */}
      {selectedQuotes.size > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {selectedQuotes.size} quote{selectedQuotes.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={sendSelectedQuotes} size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Send Selected Quotes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedQuotes(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredProjects.map((project) => {
          const projectQuotes = getProjectQuotes(project.id);
          const isExpanded = expandedJobs.has(project.id);
          const clientName = getClientName(project);
          
          return (
            <Card key={project.id} className="overflow-hidden">
              <Collapsible 
                open={isExpanded} 
                onOpenChange={() => toggleJobExpansion(project.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        
                        <div>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <span className="font-mono">
                              {project.job_number || `JOB-${project.id.slice(-4)}`}
                            </span>
                            <span className="text-base font-normal">
                              {project.name}
                            </span>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {clientName} • Created {new Date(project.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                        <Badge variant={getStatusBadgeVariant(project.status)}>
                          {project.status?.replace('_', ' ')}
                        </Badge>
                        
                        {projectQuotes.length > 0 && (
                          <Badge variant="outline" className="bg-primary/10">
                            {projectQuotes.length} quote{projectQuotes.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onJobSelect(project.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Job
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCreateQuoteVersion(project.id)}>
                              <Plus className="mr-2 h-4 w-4" />
                              New Quote Version
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate Job
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Job
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4">
                    {projectQuotes.length === 0 ? (
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              No quotes generated yet
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onCreateQuoteVersion(project.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Quote
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-4 space-y-2">
                        {projectQuotes.map((quote, index) => (
                          <div 
                            key={quote.id}
                            className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={selectedQuotes.has(quote.id)}
                                onCheckedChange={() => toggleQuoteSelection(quote.id)}
                              />
                              
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-sm font-medium">
                                    {getQuoteVersion(projectQuotes, index)}
                                  </span>
                                  <Badge 
                                    variant={getStatusBadgeVariant(quote.status)}
                                    className="text-xs"
                                  >
                                    {quote.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Created {new Date(quote.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <span className="font-medium">
                                {formatCurrency(quote.total_amount || 0, userCurrency)}
                              </span>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview Quote
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Quote
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate Quote
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Quote
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No jobs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};