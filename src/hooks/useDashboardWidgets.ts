import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { getEffectiveOwnerForMutation } from "@/utils/getEffectiveOwnerForMutation";

export interface WidgetConfig {
  id: string;
  title: string;
  enabled: boolean;
  category: string;
  requiredPermission?: string;
}

export interface DashboardWidget {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
  category: "analytics" | "communication" | "finance" | "integrations";
  size: "small" | "medium" | "large";
  requiredPermission?: string;
  integrationType?: "shopify" | "online_store" | null;
}

export const DEFAULT_WIDGETS: DashboardWidget[] = [
  // === CHART WIDGETS (formerly hardcoded in charts row) ===
  {
    id: "revenue-trend",
    name: "Revenue Trend",
    description: "Monthly revenue chart with trend analysis",
    enabled: true,
    order: 1,
    category: "finance",
    size: "medium",
    requiredPermission: "view_revenue_kpis",
  },
  {
    id: "jobs-status",
    name: "Jobs by Status",
    description: "Pie chart showing project status distribution",
    enabled: true,
    order: 2,
    category: "analytics",
    size: "medium",
    requiredPermission: "view_all_jobs",
  },
  {
    id: "status-reasons",
    name: "Rejections & Cancellations",
    description: "Track project rejections, cancellations, and holds",
    enabled: true,
    order: 3,
    category: "analytics",
    size: "medium",
    requiredPermission: "view_revenue_kpis",
  },
  {
    id: "quick-actions",
    name: "Quick Actions",
    description: "Shortcuts to create projects, clients, and more",
    enabled: true,
    order: 4,
    category: "analytics",
    size: "small",
  },
  {
    id: "sales-pipeline",
    name: "Sales Pipeline",
    description: "Visual pipeline of quotes by stage",
    enabled: false,
    order: 5,
    category: "finance",
    size: "medium",
    requiredPermission: "view_revenue_kpis",
  },
  {
    id: "ecommerce-gateway",
    name: "E-Commerce Setup",
    description: "Get started with online selling",
    enabled: true,
    order: 6,
    category: "integrations",
    size: "medium",
  },
  // Shopify Widgets - Disabled by default, only enable when Shopify is connected
  {
    id: "shopify",
    name: "E-Commerce Integration",
    description: "Shopify store connection and analytics",
    enabled: false,
    order: 7,
    category: "integrations",
    size: "medium",
    requiredPermission: "view_shopify",
    integrationType: "shopify",
  },
  {
    id: "shopify-orders",
    name: "Shopify Store Performance",
    description: "Recent orders and store analytics",
    enabled: false,
    order: 8,
    category: "integrations",
    size: "large",
    requiredPermission: "view_shopify",
    integrationType: "shopify",
  },
  {
    id: "shopify-products",
    name: "Product Sync Status",
    description: "Sync products between Shopify and InterioApp",
    enabled: false,
    order: 9,
    category: "integrations",
    size: "small",
    requiredPermission: "view_shopify",
    integrationType: "shopify",
  },
  {
    id: "shopify-categories",
    name: "Product Categories",
    description: "Product breakdown by category",
    enabled: false,
    order: 10,
    category: "integrations",
    size: "small",
    requiredPermission: "view_shopify",
    integrationType: "shopify",
  },
  // Online Store Widgets (InterioApp)
  {
    id: "online-store-analytics",
    name: "Store Analytics",
    description: "Visitor and conversion metrics for your online store",
    enabled: true,
    order: 11,
    category: "analytics",
    size: "medium",
    integrationType: "online_store",
  },
  {
    id: "online-store-orders",
    name: "Store Inquiries",
    description: "Recent customer inquiries and quote requests",
    enabled: true,
    order: 12,
    category: "communication",
    size: "medium",
    integrationType: "online_store",
  },
  {
    id: "online-store-products",
    name: "Products Online",
    description: "Products visible on your online store",
    enabled: true,
    order: 13,
    category: "integrations",
    size: "small",
    integrationType: "online_store",
  },
  // General Widgets (no integration type)
  {
    id: "dealer-performance",
    name: "Team Performance",
    description: "Leaderboard showing dealer/team member performance metrics",
    enabled: true,
    order: 14,
    category: "analytics",
    size: "small",
    requiredPermission: "view_team_performance",
  },
  {
    id: "team",
    requiredPermission: "view_team_members",
    name: "Team Members",
    description: "View and message your team",
    enabled: true,
    order: 15,
    category: "communication",
    size: "small",
  },
  {
    id: "events",
    name: "Upcoming Events",
    description: "Calendar appointments and meetings",
    enabled: true,
    order: 16,
    category: "communication",
    size: "small",
    requiredPermission: "view_calendar",
  },
  {
    id: "recent-appointments",
    name: "Recent Appointments",
    description: "Latest booked appointments",
    enabled: true,
    order: 17,
    category: "communication",
    size: "small",
    requiredPermission: "view_calendar",
  },
  {
    id: "emails",
    name: "Recent Emails",
    description: "Email campaigns and metrics",
    enabled: true,
    order: 18,
    category: "communication",
    size: "small",
    requiredPermission: "view_emails",
  },
  {
    id: "status",
    name: "Project Status",
    description: "Overview of project statuses",
    enabled: true,
    order: 19,
    category: "analytics",
    size: "small",
  },
  {
    id: "calendar-connection",
    name: "Calendar Connection",
    description: "Google Calendar integration",
    enabled: true,
    order: 20,
    category: "integrations",
    size: "small",
  },
  {
    id: "recent-jobs",
    name: "Recently Created Jobs",
    description: "Latest projects and jobs",
    enabled: true,
    order: 21,
    category: "analytics",
    size: "medium",
  },
];

