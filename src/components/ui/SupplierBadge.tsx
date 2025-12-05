import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface SupplierBadgeProps {
  supplier?: string | null;
  className?: string;
  showIcon?: boolean;
}

export const SupplierBadge = ({ supplier, className, showIcon = true }: SupplierBadgeProps) => {
  if (!supplier) return null;

  // TWC supplier badge styling
  if (supplier.toUpperCase() === 'TWC') {
    return (
      <Badge 
        variant="outline" 
        className={`bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 ${className}`}
      >
        {showIcon && <Package className="h-3 w-3 mr-1" />}
        TWC
      </Badge>
    );
  }

  // Generic supplier badge
  return (
    <Badge variant="outline" className={className}>
      {supplier}
    </Badge>
  );
};
