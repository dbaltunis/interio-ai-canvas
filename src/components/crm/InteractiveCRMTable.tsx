import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  DollarSign,
  MessageSquare
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClients } from "@/hooks/useClients";
import { useUpdateClient } from "@/hooks/useClients";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const stageColors: Record<string, string> = {
  lead: "bg-blue-100 text-blue-700 border-blue-300",
  contacted: "bg-purple-100 text-purple-700 border-purple-300",
  measuring_scheduled: "bg-yellow-100 text-yellow-700 border-yellow-300",
  quoted: "bg-orange-100 text-orange-700 border-orange-300",
  approved: "bg-green-100 text-green-700 border-green-300",
  lost: "bg-gray-100 text-gray-700 border-gray-300",
};

export const InteractiveCRMTable = () => {
  const { data: clients = [], isLoading } = useClients();
  const updateClient = useUpdateClient();
  const [editingCell, setEditingCell] = useState<{row: string, col: string} | null>(null);

  const handleCellEdit = async (clientId: string, field: string, value: any) => {
    await updateClient.mutateAsync({
      id: clientId,
      [field]: value,
    });
    setEditingCell(null);
  };

  const handleStageChange = async (clientId: string, newStage: string) => {
    await updateClient.mutateAsync({
      id: clientId,
      funnel_stage: newStage,
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Stage</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Deal Value</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Source</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Last Activity</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Next Follow-up</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Probability</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Lead Score</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clients.map((client, index) => {
              const displayName = client.client_type === 'B2B' ? client.company_name : client.name;
              const initials = (displayName || 'U').substring(0, 2).toUpperCase();
              
              return (
                <tr key={client.id} className="group hover:bg-muted/30 transition-colors">
                  {/* Row Number */}
                  <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                  
                  {/* Client */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{displayName}</div>
                        <div className="text-xs text-muted-foreground">{client.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Stage - Editable */}
                  <td className="px-4 py-3">
                    <Select
                      value={client.funnel_stage || 'lead'}
                      onValueChange={(value) => handleStageChange(client.id, value)}
                    >
                      <SelectTrigger className="w-[140px] h-8 border-0 hover:bg-muted">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">
                          <Badge variant="outline" className={stageColors.lead}>LEAD</Badge>
                        </SelectItem>
                        <SelectItem value="contacted">
                          <Badge variant="outline" className={stageColors.contacted}>CONTACTED</Badge>
                        </SelectItem>
                        <SelectItem value="measuring_scheduled">
                          <Badge variant="outline" className={stageColors.measuring_scheduled}>MEASURING</Badge>
                        </SelectItem>
                        <SelectItem value="quoted">
                          <Badge variant="outline" className={stageColors.quoted}>QUOTED</Badge>
                        </SelectItem>
                        <SelectItem value="approved">
                          <Badge variant="outline" className={stageColors.approved}>APPROVED</Badge>
                        </SelectItem>
                        <SelectItem value="lost">
                          <Badge variant="outline" className={stageColors.lost}>LOST</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  
                  {/* Deal Value - Editable */}
                  <td className="px-4 py-3">
                    {editingCell?.row === client.id && editingCell?.col === 'deal_value' ? (
                      <Input
                        type="number"
                        defaultValue={client.deal_value || 0}
                        className="h-8 w-24"
                        onBlur={(e) => handleCellEdit(client.id, 'deal_value', parseFloat(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(client.id, 'deal_value', parseFloat(e.currentTarget.value));
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="flex items-center gap-1 cursor-pointer hover:bg-muted px-2 py-1 rounded"
                        onClick={() => setEditingCell({row: client.id, col: 'deal_value'})}
                      >
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {client.deal_value ? client.deal_value.toLocaleString() : '—'}
                        </span>
                      </div>
                    )}
                  </td>
                  
                  {/* Source */}
                  <td className="px-4 py-3">
                    {client.lead_source ? (
                      <Badge variant="secondary" className="text-xs">
                        {client.lead_source.replace('_', ' ')}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                  
                  {/* Last Activity */}
                  <td className="px-4 py-3">
                    {client.last_activity_date ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDistanceToNow(new Date(client.last_activity_date), { addSuffix: true })}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No activity</span>
                    )}
                  </td>
                  
                  {/* Next Follow-up */}
                  <td className="px-4 py-3">
                    {client.follow_up_date ? (
                      <div className="text-sm">
                        {new Date(client.follow_up_date).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                  
                  {/* Probability - Editable */}
                  <td className="px-4 py-3">
                    {editingCell?.row === client.id && editingCell?.col === 'conversion_probability' ? (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={client.conversion_probability || 0}
                        className="h-8 w-16"
                        onBlur={(e) => handleCellEdit(client.id, 'conversion_probability', parseInt(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(client.id, 'conversion_probability', parseInt(e.currentTarget.value));
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-muted px-2 py-1 rounded"
                        onClick={() => setEditingCell({row: client.id, col: 'conversion_probability'})}
                      >
                        <span className="text-sm font-medium">
                          {client.conversion_probability || 0}%
                        </span>
                      </div>
                    )}
                  </td>
                  
                  {/* Lead Score */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          client.lead_score && client.lead_score >= 70 && "bg-green-100 text-green-700",
                          client.lead_score && client.lead_score >= 40 && client.lead_score < 70 && "bg-yellow-100 text-yellow-700",
                          (!client.lead_score || client.lead_score < 40) && "bg-gray-100 text-gray-700"
                        )}
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {client.lead_score || 0}
                      </Badge>
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Note
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Meeting
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {clients.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No clients found. Add your first client to get started.
        </div>
      )}
    </Card>
  );
};