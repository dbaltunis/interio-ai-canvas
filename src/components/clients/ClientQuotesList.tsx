
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, Calendar, DollarSign, Eye } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";

interface ClientQuotesListProps {
  clientId: string;
}

export const ClientQuotesList = ({ clientId }: ClientQuotesListProps) => {
  const { data: allQuotes, isLoading } = useQuotes();
  
  // Filter quotes for this specific client
  const quotes = allQuotes?.filter(quote => quote.client_id === clientId) || [];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading quotes...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Client Quotes
          </CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No quotes found for this client</p>
            <Button className="mt-2" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create First Quote
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">
                      {quote.quote_number || `Quote #${quote.id.slice(0, 8)}`}
                    </div>
                    {quote.notes && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs mt-1">
                        {quote.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(quote.status || 'draft')} border`} variant="secondary">
                      {quote.status || 'draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center font-medium text-green-600">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {quote.total_amount?.toLocaleString('en-US', { 
                        style: 'currency', 
                        currency: 'USD' 
                      }) || '$0.00'}
                    </div>
                    {quote.subtotal !== quote.total_amount && (
                      <div className="text-sm text-muted-foreground">
                        Subtotal: {quote.subtotal?.toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'USD' 
                        }) || '$0.00'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'No expiry'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(quote.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
