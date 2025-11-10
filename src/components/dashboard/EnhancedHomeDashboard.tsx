import { useState, useMemo } from "react";
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
import { ECommerceGatewayWidget } from "./ECommerceGatewayWidget";
import { OnlineStoreAnalyticsWidget } from "./OnlineStoreAnalyticsWidget";
import { OnlineStoreOrdersWidget } from "./OnlineStoreOrdersWidget";
import { OnlineStoreProductsWidget } from "./OnlineStoreProductsWidget";
import { ShopifyAnalyticsCard } from "./ShopifyAnalyticsCard";
import { ShopifyOrdersWidget } from "./ShopifyOrdersWidget";
import { ShopifyProductsSyncWidget } from "./ShopifyProductsSyncWidget";
import { ShopifyProductCategoriesWidget } from "./ShopifyProductCategoriesWidget";
import { DraggableKPISection } from "./DraggableKPISection";
import { TeamMembersWidget } from "./TeamMembersWidget";
import { RecentlyCreatedJobsWidget } from "./RecentlyCreatedJobsWidget";
import { RecentAppointmentsWidget } from "./RecentAppointmentsWidget";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useEmailKPIs } from "@/hooks/useEmails";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShopifyIntegrationDialog } from "@/components/library/ShopifyIntegrationDialog";
import { Users, FileText, Package, DollarSign, Mail, MousePointerClick, Clock, TrendingUp, Store, CalendarCheck } from "lucide-react";
import { useHasPermission } from "@/hooks/usePermissions";


export const EnhancedHomeDashboard = () => {
  const [showShopifyDialog, setShowShopifyDialog] = useState(false);
  const [showWidgetCustomizer, setShowWidgetCustomizer] = useState(false);
  const { kpiConfigs, toggleKPI, reorderKPIs, getEnabledKPIs } = useKPIConfig();
  const { widgets, toggleWidget, reorderWidgets, getEnabledWidgets, getAvailableWidgets, updateWidgetSize } = useDashboardWidgets();
  const { data: stats } = useDashboardStats();
  const { data: emailKPIs } = useEmailKPIs();
  const { integration: shopifyIntegration } = useShopifyIntegrationReal();
  const isShopifyConnected = !!shopifyIntegration?.is_connected;

  // Check if user has Online Store
  const { data: hasOnlineStore, isLoading: isLoadingStore } = useQuery({
    queryKey: ['has-online-store'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data } = await supabase
        .from('online_stores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      console.log('[EnhancedHomeDashboard] Online store query result:', data);
      return !!data;
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always', // Always refetch when component mounts
  });

  console.log('[Dashboard] hasOnlineStore:', hasOnlineStore, 'isShopifyConnected:', isShopifyConnected);
  
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
    if (isLoadingStore) return [];
    
    const widgets = getEnabledWidgets();
    console.log('[Dashboard] All enabled widgets before filtering:', widgets.map(w => ({ id: w.id, permission: w.requiredPermission, integrationType: w.integrationType })));
    console.log('[Dashboard] Integration status:', { hasOnlineStore, isShopifyConnected });
    
    const filtered = widgets.filter(widget => {
      // Filter by integration type first - EXPLICIT checks
      if (widget.integrationType === 'shopify') {
        if (!isShopifyConnected) {
          console.log(`[Dashboard] Hiding ${widget.id} - Shopify not connected`);
          return false;
        }
      }
      
      if (widget.integrationType === 'online_store') {
        if (hasOnlineStore !== true) {
          console.log(`[Dashboard] Hiding ${widget.id} - No online store (hasOnlineStore=${hasOnlineStore})`);
          return false;
        }
      }

      // Then check permissions
      if (!widget.requiredPermission) return true;

      // Check specific permissions - ONLY show if explicitly true
      if (widget.requiredPermission === 'view_calendar') {
        const result = canViewCalendar === true;
        console.log(`[Dashboard] Widget ${widget.id} requires view_calendar:`, { canViewCalendar, result });
        return result;
      }
      if (widget.requiredPermission === 'view_shopify') {
        const result = canViewShopify === true;
        console.log(`[Dashboard] Widget ${widget.id} requires view_shopify:`, { canViewShopify, result });
        return result;
      }
      if (widget.requiredPermission === 'view_emails') {
        const result = canViewEmails === true;
        console.log(`[Dashboard] Widget ${widget.id} requires view_emails:`, { canViewEmails, result });
        return result;
      }
      if (widget.requiredPermission === 'view_inventory') {
        const result = canViewInventory === true;
        console.log(`[Dashboard] Widget ${widget.id} requires view_inventory:`, { canViewInventory, result });
        return result;
      }

      // If permission check is undefined or false, DON'T show
      return false;
    });
    
    console.log('[Dashboard] Filtered enabled widgets:', filtered.map(w => w.id));
    return filtered;
  }, [getEnabledWidgets, canViewCalendar, canViewShopify, canViewEmails, canViewInventory, isShopifyConnected, hasOnlineStore, isLoadingStore]);

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

      {/* Dynamic Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {enabledWidgets.map((widget) => {
          const sizeClasses = {
            small: "col-span-1",
            medium: "col-span-1 xl:col-span-2",
            large: "col-span-full"
          };
          
          switch (widget.id) {
            case "shopify-orders":
              return isShopifyConnected ? (
                <div key={widget.id} className={sizeClasses[widget.size]}>
                  <ShopifyOrdersWidget />
                </div>
              ) : null;
            
            case "shopify-products":
              return isShopifyConnected ? (
                <div key={widget.id} className={sizeClasses[widget.size]}>
                  <ShopifyProductsSyncWidget />
                </div>
              ) : null;
            
            case "shopify-categories":
              return isShopifyConnected ? (
                <div key={widget.id} className={sizeClasses[widget.size]}>
                  <ShopifyProductCategoriesWidget />
                </div>
              ) : null;
            
            case "shopify":
              return isShopifyConnected ? (
                <div key={widget.id} className={sizeClasses[widget.size]}>
                  <ShopifyAnalyticsCard />
                </div>
              ) : null;
            
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
            
            case "online-store-analytics":
              return hasOnlineStore ? (
                <div key={widget.id} className={sizeClasses[widget.size]}>
                  <OnlineStoreAnalyticsWidget />
                </div>
              ) : null;
            
            case "online-store-orders":
              return hasOnlineStore ? (
                <div key={widget.id} className={sizeClasses[widget.size]}>
                  <OnlineStoreOrdersWidget />
                </div>
              ) : null;
            
            case "online-store-products":
              return hasOnlineStore ? (
                <div key={widget.id} className={sizeClasses[widget.size]}>
                  <OnlineStoreProductsWidget />
                </div>
              ) : null;
            
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
        widgets={getAvailableWidgets()}
        onToggle={toggleWidget}
        onReorder={reorderWidgets}
        onSizeChange={updateWidgetSize}
      />
    </div>
  );
};
