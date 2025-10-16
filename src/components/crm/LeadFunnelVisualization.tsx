import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCRMStats } from "@/hooks/useCRMStats";
import { TrendingDown, Users } from "lucide-react";

export const LeadFunnelVisualization = () => {
  const { data: stats } = useCRMStats();

  if (!stats) return null;

  const contactedCount = typeof stats.byStage?.contacted === 'object' ? stats.byStage.contacted.count : (stats.byStage?.contacted || 0);
  const qualifiedCount = typeof stats.byStage?.measuring_scheduled === 'object' ? stats.byStage.measuring_scheduled.count : (stats.byStage?.measuring_scheduled || 0);
  const proposalCount = typeof stats.byStage?.quoted === 'object' ? stats.byStage.quoted.count : (stats.byStage?.quoted || 0);

  const stages = [
    { name: "Leads", count: stats.totalLeads, color: "bg-blue-500" },
    { name: "Contacted", count: contactedCount, color: "bg-indigo-500" },
    { name: "Qualified", count: qualifiedCount, color: "bg-purple-500" },
    { name: "Proposal", count: proposalCount, color: "bg-pink-500" },
    { name: "Won", count: stats.convertedLeads, color: "bg-green-500" },
  ];

  const maxCount = stages[0].count || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Lead Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const width = Math.max((stage.count / maxCount) * 100, 5);
            const dropOffFromPrevious = index > 0 ? stages[index - 1].count - stage.count : 0;
            const dropOffPercentage = index > 0 
              ? Math.round((dropOffFromPrevious / stages[index - 1].count) * 100)
              : 0;

            return (
              <div key={stage.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {index > 0 && dropOffFromPrevious > 0 && (
                      <span className="text-xs text-destructive">
                        -{dropOffPercentage}% drop
                      </span>
                    )}
                    <span className="font-bold">{stage.count}</span>
                  </div>
                </div>
                <div className="relative h-10 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={`${stage.color} h-full flex items-center justify-end pr-4 text-white text-sm font-medium transition-all duration-500`}
                    style={{ width: `${width}%` }}
                  >
                    {width > 20 && `${Math.round((stage.count / maxCount) * 100)}%`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Overall Conversion</p>
              <p className="text-2xl font-bold text-primary">
                {stats.conversionRate}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Lost Deals</p>
              <p className="text-2xl font-bold text-destructive">
                {stats.lostDeals}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
