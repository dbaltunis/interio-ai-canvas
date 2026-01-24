
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Eye, Edit, Copy, Calendar, DollarSign, User } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { formatUserDate } from "@/utils/dateFormatUtils";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface QuotesListViewProps {
  onNewQuote: () => void;
  onQuoteSelect: (quoteId: string) => void;
  onQuoteEdit: (quoteId: string) => void;
}

export const QuotesListView = ({ onNewQuote, onQuoteSelect, onQuoteEdit }: QuotesListViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});

  const { data: quotes, isLoading: quotesLoading } = useQuotes();
  const { data: clients } = useClients();
  const { units } = useMeasurementUnits();
  const currency = units.currency || 'USD';

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
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format dates using user preferences - batched and debounced
  useEffect(() => {
    const formatDates = async () => {
      if (!quotes || quotes.length === 0) return;
      
      const dateMap: Record<string, string> = {};
      
      // Batch format all dates at once
      await Promise.all(
        quotes.flatMap(quote => [
          quote.created_at ? formatUserDate(quote.created_at).then(formatted => {
            dateMap[`created_${quote.id}`] = formatted;
          }) : Promise.resolve(),
          quote.valid_until ? formatUserDate(quote.valid_until).then(formatted => {
            dateMap[`valid_${quote.id}`] = formatted;
          }) : Promise.resolve()
        ])
      );
      
      setFormattedDates(dateMap);
    };
    
    const timeoutId = setTimeout(formatDates, 100);
    return () => clearTimeout(timeoutId);
  }, [quotes]);

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
          <h2 className="text-xl font-bold text-foreground tracking-tight">Quotes</h2>
          <p className="text-sm text-muted-foreground">Manage your project quotes and estimates</p>
        </div>
        <Button onClick={onNewQuote} className="rounded-lg shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          New Quote
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search quotes by number or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-lg"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/50 transition-colors"
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
        <Card variant="elevated" className="p-12 text-center">
          <div className="space-y-4">
            <div className="p-4 bg-muted/40 rounded-2xl w-fit mx-auto">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground">No quotes found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm || filterStatus !== 'all' ? 
                'No quotes match your current filters.' : 
                'Get started by creating your first quote.'
              }
            </p>
            <Button onClick={onNewQuote} className="rounded-lg shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Create New Quote
            </Button>
          </div>
        </Card>
      ) : (
        <Card variant="elevated" className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/40">
                <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Quote Number</TableHead>
                <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Client</TableHead>
                <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Total Amount</TableHead>
                <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Created</TableHead>
                <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Valid Until</TableHead>
                <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => {
                const client = clientsMap[quote.client_id];
                return (
                  <TableRow key={quote.id} className="hover:bg-muted/40 cursor-pointer border-border/40 transition-colors group">
                    <TableCell 
                      className="font-medium text-primary hover:underline"
                      onClick={() => onQuoteSelect(quote.id)}
                    >
                      #{quote.quote_number || `QUOTE-${quote.id.slice(0, 8)}`}
                    </TableCell>
                    
                    <TableCell>
                      {client ? (
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-muted/60 rounded-lg">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{client.name}</div>
                            {client.company_name && (
                              <div className="text-xs text-muted-foreground">{client.company_name}</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic text-sm">No client</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(quote.status)}
                    </TableCell>
                    
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{formatCurrency(quote.total_amount || 0)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-sm">{formattedDates[`created_${quote.id}`] || <Skeleton className="h-4 w-24 inline-block" />}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-muted-foreground">
                      {quote.valid_until ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-sm">{formattedDates[`valid_${quote.id}`] || <Skeleton className="h-4 w-24 inline-block" />}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 text-sm">No expiry</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="rounded-lg">
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
        </Card>
      )}
    </div>
  );
};
