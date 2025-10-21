import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MoreVertical } from "lucide-react";
import { useClients } from "@/hooks/useClients";
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

  if (isLoading) {
    return (
      <div className="space-y-2 p-3 pb-20 animate-fade-in" data-create-client>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-3">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 pb-20 animate-fade-in" data-create-client>
      {clients.map((client) => {
        const displayName = client.client_type === 'B2B' ? client.company_name : client.name;
        const initials = (displayName || 'U').substring(0, 2).toUpperCase();
        
        return (
          <Card 
            key={client.id} 
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
            onClick={() => onClientClick(client)}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-xs font-semibold">
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
                      <Badge variant="outline" className="text-xs">
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
  );
};
