import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUpdateClient } from "@/hooks/useClients";
import { ChevronRight, User } from "lucide-react";
import { useClientStages } from "@/hooks/useClientStages";
import { FUNNEL_STAGES } from "@/constants/clientConstants";

interface ClientStatusChangerProps {
  clientId: string;
  currentStatus: string;
  clientName: string;
}

const getColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
    primary: "bg-primary/10 text-primary",
  };
  return colorMap[color] || colorMap.gray;
};

export const ClientStatusChanger = ({ clientId, currentStatus, clientName }: ClientStatusChangerProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const updateClient = useUpdateClient();
  const { data: dynamicStages = [], isLoading } = useClientStages();

  // Use dynamic stages if available, otherwise fall back to hardcoded
  const stages = dynamicStages.length > 0
    ? dynamicStages.map(s => ({ value: s.name, label: s.label, color: getColorClasses(s.color) }))
    : FUNNEL_STAGES;

  const currentStage = stages.find(stage => stage.value === currentStatus) || stages[0];

  const handleStatusChange = async (newStatus: string) => {
    setIsChanging(true);
    try {
      await updateClient.mutateAsync({
        id: clientId,
        funnel_stage: newStatus,
        stage_changed_at: new Date().toISOString()
      });
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
            <Badge className={`${currentStage?.color || 'bg-gray-100 text-gray-700'} border-0`} variant="secondary">
              {currentStage?.label || currentStatus}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={currentStatus} 
            onValueChange={handleStatusChange}
            disabled={isChanging || updateClient.isPending || isLoading}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stage.color.split(' ')[0]}`}></div>
                    {stage.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
};
