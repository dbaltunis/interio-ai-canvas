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
    <div className="flex items-center gap-2 flex-wrap bg-muted/30 rounded-lg px-4 py-2 border border-border/50">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Quote:</span>
      </div>
      
      <Select 
        value={selectedQuote?.id || ''} 
        onValueChange={onQuoteChange}
      >
        <SelectTrigger className="w-[180px] h-9 bg-background border-border hover:bg-muted/50 transition-colors">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent className="bg-background z-[100]">
          {quoteVersions.map((quote) => (
            <SelectItem 
              key={quote.id} 
              value={quote.id}
              className="cursor-pointer hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{quote.quote_number}</span>
                {quote.version && (
                  <Badge variant="secondary" className="text-xs font-semibold px-1.5 py-0">
                    v{quote.version}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedQuote && (
        <div className="flex items-center gap-2 pl-2 border-l border-border/50">
          <JobStatusDropdown
            currentStatus={getStatusName(selectedQuote)}
            jobType="quote"
            jobId={selectedQuote.id}
          />
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleDuplicateQuote}
        disabled={duplicateQuote.isPending || !selectedQuote}
        className="ml-2 h-9 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary hover:text-primary font-medium transition-all"
      >
        <Copy className="h-4 w-4 mr-2" />
        New Version
      </Button>
    </div>
  );
};
