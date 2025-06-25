
import { useState, useEffect } from "react";
import { KPICard } from "./KPICard";
import { RevenueChart } from "./RevenueChart";
import { PipelineOverview } from "./PipelineOverview";
import { QuickActions } from "./QuickActions";
import { WelcomeDashboard } from "./WelcomeDashboard";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export const Dashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();
  const [isFirstTime, setIsFirstTime] = useState(true);

  // Check if user has any real data (not just sample data)
  useEffect(() => {
    // This could be enhanced to check if user has added real clients/projects
    const hasRealData = localStorage.getItem('hasRealData') === 'true';
    setIsFirstTime(!hasRealData);
  }, []);

  // Show welcome dashboard for first-time users
  if (isFirstTime) {
    return <WelcomeDashboard />;
  }

  // Show regular dashboard for existing users
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-primary">Dashboard</h2>
          <p className="text-brand-neutral">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={stats?.totalRevenue || 0}
          change={12.5}
          format="currency"
          loading={isLoading}
        />
        <KPICard
          title="Active Projects"
          value={stats?.activeProjects || 0}
          change={8.2}
          loading={isLoading}
        />
        <KPICard
          title="Pending Quotes"
          value={stats?.pendingQuotes || 0}
          change={-2.1}
          loading={isLoading}
        />
        <KPICard
          title="This Month"
          value={stats?.monthlyRevenue || 0}
          change={15.3}
          format="currency"
          loading={isLoading}
        />
      </div>

      {/* Charts and Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RevenueChart />
        </div>
        <div className="col-span-3">
          <PipelineOverview />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};
