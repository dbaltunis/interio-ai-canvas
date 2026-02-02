import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, FileText, Calendar, DollarSign, Eye } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { PixelDocumentIcon } from "@/components/icons/PixelArtIcons";
import { useFormattedDates } from "@/hooks/useFormattedDate";

interface ClientQuotesListProps {
  clientId: string;
}

export const ClientQuotesList = ({ clientId }: ClientQuotesListProps) => {
  const { data: allQuotes, isLoading } = useQuotes();
  const { units } = useMeasurementUnits();
  const currency = units.currency || 'USD';
  
  // Filter quotes for this specific client
  const quotes = allQuotes?.filter(quote => quote.client_id === clientId) || [];
  
  // Format dates using user preferences - useCallback prevents infinite re-render
  const getQuoteDate = useCallback((quote: any) => quote.created_at, []);
  const { formattedDates } = useFormattedDates(quotes, getQuoteDate);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-sm text-muted-foreground">Loading quotes...</div>;
  }

  return (
    <Card variant="analytics">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            Quotes
          </CardTitle>
          <Button size="sm" className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            New Quote
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {quotes.length === 0 ? (
          <div className="empty-state">
            <PixelDocumentIcon size={48} className="mx-auto mb-2" />
            <p className="empty-state-title">Ready to quote</p>
            <p className="empty-state-text text-xs">Create your first quote for this client</p>
            <Button size="sm" variant="outline" className="h-7 text-xs mt-2">
              <Plus className="h-3 w-3 mr-1" />
              Create Quote
            </Button>
          </div>
        ) : (
          <ScrollArea className="widget-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Quote</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Created</TableHead>
                  <TableHead className="text-xs"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id} className="hover:bg-muted/50">
                    <TableCell className="py-2">
                      <div className="text-sm font-medium">
                        {quote.quote_number || `#${quote.id.slice(0, 6)}`}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge className={`${getStatusColor(quote.status || 'draft')} border text-xs`} variant="secondary">
                        {quote.status || 'draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="text-sm font-medium text-green-600">
                        {quote.total_amount?.toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: currency 
                        }) || '$0.00'}
                      </span>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="text-xs text-muted-foreground">
                        {formattedDates[quote.id] || 'Loading...'}
                      </span>
                    </TableCell>
                    <TableCell className="py-2">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
