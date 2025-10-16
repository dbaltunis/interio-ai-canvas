import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, CheckCircle, XCircle, DollarSign, Target, Percent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCRMStats } from "@/hooks/useCRMStats";

export const CRMSummaryCards = () => {
  const { data: stats, isLoading } = useCRMStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(7)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
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
      label: "Active Leads",
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
      label: "Lost Deals",
      value: stats?.lostDeals || 0,
      icon: XCircle,
      color: "text-red-600",
    },
    {
      label: "Revenue (Month)",
      value: `$${(stats?.totalRevenueThisMonth || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Avg Deal Size",
      value: `$${(stats?.avgDealSize || 0).toLocaleString()}`,
      icon: Target,
      color: "text-purple-600",
    },
    {
      label: "Conversion Rate",
      value: `${(stats?.conversionRate || 0).toFixed(1)}%`,
      icon: Percent,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};