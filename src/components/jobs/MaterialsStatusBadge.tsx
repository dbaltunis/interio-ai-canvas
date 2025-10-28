import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, ShoppingCart, Package, CheckCircle } from "lucide-react";

interface MaterialsStatusBadgeProps {
  status?: string;
}

export const MaterialsStatusBadge = ({ status = 'not_processed' }: MaterialsStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'not_processed':
        return { 
          label: 'Not Processed', 
          variant: 'outline' as const,
          icon: AlertCircle,
          className: 'text-muted-foreground'
        };
      case 'in_queue':
        return { 
          label: 'In Queue', 
          variant: 'secondary' as const,
          icon: Clock,
          className: 'text-blue-600 dark:text-blue-400'
        };
      case 'ordered':
        return { 
          label: 'Ordered', 
          variant: 'default' as const,
          icon: ShoppingCart,
          className: 'text-orange-600 dark:text-orange-400'
        };
      case 'partially_received':
        return { 
          label: 'Partial', 
          variant: 'default' as const,
          icon: Package,
          className: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'received':
        return { 
          label: 'Received', 
          variant: 'default' as const,
          icon: CheckCircle,
          className: 'text-green-600 dark:text-green-400'
        };
      default:
        return { 
          label: 'Unknown', 
          variant: 'outline' as const,
          icon: AlertCircle,
          className: 'text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
