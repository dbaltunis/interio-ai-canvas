import * as React from "react";
import { Wifi, Lock, AlertCircle, KeyRound, Settings, Ruler, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ErrorIcon } from "@/utils/friendlyErrors";

interface FriendlyToastContentProps {
  icon?: ErrorIcon;
  title: string;
  message: string;
  showLoginButton?: boolean;
  onLoginClick?: () => void;
}

const iconMap: Record<ErrorIcon, React.ReactNode> = {
  network: <Wifi className="h-5 w-5" />,
  permission: <Lock className="h-5 w-5" />,
  validation: <AlertCircle className="h-5 w-5" />,
  session: <KeyRound className="h-5 w-5" />,
  config: <Settings className="h-5 w-5" />,
  calculator: <Ruler className="h-5 w-5" />,
  general: <Info className="h-5 w-5" />,
};

export function FriendlyToastContent({
  icon = 'general',
  title,
  message,
  showLoginButton,
  onLoginClick,
}: FriendlyToastContentProps) {
  return (
    <div className="flex items-start gap-3 w-full">
      <div className="flex-shrink-0 mt-0.5 text-current opacity-80">
        {iconMap[icon]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm mb-1">{title}</div>
        <div className="text-sm opacity-90 leading-relaxed">{message}</div>
        {showLoginButton && onLoginClick && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onLoginClick}
            className="mt-3 bg-white/20 hover:bg-white/30 text-current border-0"
          >
            Log In Again
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper to get variant class based on error type
export function getToastVariantForIcon(icon: ErrorIcon): 'warning' | 'destructive' {
  // Session errors are more critical, use a slightly different treatment
  if (icon === 'session') {
    return 'warning';
  }
  // All other errors use the friendly warning style
  return 'warning';
}
