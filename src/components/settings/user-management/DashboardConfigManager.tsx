import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCcw, BarChart3, LayoutGrid } from "lucide-react";
import { useUserDashboardConfig } from "@/hooks/useUserDashboardConfig";
import { useToast } from "@/hooks/use-toast";
import { KPIConfig } from "@/hooks/useKPIConfig";
import { DashboardWidget } from "@/hooks/useDashboardWidgets";

interface DashboardConfigManagerProps {
  userId: string;
  userName: string;
}

const KPI_CATEGORIES = {
  primary: "Primary KPIs",
  email: "Email KPIs",
  business: "Business KPIs",
};

const WIDGET_CATEGORIES = {
  analytics: "Analytics",
  communication: "Communication",
  finance: "Finance",
  integrations: "Integrations",
};

export const DashboardConfigManager = ({ userId, userName }: DashboardConfigManagerProps) => {
  const { toast } = useToast();
  const {
    kpiConfigs,
    widgetConfigs,
    isLoading,
    updateKPIConfigs,
    updateWidgetConfigs,
    resetToDefaults,
  } = useUserDashboardConfig(userId);

  const handleKPIToggle = (kpiId: string, enabled: boolean) => {
    const updated = kpiConfigs.map((kpi) =>
      kpi.id === kpiId ? { ...kpi, enabled } : kpi
    );
    updateKPIConfigs.mutate(updated, {
      onSuccess: () => {
        toast({ title: "KPI updated", description: `KPI ${enabled ? "enabled" : "disabled"} for ${userName}` });
      },
    });
  };

  const handleWidgetToggle = (widgetId: string, enabled: boolean) => {
    const updated = widgetConfigs.map((widget) =>
      widget.id === widgetId ? { ...widget, enabled } : widget
    );
    updateWidgetConfigs.mutate(updated, {
      onSuccess: () => {
        toast({ title: "Widget updated", description: `Widget ${enabled ? "enabled" : "disabled"} for ${userName}` });
      },
    });
  };

  const handleReset = () => {
    resetToDefaults.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Reset complete", description: `Dashboard reset to defaults for ${userName}` });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const groupedKPIs = kpiConfigs.reduce<Record<string, KPIConfig[]>>((acc, kpi) => {
    const category = kpi.category || "primary";
    if (!acc[category]) acc[category] = [];
    acc[category].push(kpi);
    return acc;
  }, {});

  const groupedWidgets = widgetConfigs.reduce<Record<string, DashboardWidget[]>>((acc, widget) => {
    const category = widget.category || "analytics";
    if (!acc[category]) acc[category] = [];
    acc[category].push(widget);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* KPI Configuration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">KPI Configuration</h3>
          <Badge variant="secondary" className="ml-auto">
            {kpiConfigs.filter((k) => k.enabled).length}/{kpiConfigs.length} enabled
          </Badge>
        </div>

        {Object.entries(groupedKPIs).map(([category, kpis]) => (
          <div key={category} className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {KPI_CATEGORIES[category as keyof typeof KPI_CATEGORIES] || category}
            </p>
            <div className="grid gap-2">
              {kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{kpi.title}</p>
                    </div>
                  </div>
                  <Switch
                    checked={kpi.enabled}
                    onCheckedChange={(checked) => handleKPIToggle(kpi.id, checked)}
                    disabled={updateKPIConfigs.isPending}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Widget Configuration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Widget Configuration</h3>
          <Badge variant="secondary" className="ml-auto">
            {widgetConfigs.filter((w) => w.enabled).length}/{widgetConfigs.length} enabled
          </Badge>
        </div>

        {Object.entries(groupedWidgets).map(([category, widgets]) => (
          <div key={category} className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {WIDGET_CATEGORIES[category as keyof typeof WIDGET_CATEGORIES] || category}
            </p>
            <div className="grid gap-2">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div>
                    <p className="text-sm font-medium">{widget.name}</p>
                    {widget.requiredPermission && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Requires: {widget.requiredPermission}
                      </Badge>
                    )}
                  </div>
                  <Switch
                    checked={widget.enabled}
                    onCheckedChange={(checked) => handleWidgetToggle(widget.id, checked)}
                    disabled={updateWidgetConfigs.isPending}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Reset Button */}
      <div className="pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={resetToDefaults.isPending}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};
