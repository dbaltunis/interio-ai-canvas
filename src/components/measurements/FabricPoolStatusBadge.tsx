import { Badge } from "@/components/ui/badge";
import { Package, Recycle, Layers, Check, AlertTriangle } from "lucide-react";

export type PoolStatus = 
  | "new_order" 
  | "using_pool" 
  | "mixed_source" 
  | "pool_available" 
  | "low_pool";

interface FabricPoolStatusBadgeProps {
  status: PoolStatus;
  className?: string;
}

export const FabricPoolStatusBadge = ({ 
  status, 
  className 
}: FabricPoolStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "new_order":
        return {
          icon: Package,
          label: "New Order",
          className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
        };
      case "using_pool":
        return {
          icon: Recycle,
          label: "Using Pool",
          className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        };
      case "mixed_source":
        return {
          icon: Layers,
          label: "Mixed Source",
          className: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
        };
      case "pool_available":
        return {
          icon: Check,
          label: "Pool Available",
          className: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
        };
      case "low_pool":
        return {
          icon: AlertTriangle,
          label: "Low Pool",
          className: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
        };
      default:
        return {
          icon: Package,
          label: "Unknown",
          className: "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${className} flex items-center gap-1.5 text-xs font-medium`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
