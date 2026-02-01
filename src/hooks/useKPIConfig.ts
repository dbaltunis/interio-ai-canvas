import { useState, useCallback, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { KPITarget, TargetPeriod } from '@/utils/kpiTargetProgress';
import { getEffectiveOwnerForMutation } from '@/utils/getEffectiveOwnerForMutation';

// Re-export for convenience
export type { KPITarget, TargetPeriod } from '@/utils/kpiTargetProgress';

export interface KPIConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  category: 'primary' | 'email' | 'business';
  customTitle?: string;
  color?: string;
  displayFormat: 'card' | 'compact' | 'gauge';
  size: 'small' | 'medium' | 'large';
  refreshInterval: number; // in minutes
  showTrend: boolean;
  thresholds?: {
    warning?: number;
    critical?: number;
  };
  dataPeriod: '7d' | '30d' | '90d' | 'all';
  target?: KPITarget;
}

export interface KPIData {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  category: 'primary' | 'email' | 'business';
}

export const DEFAULT_KPI_CONFIGS: KPIConfig[] = [
  { id: 'total-revenue', title: 'Total Revenue', enabled: true, order: 0, category: 'primary', displayFormat: 'card', size: 'medium', refreshInterval: 15, showTrend: true, dataPeriod: '30d' },
  { id: 'active-projects', title: 'Active Projects', enabled: true, order: 1, category: 'primary', displayFormat: 'card', size: 'medium', refreshInterval: 15, showTrend: true, dataPeriod: '30d' },
  { id: 'pending-quotes', title: 'Pending Quotes', enabled: true, order: 2, category: 'primary', displayFormat: 'card', size: 'medium', refreshInterval: 15, showTrend: true, dataPeriod: '30d' },
  { id: 'total-clients', title: 'Total Clients', enabled: true, order: 3, category: 'primary', displayFormat: 'card', size: 'medium', refreshInterval: 30, showTrend: true, dataPeriod: 'all' },
  { id: 'appointments-booked', title: 'Appointments Booked', enabled: true, order: 4, category: 'primary', displayFormat: 'card', size: 'medium', refreshInterval: 10, showTrend: true, dataPeriod: '30d' },
  { id: 'emails-sent', title: 'Emails Sent', enabled: true, order: 0, category: 'email', displayFormat: 'card', size: 'medium', refreshInterval: 5, showTrend: true, dataPeriod: '7d' },
  { id: 'open-rate', title: 'Open Rate', enabled: true, order: 1, category: 'email', displayFormat: 'gauge', size: 'medium', refreshInterval: 5, showTrend: true, dataPeriod: '7d' },
  { id: 'click-rate', title: 'Click Rate', enabled: true, order: 2, category: 'email', displayFormat: 'gauge', size: 'medium', refreshInterval: 5, showTrend: true, dataPeriod: '7d' },
  { id: 'avg-time-spent', title: 'Avg. Time Spent', enabled: true, order: 3, category: 'email', displayFormat: 'compact', size: 'small', refreshInterval: 10, showTrend: false, dataPeriod: '7d' },
  { id: 'conversion-rate', title: 'Conversion Rate', enabled: true, order: 0, category: 'business', displayFormat: 'gauge', size: 'medium', refreshInterval: 60, showTrend: true, dataPeriod: '90d' },
  { id: 'avg-quote-value', title: 'Avg Quote Value', enabled: true, order: 1, category: 'business', displayFormat: 'card', size: 'medium', refreshInterval: 30, showTrend: true, dataPeriod: '30d' },
  { id: 'completed-jobs', title: 'Completed Jobs', enabled: true, order: 2, category: 'business', displayFormat: 'card', size: 'medium', refreshInterval: 30, showTrend: true, dataPeriod: '30d' },
  { id: 'response-time', title: 'Response Time', enabled: true, order: 3, category: 'business', displayFormat: 'compact', size: 'small', refreshInterval: 10, showTrend: true, dataPeriod: '7d' },
];

