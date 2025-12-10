import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClients } from "@/hooks/useClients";
import { Building2, User, DollarSign } from "lucide-react";
import { FUNNEL_STAGES } from "@/constants/clientConstants";

interface CRMPipelineViewProps {
  onClientClick?: (clientId: string) => void;
}

export const CRMPipelineView = ({ onClientClick }: CRMPipelineViewProps) => {
  const { data: allClients } = useClients();

  const getStageClients = (stage: string) => {
    return allClients?.filter(c => c.funnel_stage === stage) || [];
  };

  const getStageValue = (stage: string) => {
    const clients = getStageClients(stage);
    return clients.reduce((sum, c) => sum + (c.deal_value || 0), 0);
  };

  // Filter out 'lost' from pipeline view - lost clients shown separately
  const pipelineStages = FUNNEL_STAGES.filter(s => s.value !== 'lost');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sales Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-3">
          {pipelineStages.map((stage) => {
            const clients = getStageClients(stage.value);
            const stageValue = getStageValue(stage.value);

            return (
              <div key={stage.value} className="space-y-2">
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className={`${stage.color} justify-center`}>
                    {stage.label}
                  </Badge>
                  <div className="text-center">
                    <p className="text-sm font-semibold">{clients.length}</p>
                    <p className="text-xs text-muted-foreground">
                      ${(stageValue / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>

                <ScrollArea className="h-[300px]">
                  <div className="space-y-2 pr-3">
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className="p-2 rounded-lg border bg-card hover:bg-accent/5 cursor-pointer transition-colors"
                        onClick={() => onClientClick?.(client.id)}
                      >
                        <div className="flex items-start gap-2">
                          {client.client_type === 'B2B' ? (
                            <Building2 className="h-3 w-3 text-blue-600 mt-0.5" />
                          ) : (
                            <User className="h-3 w-3 text-primary mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {client.client_type === 'B2B' ? client.company_name : client.name}
                            </p>
                            {client.deal_value > 0 && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <DollarSign className="h-2 w-2" />
                                {client.deal_value.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {clients.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No clients
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
