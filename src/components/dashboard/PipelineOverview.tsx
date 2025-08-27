
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Sales Pipeline
          <Badge variant="outline" className="text-lg font-semibold">
            ${totalValue.toLocaleString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((stage) => (
          <div key={stage.stage} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{stage.stage}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{stage.count} quotes</span>
                <Badge variant="secondary" className="text-xs">
                  ${stage.value.toLocaleString()}
                </Badge>
              </div>
            </div>
            <Progress 
              value={(stage.value / totalValue) * 100} 
              className="h-2"
              style={{ 
                background: `linear-gradient(to right, ${stage.color} 0%, ${stage.color}80 100%)`
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