const defaultKPIConfigs = DEFAULT_KPI_CONFIGS;

export const useKPIConfig = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [kpiConfigs, setKpiConfigs] = useState<KPIConfig[]>(defaultKPIConfigs);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('dashboard_preferences')
          .select('kpi_configs')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.kpi_configs && Array.isArray(data.kpi_configs) && data.kpi_configs.length > 0) {
          // Merge saved configs with defaults (in case new KPIs were added)
          const savedConfigs = data.kpi_configs as unknown as KPIConfig[];
          const mergedConfigs = defaultKPIConfigs.map(defaultConfig => {
            const savedConfig = savedConfigs.find(c => c.id === defaultConfig.id);
            return savedConfig || defaultConfig;
          });
          setKpiConfigs(mergedConfigs);
        }
      } catch (error) {
        console.error('Error loading KPI preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id]);

  // Save preferences to database
  const savePreferences = useCallback(async (configs: KPIConfig[]) => {
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
          .update({ kpi_configs: configs as unknown as any })
          .eq('user_id', effectiveOwnerId);
      } else {
        // Insert new record
        await supabase
          .from('dashboard_preferences')
          .insert({ user_id: effectiveOwnerId, kpi_configs: configs as unknown as any });
      }
    } catch (error) {
      console.error('Error saving KPI preferences:', error);
    }
  }, [user?.id]);

  const updateKPIConfig = useCallback((updatedConfigs: KPIConfig[]) => {
    setKpiConfigs(updatedConfigs);
    savePreferences(updatedConfigs);
  }, [savePreferences]);

  const toggleKPI = useCallback((id: string) => {
    setKpiConfigs(prev => {
      const updated = prev.map(config => 
        config.id === id ? { ...config, enabled: !config.enabled } : config
      );
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const reorderKPIs = useCallback((category: 'primary' | 'email' | 'business', activeId: string, overId: string) => {
    setKpiConfigs(prev => {
      const categoryKPIs = prev.filter(config => config.category === category);
      const otherKPIs = prev.filter(config => config.category !== category);
      
      const activeIndex = categoryKPIs.findIndex(config => config.id === activeId);
      const overIndex = categoryKPIs.findIndex(config => config.id === overId);
      
      if (activeIndex === -1 || overIndex === -1) return prev;
      
      const reorderedCategoryKPIs = [...categoryKPIs];
      const [removed] = reorderedCategoryKPIs.splice(activeIndex, 1);
      reorderedCategoryKPIs.splice(overIndex, 0, removed);
      
      // Update order property
      const updatedCategoryKPIs = reorderedCategoryKPIs.map((config, index) => ({
        ...config,
        order: index
      }));
      
      const updated = [...otherKPIs, ...updatedCategoryKPIs].sort((a, b) => {
        if (a.category !== b.category) {
          const categoryOrder = { primary: 0, email: 1, business: 2 };
          return categoryOrder[a.category] - categoryOrder[b.category];
        }
        return a.order - b.order;
      });

      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const updateKPIProperty = useCallback((id: string, property: keyof KPIConfig, value: any) => {
    setKpiConfigs(prev => {
      const updated = prev.map(config => 
        config.id === id ? { ...config, [property]: value } : config
      );
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const resetToDefaults = useCallback(() => {
    setKpiConfigs(defaultKPIConfigs);
    savePreferences(defaultKPIConfigs);
  }, [savePreferences]);

  const getEnabledKPIs = useCallback((category: 'primary' | 'email' | 'business') => {
    return kpiConfigs
      .filter(config => config.category === category && config.enabled)
      .sort((a, b) => a.order - b.order);
  }, [kpiConfigs]);

  const getKPIConfig = useCallback((id: string) => {
    return kpiConfigs.find(config => config.id === id);
  }, [kpiConfigs]);

  return {
    kpiConfigs,
    isLoading,
    updateKPIConfig,
    toggleKPI,
    reorderKPIs,
    updateKPIProperty,
    resetToDefaults,
    getEnabledKPIs,
    getKPIConfig
  };
};