export const useDashboardWidgets = () => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from database
  useEffect(() => {
    const loadWidgets = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('dashboard_preferences')
          .select('widget_configs')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.widget_configs && Array.isArray(data.widget_configs) && data.widget_configs.length > 0) {
          // Merge saved widgets with defaults (in case new widgets were added)
          const savedWidgets = data.widget_configs as unknown as DashboardWidget[];
          const mergedWidgets = DEFAULT_WIDGETS.map(defaultWidget => {
            const savedWidget = savedWidgets.find(w => w.id === defaultWidget.id);
            return savedWidget ? { ...defaultWidget, ...savedWidget } : defaultWidget;
          });
          setWidgets(mergedWidgets);
        }
      } catch (error) {
        console.error('Error loading widget preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWidgets();
  }, [user?.id]);

  // Save preferences to database
  const saveWidgets = useCallback(async (updatedWidgets: DashboardWidget[]) => {
    if (!user?.id) return;

    try {
      // FIX: Use effectiveOwnerId for multi-tenant support
      const { effectiveOwnerId } = await getEffectiveOwnerForMutation();

      // First check if record exists
      const { data: existing } = await supabase
        .from('dashboard_preferences')
        .select('id')
        .eq('user_id', effectiveOwnerId)
        .maybeSingle();

      if (existing) {
        // Update existing record
        await supabase
          .from('dashboard_preferences')
          .update({ widget_configs: updatedWidgets as unknown as any })
          .eq('user_id', effectiveOwnerId);
      } else {
        // Insert new record
        await supabase
          .from('dashboard_preferences')
          .insert({ user_id: effectiveOwnerId, widget_configs: updatedWidgets as unknown as any });
      }
    } catch (error) {
      console.error('Error saving widget preferences:', error);
    }
  }, [user?.id]);

  const updateWidgetSize = useCallback((widgetId: string, size: "small" | "medium" | "large") => {
    setWidgets(prev => {
      const updated = prev.map(w => w.id === widgetId ? { ...w, size } : w);
      saveWidgets(updated);
      return updated;
    });
  }, [saveWidgets]);

  const toggleWidget = useCallback((widgetId: string) => {
    setWidgets(prev => {
      const updated = prev.map(w => w.id === widgetId ? { ...w, enabled: !w.enabled } : w);
      saveWidgets(updated);
      return updated;
    });
  }, [saveWidgets]);

  const reorderWidgets = useCallback((widgetId: string, direction: "up" | "down") => {
    setWidgets(prev => {
      const currentIndex = prev.findIndex(w => w.id === widgetId);
      if (currentIndex === -1) return prev;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const updatedWidgets = [...prev];
      [updatedWidgets[currentIndex], updatedWidgets[newIndex]] = 
        [updatedWidgets[newIndex], updatedWidgets[currentIndex]];

      // Update order numbers
      updatedWidgets.forEach((widget, index) => {
        widget.order = index + 1;
      });

      saveWidgets(updatedWidgets);
      return updatedWidgets;
    });
  }, [saveWidgets]);

  const getEnabledWidgets = useCallback(() => {
    return widgets.filter(w => w.enabled).sort((a, b) => a.order - b.order);
  }, [widgets]);

  const getAvailableWidgets = useCallback(() => {
    // Returns all widgets (for the customizer to filter by permissions)
    return widgets;
  }, [widgets]);

  return {
    widgets,
    isLoading,
    toggleWidget,
    reorderWidgets,
    getEnabledWidgets,
    getAvailableWidgets,
    updateWidgetSize,
  };
};
