import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, MapPin, DollarSign } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { cn } from "@/lib/utils";
import { JobStatusBadge } from "./JobStatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileJobsViewProps {
  onJobSelect: (quote: any) => void;
  searchTerm: string;
  statusFilter: string;
}

export const MobileJobsView = ({ onJobSelect, searchTerm, statusFilter }: MobileJobsViewProps) => {
  const { data: quotes = [], isLoading } = useQuotes();
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();

  const filteredQuotes = quotes.filter((quote) => {
    const project = projects.find((p) => p.id === quote.project_id);
    const client = clients.find((c) => c.id === quote.client_id);
    
    const matchesSearch = 
      quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-2 p-3 pb-20 animate-fade-in">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-3">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 pb-20 animate-fade-in" data-create-project>
      {filteredQuotes.map((quote) => {
        const project = projects.find((p) => p.id === quote.project_id);
        const client = clients.find((c) => c.id === quote.client_id);
        const clientName = client?.name || 'Unknown';
        const initials = clientName.substring(0, 2).toUpperCase();
        
        return (
          <Card 
            key={quote.id} 
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onJobSelect(quote)}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {quote.quote_number?.substring(0, 7) || 'N/A'}
                        </span>
                        <JobStatusBadge status={quote.status} />
                      </div>
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {clientName.length > 14 ? clientName.substring(0, 14) + '...' : clientName}
                      </h4>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onJobSelect(quote);
                        }}>
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {project?.name && (
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{project.name}</span>
                      </div>
                    )}
                    {quote.total_amount && (
                      <div className="flex items-center gap-1 shrink-0">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-semibold">
                          ${quote.total_amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
