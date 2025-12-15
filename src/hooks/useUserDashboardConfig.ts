import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPIConfig, DEFAULT_KPI_CONFIGS } from "./useKPIConfig";
import { DashboardWidget, DEFAULT_WIDGETS } from "./useDashboardWidgets";

interface DashboardPreferences {
  kpi_configs: KPIConfig[];
  widget_configs: DashboardWidget[];
}

export const useUserDashboardConfig = (targetUserId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["user-dashboard-config", targetUserId],
    queryFn: async (): Promise<DashboardPreferences> => {
      if (!targetUserId) {
        return { kpi_configs: DEFAULT_KPI_CONFIGS, widget_configs: DEFAULT_WIDGETS };
      }

      const { data, error } = await supabase
        .from("dashboard_preferences")
        .select("kpi_configs, widget_configs")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user dashboard config:", error);
        return { kpi_configs: DEFAULT_KPI_CONFIGS, widget_configs: DEFAULT_WIDGETS };
      }

      return {
        kpi_configs: (data?.kpi_configs as unknown as KPIConfig[]) || DEFAULT_KPI_CONFIGS,
        widget_configs: (data?.widget_configs as unknown as DashboardWidget[]) || DEFAULT_WIDGETS,
      };
    },
    enabled: !!targetUserId,
  });

  const updateKPIConfigs = useMutation({
    mutationFn: async (configs: KPIConfig[]) => {
      if (!targetUserId) throw new Error("No target user ID");

      const { data: existing } = await supabase
        .from("dashboard_preferences")
        .select("id")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("dashboard_preferences")
          .update({ kpi_configs: configs as unknown as any })
          .eq("user_id", targetUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("dashboard_preferences")
          .insert({ user_id: targetUserId, kpi_configs: configs as unknown as any });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-dashboard-config", targetUserId] });
    },
  });

  const updateWidgetConfigs = useMutation({
    mutationFn: async (configs: DashboardWidget[]) => {
      if (!targetUserId) throw new Error("No target user ID");

      const { data: existing } = await supabase
        .from("dashboard_preferences")
        .select("id")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("dashboard_preferences")
          .update({ widget_configs: configs as unknown as any })
          .eq("user_id", targetUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("dashboard_preferences")
          .insert({ user_id: targetUserId, widget_configs: configs as unknown as any });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-dashboard-config", targetUserId] });
    },
  });

  const resetToDefaults = useMutation({
    mutationFn: async () => {
      if (!targetUserId) throw new Error("No target user ID");

      const { error } = await supabase
        .from("dashboard_preferences")
        .delete()
        .eq("user_id", targetUserId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-dashboard-config", targetUserId] });
    },
  });

  return {
    kpiConfigs: data?.kpi_configs || DEFAULT_KPI_CONFIGS,
    widgetConfigs: data?.widget_configs || DEFAULT_WIDGETS,
    isLoading,
    updateKPIConfigs,
    updateWidgetConfigs,
    resetToDefaults,
  };
};
