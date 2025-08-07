
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClients, useUpdateClient } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, User } from "lucide-react";

const FUNNEL_STAGES = [
  { value: "lead", label: "Lead", color: "bg-gray-100 text-gray-800" },
  { value: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-800" },
  { value: "measuring_scheduled", label: "Measuring Scheduled", color: "bg-yellow-100 text-yellow-800" },
  { value: "quoted", label: "Quoted", color: "bg-secondary text-secondary-foreground" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-800" },
  { value: "in_production", label: "In Production", color: "bg-orange-100 text-orange-800" },
  { value: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-800" }
];

interface ClientStatusChangerProps {
  clientId: string;
  currentStatus: string;
  clientName: string;
}

export const ClientStatusChanger = ({ clientId, currentStatus, clientName }: ClientStatusChangerProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const updateClient = useUpdateClient();
  const { toast } = useToast();

  const currentStage = FUNNEL_STAGES.find(stage => stage.value === currentStatus) || FUNNEL_STAGES[0];

  const handleStatusChange = async (newStatus: string) => {
    setIsChanging(true);
    try {
      await updateClient.mutateAsync({
        id: clientId,
        funnel_stage: newStatus,
        stage_changed_at: new Date().toISOString()
      });
      
      toast({
        title: "Status Updated",
        description: `${clientName} moved to ${FUNNEL_STAGES.find(s => s.value === newStatus)?.label}`,
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
          <User className="h-4 w-4 text-gray-500" />
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
