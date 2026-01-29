import { cn } from "@/lib/utils";
import { 
  CheckCircle2, Clock, XCircle, AlertCircle, Send, 
  Eye, MousePointerClick, Loader2 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type EmailStatus = 
  | 'queued' 
  | 'sending' 
  | 'sent' 
  | 'delivered' 
  | 'opened' 
  | 'clicked' 
  | 'bounced' 
  | 'failed' 
  | 'spam';

interface EmailStatusDotProps {
  status: EmailStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showTooltip?: boolean;
  openCount?: number;
  clickCount?: number;
  className?: string;
}

const statusConfig: Record<EmailStatus, { 
  color: string; 
  bgColor: string; 
  icon: React.ComponentType<{ className?: string }>; 
  label: string;
  pulseColor?: string;
}> = {
  queued: {
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/20',
    icon: Clock,
    label: 'Queued',
    pulseColor: 'bg-amber-400',
  },
  sending: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
    icon: Loader2,
    label: 'Sending',
    pulseColor: 'bg-blue-400',
  },
  sent: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
    icon: Send,
    label: 'Sent',
  },
  delivered: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    icon: CheckCircle2,
    label: 'Delivered',
    pulseColor: 'bg-green-400',
  },
  opened: {
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/20',
    icon: Eye,
    label: 'Opened',
  },
  clicked: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/20',
    icon: MousePointerClick,
    label: 'Clicked',
  },
  bounced: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
    icon: AlertCircle,
    label: 'Bounced',
  },
  failed: {
    color: 'text-red-600',
    bgColor: 'bg-red-600/20',
    icon: XCircle,
    label: 'Failed',
  },
  spam: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/20',
    icon: AlertCircle,
    label: 'Marked as Spam',
  },
};

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const iconSizeClasses = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
};

export const EmailStatusDot = ({
  status,
  size = 'md',
  showLabel = false,
  showTooltip = true,
  openCount,
  clickCount,
  className,
}: EmailStatusDotProps) => {
  const normalizedStatus = (status?.toLowerCase() || 'sent') as EmailStatus;
  const config = statusConfig[normalizedStatus] || statusConfig.sent;
  const Icon = config.icon;
  const isPulsing = ['queued', 'sending', 'delivered'].includes(normalizedStatus);
  const isSpinning = normalizedStatus === 'sending';

  const content = (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn(
        "relative flex items-center justify-center rounded-full",
        config.bgColor,
        sizeClasses[size]
      )}>
        {/* Pulse animation for active states */}
        {isPulsing && config.pulseColor && (
          <span className={cn(
            "absolute inset-0 rounded-full animate-ping opacity-75",
            config.pulseColor
          )} />
        )}
        <Icon className={cn(
          config.color,
          iconSizeClasses[size],
          isSpinning && "animate-spin"
        )} />
      </div>
      
      {showLabel && (
        <span className={cn("text-xs font-medium", config.color)}>
          {config.label}
        </span>
      )}
      
      {/* Engagement metrics inline */}
      {(openCount !== undefined && openCount > 0) && (
        <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" />
          <span>{openCount}</span>
        </div>
      )}
      {(clickCount !== undefined && clickCount > 0) && (
        <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
          <MousePointerClick className="h-3 w-3" />
          <span>{clickCount}</span>
        </div>
      )}
    </div>
  );

  if (!showTooltip) return content;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p className="font-medium">{config.label}</p>
          {openCount !== undefined && openCount > 0 && (
            <p className="text-muted-foreground">Opened {openCount} time{openCount > 1 ? 's' : ''}</p>
          )}
          {clickCount !== undefined && clickCount > 0 && (
            <p className="text-muted-foreground">{clickCount} click{clickCount > 1 ? 's' : ''}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Quick status badge component for compact display
export const EmailStatusBadge = ({
  status,
  className,
}: {
  status: EmailStatus | string;
  className?: string;
}) => {
  const normalizedStatus = (status?.toLowerCase() || 'sent') as EmailStatus;
  const config = statusConfig[normalizedStatus] || statusConfig.sent;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      config.bgColor,
      config.color,
      className
    )}>
      {config.label}
    </span>
  );
};
