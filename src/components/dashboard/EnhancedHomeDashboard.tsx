import { useState } from "react";
import { useKPIConfig } from "@/hooks/useKPIConfig";
import { WelcomeHeader } from "./WelcomeHeader";
import { DashboardCustomizationButton } from "./DashboardCustomizationButton";
import { UpcomingEventsWidget } from "./UpcomingEventsWidget";
import { StatusOverviewWidget } from "./StatusOverviewWidget";
import { RecentEmailsWidget } from "./RecentEmailsWidget";
import { RevenuePieChart } from "./RevenuePieChart";
import { CalendarConnectionCard } from "./CalendarConnectionCard";
import { ShopifyConnectionCTA } from "./ShopifyConnectionCTA";
import { ShopifyAnalyticsCard } from "./ShopifyAnalyticsCard";
import { DraggableKPISection } from "./DraggableKPISection";
import { TeamMembersWidget } from "./TeamMembersWidget";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useEmailKPIs } from "@/hooks/useEmails";
import { ShopifyIntegrationDialog } from "@/components/library/ShopifyIntegrationDialog";
import { Users, FileText, Package, DollarSign, Mail, MousePointerClick, Clock, TrendingUp } from "lucide-react";

export const EnhancedHomeDashboard = () => {
  const [showShopifyDialog, setShowShopifyDialog] = useState(false);
  const { kpiConfigs, toggleKPI, reorderKPIs, getEnabledKPIs } = useKPIConfig();
  const { data: stats } = useDashboardStats();
  const { data: emailKPIs } = useEmailKPIs();
  const { integration: shopifyIntegration } = useShopifyIntegrationReal();
  const isShopifyConnected = !!shopifyIntegration?.is_connected;

  // Prepare KPI data for primary metrics
  const primaryKPIs = [
    {
      id: "total-revenue",
      title: "Total Revenue",
      value: stats?.totalRevenue || 0,
      subtitle: "from accepted quotes",
      icon: DollarSign,
      trend: { value: 12.5, isPositive: true },
      category: "primary" as const,
    },
    {
      id: "active-projects",
      title: "Active Projects",
      value: stats?.totalClients || 0,
      subtitle: "in progress",
      icon: FileText,
      trend: { value: 8.2, isPositive: true },
      category: "primary" as const,
    },
    {
      id: "pending-quotes",
      title: "Pending Quotes",
      value: stats?.pendingQuotes || 0,
      subtitle: "awaiting response",
      icon: FileText,
      category: "primary" as const,
    },
    {
      id: "total-clients",
      title: "Total Clients",
      value: stats?.totalClients || 0,
      subtitle: "active relationships",
      icon: Users,
      trend: { value: 15.3, isPositive: true },
      category: "primary" as const,
    },
  ];

  // Email performance KPIs
  const emailKPIsData = [
    {
      id: "emails-sent",
      title: "Emails Sent",
      value: emailKPIs?.totalSent || 0,
      subtitle: "total campaigns",
      icon: Mail,
      category: "email" as const,
    },
    {
      id: "open-rate",
      title: "Open Rate",
      value: emailKPIs?.openRate || 0,
      subtitle: "average engagement",
      icon: MousePointerClick,
      trend: { value: 5.2, isPositive: true },
      category: "email" as const,
    },
    {
      id: "click-rate",
      title: "Click Rate",
      value: emailKPIs?.clickRate || 0,
      subtitle: "link engagement",
      icon: MousePointerClick,
      trend: { value: 3.1, isPositive: true },
      category: "email" as const,
    },
    {
      id: "avg-time-spent",
      title: "Avg Time Spent",
      value: emailKPIs?.avgTimeSpent || 0,
      subtitle: "reading emails",
      icon: Clock,
      category: "email" as const,
    },
  ];

  const enabledPrimaryKPIs = getEnabledKPIs("primary");
  const enabledEmailKPIs = getEnabledKPIs("email");
  const enabledBusinessKPIs = getEnabledKPIs("business");

  const filteredPrimaryKPIs = primaryKPIs.filter(kpi => 
    enabledPrimaryKPIs.some(config => config.id === kpi.id)
  );

  const filteredEmailKPIs = emailKPIsData.filter(kpi => 
    enabledEmailKPIs.some(config => config.id === kpi.id)
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 w-full">
          <WelcomeHeader />
        </div>
        <div className="shrink-0 sm:pt-2 w-full sm:w-auto flex items-center gap-2">
          <ThemeToggle />
          <DashboardCustomizationButton
            kpiConfigs={kpiConfigs}
            onToggleKPI={toggleKPI}
          />
        </div>
      </div>

      {/* Top Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Shopify Section */}
        {isShopifyConnected ? (
          <ShopifyAnalyticsCard />
        ) : (
          <ShopifyConnectionCTA onConnect={() => setShowShopifyDialog(true)} />
        )}

        {/* Team Members */}
        <TeamMembersWidget />

        {/* Upcoming Events */}
        <UpcomingEventsWidget />
      </div>

      {/* Second Row - Email & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentEmailsWidget />
        <StatusOverviewWidget />
      </div>

      {/* Primary KPIs Section */}
      {filteredPrimaryKPIs.length > 0 && (
        <DraggableKPISection
          title="Primary Metrics"
          kpis={filteredPrimaryKPIs}
          kpiConfigs={enabledPrimaryKPIs}
          onReorder={(activeId, overId) => reorderKPIs("primary", activeId, overId)}
        />
      )}

      {/* Revenue Chart */}
      <RevenuePieChart />

      {/* Calendar Connection */}
      <CalendarConnectionCard />

      {/* Email Performance KPIs */}
      {filteredEmailKPIs.length > 0 && (
        <DraggableKPISection
          title="Email Performance"
          kpis={filteredEmailKPIs}
          kpiConfigs={enabledEmailKPIs}
          onReorder={(activeId, overId) => reorderKPIs("email", activeId, overId)}
        />
      )}

      {/* Business Metrics KPIs */}
      {enabledBusinessKPIs.length > 0 && (
        <DraggableKPISection
          title="Business Metrics"
          kpis={[]} // Add business metrics data when available
          kpiConfigs={enabledBusinessKPIs}
          onReorder={(activeId, overId) => reorderKPIs("business", activeId, overId)}
        />
      )}
      
      {/* Shopify Integration Dialog */}
      <ShopifyIntegrationDialog 
        open={showShopifyDialog} 
        onOpenChange={setShowShopifyDialog} 
      />
    </div>
  );
};
