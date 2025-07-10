import { useState, useCallback } from 'react';
import { LucideIcon } from 'lucide-react';

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

const defaultKPIConfigs: KPIConfig[] = [
  { id: 'total-revenue', title: 'Total Revenue', enabled: true, order: 0, category: 'primary', displayFormat: 'card', size: 'medium', refreshInterval: 15, showTrend: true, dataPeriod: '30d' },
  { id: 'active-projects', title: 'Active Projects', enabled: true, order: 1, category: 'primary', displayFormat: 'card', size: 'medium', refreshInterval: 15, showTrend: true, dataPeriod: '30d' },
  { id: 'pending-quotes', title: 'Pending Quotes', enabled: true, order: 2, category: 'primary', displayFormat: 'card', size: 'medium', refreshInterval: 15, showTrend: true, dataPeriod: '30d' },
  { id: 'total-clients', title: 'Total Clients', enabled: true, order: 3, category: 'primary', displayFormat: 'card', size: 'medium', refreshInterval: 30, showTrend: true, dataPeriod: 'all' },
  { id: 'emails-sent', title: 'Emails Sent', enabled: true, order: 0, category: 'email', displayFormat: 'card', size: 'medium', refreshInterval: 5, showTrend: true, dataPeriod: '7d' },
  { id: 'open-rate', title: 'Open Rate', enabled: true, order: 1, category: 'email', displayFormat: 'gauge', size: 'medium', refreshInterval: 5, showTrend: true, dataPeriod: '7d' },
  { id: 'click-rate', title: 'Click Rate', enabled: true, order: 2, category: 'email', displayFormat: 'gauge', size: 'medium', refreshInterval: 5, showTrend: true, dataPeriod: '7d' },
  { id: 'avg-time-spent', title: 'Avg. Time Spent', enabled: true, order: 3, category: 'email', displayFormat: 'compact', size: 'small', refreshInterval: 10, showTrend: false, dataPeriod: '7d' },
  { id: 'conversion-rate', title: 'Conversion Rate', enabled: true, order: 0, category: 'business', displayFormat: 'gauge', size: 'medium', refreshInterval: 60, showTrend: true, dataPeriod: '90d' },
  { id: 'avg-quote-value', title: 'Avg Quote Value', enabled: true, order: 1, category: 'business', displayFormat: 'card', size: 'medium', refreshInterval: 30, showTrend: true, dataPeriod: '30d' },
  { id: 'completed-jobs', title: 'Completed Jobs', enabled: true, order: 2, category: 'business', displayFormat: 'card', size: 'medium', refreshInterval: 30, showTrend: true, dataPeriod: '30d' },
  { id: 'response-time', title: 'Response Time', enabled: true, order: 3, category: 'business', displayFormat: 'compact', size: 'small', refreshInterval: 10, showTrend: true, dataPeriod: '7d' },
];

export const useKPIConfig = () => {
  const [kpiConfigs, setKpiConfigs] = useState<KPIConfig[]>(defaultKPIConfigs);

  const updateKPIConfig = useCallback((updatedConfigs: KPIConfig[]) => {
    setKpiConfigs(updatedConfigs);
  }, []);

  const toggleKPI = useCallback((id: string) => {
    setKpiConfigs(prev => 
      prev.map(config => 
        config.id === id ? { ...config, enabled: !config.enabled } : config
      )
    );
  }, []);

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
      
      return [...otherKPIs, ...updatedCategoryKPIs].sort((a, b) => {
        if (a.category !== b.category) {
          const categoryOrder = { primary: 0, email: 1, business: 2 };
          return categoryOrder[a.category] - categoryOrder[b.category];
        }
        return a.order - b.order;
      });
    });
  }, []);

  const updateKPIProperty = useCallback((id: string, property: keyof KPIConfig, value: any) => {
    setKpiConfigs(prev => 
      prev.map(config => 
        config.id === id ? { ...config, [property]: value } : config
      )
    );
  }, []);

  const resetToDefaults = useCallback(() => {
    setKpiConfigs(defaultKPIConfigs);
  }, []);

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
    updateKPIConfig,
    toggleKPI,
    reorderKPIs,
    updateKPIProperty,
    resetToDefaults,
    getEnabledKPIs,
    getKPIConfig
  };
};