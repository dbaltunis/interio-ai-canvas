import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface PricingHierarchyBadgeProps {
  level: 'category' | 'subcategory' | 'sub-subcategory' | 'option';
  pricingMethod?: string;
  inheritsFrom?: 'category' | 'subcategory';
  price?: number;
}

export const PricingHierarchyBadge = ({ 
  level, 
  pricingMethod, 
  inheritsFrom,
  price 
}: PricingHierarchyBadgeProps) => {
  const getLevelColor = (lvl: string) => {
    switch (lvl) {
      case 'category':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
      case 'subcategory':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/30';
      case 'sub-subcategory':
        return 'bg-green-500/10 text-green-700 border-green-500/30';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/30';
    }
  };

  const formatPricingMethod = (method?: string) => {
    if (!method) return 'No pricing';
    
    const methodMap: Record<string, string> = {
      'fixed': 'Fixed Price',
      'per-unit': 'Per Unit',
      'per-item': 'Per Item',
      'per-linear-meter': 'Per Meter',
      'per-linear-yard': 'Per Yard',
      'per-sqm': 'Per Sq.M',
      'percentage': 'Percentage',
      'pricing-grid': 'Pricing Grid',
    };
    
    return methodMap[method] || method;
  };

  if (!pricingMethod && !inheritsFrom) {
    return null;
  }

  const tooltipContent = inheritsFrom 
    ? `Inherits "${formatPricingMethod(pricingMethod)}" from ${inheritsFrom}`
    : `Pricing set at ${level} level: ${formatPricingMethod(pricingMethod)}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <Badge 
              variant="outline" 
              className={`text-xs ${getLevelColor(inheritsFrom || level)}`}
            >
              {inheritsFrom && <span className="opacity-60">↓ </span>}
              {formatPricingMethod(pricingMethod)}
              {price !== undefined && ` - £${price.toFixed(2)}`}
            </Badge>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
