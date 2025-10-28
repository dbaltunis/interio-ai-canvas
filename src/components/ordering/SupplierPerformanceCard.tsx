import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupplierLeadTimes } from "@/hooks/useOrderTracking";
import { TrendingUp, TrendingDown, Clock, CheckCircle } from "lucide-react";

interface SupplierPerformanceCardProps {
  supplierId: string;
  supplierName: string;
}

export const SupplierPerformanceCard = ({ supplierId, supplierName }: SupplierPerformanceCardProps) => {
  const { data: leadTimes } = useSupplierLeadTimes(supplierId);

  if (!leadTimes || leadTimes.length === 0) {
    return null;
  }

  const avgLeadTime = Math.round(
    leadTimes.reduce((sum, lt) => sum + lt.lead_time_days, 0) / leadTimes.length
  );

  const recentLeadTime = leadTimes[0]?.lead_time_days || 0;
  const isImproving = recentLeadTime < avgLeadTime;

  // Calculate on-time delivery rate (within 1 day of average)
  const onTimeCount = leadTimes.filter(
    lt => Math.abs(lt.lead_time_days - avgLeadTime) <= 1
  ).length;
  const onTimeRate = Math.round((onTimeCount / leadTimes.length) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{supplierName}</CardTitle>
        <CardDescription>
          Performance based on {leadTimes.length} order{leadTimes.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Avg Lead Time
            </div>
            <div className="text-2xl font-bold">{avgLeadTime} days</div>
            {recentLeadTime > 0 && (
              <div className="flex items-center gap-1 text-sm">
                {isImproving ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Improving</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-600">Slower</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              On-Time Rate
            </div>
            <div className="text-2xl font-bold">{onTimeRate}%</div>
            <Badge 
              variant={onTimeRate >= 90 ? "default" : onTimeRate >= 75 ? "secondary" : "destructive"}
              className="text-xs"
            >
              {onTimeRate >= 90 ? 'Excellent' : onTimeRate >= 75 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground">Recent Orders:</div>
          <div className="mt-2 space-y-1">
            {leadTimes.slice(0, 3).map((lt, idx) => (
              <div key={lt.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Order {idx + 1}
                </span>
                <span className="font-medium">{lt.lead_time_days} days</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
