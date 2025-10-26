import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export interface DashboardWidget {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
  category: "analytics" | "communication" | "finance" | "integrations";
  size: "small" | "medium" | "large";
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: "shopify",
    name: "E-Commerce Integration",
    description: "Shopify store connection and analytics",
    enabled: true,
    order: 1,
    category: "integrations",
    size: "medium",
  },
  {
    id: "team",
    name: "Team Members",
    description: "View and message your team",
    enabled: true,
    order: 2,
    category: "communication",
    size: "small",
  },
  {
    id: "events",
    name: "Upcoming Events",
    description: "Calendar appointments and meetings",
    enabled: true,
    order: 3,
    category: "communication",
    size: "small",
  },
  {
    id: "emails",
    name: "Recent Emails",
    description: "Email campaigns and metrics",
    enabled: true,
    order: 4,
    category: "communication",
    size: "small",
  },
  {
    id: "status",
    name: "Project Status",
    description: "Overview of project statuses",
    enabled: true,
    order: 5,
    category: "analytics",
    size: "small",
  },
  {
    id: "revenue",
    name: "Revenue Chart",
    description: "Revenue breakdown by project",
    enabled: true,
    order: 6,
    category: "finance",
    size: "medium",
  },
  {
    id: "calendar-connection",
    name: "Calendar Connection",
    description: "Google Calendar integration",
    enabled: true,
    order: 7,
    category: "integrations",
    size: "small",
  },
  {
    id: "recent-jobs",
    name: "Recently Created Jobs",
    description: "Latest projects and jobs",
    enabled: true,
    order: 8,
    category: "analytics",
    size: "medium",
  },
];

export const useDashboardWidgets = () => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWidgets();
  }, [user?.id]);

  const loadWidgets = async () => {
    if (!user?.id) {
      // Load from localStorage if no user
      const saved = localStorage.getItem("dashboard_widgets");
      if (saved) {
        try {
          setWidgets(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing saved widgets:", e);
        }
      }
      setIsLoading(false);
      return;
    }

    try {
      // Try to load from localStorage first
      const saved = localStorage.getItem(`dashboard_widgets_${user.id}`);
      if (saved) {
        try {
          const savedWidgets = JSON.parse(saved) as DashboardWidget[];
          const mergedWidgets = DEFAULT_WIDGETS.map(defaultWidget => {
            const savedWidget = savedWidgets.find(w => w.id === defaultWidget.id);
            return savedWidget || defaultWidget;
          });
          setWidgets(mergedWidgets);
        } catch (e) {
          console.error("Error parsing saved widgets:", e);
        }
      }
    } catch (error) {
      console.error("Error loading widgets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWidgets = async (updatedWidgets: DashboardWidget[]) => {
    const storageKey = user?.id ? `dashboard_widgets_${user.id}` : "dashboard_widgets";
    localStorage.setItem(storageKey, JSON.stringify(updatedWidgets));
    setWidgets(updatedWidgets);
  };

  const updateWidgetSize = (widgetId: string, size: "small" | "medium" | "large") => {
    const updatedWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, size } : w
    );
    saveWidgets(updatedWidgets);
  };

  const toggleWidget = (widgetId: string) => {
    const updatedWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    saveWidgets(updatedWidgets);
  };

  const reorderWidgets = (widgetId: string, direction: "up" | "down") => {
    const currentIndex = widgets.findIndex(w => w.id === widgetId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= widgets.length) return;

    const updatedWidgets = [...widgets];
    [updatedWidgets[currentIndex], updatedWidgets[newIndex]] = 
      [updatedWidgets[newIndex], updatedWidgets[currentIndex]];

    // Update order numbers
    updatedWidgets.forEach((widget, index) => {
      widget.order = index + 1;
    });

    saveWidgets(updatedWidgets);
  };

  const getEnabledWidgets = () => {
    return widgets.filter(w => w.enabled).sort((a, b) => a.order - b.order);
  };

  return {
    widgets,
    isLoading,
    toggleWidget,
    reorderWidgets,
    getEnabledWidgets,
    updateWidgetSize,
  };
};
