
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Mail, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Settings, 
  Clock,
  Eye,
  MoreVertical,
  User,
  Building2
} from "lucide-react";
import { useUpdateClientStage } from "@/hooks/useClients";

const FUNNEL_STAGES = [
  { key: "lead", label: "Lead", icon: User, color: "bg-gray-100 text-gray-800" },
  { key: "contacted", label: "Contacted", icon: Mail, color: "bg-blue-100 text-blue-800" },
  { key: "measuring_scheduled", label: "Measuring", icon: Calendar, color: "bg-yellow-100 text-yellow-800" },
  { key: "quoted", label: "Quoted", icon: FileText, color: "bg-secondary text-secondary-foreground" },
  { key: "approved", label: "Approved", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  { key: "in_production", label: "In Production", icon: Settings, color: "bg-orange-100 text-orange-800" },
  { key: "completed", label: "Completed", icon: CheckCircle, color: "bg-emerald-100 text-emerald-800" }
];

interface KanbanClientCardProps {
  client: any;
  onClientClick: (client: any) => void;
}

export const KanbanClientCard = ({ client, onClientClick }: KanbanClientCardProps) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const updateClientStage = useUpdateClientStage();

  const handleStatusChange = (newStage: string) => {
    updateClientStage.mutate({
      clientId: client.id,
      stage: newStage
    });
    setShowStatusDropdown(false);
  };

  return (
    <Card 
      className="p-3 hover:shadow-md transition-shadow cursor-pointer border-l-2 border-l-transparent hover:border-l-brand-primary group"
      onClick={() => onClientClick(client)}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm flex items-center gap-2">
            {client.client_type === 'B2B' ? (
              <Building2 className="h-3 w-3 text-muted-foreground" />
            ) : (
              <User className="h-3 w-3 text-muted-foreground" />
            )}
            {client.client_type === 'B2B' ? client.company_name : client.name}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onClientClick(client);
              }}>
                <Eye className="h-3 w-3 mr-2" />
                View Client
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                setShowStatusDropdown(true);
              }}>
                <Settings className="h-3 w-3 mr-2" />
                Change Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {client.email && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {client.email}
          </div>
        )}
        
        {client.last_contact_date && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(client.last_contact_date).toLocaleDateString()}
          </div>
        )}

        {/* Status Change Dropdown */}
        {showStatusDropdown && (
          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
            <Select
              value={client.funnel_stage || 'lead'}
              onValueChange={handleStatusChange}
              onOpenChange={(open) => !open && setShowStatusDropdown(false)}
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FUNNEL_STAGES.map((stage) => {
                  const Icon = stage.icon;
                  return (
                    <SelectItem key={stage.key} value={stage.key}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-3 h-3" />
                        {stage.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </Card>
  );
};
