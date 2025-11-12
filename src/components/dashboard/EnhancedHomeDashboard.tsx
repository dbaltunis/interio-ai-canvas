import { useState, useMemo, lazy, Suspense } from "react";
import { useKPIConfig } from "@/hooks/useKPIConfig";
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets";
import { WelcomeHeader } from "./WelcomeHeader";
import { DashboardWidgetCustomizer } from "./DashboardWidgetCustomizer";
import { ECommerceGatewayWidget } from "./ECommerceGatewayWidget";
import { DraggableKPISection } from "./DraggableKPISection";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { useBatchedDashboardQueries } from "@/hooks/useBatchedDashboardQueries";
import { useEmailKPIs } from "@/hooks/useEmails";
import { ShopifyIntegrationDialog } from "@/components/library/ShopifyIntegrationDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, DollarSign, Mail, MousePointerClick, Clock, CalendarCheck } from "lucide-react";
import { useHasPermission } from "@/hooks/usePermissions";

// Lazy load non-critical widgets for better initial load performance
const UpcomingEventsWidget = lazy(() => import("./UpcomingEventsWidget").then(m => ({ default: m.UpcomingEventsWidget })));
const StatusOverviewWidget = lazy(() => import("./StatusOverviewWidget").then(m => ({ default: m.StatusOverviewWidget })));
const RecentEmailsWidget = lazy(() => import("./RecentEmailsWidget").then(m => ({ default: m.RecentEmailsWidget })));
const RevenuePieChart = lazy(() => import("./RevenuePieChart").then(m => ({ default: m.RevenuePieChart })));
const CalendarConnectionCard = lazy(() => import("./CalendarConnectionCard").then(m => ({ default: m.CalendarConnectionCard })));
const OnlineStoreAnalyticsWidget = lazy(() => import("./OnlineStoreAnalyticsWidget").then(m => ({ default: m.OnlineStoreAnalyticsWidget })));
const OnlineStoreOrdersWidget = lazy(() => import("./OnlineStoreOrdersWidget").then(m => ({ default: m.OnlineStoreOrdersWidget })));
const OnlineStoreProductsWidget = lazy(() => import("./OnlineStoreProductsWidget").then(m => ({ default: m.OnlineStoreProductsWidget })));
const ShopifyAnalyticsCard = lazy(() => import("./ShopifyAnalyticsCard").then(m => ({ default: m.ShopifyAnalyticsCard })));
const ShopifyOrdersWidget = lazy(() => import("./ShopifyOrdersWidget").then(m => ({ default: m.ShopifyOrdersWidget })));
const ShopifyProductsSyncWidget = lazy(() => import("./ShopifyProductsSyncWidget").then(m => ({ default: m.ShopifyProductsSyncWidget })));
const ShopifyProductCategoriesWidget = lazy(() => import("./ShopifyProductCategoriesWidget").then(m => ({ default: m.ShopifyProductCategoriesWidget })));
const TeamMembersWidget = lazy(() => import("./TeamMembersWidget").then(m => ({ default: m.TeamMembersWidget })));
const RecentlyCreatedJobsWidget = lazy(() => import("./RecentlyCreatedJobsWidget").then(m => ({ default: m.RecentlyCreatedJobsWidget })));
const RecentAppointmentsWidget = lazy(() => import("./RecentAppointmentsWidget").then(m => ({ default: m.RecentAppointmentsWidget })));

// Widget skeleton fallback
const WidgetSkeleton = () => (
  <div className="space-y-3 p-4">
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);


