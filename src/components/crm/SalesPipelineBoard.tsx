import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Calendar, Target } from "lucide-react";
import { useDealsByStage, useSalesForecast } from "@/hooks/useDeals";
import { formatDistanceToNow } from "date-fns";

const stageConfig = {
  qualification: { label: "Qualification", color: "bg-gray-500", order: 1 },
  needs_analysis: { label: "Needs Analysis", color: "bg-blue-500", order: 2 },
  proposal: { label: "Proposal", color: "bg-yellow-500", order: 3 },
  negotiation: { label: "Negotiation", color: "bg-orange-500", order: 4 },
  closed_won: { label: "Closed Won", color: "bg-green-500", order: 5 },
  closed_lost: { label: "Closed Lost", color: "bg-red-500", order: 6 },
};

export const SalesPipelineBoard = () => {
  const { data: stageData, isLoading } = useDealsByStage();
  const { data: forecast } = useSalesForecast('monthly');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading pipeline...</div>
        </CardContent>
      </Card>
    );
  }

  const sortedStages = Object.entries(stageData || {}).sort(
    ([a], [b]) => (stageConfig[a as keyof typeof stageConfig]?.order || 0) - 
                  (stageConfig[b as keyof typeof stageConfig]?.order || 0)
  );

  const totalPipelineValue = Object.values(stageData || {}).reduce(
    (sum, stage: any) => sum + (stage.total_value || 0), 0
  );

  const totalWeightedValue = Object.values(stageData || {}).reduce(
    (sum, stage: any) => sum + (stage.weighted_value || 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">Total Pipeline</div>
                <div className="text-lg font-semibold">${totalPipelineValue.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm text-muted-foreground">Weighted Value</div>
                <div className="text-lg font-semibold">${totalWeightedValue.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-sm text-muted-foreground">Monthly Forecast</div>
                <div className="text-lg font-semibold">
                  ${forecast?.forecasted_amount?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-sm text-muted-foreground">Active Deals</div>
                <div className="text-lg font-semibold">
                  {Object.values(stageData || {}).reduce((sum, stage: any) => sum + (stage.count || 0), 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stages */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedStages.map(([stage, data]: [string, any]) => {
              const config = stageConfig[stage as keyof typeof stageConfig];
              const conversionRate = totalPipelineValue > 0 ? (data.weighted_value / data.total_value) * 100 : 0;
              
              return (
                <Card key={stage} className="border-l-4" style={{ borderLeftColor: config?.color?.replace('bg-', '#') }}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{config?.label || stage}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {data.count} deals
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Total Value</div>
                      <div className="text-lg font-semibold">${data.total_value.toLocaleString()}</div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground">Weighted Value</div>
                      <div className="text-sm font-medium">${data.weighted_value.toLocaleString()}</div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Avg. Probability</span>
                        <span>{Math.round(conversionRate)}%</span>
                      </div>
                      <Progress value={conversionRate} className="h-2" />
                    </div>

                    {data.count > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground">Avg. Deal Size</div>
                        <div className="text-sm font-medium">
                          ${Math.round(data.total_value / data.count).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};