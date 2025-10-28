import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, FileText } from "lucide-react";
import { useQuoteVersions } from "@/hooks/useQuoteVersions";
import { JobStatusDropdown } from "./JobStatusDropdown";
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
  
  const selectedQuote = selectedQuoteId 
    ? quoteVersions.find(q => q.id === selectedQuoteId) 
    : currentQuote;

  // Auto-select first quote if none selected
  useEffect(() => {
    if (!selectedQuoteId && currentQuote) {
      onQuoteChange(currentQuote.id);
    }
  }, [selectedQuoteId, currentQuote, onQuoteChange]);

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
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Quote:</span>
      </div>
      
      <Select 
        value={selectedQuote?.id || ''} 
        onValueChange={onQuoteChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select quote version" />
        </SelectTrigger>
        <SelectContent>
          {quoteVersions.map((quote) => (
            <SelectItem key={quote.id} value={quote.id}>
              <div className="flex items-center gap-2">
                <span>{quote.quote_number}</span>
                {quote.version && (
                  <Badge variant="outline" className="text-xs">
                    v{quote.version}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedQuote && (
        <JobStatusDropdown
          currentStatus={selectedQuote.status || 'draft'}
          jobType="quote"
          jobId={selectedQuote.id}
        />
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleDuplicateQuote}
        disabled={duplicateQuote.isPending || !selectedQuote}
      >
        <Copy className="h-4 w-4 mr-2" />
        New Version
      </Button>
    </div>
  );
};
