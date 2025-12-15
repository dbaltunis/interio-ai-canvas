// KPI Target Progress Utilities

export type ProgressStatus = 'critical' | 'warning' | 'on-track' | 'exceeded';
export type TargetPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface KPITarget {
  value: number;
  unit?: string;
  period: TargetPeriod;
  enabled: boolean;
}

export const calculateProgress = (current: number, target: number): number => {
  if (target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 150); // Cap at 150%
};

export const getProgressStatus = (progress: number): ProgressStatus => {
  if (progress >= 100) return 'exceeded';
  if (progress >= 80) return 'on-track';
  if (progress >= 50) return 'warning';
  return 'critical';
};

export const getProgressColor = (status: ProgressStatus): string => {
  switch (status) {
    case 'exceeded': return 'hsl(var(--chart-2))'; // Green
    case 'on-track': return 'hsl(var(--chart-2))'; // Green
    case 'warning': return 'hsl(var(--chart-4))'; // Yellow/Orange
    case 'critical': return 'hsl(var(--destructive))'; // Red
  }
};

export const getProgressBgColor = (status: ProgressStatus): string => {
  switch (status) {
    case 'exceeded': return 'bg-green-500';
    case 'on-track': return 'bg-green-500';
    case 'warning': return 'bg-yellow-500';
    case 'critical': return 'bg-red-500';
  }
};

export const formatProgressDisplay = (
  current: number,
  target: number,
  unit?: string
): string => {
  const prefix = unit || '';
  const formatNum = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  };
  return `${prefix}${formatNum(current)} / ${prefix}${formatNum(target)}`;
};

export const getPeriodLabel = (period: TargetPeriod): string => {
  switch (period) {
    case 'daily': return 'per day';
    case 'weekly': return 'per week';
    case 'monthly': return 'per month';
    case 'quarterly': return 'per quarter';
    case 'yearly': return 'per year';
  }
};

export const parseNumericValue = (value: string | number): number => {
  if (typeof value === 'number') return value;
  // Remove currency symbols and commas, parse as float
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};
