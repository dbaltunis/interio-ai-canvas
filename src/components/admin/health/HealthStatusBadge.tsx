import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface HealthStatusBadgeProps {
  status: 'healthy' | 'warning' | 'critical';
  showIcon?: boolean;
}

export function HealthStatusBadge({ status, showIcon = true }: HealthStatusBadgeProps) {
  const config = {
    healthy: {
      label: 'Healthy',
      variant: 'default' as const,
      className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20',
      icon: CheckCircle,
    },
    warning: {
      label: 'Warning',
      variant: 'secondary' as const,
      className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20',
      icon: AlertTriangle,
    },
    critical: {
      label: 'Critical',
      variant: 'destructive' as const,
      className: 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20',
      icon: XCircle,
    },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <Badge variant="outline" className={className}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {label}
    </Badge>
  );
}
