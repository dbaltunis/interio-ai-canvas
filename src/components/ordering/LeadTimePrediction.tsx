import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePredictLeadTime } from "@/hooks/useOrderTracking";
import { calculateExpectedDeliveryDate, getConfidenceColor, getConfidenceLabel } from "@/lib/orderPredictions";
import { format, addDays } from "date-fns";
import { TrendingUp, Calendar, BarChart3 } from "lucide-react";

interface LeadTimePredictionProps {
  supplierId: string;
  materialType: string;
  orderDate?: Date;
}

export const LeadTimePrediction = ({ supplierId, materialType, orderDate }: LeadTimePredictionProps) => {
  const prediction = usePredictLeadTime(supplierId, materialType);

  if (!prediction) {
    return null;
  }

  const startDate = orderDate || new Date();
  const expectedDelivery = calculateExpectedDeliveryDate(startDate, prediction.estimatedDays);
  const rangeStart = addDays(startDate, prediction.range[0]);
  const rangeEnd = addDays(startDate, prediction.range[1]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Lead Time Prediction
            </CardTitle>
            <CardDescription>
              Based on {prediction.sampleSize} historical order{prediction.sampleSize !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Badge className={getConfidenceColor(prediction.confidence)}>
            {getConfidenceLabel(prediction.confidence)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Prediction */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              Estimated Delivery
            </div>
            <div className="text-2xl font-bold text-primary">
              {prediction.estimatedDays} days
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {format(expectedDelivery, 'MMM dd, yyyy')}
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <BarChart3 className="h-4 w-4" />
              Expected Range
            </div>
            <div className="text-lg font-semibold">
              {prediction.range[0]}-{prediction.range[1]} days
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {format(rangeStart, 'MMM dd')} - {format(rangeEnd, 'MMM dd')}
            </div>
          </div>
        </div>

        {/* Historical Average */}
        {prediction.historicalAverage && (
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm text-muted-foreground">Historical Average:</span>
            <span className="text-sm font-medium">{prediction.historicalAverage} days</span>
          </div>
        )}

        {/* Note */}
        {prediction.note && (
          <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
            ℹ️ {prediction.note}
          </div>
        )}

        {/* Confidence Explanation */}
        <div className="text-xs text-muted-foreground">
          {prediction.confidence === 'high' && (
            <p>High confidence: Consistent delivery times with enough historical data.</p>
          )}
          {prediction.confidence === 'medium' && (
            <p>Medium confidence: Some variation in delivery times or limited historical data.</p>
          )}
          {prediction.confidence === 'low' && (
            <p>Low confidence: Inconsistent delivery times or insufficient historical data. Use as rough estimate.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
