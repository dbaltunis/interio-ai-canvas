import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCRMStats } from "@/hooks/useCRMStats";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";

export const ConversionFunnel = () => {
  const { data: stats, isLoading } = useCRMStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const stages = [
    { name: "Total Leads", count: stats?.totalLeads || 0, color: "bg-muted" },
    { 
      name: "Contacted", 
      count: (stats?.byStage?.contacted?.count || 0) + 
             (stats?.byStage?.measuring_scheduled?.count || 0) + 
             (stats?.byStage?.quoted?.count || 0) + 
             (stats?.byStage?.approved?.count || 0),
      color: "bg-primary" 
    },
    { 
      name: "Quoted", 
      count: (stats?.byStage?.quoted?.count || 0) + (stats?.byStage?.approved?.count || 0),
      color: "bg-yellow-500" 
    },
    { name: "Approved", count: stats?.convertedLeads || 0, color: "bg-green-600" },
  ];

  const calculateDropoff = (currentCount: number, previousCount: number) => {
    if (previousCount === 0) return 0;
    return (((previousCount - currentCount) / previousCount) * 100).toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const percentage = stats?.totalLeads 
              ? ((stage.count / stats.totalLeads) * 100).toFixed(1)
              : "0";
            const dropoff = index > 0 ? calculateDropoff(stage.count, stages[index - 1].count) : null;

            return (
              <div key={stage.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.name}</span>
                  <span className="text-muted-foreground">
                    {stage.count} ({percentage}%)
                  </span>
                </div>
                <div className="h-12 rounded-lg overflow-hidden bg-muted/20">
                  <div 
                    className={`h-full ${stage.color} flex items-center justify-center text-white font-medium transition-all`}
                    style={{ width: `${Math.max(Number(percentage), 5)}%` }}
                  >
                    {stage.count}
                  </div>
                </div>
                {dropoff && index < stages.length - 1 && (
                  <div className="flex items-center justify-center text-xs text-muted-foreground">
                    <ChevronDown className="h-4 w-4 mr-1" />
                    {dropoff}% drop-off
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};