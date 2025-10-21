import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  MoreVertical,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const stageColors: Record<string, { bg: string, dot: string }> = {
  lead: { bg: "bg-blue-100", dot: "bg-blue-500" },
  contacted: { bg: "bg-purple-100", dot: "bg-purple-500" },
  measuring_scheduled: { bg: "bg-yellow-100", dot: "bg-yellow-500" },
  quoted: { bg: "bg-orange-100", dot: "bg-orange-500" },
  approved: { bg: "bg-green-100", dot: "bg-green-500" },
  lost: { bg: "bg-gray-100", dot: "bg-gray-500" },
};

export const MobileCRMView = () => {
  const { data: clients = [], isLoading } = useClients();

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {clients.map((client, index) => {
        const displayName = client.client_type === 'B2B' ? client.company_name : client.name;
        const initials = (displayName || 'U').substring(0, 2).toUpperCase();
        const stageStyle = stageColors[client.funnel_stage || 'lead'];
        
        return (
          <Card key={client.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Avatar & Number */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">#{index + 1}</span>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Name & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{displayName}</h4>
                      {client.company_name && client.client_type === 'B2C' && (
                        <p className="text-xs text-muted-foreground truncate">
                          {client.company_name}
                        </p>
                      )}
                    </div>
                    
                    {/* Status Dot */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={cn("h-3 w-3 rounded-full", stageStyle.dot)} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {client.deal_value && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${client.deal_value.toLocaleString()}</span>
                      </div>
                    )}
                    {client.lead_score && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{client.lead_score}%</span>
                      </div>
                    )}
                    {client.last_activity_date && (
                      <span className="truncate">
                        {formatDistanceToNow(new Date(client.last_activity_date), { addSuffix: true })}
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
  );
};
