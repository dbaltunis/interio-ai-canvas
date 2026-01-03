import React from 'react';
import { Check, CheckCheck, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppStatusIconProps {
  status: string;
  className?: string;
  showLabel?: boolean;
}

export const WhatsAppStatusIcon: React.FC<WhatsAppStatusIconProps> = ({ 
  status, 
  className,
  showLabel = false 
}) => {
  const statusLower = status?.toLowerCase() || 'pending';

  const getStatusConfig = () => {
    switch (statusLower) {
      case 'read':
      case 'opened':
        return {
          icon: CheckCheck,
          color: 'text-blue-500',
          label: 'Read'
        };
      case 'delivered':
        return {
          icon: CheckCheck,
          color: 'text-muted-foreground',
          label: 'Delivered'
        };
      case 'sent':
        return {
          icon: Check,
          color: 'text-muted-foreground',
          label: 'Sent'
        };
      case 'failed':
      case 'error':
        return {
          icon: X,
          color: 'text-destructive',
          label: 'Failed'
        };
      case 'pending':
      case 'queued':
      default:
        return {
          icon: Clock,
          color: 'text-muted-foreground',
          label: 'Pending'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Icon className={cn('h-3.5 w-3.5', config.color)} />
      {showLabel && (
        <span className={cn('text-xs', config.color)}>{config.label}</span>
      )}
    </span>
  );
};
