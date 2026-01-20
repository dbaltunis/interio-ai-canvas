import { useState, useMemo, Suspense, useEffect } from "react";
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets";
import { WelcomeHeader } from "./WelcomeHeader";
import { DashboardWidgetCustomizer } from "./DashboardWidgetCustomizer";
import { CompactKPIRow } from "./CompactKPIRow";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { useBatchedDashboardQueries } from "@/hooks/useBatchedDashboardQueries";
import { ShopifyIntegrationDialog } from "@/components/library/ShopifyIntegrationDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, DollarSign } from "lucide-react";
import { useHasPermission } from "@/hooks/usePermissions";
import { disableShopifyWidgets } from "@/utils/disableShopifyWidgets";
import { DashboardDateProvider, useDashboardDate } from "@/contexts/DashboardDateContext";
import { useIsDealer } from "@/hooks/useIsDealer";
import { DealerWelcomeHeader } from "./DealerWelcomeHeader";
import { DealerRecentJobsWidget } from "./DealerRecentJobsWidget";
import { lazyWithRetry } from "@/utils/lazyWithRetry";


// Lazy load non-critical widgets for better initial load performance (with automatic retry)
const UpcomingEventsWidget = lazyWithRetry(() => import("./UpcomingEventsWidget").then(m => ({ default: m.UpcomingEventsWidget })), "UpcomingEventsWidget");
const StatusOverviewWidget = lazyWithRetry(() => import("./StatusOverviewWidget").then(m => ({ default: m.StatusOverviewWidget })), "StatusOverviewWidget");
const RecentEmailsWidget = lazyWithRetry(() => import("./RecentEmailsWidget").then(m => ({ default: m.RecentEmailsWidget })), "RecentEmailsWidget");
const RevenueTrendChart = lazyWithRetry(() => import("./RevenueTrendChart").then(m => ({ default: m.RevenueTrendChart })), "RevenueTrendChart");
const JobsStatusChart = lazyWithRetry(() => import("./JobsStatusChart").then(m => ({ default: m.JobsStatusChart })), "JobsStatusChart");
const CalendarConnectionCard = lazyWithRetry(() => import("./CalendarConnectionCard").then(m => ({ default: m.CalendarConnectionCard })), "CalendarConnectionCard");
const OnlineStoreAnalyticsWidget = lazyWithRetry(() => import("./OnlineStoreAnalyticsWidget").then(m => ({ default: m.OnlineStoreAnalyticsWidget })), "OnlineStoreAnalyticsWidget");
const OnlineStoreOrdersWidget = lazyWithRetry(() => import("./OnlineStoreOrdersWidget").then(m => ({ default: m.OnlineStoreOrdersWidget })), "OnlineStoreOrdersWidget");
const OnlineStoreProductsWidget = lazyWithRetry(() => import("./OnlineStoreProductsWidget").then(m => ({ default: m.OnlineStoreProductsWidget })), "OnlineStoreProductsWidget");
const ShopifyAnalyticsCard = lazyWithRetry(() => import("./ShopifyAnalyticsCard").then(m => ({ default: m.ShopifyAnalyticsCard })), "ShopifyAnalyticsCard");
const ShopifyOrdersWidget = lazyWithRetry(() => import("./ShopifyOrdersWidget").then(m => ({ default: m.ShopifyOrdersWidget })), "ShopifyOrdersWidget");
const ShopifyProductsSyncWidget = lazyWithRetry(() => import("./ShopifyProductsSyncWidget").then(m => ({ default: m.ShopifyProductsSyncWidget })), "ShopifyProductsSyncWidget");
const ShopifyProductCategoriesWidget = lazyWithRetry(() => import("./ShopifyProductCategoriesWidget").then(m => ({ default: m.ShopifyProductCategoriesWidget })), "ShopifyProductCategoriesWidget");
const TeamMembersWidget = lazyWithRetry(() => import("./TeamMembersWidget").then(m => ({ default: m.TeamMembersWidget })), "TeamMembersWidget");
const DealerPerformanceWidget = lazyWithRetry(() => import("./DealerPerformanceWidget"), "DealerPerformanceWidget");
const RecentlyCreatedJobsWidget = lazyWithRetry(() => import("./RecentlyCreatedJobsWidget").then(m => ({ default: m.RecentlyCreatedJobsWidget })), "RecentlyCreatedJobsWidget");
const RecentAppointmentsWidget = lazyWithRetry(() => import("./RecentAppointmentsWidget").then(m => ({ default: m.RecentAppointmentsWidget })), "RecentAppointmentsWidget");

// Widget skeleton fallback
const WidgetSkeleton = () => (
  <div className="space-y-3 p-4">
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

/**
 * Simplified dealer dashboard component
 * - No revenue, active projects count, team info
 * - No charts showing all account data
 * - Only their own recent jobs
 */
const DealerDashboard = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Simplified Dealer Welcome Header - no stats, no customize button */}
      <DealerWelcomeHeader />

      {/* Only their own recent jobs - no charts, no revenue */}
      <DealerRecentJobsWidget />
    </div>
  );
};


