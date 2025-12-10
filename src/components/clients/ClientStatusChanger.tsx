
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUpdateClient } from "@/hooks/useClients";
import { ChevronRight, User } from "lucide-react";
import { FUNNEL_STAGES } from "@/constants/clientConstants";

interface ClientStatusChangerProps {
  clientId: string;
  currentStatus: string;
  clientName: string;
}

export const ClientStatusChanger = ({ clientId, currentStatus, clientName }: ClientStatusChangerProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const updateClient = useUpdateClient();

  const currentStage = FUNNEL_STAGES.find(stage => stage.value === currentStatus) || FUNNEL_STAGES[0];

  const handleStatusChange = async (newStatus: string) => {
    setIsChanging(true);
    try {
      await updateClient.mutateAsync({
        id: clientId,
        funnel_stage: newStatus,
        stage_changed_at: new Date().toISOString()
      });
      
      // Removed unnecessary success toast - status change is visual
    } catch (error) {
      console.error("Failed to update client status:", error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <h4 className="font-medium">{clientName}</h4>
            <Badge className={`${currentStage.color} border-0`} variant="secondary">
              {currentStage.label}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={currentStatus} 
            onValueChange={handleStatusChange}
            disabled={isChanging || updateClient.isPending}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FUNNEL_STAGES.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stage.color.split(' ')[0]}`}></div>
                    {stage.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </Card>
  );
};
