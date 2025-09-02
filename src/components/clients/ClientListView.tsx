import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, User, Building2, MoreHorizontal, Star, TrendingUp, Clock, AlertCircle, Target } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  client_type?: string;
  company_name?: string;
  contact_person?: string;
  city?: string;
  state?: string;
  created_at: string;
  notes?: string;
  projectCount?: number;
  totalValue?: number;
  lead_score?: number;
  funnel_stage?: string;
  priority_level?: string;
  lead_source?: string;
  follow_up_date?: string;
  last_contact_date?: string;
  deal_value?: number;
  conversion_probability?: number;
}

interface ClientListViewProps {
  clients: Client[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClientClick: (client: Client) => void;
  isLoading: boolean;
}

export const ClientListView = ({ clients, onClientClick, isLoading }: ClientListViewProps) => {
  const getTypeColor = (type: string) => {
    return type === "B2B" 
      ? "bg-blue-100 text-blue-800" 
      : "bg-secondary text-secondary-foreground";
  };

  const getTypeIcon = (type: string) => {
    return type === "B2B" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const getStageColor = (stage: string) => {
    const colors = {
      'lead': 'bg-gray-100 text-gray-800',
      'qualification': 'bg-blue-100 text-blue-800',
      'proposal': 'bg-yellow-100 text-yellow-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'closed_won': 'bg-green-100 text-green-800',
      'closed_lost': 'bg-red-100 text-red-800'
    };
    return colors[stage as keyof typeof colors] || colors.lead;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-blue-100 text-blue-600',
      'high': 'bg-orange-100 text-orange-600',
      'urgent': 'bg-red-100 text-red-600'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPriorityIcon = (priority: string) => {
    const icons = {
      'low': <TrendingUp className="h-3 w-3" />,
      'medium': <Target className="h-3 w-3" />,
      'high': <AlertCircle className="h-3 w-3" />,
      'urgent': <AlertCircle className="h-3 w-3" />
    };
    return icons[priority as keyof typeof icons] || icons.medium;
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-gray-600';
  };

  const isHotLead = (score: number) => score >= 70;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {!clients || clients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No clients found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or add a new client.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Client Info</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Stage</TableHead>
                <TableHead className="font-semibold">Lead Score</TableHead>
                <TableHead className="font-semibold">Priority</TableHead>
                <TableHead className="font-semibold">Deal Value</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow 
                  key={client.id} 
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onClientClick(client)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(client.lead_score && isHotLead(client.lead_score)) && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <div>
                        <div className="font-medium text-foreground">
                          {client.client_type === 'B2B' ? client.company_name : client.name}
                        </div>
                        {client.client_type === 'B2B' && client.contact_person && (
                          <div className="text-sm text-muted-foreground">
                            Contact: {client.contact_person}
                          </div>
                        )}
                        {client.lead_source && (
                          <div className="text-xs text-muted-foreground">
                            Source: {client.lead_source}
                          </div>
                        )}
                        {client.follow_up_date && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            Follow-up: {new Date(client.follow_up_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getTypeColor(client.client_type || 'B2C')} border-0 flex items-center space-x-1 w-fit`} variant="secondary">
                      {getTypeIcon(client.client_type || 'B2C')}
                      <span>{client.client_type || 'B2C'}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStageColor(client.funnel_stage || 'lead')} border-0 text-xs`} variant="outline">
                      {(client.funnel_stage || 'lead').replace('_', ' ').toUpperCase()}
                    </Badge>
                    {client.conversion_probability && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {client.conversion_probability}% probability
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getLeadScoreColor(client.lead_score || 0)}`}>
                        {client.lead_score || 0}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min((client.lead_score || 0), 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getPriorityColor(client.priority_level || 'medium')} border-0 flex items-center gap-1 w-fit text-xs`} variant="outline">
                      {getPriorityIcon(client.priority_level || 'medium')}
                      <span>{(client.priority_level || 'medium').toUpperCase()}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {client.deal_value && client.deal_value > 0 ? (
                        <div className="font-medium text-green-600">
                          ${client.deal_value.toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">No deal set</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {client.projectCount || 0} projects
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center text-sm text-foreground">
                          <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-xs">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                          {client.phone}
                        </div>
                      )}
                      {client.city && client.state && (
                        <div className="text-xs text-muted-foreground">
                          {client.city}, {client.state}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Phone className="mr-2 h-4 w-4" />
                          Call Client
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <User className="mr-2 h-4 w-4" />
                          Edit Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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