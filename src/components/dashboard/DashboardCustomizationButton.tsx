import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPIConfigDialog } from './KPIConfigDialog';
import { KPIConfig } from '@/hooks/useKPIConfig';

interface DashboardCustomizationButtonProps {
  kpiConfigs: KPIConfig[];
  onToggleKPI: (id: string) => void;
}

export const DashboardCustomizationButton = ({
  kpiConfigs,
  onToggleKPI,
}: DashboardCustomizationButtonProps) => {
  return (
    <KPIConfigDialog kpiConfigs={kpiConfigs} onToggleKPI={onToggleKPI} />
  );
};
