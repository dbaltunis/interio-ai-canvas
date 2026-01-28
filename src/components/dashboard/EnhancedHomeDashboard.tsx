import { useState, useMemo, Suspense, useEffect } from "react";
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets";
import { WelcomeHeader } from "./WelcomeHeader";
import { DashboardWidgetCustomizer } from "./DashboardWidgetCustomizer";
import { CompactKPIRow } from "./CompactKPIRow";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { useBatchedDashboardQueries } from "@/hooks/useBatchedDashboardQueries";
import { ShopifyIntegrationDialog } from "@/components/library/ShopifyIntegrationDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, DollarSign, FolderOpen } from "lucide-react";
import { useHasPermission, useHasAnyPermission } from "@/hooks/usePermissions";
import { disableShopifyWidgets } from "@/utils/disableShopifyWidgets";
import { DashboardDateProvider, useDashboardDate } from "@/contexts/DashboardDateContext";
import { useIsDealer } from "@/hooks/useIsDealer";
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
const StatusReasonsWidget = lazyWithRetry(() => import("./StatusReasonsWidget").then(m => ({ default: m.StatusReasonsWidget })), "StatusReasonsWidget");

// Widget skeleton fallback
const WidgetSkeleton = () => (
  <div className="space-y-3 p-4">
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

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
  
  // Permission checks for KPIs and charts (permission-driven, not role-driven)
  const canViewRevenue = useHasAnyPermission(['view_revenue_kpis', 'view_analytics', 'view_primary_kpis']);
  const canViewJobs = useHasAnyPermission(['view_all_jobs', 'view_assigned_jobs']);
  const canViewClients = useHasAnyPermission(['view_all_clients', 'view_assigned_clients']);

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

  // ALL useMemo hooks MUST be called BEFORE any conditional returns (React Rules of Hooks)
  // Helper to check if a specific widget is enabled
  const isWidgetEnabled = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget?.enabled) return false;
    
    // Check permissions for specific widgets
    if (widget.requiredPermission === 'view_revenue_kpis') return canViewRevenue !== false;
    if (widget.requiredPermission === 'view_all_jobs') return canViewJobs !== false;
    
    return true;
  };

  // Filter enabled widgets by permissions AND integration type
  const enabledWidgets = useMemo(() => {
    // Don't filter until we know the store status
    if (hasOnlineStore.isLoading) return [];
    
    const allWidgets = getEnabledWidgets();
    const filtered = allWidgets.filter(widget => {
      // Chart widgets are handled separately in the charts row
      if (['revenue-trend', 'jobs-status', 'status-reasons'].includes(widget.id)) {
        return false; // Don't show in dynamic grid
      }
      
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
      
      // E-commerce gateway only shows if neither platform is set up
      if (widget.id === 'ecommerce-gateway') {
        if (hasOnlineStore.data || isShopifyConnected) return false;
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
      if (widget.requiredPermission === 'view_revenue_kpis') return canViewRevenue !== false;
      if (widget.requiredPermission === 'view_all_jobs') return canViewJobs !== false;

      return true; // Default to showing during loading
    });
    
    return filtered;
  }, [widgets, getEnabledWidgets, canViewCalendar, canViewShopify, canViewEmails, canViewInventory, canViewTeamPerformance, canViewTeamMembers, canViewRevenue, canViewJobs, isShopifyConnected, hasOnlineStore.data, hasOnlineStore.isLoading]);

  // Compact metrics for top row - PERMISSION-FILTERED (not role-based)
  // Users see only the KPIs they have permission to view
  const compactMetrics = useMemo(() => {
    const metrics = [];
    
    // Revenue KPI: requires view_revenue_kpis, view_analytics, or view_primary_kpis
    if (canViewRevenue !== false) {
      metrics.push({ id: "revenue", label: "Revenue", value: stats?.totalRevenue || 0, icon: DollarSign, isCurrency: true });
    }
    
    // Projects & Quotes KPIs: requires view_all_jobs or view_assigned_jobs
    if (canViewJobs !== false) {
      metrics.push({ id: "projects", label: "Active Projects", value: stats?.activeProjects || 0, icon: FileText });
      metrics.push({ id: "quotes", label: "Pending Quotes", value: stats?.pendingQuotes || 0, icon: FileText });
    }
    
    // Clients KPI: requires view_all_clients or view_assigned_clients
    if (canViewClients !== false) {
      metrics.push({ id: "clients", label: "Clients", value: stats?.totalClients || 0, icon: Users });
    }
    
    return metrics;
  }, [stats, canViewRevenue, canViewJobs, canViewClients]);

  // Debug logging for integration status
  console.log('[Dashboard] Integration Status:', {
    canViewShopify,
    isShopifyConnected,
    hasOnlineStore: hasOnlineStore.data,
    totalEnabledWidgets: getEnabledWidgets().length,
    displayedWidgets: enabledWidgets.length,
    filteredOutCount: getEnabledWidgets().length - enabledWidgets.length,
    isDealer
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Section - dealers don't see customize button */}
      <WelcomeHeader onCustomizeClick={!isDealer ? () => setShowWidgetCustomizer(true) : undefined} />

      {/* Compact KPI Row - Shopify-style top metrics */}
      <CompactKPIRow metrics={compactMetrics} loading={criticalStats.isLoading} />

      {/* Charts Row 1 - Now controlled by widget configs */}
      {(isWidgetEnabled('revenue-trend') || isWidgetEnabled('jobs-status')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isWidgetEnabled('revenue-trend') && (
            <Suspense fallback={<WidgetSkeleton />}>
              <RevenueTrendChart />
            </Suspense>
          )}
          {isWidgetEnabled('jobs-status') && (
            <Suspense fallback={<WidgetSkeleton />}>
              <JobsStatusChart />
            </Suspense>
          )}
        </div>
      )}

      {/* Charts Row 2 - Rejections widget controlled by widget config */}
      {isWidgetEnabled('status-reasons') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Suspense fallback={<WidgetSkeleton />}>
            <StatusReasonsWidget />
          </Suspense>
        </div>
      )}

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
              // status-reasons is now rendered directly in charts row with revenue permission
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
