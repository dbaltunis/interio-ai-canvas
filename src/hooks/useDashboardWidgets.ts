import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

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
  // Shopify Widgets - Disabled by default, only enable when Shopify is connected
  {
    id: "shopify",
    name: "E-Commerce Integration",
    description: "Shopify store connection and analytics",
    enabled: false,
    order: 1,
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
    order: 2,
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
    order: 3,
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
    order: 4,
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
    order: 5,
    category: "analytics",
    size: "medium",
    integrationType: "online_store",
  },
  {
    id: "online-store-orders",
    name: "Store Inquiries",
    description: "Recent customer inquiries and quote requests",
    enabled: true,
    order: 6,
    category: "communication",
    size: "medium",
    integrationType: "online_store",
  },
  {
    id: "online-store-products",
    name: "Products Online",
    description: "Products visible on your online store",
    enabled: true,
    order: 7,
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
    order: 8,
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
    order: 9,
    category: "communication",
    size: "small",
  },
  {
    id: "events",
    name: "Upcoming Events",
    description: "Calendar appointments and meetings",
    enabled: true,
    order: 10,
    category: "communication",
    size: "small",
    requiredPermission: "view_calendar",
  },
  {
    id: "recent-appointments",
    name: "Recent Appointments",
    description: "Latest booked appointments",
    enabled: true,
    order: 11,
    category: "communication",
    size: "small",
    requiredPermission: "view_calendar",
  },
  {
    id: "emails",
    name: "Recent Emails",
    description: "Email campaigns and metrics",
    enabled: true,
    order: 12,
    category: "communication",
    size: "small",
    requiredPermission: "view_emails",
  },
  {
    id: "status",
    name: "Project Status",
    description: "Overview of project statuses",
    enabled: true,
    order: 13,
    category: "analytics",
    size: "small",
  },
  // Revenue widget removed - RevenueTrendChart is shown in main charts row
  {
    id: "calendar-connection",
    name: "Calendar Connection",
    description: "Google Calendar integration",
    enabled: true,
    order: 15,
    category: "integrations",
    size: "small",
  },
  {
    id: "recent-jobs",
    name: "Recently Created Jobs",
    description: "Latest projects and jobs",
    enabled: true,
    order: 16,
    category: "analytics",
    size: "medium",
  },
  {
    id: "status-reasons",
    name: "Rejections & Cancellations",
    description: "Recent project rejections and cancellation reasons",
    enabled: true,
    order: 17,
    category: "analytics",
    size: "medium",
    requiredPermission: "view_primary_kpis",
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
      // First check if record exists
      const { data: existing } = await supabase
        .from('dashboard_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing record
        await supabase
          .from('dashboard_preferences')
          .update({ widget_configs: updatedWidgets as unknown as any })
          .eq('user_id', user.id);
      } else {
        // Insert new record
        await supabase
          .from('dashboard_preferences')
          .insert({ user_id: user.id, widget_configs: updatedWidgets as unknown as any });
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
