import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MoreVertical, Users, Filter, HelpCircle } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileClientViewProps {
  onClientClick: (client: any) => void;
}

export const MobileClientView = ({ onClientClick }: MobileClientViewProps) => {
  const { data: clients = [], isLoading } = useClients();
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Filter clients based on selected filters
  const filteredClients = clients.filter(client => {
    const statusMatch = statusFilter === 'all' || client.funnel_stage === statusFilter;
    const typeMatch = typeFilter === 'all' || client.client_type === typeFilter;
    return statusMatch && typeMatch;
  });

  const getClientAvatarColor = (clientName: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-cyan-500'
    ];
    const index = clientName.length % colors.length;
    return colors[index];
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'lead':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'contacted':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'qualified':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'proposal':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'negotiation':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'lost':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'client':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4 pb-20 animate-fade-in bg-background/50" data-create-client>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse rounded-xl border-border/40">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-background/50 min-h-screen animate-fade-in">
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Clients</h1>
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <Badge className="bg-secondary/10 text-secondary border-secondary/20">
              {clients.length} clients
            </Badge>
          </div>
          
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "default" : "outline"}
            size="sm"
            className="h-9"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-4 space-y-4 border-primary/20 bg-card animate-fade-in">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 rounded-lg border bg-background text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="lead">Lead</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="approved">Approved</option>
                <option value="client">Client</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Client Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 rounded-lg border bg-background text-sm"
              >
                <option value="all">All Types</option>
                <option value="B2C">B2C (Individual)</option>
                <option value="B2B">B2B (Business)</option>
              </select>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                {filteredClients.length} of {clients.length} clients
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
              >
                Clear
              </Button>
            </div>
          </Card>
        )}

        {/* Clients List */}
        <div className="space-y-3 pb-20" data-create-client>
          {filteredClients.map((client) => {
            const displayName = client.client_type === 'B2B' ? client.company_name : client.name;
            const initials = (displayName || 'U').substring(0, 2).toUpperCase();
            const avatarColor = getClientAvatarColor(displayName || 'Unknown');
            const statusColor = getStatusColor(client.funnel_stage || '');
            
            return (
              <Card 
                key={client.id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-all rounded-xl border-border/40 bg-card"
                onClick={() => onClientClick(client)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Colored Avatar */}
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className={`${avatarColor} text-white text-xs font-semibold`}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{displayName}</h4>
                          {client.email && (
                            <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                          )}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Mail className="h-4 w-4 mr-2" />
                              Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Phone className="h-4 w-4 mr-2" />
                              Call
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-2">
                        {client.funnel_stage && (
                          <Badge variant="outline" className={`text-xs border ${statusColor}`}>
                            {client.funnel_stage.replace('_', ' ')}
                          </Badge>
                        )}
                        {client.phone && (
                          <span className="text-xs text-muted-foreground truncate">
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
