import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Copy, MoreHorizontal } from "lucide-react";
import { useQuoteVersions } from "@/hooks/useQuoteVersions";

interface QuoteVersionDropdownProps {
  projectId: string;
  quote: any;
}

export const QuoteVersionDropdown = ({ projectId, quote }: QuoteVersionDropdownProps) => {
  const { duplicateQuote } = useQuoteVersions(projectId);

  const handleDuplicateQuote = async () => {
    try {
      await duplicateQuote.mutateAsync(quote);
    } catch (error) {
      console.error('Error duplicating quote:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          Preview Quote
        </DropdownMenuItem>
        <DropdownMenuItem>
          Send Quote
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicateQuote}>
          <Copy className="mr-2 h-4 w-4" />
          Create New Version
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          Delete Quote
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};