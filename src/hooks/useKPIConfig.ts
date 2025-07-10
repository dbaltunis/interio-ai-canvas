import { useState, useCallback } from 'react';
import { LucideIcon } from 'lucide-react';

export interface KPIConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  category: 'primary' | 'email' | 'business';
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
  { id: 'total-revenue', title: 'Total Revenue', enabled: true, order: 0, category: 'primary' },
  { id: 'active-projects', title: 'Active Projects', enabled: true, order: 1, category: 'primary' },
  { id: 'pending-quotes', title: 'Pending Quotes', enabled: true, order: 2, category: 'primary' },
  { id: 'total-clients', title: 'Total Clients', enabled: true, order: 3, category: 'primary' },
  { id: 'emails-sent', title: 'Emails Sent', enabled: true, order: 0, category: 'email' },
  { id: 'open-rate', title: 'Open Rate', enabled: true, order: 1, category: 'email' },
  { id: 'click-rate', title: 'Click Rate', enabled: true, order: 2, category: 'email' },
  { id: 'avg-time-spent', title: 'Avg. Time Spent', enabled: true, order: 3, category: 'email' },
  { id: 'conversion-rate', title: 'Conversion Rate', enabled: true, order: 0, category: 'business' },
  { id: 'avg-quote-value', title: 'Avg Quote Value', enabled: true, order: 1, category: 'business' },
  { id: 'completed-jobs', title: 'Completed Jobs', enabled: true, order: 2, category: 'business' },
  { id: 'response-time', title: 'Response Time', enabled: true, order: 3, category: 'business' },
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

  const getEnabledKPIs = useCallback((category: 'primary' | 'email' | 'business') => {
    return kpiConfigs
      .filter(config => config.category === category && config.enabled)
      .sort((a, b) => a.order - b.order);
  }, [kpiConfigs]);

  return {
    kpiConfigs,
    updateKPIConfig,
    toggleKPI,
    reorderKPIs,
    getEnabledKPIs
  };
};