export const EnhancedHomeDashboard = () => {
  const [showShopifyDialog, setShowShopifyDialog] = useState(false);
  const [showWidgetCustomizer, setShowWidgetCustomizer] = useState(false);
  const { kpiConfigs, toggleKPI, reorderKPIs, getEnabledKPIs } = useKPIConfig();
  const { widgets, toggleWidget, reorderWidgets, getEnabledWidgets, getAvailableWidgets, updateWidgetSize } = useDashboardWidgets();
  
  // Use batched queries for better performance
  const { criticalStats, secondaryStats, hasOnlineStore } = useBatchedDashboardQueries();
  
  // Combine stats from both queries
  const stats = useMemo(() => {
    if (!criticalStats.data) return null;
    return {
      totalClients: criticalStats.data.totalClients,
      pendingQuotes: criticalStats.data.pendingQuotes,
      totalRevenue: criticalStats.data.totalRevenue,
      lowStockItems: secondaryStats.data?.lowStockItems || 0,
      totalAppointments: secondaryStats.data?.totalAppointments || 0,
      activeSchedulers: secondaryStats.data?.activeSchedulers || 0,
    };
  }, [criticalStats.data, secondaryStats.data]);
  
  const { data: emailKPIs } = useEmailKPIs();
  const { integration: shopifyIntegration } = useShopifyIntegrationReal();
  const isShopifyConnected = !!shopifyIntegration?.is_connected;
  
  // Permission checks for widgets
  const canViewCalendar = useHasPermission('view_calendar');
  const canViewShopify = useHasPermission('view_shopify');
  const canViewEmails = useHasPermission('view_emails');
  const canViewInventory = useHasPermission('view_inventory');

  // Debug logging for Shopify permission
  console.log('[Dashboard] Shopify Permission Check:', {
    canViewShopify,
    type: typeof canViewShopify,
    isTrue: canViewShopify === true,
    isFalse: canViewShopify === false,
    isUndefined: canViewShopify === undefined
  });

  // Filter enabled widgets by permissions AND integration type
  const enabledWidgets = useMemo(() => {
    // Don't filter until we know the store status
    if (hasOnlineStore.isLoading) return [];
    
    const widgets = getEnabledWidgets();
    const filtered = widgets.filter(widget => {
      // MUTUAL EXCLUSIVITY: Only one e-commerce platform can be active
      if (widget.integrationType === 'shopify') {
        // Hide Shopify widgets if InteriorApp store exists
        if (hasOnlineStore.data) return false;
        // Show Shopify widgets only if Shopify is connected
        if (!isShopifyConnected) return false;
      }
      
      if (widget.integrationType === 'online_store') {
        // Hide InteriorApp store widgets if Shopify is connected
        if (isShopifyConnected) return false;
        // Show InteriorApp store widgets only if store exists
        if (hasOnlineStore.data !== true) return false;
      }

      // Then check permissions
      if (!widget.requiredPermission) return true;

      // Check specific permissions - ONLY show if explicitly true
      if (widget.requiredPermission === 'view_calendar') return canViewCalendar === true;
      if (widget.requiredPermission === 'view_shopify') return canViewShopify === true;
      if (widget.requiredPermission === 'view_emails') return canViewEmails === true;
      if (widget.requiredPermission === 'view_inventory') return canViewInventory === true;

      return false;
    });
    
    return filtered;
  }, [getEnabledWidgets, canViewCalendar, canViewShopify, canViewEmails, canViewInventory, isShopifyConnected, hasOnlineStore.data, hasOnlineStore.isLoading]);

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

      {/* E-Commerce Gateway Widget */}
      <ECommerceGatewayWidget />

      {/* Dynamic Widgets Grid - Lazy loaded for performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {enabledWidgets.map((widget) => {
          const sizeClasses = {
            small: "col-span-1",
            medium: "col-span-1 xl:col-span-2",
            large: "col-span-full"
          };
          
          const renderWidget = () => {
            switch (widget.id) {
              case "shopify-orders":
                return isShopifyConnected ? <ShopifyOrdersWidget /> : null;
              case "shopify-products":
                return isShopifyConnected ? <ShopifyProductsSyncWidget /> : null;
              case "shopify-categories":
                return isShopifyConnected ? <ShopifyProductCategoriesWidget /> : null;
              case "shopify":
                return isShopifyConnected ? <ShopifyAnalyticsCard /> : null;
              case "team":
                return <TeamMembersWidget />;
              case "events":
                return <UpcomingEventsWidget />;
              case "recent-appointments":
                return <RecentAppointmentsWidget />;
              case "emails":
                return <RecentEmailsWidget />;
              case "status":
                return <StatusOverviewWidget />;
              case "revenue":
                return <RevenuePieChart />;
              case "calendar-connection":
                return <CalendarConnectionCard />;
              case "recent-jobs":
                return <RecentlyCreatedJobsWidget />;
              case "online-store-analytics":
                return hasOnlineStore.data ? <OnlineStoreAnalyticsWidget /> : null;
              case "online-store-orders":
                return hasOnlineStore.data ? <OnlineStoreOrdersWidget /> : null;
              case "online-store-products":
                return hasOnlineStore.data ? <OnlineStoreProductsWidget /> : null;
              default:
                return null;
            }
          };

          return (
            <div key={widget.id} className={sizeClasses[widget.size]}>
              <Suspense fallback={<WidgetSkeleton />}>
                {renderWidget()}
              </Suspense>
            </div>
          );
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
        widgets={getAvailableWidgets()}
        onToggle={toggleWidget}
        onReorder={reorderWidgets}
        onSizeChange={updateWidgetSize}
      />
    </div>
  );
};
