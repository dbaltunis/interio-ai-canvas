import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, BarChart3, LayoutGrid, Target, ChevronDown, ChevronUp } from "lucide-react";
import { useUserDashboardConfig } from "@/hooks/useUserDashboardConfig";
import { useToast } from "@/hooks/use-toast";
import { KPIConfig } from "@/hooks/useKPIConfig";
import { DashboardWidget } from "@/hooks/useDashboardWidgets";
import { TargetPeriod, getPeriodLabel } from "@/utils/kpiTargetProgress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

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

const TARGET_PERIODS: { value: TargetPeriod; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

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

  const [expandedKPIs, setExpandedKPIs] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (kpiId: string) => {
    setExpandedKPIs(prev => {
      const next = new Set(prev);
      if (next.has(kpiId)) {
        next.delete(kpiId);
      } else {
        next.add(kpiId);
      }
      return next;
    });
  };

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

  const handleTargetChange = (kpiId: string, field: 'value' | 'period' | 'enabled' | 'unit', value: any) => {
    const updated = kpiConfigs.map((kpi) => {
      if (kpi.id !== kpiId) return kpi;
      const currentTarget = kpi.target || { value: 0, period: 'monthly' as TargetPeriod, enabled: false };
      return {
        ...kpi,
        target: { ...currentTarget, [field]: value }
      };
    });
    updateKPIConfigs.mutate(updated, {
      onSuccess: () => {
        toast({ title: "Target updated", description: `KPI target updated for ${userName}` });
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
              {kpis.map((kpi) => {
                const isExpanded = expandedKPIs.has(kpi.id);
                const hasTarget = kpi.target?.enabled && kpi.target?.value > 0;
                
                return (
                  <Collapsible key={kpi.id} open={isExpanded} onOpenChange={() => toggleExpanded(kpi.id)}>
                    <div className="rounded-lg border bg-card">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <div>
                            <p className="text-sm font-medium">{kpi.title}</p>
                            {hasTarget && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Target: {kpi.target?.unit || ''}{kpi.target?.value?.toLocaleString()} {getPeriodLabel(kpi.target?.period || 'monthly')}
                              </p>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={kpi.enabled}
                          onCheckedChange={(checked) => handleKPIToggle(kpi.id, checked)}
                          disabled={updateKPIConfigs.isPending}
                        />
                      </div>
                      
                      <CollapsibleContent>
                        <div className="px-3 pb-3 pt-0 space-y-3 border-t">
                          <div className="pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Target className="h-4 w-4 text-primary" />
                                Target Settings
                              </label>
                              <Switch
                                checked={kpi.target?.enabled || false}
                                onCheckedChange={(checked) => handleTargetChange(kpi.id, 'enabled', checked)}
                                disabled={updateKPIConfigs.isPending}
                              />
                            </div>
                            
                            {kpi.target?.enabled && (
                              <div className="grid gap-3 mt-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Target Value</label>
                                    <Input
                                      type="number"
                                      placeholder="e.g., 50000"
                                      value={kpi.target?.value || ''}
                                      onChange={(e) => handleTargetChange(kpi.id, 'value', parseFloat(e.target.value) || 0)}
                                      className="h-8"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Unit/Prefix</label>
                                    <Input
                                      type="text"
                                      placeholder="e.g., $, ₹, %"
                                      value={kpi.target?.unit || ''}
                                      onChange={(e) => handleTargetChange(kpi.id, 'unit', e.target.value)}
                                      className="h-8"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground mb-1 block">Period</label>
                                  <Select
                                    value={kpi.target?.period || 'monthly'}
                                    onValueChange={(value) => handleTargetChange(kpi.id, 'period', value)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {TARGET_PERIODS.map((period) => (
                                        <SelectItem key={period.value} value={period.value}>
                                          {period.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
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
