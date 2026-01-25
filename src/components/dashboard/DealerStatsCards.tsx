import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, FileText, Users } from "lucide-react";
import { useDealerStats } from "@/hooks/useDealerStats";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
}

const StatCard = ({ label, value, icon: Icon, isLoading }: StatCardProps) => (
  <Card className="bg-card/50 backdrop-blur-sm border">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * Dealer-specific stats cards for the dealer dashboard
 * Shows: Active Projects, Pending Quotes, Total Clients
 */
export const DealerStatsCards = () => {
  const { data: stats, isLoading } = useDealerStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label="Active Projects"
        value={stats?.activeProjects || 0}
        icon={FolderOpen}
        isLoading={isLoading}
      />
      <StatCard
        label="Pending Quotes"
        value={stats?.pendingQuotes || 0}
        icon={FileText}
        isLoading={isLoading}
      />
      <StatCard
        label="Clients"
        value={stats?.totalClients || 0}
        icon={Users}
        isLoading={isLoading}
      />
    </div>
  );
};
