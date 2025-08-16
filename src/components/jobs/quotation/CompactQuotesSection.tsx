import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Eye, Mail, StickyNote } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { QuoteViewer } from "../QuoteViewer";

interface CompactQuotesSectionProps {
  quotes: any[];
  onSelectQuote: (quote: any) => void;
  onOpenNotes: (quote: any) => void;
}

export const CompactQuotesSection: React.FC<CompactQuotesSectionProps> = ({
  quotes,
  onSelectQuote,
  onOpenNotes
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (quotes.length === 0) return null;

  return (
    <Card className="mb-4">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-base">Active Quotes</CardTitle>
                <Badge variant="secondary">{quotes.length}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Total: {formatCurrency(quotes.reduce((sum, q) => sum + (q.total_amount || 0), 0))}
                </span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quotes.map((quote) => (
                <div 
                  key={quote.id} 
                  className="border rounded-lg p-3 hover:border-primary/20 transition-colors bg-background"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{quote.quote_number}</span>
                    <Badge 
                      variant="outline"
                      className={getStatusBadgeClass(quote.status)}
                    >
                      {quote.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <div>Total: {formatCurrency(quote.total_amount || 0)}</div>
                    <div>Created: {new Date(quote.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex space-x-1">
                    <QuoteViewer quote={quote} isEditable={true}>
                      <Button variant="outline" size="sm" className="flex-1 text-xs px-2 py-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </QuoteViewer>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs px-2 py-1"
                      onClick={() => onOpenNotes(quote)}
                    >
                      <StickyNote className="h-3 w-3 mr-1" />
                      Notes
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs px-2 py-1">
                      <Mail className="h-3 w-3 mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-muted text-muted-foreground';
    case 'sent':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return '';
  }
};