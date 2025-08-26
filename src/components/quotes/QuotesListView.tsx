
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Eye, Edit, Copy, Calendar, DollarSign, User } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";

interface QuotesListViewProps {
  onNewQuote: () => void;
  onQuoteSelect: (quoteId: string) => void;
  onQuoteEdit: (quoteId: string) => void;
}

export const QuotesListView = ({ onNewQuote, onQuoteSelect, onQuoteEdit }: QuotesListViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: quotes, isLoading: quotesLoading } = useQuotes();
  const { data: clients } = useClients();

  // Create client lookup
  const clientsMap = clients?.reduce((acc, client) => {
    acc[client.id] = client;
    return acc;
  }, {} as Record<string, any>) || {};

  // Filter quotes
  const filteredQuotes = quotes?.filter(quote => {
    const client = clientsMap[quote.client_id];
    const matchesSearch = !searchTerm || 
      quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (quotesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600">Loading quotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quotes</h2>
          <p className="text-gray-600">Manage your project quotes and estimates</p>
        </div>
        <Button onClick={onNewQuote} variant="brand">
          <Plus className="h-4 w-4 mr-2" />
          New Quote
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search quotes by number or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Quotes Table */}
      {filteredQuotes.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium">No quotes found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' ? 
                'No quotes match your current filters.' : 
                'Get started by creating your first quote.'
              }
            </p>
            <Button onClick={onNewQuote} className="bg-brand-primary hover:bg-brand-accent text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create New Quote
            </Button>
          </div>
        </Card>
      ) : (
        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-900">Quote Number</TableHead>
                <TableHead className="font-semibold text-gray-900">Client</TableHead>
                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                <TableHead className="font-semibold text-gray-900">Total Amount</TableHead>
                <TableHead className="font-semibold text-gray-900">Created</TableHead>
                <TableHead className="font-semibold text-gray-900">Valid Until</TableHead>
                <TableHead className="font-semibold text-gray-900 w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => {
                const client = clientsMap[quote.client_id];
                return (
                  <TableRow key={quote.id} className="hover:bg-gray-50 cursor-pointer group">
                    <TableCell 
                      className="font-medium text-brand-primary hover:underline"
                      onClick={() => onQuoteSelect(quote.id)}
                    >
                      #{quote.quote_number || `QUOTE-${quote.id.slice(0, 8)}`}
                    </TableCell>
                    
                    <TableCell>
                      {client ? (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{client.name}</div>
                            {client.company_name && (
                              <div className="text-xs text-gray-500">{client.company_name}</div>
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
                    
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>{formatCurrency(quote.total_amount || 0)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatDate(quote.created_at)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-gray-600">
                      {quote.valid_until ? (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(quote.valid_until)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No expiry</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onQuoteSelect(quote.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Quote
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onQuoteEdit(quote.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Quote
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate Quote
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
