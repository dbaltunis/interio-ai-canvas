import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PixelUserIcon } from "@/components/icons/PixelArtIcons";
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
import { useClientStages } from "@/hooks/useClientStages";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { FUNNEL_STAGES } from "@/constants/clientConstants";

const getColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700 border-gray-300",
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    green: "bg-green-100 text-green-700 border-green-300",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
    orange: "bg-orange-100 text-orange-700 border-orange-300",
    red: "bg-red-100 text-red-700 border-red-300",
    purple: "bg-purple-100 text-purple-700 border-purple-300",
    primary: "bg-primary/10 text-primary border-primary/30",
  };
  return colorMap[color] || colorMap.gray;
};

export const InteractiveCRMTable = () => {
  const { data: clients = [], isLoading } = useClients();
  const updateClient = useUpdateClient();
  const { data: dynamicStages = [] } = useClientStages();
  const [editingCell, setEditingCell] = useState<{row: string, col: string} | null>(null);

  // Use dynamic stages if available, otherwise fall back to hardcoded
  const stages = dynamicStages.length > 0
    ? dynamicStages.map(s => ({ value: s.name, label: s.label, color: getColorClasses(s.color) }))
    : FUNNEL_STAGES.map(s => ({ ...s, color: s.color }));

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
              const currentStage = stages.find(s => s.value === client.funnel_stage) || stages[0];
              
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
                  
                  {/* Stage - Editable with dynamic stages */}
                  <td className="px-4 py-3">
                    <Select
                      value={client.funnel_stage || 'lead'}
                      onValueChange={(value) => handleStageChange(client.id, value)}
                    >
                      <SelectTrigger className="w-[140px] h-8 border-0 hover:bg-muted">
                        <SelectValue>
                          <Badge variant="outline" className={currentStage?.color}>
                            {currentStage?.label?.toUpperCase() || client.funnel_stage?.toUpperCase()}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((stage) => (
                          <SelectItem key={stage.value} value={stage.value}>
                            <Badge variant="outline" className={stage.color}>
                              {stage.label.toUpperCase()}
                            </Badge>
                          </SelectItem>
                        ))}
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
                          {client.conversion_probability ? `${client.conversion_probability}%` : '—'}
                        </span>
                      </div>
                    )}
                  </td>
                  
                  {/* Lead Score - only show if > 0 */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {client.lead_score && client.lead_score > 0 ? (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            client.lead_score >= 70 && "bg-green-100 text-green-700",
                            client.lead_score >= 40 && client.lead_score < 70 && "bg-yellow-100 text-yellow-700",
                            client.lead_score < 40 && "bg-gray-100 text-gray-700"
                          )}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {client.lead_score}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <PixelUserIcon size={64} />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Your future clients are waiting!</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">Start building relationships that last.</p>
        </div>
      )}
    </Card>
  );
};