import { useState } from "react";
import { useKPIConfig } from "@/hooks/useKPIConfig";
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets";
import { WelcomeHeader } from "./WelcomeHeader";
import { DashboardCustomizationButton } from "./DashboardCustomizationButton";
import { DashboardWidgetCustomizer } from "./DashboardWidgetCustomizer";
import { UpcomingEventsWidget } from "./UpcomingEventsWidget";
import { StatusOverviewWidget } from "./StatusOverviewWidget";
import { RecentEmailsWidget } from "./RecentEmailsWidget";
import { RevenuePieChart } from "./RevenuePieChart";
import { CalendarConnectionCard } from "./CalendarConnectionCard";
import { ShopifyConnectionCTA } from "./ShopifyConnectionCTA";
import { ShopifyAnalyticsCard } from "./ShopifyAnalyticsCard";
import { ShopifyOrdersWidget } from "./ShopifyOrdersWidget";
import { DraggableKPISection } from "./DraggableKPISection";
import { TeamMembersWidget } from "./TeamMembersWidget";
import { RecentlyCreatedJobsWidget } from "./RecentlyCreatedJobsWidget";
import { RecentAppointmentsWidget } from "./RecentAppointmentsWidget";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useEmailKPIs } from "@/hooks/useEmails";
import { ShopifyIntegrationDialog } from "@/components/library/ShopifyIntegrationDialog";
import { Users, FileText, Package, DollarSign, Mail, MousePointerClick, Clock, TrendingUp, Store, CalendarCheck } from "lucide-react";

export const EnhancedHomeDashboard = () => {
  const [showShopifyDialog, setShowShopifyDialog] = useState(false);
  const [showWidgetCustomizer, setShowWidgetCustomizer] = useState(false);
  const { kpiConfigs, toggleKPI, reorderKPIs, getEnabledKPIs } = useKPIConfig();
  const { widgets, toggleWidget, reorderWidgets, getEnabledWidgets, updateWidgetSize } = useDashboardWidgets();
  const { data: stats } = useDashboardStats();
  const { data: emailKPIs } = useEmailKPIs();
  const { integration: shopifyIntegration } = useShopifyIntegrationReal();
  const isShopifyConnected = !!shopifyIntegration?.is_connected;

  const enabledWidgets = getEnabledWidgets();

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
    {
      id: "appointments-booked",
      title: "Appointments Booked",
      value: stats?.totalAppointments || 0,
      subtitle: `${stats?.activeSchedulers || 0} active scheduler${(stats?.activeSchedulers || 0) !== 1 ? 's' : ''}`,
      icon: CalendarCheck,
      trend: { value: 18.7, isPositive: true },
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
      <WelcomeHeader onCustomizeClick={() => setShowWidgetCustomizer(true)} />

      {/* Dynamic Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Shopify Orders Widget - Always show first if connected */}
        {isShopifyConnected && (
          <div className="col-span-1 xl:col-span-2">
            <ShopifyOrdersWidget />
          </div>
        )}
        
        {enabledWidgets.map((widget) => {
          const sizeClasses = {
            small: "col-span-1",
            medium: "col-span-1 xl:col-span-2",
            large: "col-span-1 xl:col-span-3"
          };
          
          switch (widget.id) {
            case "shopify":
              return isShopifyConnected ? (
                <div key={widget.id} className={sizeClasses[widget.size]}>
                  <ShopifyAnalyticsCard />
                </div>
              ) : (
                <Card 
                  key={widget.id}
                  className={`${sizeClasses[widget.size]} border border-border/50 bg-card/50 hover:border-primary/40 transition-colors cursor-pointer`}
                  onClick={() => setShowShopifyDialog(true)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Store className="h-4 w-4" />
                      E-Commerce Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-center py-6">
                      <Store className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect your Shopify store to display products and orders
                      </p>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Store className="h-4 w-4" />
                        Connect Store
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            
            case "team":
              return <div key={widget.id} className={sizeClasses[widget.size]}><TeamMembersWidget /></div>;
            
            case "events":
              return <div key={widget.id} className={sizeClasses[widget.size]}><UpcomingEventsWidget /></div>;
            
            case "recent-appointments":
              return <div key={widget.id} className={sizeClasses[widget.size]}><RecentAppointmentsWidget /></div>;
            
            case "emails":
              return <div key={widget.id} className={sizeClasses[widget.size]}><RecentEmailsWidget /></div>;
            
            case "status":
              return <div key={widget.id} className={sizeClasses[widget.size]}><StatusOverviewWidget /></div>;
            
            case "revenue":
              return <div key={widget.id} className={sizeClasses[widget.size]}><RevenuePieChart /></div>;
            
            case "calendar-connection":
              return <div key={widget.id} className={sizeClasses[widget.size]}><CalendarConnectionCard /></div>;
            
            case "recent-jobs":
              return <div key={widget.id} className={sizeClasses[widget.size]}><RecentlyCreatedJobsWidget /></div>;
            
            default:
              return null;
          }
        })}
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
      
      {/* Dialogs */}
      <ShopifyIntegrationDialog 
        open={showShopifyDialog} 
        onOpenChange={setShowShopifyDialog} 
      />
      
      <DashboardWidgetCustomizer
        open={showWidgetCustomizer}
        onOpenChange={setShowWidgetCustomizer}
        widgets={widgets}
        onToggle={toggleWidget}
        onReorder={reorderWidgets}
        onSizeChange={updateWidgetSize}
      />
    </div>
  );
};
