
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";

interface PipelineData {
  stage: string;
  count: number;
  value: number;
  color: string;
}

interface PipelineOverviewProps {
  data: PipelineData[];
  totalValue: number;
}

export const PipelineOverview = ({ data, totalValue }: PipelineOverviewProps) => {
  const { formatCurrency } = useFormattedCurrency();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="text-foreground">Sales Pipeline</span>
          <Badge variant="outline" className="text-base font-semibold bg-primary/10 text-primary border-primary/20">
            {formatCurrency(totalValue, { decimals: 0 })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {data.map((stage) => (
          <div key={stage.stage} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{stage.stage}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{stage.count} quotes</span>
                <Badge variant="secondary" className="text-xs bg-muted/50">
                  {formatCurrency(stage.value, { decimals: 0 })}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <div className="modern-progress h-2">
                <div 
                  className="modern-progress-fill h-full rounded-full"
                  style={{ 
                    width: `${(stage.value / totalValue) * 100}%`,
                    background: `linear-gradient(90deg, ${stage.color} 0%, ${stage.color}CC 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round((stage.value / totalValue) * 100)}%</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
