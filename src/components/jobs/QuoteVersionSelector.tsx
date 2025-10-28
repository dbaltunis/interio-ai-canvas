import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, FileText } from "lucide-react";
import { useQuoteVersions } from "@/hooks/useQuoteVersions";
import { JobStatusDropdown } from "./JobStatusDropdown";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { useEffect } from "react";

interface QuoteVersionSelectorProps {
  projectId: string;
  selectedQuoteId?: string;
  onQuoteChange: (quoteId: string) => void;
}

export const QuoteVersionSelector = ({ 
  projectId, 
  selectedQuoteId, 
  onQuoteChange 
}: QuoteVersionSelectorProps) => {
  const { quoteVersions, duplicateQuote, currentQuote } = useQuoteVersions(projectId);
  const { data: jobStatuses = [] } = useJobStatuses();
  
  const selectedQuote = selectedQuoteId 
    ? quoteVersions.find(q => q.id === selectedQuoteId) 
    : currentQuote;

  // Auto-select first quote if none selected
  useEffect(() => {
    if (!selectedQuoteId && currentQuote) {
      onQuoteChange(currentQuote.id);
    }
  }, [selectedQuoteId, currentQuote, onQuoteChange]);

  // Resolve status name from status_id
  const getStatusName = (quote: any) => {
    if (!quote) return 'draft';
    if (quote.status) return quote.status;
    if (quote.status_id) {
      const status = jobStatuses.find(s => s.id === quote.status_id);
      return status?.name || 'draft';
    }
    return 'draft';
  };

  const handleDuplicateQuote = async () => {
    if (selectedQuote) {
      const newQuote = await duplicateQuote.mutateAsync(selectedQuote);
      onQuoteChange(newQuote.id);
    }
  };

  if (!quoteVersions || quoteVersions.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-card to-muted/20 rounded-lg border shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="p-2 bg-primary/10 rounded-md">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex flex-col gap-1">
          <Select 
            value={selectedQuote?.id || ''} 
            onValueChange={onQuoteChange}
          >
            <SelectTrigger className="w-[280px] bg-background border-border/60 hover:border-border transition-colors">
              <SelectValue placeholder="Select a quote version">
                {selectedQuote && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-sm">{selectedQuote.quote_number}</span>
                    {selectedQuote.version && selectedQuote.version > 1 && (
                      <Badge variant="secondary" className="h-5 text-xs font-medium">
                        Version {selectedQuote.version}
                      </Badge>
                    )}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {quoteVersions.map((quote: any) => (
                <SelectItem 
                  key={quote.id} 
                  value={quote.id}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 py-1">
                    <span className="font-mono text-sm">{quote.quote_number}</span>
                    {quote.version && quote.version > 1 && (
                      <Badge variant="outline" className="h-5 text-xs">
                        v{quote.version}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {quoteVersions.length > 1 && (
            <p className="text-xs text-muted-foreground">
              {quoteVersions.length} version{quoteVersions.length !== 1 ? 's' : ''} available
            </p>
          )}
        </div>
      </div>

      {selectedQuote && (
        <div className="flex items-center gap-3 pl-4 border-l border-border/50">
          <JobStatusDropdown
            currentStatus={getStatusName(selectedQuote)}
            jobType="quote"
            jobId={selectedQuote.id}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicateQuote}
            disabled={duplicateQuote.isPending || !selectedQuote}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <Copy className="h-4 w-4 mr-2" />
            {duplicateQuote.isPending ? "Creating..." : "New Version"}
          </Button>
        </div>
      )}
    </div>
  );
};
