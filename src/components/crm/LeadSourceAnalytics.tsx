import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLeadSourceAnalytics } from "@/hooks/useLeadIntelligence";
import { TrendingUp, Users, DollarSign, Target } from "lucide-react";

export const LeadSourceAnalytics = () => {
  const { data: sourceData, isLoading } = useLeadSourceAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Lead Source Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!sourceData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Lead Source Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">No lead source data available</div>
        </CardContent>
      </Card>
    );
  }

  const sortedSources = sourceData.sort((a, b) => b.total_leads - a.total_leads);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Lead Source Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedSources}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_leads" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSources.map((source) => (
          <Card key={source.source}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                {source.source}
                <Badge variant="outline">{source.total_leads} leads</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-muted-foreground">Avg Score</div>
                    <div className="font-medium">{Math.round(source.avg_score)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-muted-foreground">Conversion</div>
                    <div className="font-medium">{Math.round(source.conversion_rate)}%</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Conversion Rate</span>
                  <span className="font-medium">{Math.round(source.conversion_rate)}%</span>
                </div>
                <Progress value={source.conversion_rate} className="h-2" />
              </div>

              {source.total_value > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-muted-foreground">Total Value</div>
                    <div className="font-medium">${source.total_value.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};