const DashboardContent = () => {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const { data: isDealer, isLoading: isDealerLoading } = useIsDealer();
  const [showShopifyDialog, setShowShopifyDialog] = useState(false);
  const [showWidgetCustomizer, setShowWidgetCustomizer] = useState(false);
  const { dateRange } = useDashboardDate();
  const { widgets, toggleWidget, reorderWidgets, getEnabledWidgets, getAvailableWidgets, updateWidgetSize } = useDashboardWidgets();
  
  // Use batched queries for better performance
  const { criticalStats, secondaryStats, hasOnlineStore } = useBatchedDashboardQueries();
  
  const { integration: shopifyIntegration } = useShopifyIntegrationReal();
  const isShopifyConnected = !!shopifyIntegration?.is_connected;

  // Permission checks for widgets
  const canViewCalendar = useHasPermission('view_calendar');
  const canViewShopify = useHasPermission('view_shopify');
  const canViewEmails = useHasPermission('view_emails');
  const canViewInventory = useHasPermission('view_inventory');
  const canViewTeamPerformance = useHasPermission('view_team_performance');

  // One-time cleanup: disable Shopify widgets if Shopify isn't connected
  useEffect(() => {
    if (!isShopifyConnected) {
      disableShopifyWidgets();
    }
  }, [isShopifyConnected]);
  
  // Combine stats from both queries
  const stats = useMemo(() => {
    if (!criticalStats.data) return null;
    return {
      totalClients: criticalStats.data.totalClients,
      pendingQuotes: criticalStats.data.pendingQuotes,
      totalRevenue: criticalStats.data.totalRevenue,
      activeProjects: criticalStats.data.activeProjects,
      lowStockItems: secondaryStats.data?.lowStockItems || 0,
      totalAppointments: secondaryStats.data?.totalAppointments || 0,
      activeSchedulers: secondaryStats.data?.activeSchedulers || 0,
    };
  }, [criticalStats.data, secondaryStats.data]);
  
  // Permission checks for widgets
  const canViewTeamMembers = useHasPermission('view_team_members');
  const canViewEmailKPIs = useHasPermission('view_email_kpis');
  // If user is a dealer, show simplified dashboard (AFTER all hooks are called)
  if (!isDealerLoading && isDealer) {
    return <DealerDashboard />;
  }

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

      // Check specific permissions - show during loading (undefined), hide only if explicitly false
      if (widget.requiredPermission === 'view_calendar') return canViewCalendar !== false;
      if (widget.requiredPermission === 'view_shopify') return canViewShopify !== false;
      if (widget.requiredPermission === 'view_emails') return canViewEmails !== false;
      if (widget.requiredPermission === 'view_inventory') return canViewInventory !== false;
      if (widget.requiredPermission === 'view_team_performance') return canViewTeamPerformance !== false;
      if (widget.requiredPermission === 'view_team_members') return canViewTeamMembers !== false;

      return true; // Default to showing during loading
    });
    
    return filtered;
  }, [getEnabledWidgets, canViewCalendar, canViewShopify, canViewEmails, canViewInventory, canViewTeamMembers, isShopifyConnected, hasOnlineStore.data, hasOnlineStore.isLoading]);

  // Debug logging for Shopify status
  console.log('[Dashboard] Integration Status:', {
    canViewShopify,
    isShopifyConnected,
    hasOnlineStore: hasOnlineStore.data,
    totalEnabledWidgets: getEnabledWidgets().length,
    displayedWidgets: enabledWidgets.length,
    filteredOutCount: getEnabledWidgets().length - enabledWidgets.length
  });

  // Compact metrics for top row - use real data from batched queries
  const compactMetrics = [
    { id: "revenue", label: "Revenue", value: stats?.totalRevenue || 0, icon: DollarSign, isCurrency: true },
    { id: "projects", label: "Active Projects", value: stats?.activeProjects || 0, icon: FileText },
    { id: "quotes", label: "Pending Quotes", value: stats?.pendingQuotes || 0, icon: FileText },
    { id: "clients", label: "Clients", value: stats?.totalClients || 0, icon: Users },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Section */}
      <WelcomeHeader onCustomizeClick={() => setShowWidgetCustomizer(true)} />

      {/* Compact KPI Row - Shopify-style top metrics */}
      <CompactKPIRow metrics={compactMetrics} loading={criticalStats.isLoading} />

      {/* Charts Row - Revenue trend and Jobs status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Suspense fallback={<WidgetSkeleton />}>
          <RevenueTrendChart />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <JobsStatusChart />
        </Suspense>
      </div>

      {/* Dynamic Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
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
              case "dealer-performance":
                return <DealerPerformanceWidget />;
              case "events":
                return <UpcomingEventsWidget />;
              case "recent-appointments":
                return <RecentAppointmentsWidget />;
              case "emails":
                return <RecentEmailsWidget />;
              case "status":
                return <StatusOverviewWidget />;
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

          const widgetContent = renderWidget();
          
          // Don't render container if widget returns null
          if (!widgetContent) return null;

          return (
            <div key={widget.id} className={sizeClasses[widget.size]}>
              <Suspense fallback={<WidgetSkeleton />}>
                {widgetContent}
              </Suspense>
            </div>
          );
        })}
      </div>

      
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

// Wrapper with date context provider
export const EnhancedHomeDashboard = () => (
  <DashboardDateProvider>
    <DashboardContent />
  </DashboardDateProvider>
);
