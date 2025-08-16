import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { QuoteViewer } from "@/components/jobs/QuoteViewer";
import { QuoteVersionHistory } from "@/components/quotes/QuoteVersionHistory";
import { CreateQuoteFromTreatments } from "@/components/quotes/CreateQuoteFromTreatments";
import { useQuotes } from "@/hooks/useQuotes";
import { useCopyQuote } from "@/hooks/useCopyQuote";
import { useEmailQuote } from "@/hooks/useEmailQuote";
import { useDownloadQuote } from "@/hooks/useDownloadQuote";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { formatCurrency } from "@/utils/currency";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Copy, 
  GitBranch,
  Mail,
  Download,
  Calendar,
  DollarSign,
  User,
  Building,
  SortAsc,
  SortDesc,
  Grid,
  List
} from "lucide-react";

interface EnhancedQuotesListProps {
  onNewQuote?: () => void;
  projectId?: string; // If provided, show quotes for specific project
  clientId?: string; // If provided, show quotes for specific client
}

type ViewMode = 'table' | 'grid';
type SortField = 'created_at' | 'total_amount' | 'quote_number' | 'status';
type SortDirection = 'asc' | 'desc';

export const EnhancedQuotesList: React.FC<EnhancedQuotesListProps> = ({ 
  onNewQuote, 
  projectId, 
  clientId 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  const { data: quotes = [], isLoading: quotesLoading } = useQuotes(projectId);
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();

  // Create lookup maps
  const clientMap = useMemo(() => 
    new Map(clients.map(client => [client.id, client])), 
    [clients]
  );
  const projectMap = useMemo(() => 
    new Map(projects.map(project => [project.id, project])), 
    [projects]
  );

  // Filter and sort quotes
  const filteredAndSortedQuotes = useMemo(() => {
    let filtered = quotes;

    // Filter by client if specified
    if (clientId) {
      filtered = filtered.filter(quote => quote.client_id === clientId);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(quote => 
        quote.quote_number?.toLowerCase().includes(term) ||
        quote.notes?.toLowerCase().includes(term) ||
        clientMap.get(quote.client_id)?.name?.toLowerCase().includes(term) ||
        projectMap.get(quote.project_id)?.name?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    // Sort quotes
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'total_amount') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [quotes, searchTerm, statusFilter, sortField, sortDirection, clientId, clientMap, projectMap]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  const handleViewQuote = (quote: any) => {
    setSelectedQuote(quote);
  };

  if (quotesLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading quotes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Quotes {clientId ? 'for Client' : projectId ? 'for Project' : ''}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredAndSortedQuotes.length} of {quotes.length} quotes
              </p>
            </div>
            <div className="flex items-center gap-2">
              {projectId && (
                <CreateQuoteFromTreatments projectId={projectId}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    From Treatments
                  </Button>
                </CreateQuoteFromTreatments>
              )}
              {onNewQuote && (
                <Button onClick={onNewQuote} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Quote
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quotes, clients, or projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-l-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quotes Display */}
          {filteredAndSortedQuotes.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No quotes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Create your first quote to get started'
                }
              </p>
              {onNewQuote && !searchTerm && statusFilter === 'all' && (
                <Button onClick={onNewQuote}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quote
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAndSortedQuotes.map((quote) => {
                const client = clientMap.get(quote.client_id);
                const project = projectMap.get(quote.project_id);
                
                return (
                  <Card key={quote.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{quote.quote_number}</h3>
                          <Badge className={getStatusColor(quote.status || 'draft')}>
                            {quote.status || 'draft'}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewQuote(quote)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <GitBranch className="h-4 w-4 mr-2" />
                              Versions
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(quote.total_amount || 0)}
                      </div>
                      
                      {client && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-2" />
                          {client.name}
                        </div>
                      )}
                      
                      {project && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Building className="h-4 w-4 mr-2" />
                          {project.name}
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(quote.created_at).toLocaleDateString()}
                      </div>
                      
                      {quote.valid_until && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          Valid until {new Date(quote.valid_until).toLocaleDateString()}
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewQuote(quote)} className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <QuoteVersionHistory quoteId={quote.id}>
                          <Button size="sm" variant="outline">
                            <GitBranch className="h-4 w-4" />
                          </Button>
                        </QuoteVersionHistory>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('quote_number')}
                    >
                      <div className="flex items-center gap-2">
                        Quote Number
                        {getSortIcon('quote_number')}
                      </div>
                    </TableHead>
                    {!clientId && (
                      <TableHead>Client</TableHead>
                    )}
                    {!projectId && (
                      <TableHead>Project</TableHead>
                    )}
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 text-right"
                      onClick={() => handleSort('total_amount')}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        Amount
                        {getSortIcon('total_amount')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        Created
                        {getSortIcon('created_at')}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedQuotes.map((quote) => {
                    const client = clientMap.get(quote.client_id);
                    const project = projectMap.get(quote.project_id);
                    
                    return (
                      <TableRow key={quote.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium">{quote.quote_number}</div>
                          {quote.notes && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {quote.notes}
                            </div>
                          )}
                        </TableCell>
                        {!clientId && (
                          <TableCell>
                            <div className="font-medium">{client?.name || 'Unknown'}</div>
                            {client?.email && (
                              <div className="text-sm text-muted-foreground">{client.email}</div>
                            )}
                          </TableCell>
                        )}
                        {!projectId && (
                          <TableCell>
                            <div className="font-medium">{project?.name || 'Unknown'}</div>
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge className={getStatusColor(quote.status || 'draft')}>
                            {quote.status || 'draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold">
                            {formatCurrency(quote.total_amount || 0)}
                          </div>
                          {quote.subtotal !== quote.total_amount && (
                            <div className="text-sm text-muted-foreground">
                              Subtotal: {formatCurrency(quote.subtotal || 0)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{new Date(quote.created_at).toLocaleDateString()}</div>
                          {quote.valid_until && (
                            <div className="text-sm text-muted-foreground">
                              Valid until {new Date(quote.valid_until).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewQuote(quote)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <QuoteVersionHistory quoteId={quote.id}>
                              <Button variant="ghost" size="sm">
                                <GitBranch className="h-4 w-4" />
                              </Button>
                            </QuoteVersionHistory>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Email
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Viewer Dialog */}
      {selectedQuote && (
        <QuoteViewer
          quote={selectedQuote}
          isEditable={true}
        >
          <div></div> {/* Hidden trigger */}
        </QuoteViewer>
      )}
    </div>
  );
};