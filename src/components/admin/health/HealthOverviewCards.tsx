import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { HealthSummary } from '@/hooks/useAccountHealth';

interface HealthOverviewCardsProps {
  summary: HealthSummary | undefined;
  isLoading: boolean;
}

export function HealthOverviewCards({ summary, isLoading }: HealthOverviewCardsProps) {
  const cards = [
    {
      title: 'Total Accounts',
      value: summary?.total_accounts ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Healthy',
      value: summary?.healthy_accounts ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
      percentage: summary ? Math.round((summary.healthy_accounts / summary.total_accounts) * 100) : 0,
    },
    {
      title: 'Warnings',
      value: summary?.warning_accounts ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
      percentage: summary ? Math.round((summary.warning_accounts / summary.total_accounts) * 100) : 0,
    },
    {
      title: 'Critical',
      value: summary?.critical_accounts ?? 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
      percentage: summary ? Math.round((summary.critical_accounts / summary.total_accounts) * 100) : 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{card.value}</span>
                {card.percentage !== undefined && summary && summary.total_accounts > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({card.percentage}%)
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
