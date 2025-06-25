
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Users, FileText, Package } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  format?: "currency" | "number";
  loading?: boolean;
}

export const KPICard = ({ title, value, change, format = "number", loading }: KPICardProps) => {
  const getIcon = () => {
    if (title.toLowerCase().includes("revenue") || title.toLowerCase().includes("month")) {
      return DollarSign;
    }
    if (title.toLowerCase().includes("project")) {
      return Package;
    }
    if (title.toLowerCase().includes("quote")) {
      return FileText;
    }
    return Users;
  };

  const Icon = getIcon();

  const formatValue = (val: string | number) => {
    if (format === "currency") {
      return `$${Number(val).toLocaleString()}`;
    }
    return val.toString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-brand-primary">{formatValue(value)}</div>
        {change !== undefined && (
          <div className="mt-2 flex items-center gap-1">
            {change >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <Badge 
              variant={change >= 0 ? "default" : "destructive"}
              className="text-xs"
            >
              {change >= 0 ? "+" : ""}{change}%
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
