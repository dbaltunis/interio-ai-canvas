import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Mail, Phone, User, Building2, MoreHorizontal, Star, TrendingUp, Clock, AlertCircle, Target, Calendar, MessageSquare, Briefcase, Package } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow, isPast } from "date-fns";

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
  tags?: string[];
  referral_source?: string;
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
    <Card className="border-border/50">
      <CardContent className="p-0">
        {!clients || clients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No clients found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or add a new client.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-muted-foreground font-medium w-16">#</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Client</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Stage</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Deal Value</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Source</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Last Activity</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Next Follow-up</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Probability</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Activity</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client, index) => (
                  <TableRow 
                    key={client.id} 
                    className="hover:bg-muted/50 cursor-pointer border-border/50"
                    onClick={() => onClientClick(client)}
                  >
                    <TableCell className="text-muted-foreground font-medium">
                      {index + 1}
                    </TableCell>
                    
                    <TableCell className="font-medium max-w-[280px]">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {((client.client_type === 'B2B' ? client.company_name : client.name) || 'U').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground truncate flex items-center gap-2">
                            <span className="truncate max-w-[200px]">
                              {client.client_type === 'B2B' ? client.company_name : client.name}
                            </span>
                            {(client.lead_score && isHotLead(client.lead_score)) && (
                              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                          </div>
                          {client.client_type === 'B2B' && client.contact_person && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {client.contact_person}
                            </div>
                          )}
                          {client.email && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {client.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`${getStageColor(client.funnel_stage || 'lead')} border-0 text-xs font-medium`} variant="outline">
                        {(client.funnel_stage || 'lead').replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {client.deal_value && client.deal_value > 0 ? (
                        <div className="font-bold text-foreground">
                          ${client.deal_value.toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm">—</div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {client.lead_source ? (
                        <Badge variant="secondary" className="text-xs">
                          {client.lead_source.replace('_', ' ')}
                        </Badge>
                      ) : (
                        <div className="text-muted-foreground text-sm">—</div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {client.last_contact_date ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDistanceToNow(new Date(client.last_contact_date), { addSuffix: true })}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm">No activity</div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {client.follow_up_date ? (
                        <Badge 
                          variant={isPast(new Date(client.follow_up_date)) ? "destructive" : "secondary"}
                          className="text-xs flex items-center gap-1 w-fit"
                        >
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(client.follow_up_date), { addSuffix: true })}
                        </Badge>
                      ) : (
                        <div className="text-muted-foreground text-sm">—</div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {client.conversion_probability ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {client.conversion_probability}%
                            </span>
                          </div>
                          <Progress value={client.conversion_probability} className="h-1.5" />
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm">—</div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {client.projectCount && client.projectCount > 0 && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {client.projectCount}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <User className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Client
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Meeting
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};