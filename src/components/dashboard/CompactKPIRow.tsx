import { DollarSign, FileText, Users, TrendingUp, TrendingDown } from "lucide-react";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { cn } from "@/lib/utils";

interface CompactMetric {
  id: string;
  label: string;
  value: number | string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isCurrency?: boolean;
}

interface CompactKPIRowProps {
  metrics: CompactMetric[];
  loading?: boolean;
}

export const CompactKPIRow = ({ metrics, loading }: CompactKPIRowProps) => {
  const { formatCurrency } = useFormattedCurrency();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card/50 border border-border/40 rounded-lg p-3 animate-pulse backdrop-blur-sm">
            <div className="h-3 w-16 bg-muted rounded mb-2" />
            <div className="h-5 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const displayValue = metric.isCurrency && typeof metric.value === 'number'
          ? formatCurrency(metric.value, { decimals: 0 })
          : metric.value;

        return (
          <div
            key={metric.id}
            className="bg-card/50 border border-border/40 rounded-lg p-3 hover:border-border/60 transition-colors backdrop-blur-sm"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium truncate">
                {metric.label}
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-foreground">
                {displayValue}
              </span>
              
              {metric.trend && (
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  metric.trend.isPositive ? "text-green-600" : "text-red-500"
                )}>
                  {metric.trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{metric.trend.isPositive ? "+" : ""}{metric.trend.value}%</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
