
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, DollarSign, Search, Filter, X } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { JobActionsMenu } from "./JobActionsMenu";
import { EmailStatusIndicator } from "./EmailStatusIndicator";

interface JobsTableViewProps {
  onJobSelect: (quote: any) => void;
  searchTerm: string;
  statusFilter: string;
}

export const JobsTableView = ({ onJobSelect, searchTerm, statusFilter }: JobsTableViewProps) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);
  const { data: quotes = [], isLoading } = useQuotes();

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = !localSearchTerm || 
      quote.quote_number?.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      quote.projects?.name?.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      quote.clients?.name?.toLowerCase().includes(localSearchTerm.toLowerCase());
    
    const matchesStatus = localStatusFilter === 'all' || quote.status === localStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { bg: "bg-gray-100", text: "text-gray-800", label: "Draft" },
      sent: { bg: "bg-blue-100", text: "text-blue-800", label: "Sent" },
      accepted: { bg: "bg-green-100", text: "text-green-800", label: "Accepted" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
      expired: { bg: "bg-orange-100", text: "text-orange-800", label: "Expired" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
        {config.label}
      </Badge>
    );
  };

  const clearFilters = () => {
    setLocalSearchTerm("");
    setLocalStatusFilter("all");
  };

  const hasActiveFilters = localSearchTerm || localStatusFilter !== 'all';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search jobs..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={localStatusFilter} onValueChange={setLocalStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results Info */}
      {filteredQuotes.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {filteredQuotes.length} of {quotes.length} jobs
          {hasActiveFilters && filteredQuotes.length < quotes.length && (
            <span> (filtered)</span>
          )}
        </div>
      )}

      {/* Jobs Table */}
      {filteredQuotes.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">Job Number</TableHead>
                  <TableHead className="font-semibold text-gray-900">Project & Communication</TableHead>
                  <TableHead className="font-semibold text-gray-900">Client</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900">Value</TableHead>
                  <TableHead className="font-semibold text-gray-900">Date</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id} className="hover:bg-gray-50 cursor-pointer group">
                    <TableCell 
                      className="font-medium text-brand-primary hover:underline"
                      onClick={() => onJobSelect(quote)}
                    >
                      #{quote.quote_number}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        <div 
                          className="font-medium text-gray-900 group-hover:text-brand-primary cursor-pointer"
                          onClick={() => onJobSelect(quote)}
                        >
                          {quote.projects?.name || 'Untitled Project'}
                        </div>
                        <EmailStatusIndicator 
                          clientId={quote.client_id} 
                          projectId={quote.project_id}
                        />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {quote.clients ? (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{quote.clients.name}</div>
                            {quote.clients.company_name && (
                              <div className="text-xs text-gray-500">{quote.clients.company_name}</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">No client</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(quote.status)}
                    </TableCell>
                    
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>{formatCurrency(quote.total_amount)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatDate(quote.created_at)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div onClick={(e) => e.stopPropagation()}>
                        <JobActionsMenu 
                          quote={quote}
                          client={quote.clients}
                          project={quote.projects}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : hasActiveFilters ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
            <p className="text-gray-600 mb-4">
              No jobs match your current search and filter criteria.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Jobs Yet</h3>
            <p className="text-gray-600">
              Create your first job to get started with project management.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
