
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuotes } from "@/hooks/useQuotes";
import { FileText } from "lucide-react";

interface JobsTableProps {
  onQuoteSelect?: (quoteId: string) => void;
}

export const JobsTable = ({ onQuoteSelect }: JobsTableProps) => {
  const { data: quotes } = useQuotes();

  if (!quotes || quotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No quotes yet</h3>
          <p className="text-muted-foreground">
            Create your first quote to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {quotes.map((quote) => (
        <Card key={quote.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{quote.quote_number}</CardTitle>
                <p className="text-muted-foreground">
                  Client ID: {quote.client_id.slice(0, 8)}...
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={quote.status === 'accepted' ? 'default' : 'secondary'}>
                  {quote.status}
                </Badge>
                <Button 
                  onClick={() => onQuoteSelect?.(quote.id)}
                  variant="outline"
                >
                  Open Quote
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ${quote.total_amount.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
