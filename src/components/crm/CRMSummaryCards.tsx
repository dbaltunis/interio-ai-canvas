import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, CheckCircle, XCircle, DollarSign, Target, Percent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCRMStats } from "@/hooks/useCRMStats";

export const CRMSummaryCards = () => {
  const { data: stats, isLoading } = useCRMStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
        {[...Array(7)].map((_, i) => (
          <Card key={i} variant="analytics">
            <CardContent className="p-3">
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Leads",
      value: stats?.totalLeads || 0,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Active",
      value: stats?.activeLeads || 0,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      label: "Converted",
      value: stats?.convertedLeads || 0,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Lost",
      value: stats?.lostDeals || 0,
      icon: XCircle,
      color: "text-red-600",
    },
    {
      label: "Revenue",
      value: `$${(stats?.totalRevenueThisMonth || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Avg Deal",
      value: `$${(stats?.avgDealSize || 0).toLocaleString()}`,
      icon: Target,
      color: "text-purple-600",
    },
    {
      label: "Conv. Rate",
      value: `${(stats?.conversionRate || 0).toFixed(1)}%`,
      icon: Percent,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
      {cards.map((card, index) => (
        <Card key={index} variant="analytics" className="transition-all duration-200 hover:border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{card.label}</p>
                <p className="text-lg font-bold leading-tight">{card.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};