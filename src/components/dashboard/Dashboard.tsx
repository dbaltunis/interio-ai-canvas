
import { useState, useEffect } from "react";
import { KPICard } from "./KPICard";
import { RevenueChart } from "./RevenueChart";
import { PipelineOverview } from "./PipelineOverview";
import { QuickActions } from "./QuickActions";
import { WelcomeDashboard } from "./WelcomeDashboard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();
  const [isFirstTime, setIsFirstTime] = useState(true);
  const navigate = useNavigate();

  // Check if user has any real data (not just sample data)
  useEffect(() => {
    // This could be enhanced to check if user has added real clients/projects
    const hasRealData = localStorage.getItem('hasRealData') === 'true';
    setIsFirstTime(!hasRealData);
  }, []);

  // Sample data for charts and pipeline
  const revenueData = [
    { month: "Jan", revenue: 45000, quotes: 12 },
    { month: "Feb", revenue: 52000, quotes: 15 },
    { month: "Mar", revenue: 48000, quotes: 14 },
    { month: "Apr", revenue: 61000, quotes: 18 },
    { month: "May", revenue: 55000, quotes: 16 },
    { month: "Jun", revenue: 67000, quotes: 20 },
  ];

  const pipelineData = [
    { stage: "Initial Contact", count: 8, value: 45000, color: "#3B82F6" },
    { stage: "Quote Sent", count: 12, value: 78000, color: "#10B981" },
    { stage: "Follow Up", count: 6, value: 34000, color: "#F59E0B" },
    { stage: "Ready to Close", count: 4, value: 28000, color: "#EF4444" },
  ];

  const totalPipelineValue = pipelineData.reduce((sum, stage) => sum + stage.value, 0);

  // Quick actions handlers
  const handleNewJob = () => navigate("/jobs/new");
  const handleNewClient = () => navigate("/clients");
  const handleCalculator = () => navigate("/calculator");
  const handleCalendar = () => navigate("/calendar");
  const handleInventory = () => navigate("/inventory");

  // Show welcome dashboard for first-time users
  if (isFirstTime) {
    return <WelcomeDashboard />;
  }

  // Show regular dashboard for existing users
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-primary">Dashboard</h2>
          <p className="text-brand-neutral mt-1">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueChart data={revenueData} />
        </div>
        <div className="lg:col-span-3">
          <PipelineOverview data={pipelineData} totalValue={totalPipelineValue} />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions 
        onNewJob={handleNewJob}
        onNewClient={handleNewClient}
        onCalculator={handleCalculator}
        onCalendar={handleCalendar}
        onInventory={handleInventory}
      />
    </div>
  );
};
