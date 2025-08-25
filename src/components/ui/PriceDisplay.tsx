import React from "react";
import { cn } from "@/lib/utils";
import { useMarkupSettings, calculateWithMarkup, calculateMarkupAmount } from "@/hooks/useMarkupSettings";
import { useUserRole } from "@/hooks/useUserRole";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PriceDisplayProps {
  baseCost: number;
  category?: string;
  className?: string;
  showBreakdown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'prominent';
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  baseCost,
  category,
  className,
  showBreakdown = false,
  size = 'md',
  variant = 'default'
}) => {
  const { data: markupSettings } = useMarkupSettings();
  const { data: userRole } = useUserRole();
  const { units } = useMeasurementUnits();

  const finalPrice = calculateWithMarkup(baseCost, category, markupSettings);
  const markupAmount = calculateMarkupAmount(baseCost, category, markupSettings);
  
  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    return `${currencySymbols[units.currency] || units.currency}${amount.toFixed(2)}`;
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  };

  const variantClasses = {
    default: 'text-foreground',
    subtle: 'text-muted-foreground',
    prominent: 'text-primary font-semibold'
  };

  // Regular users see final price only
  if (!userRole?.canViewMarkup) {
    return (
      <span className={cn(sizeClasses[size], variantClasses[variant], className)}>
        {formatCurrency(finalPrice)}
      </span>
    );
  }

  // Owners/Admins can see cost breakdown
  if (showBreakdown && userRole?.canViewMarkup) {
    return (
      <div className={cn("space-y-1", className)}>
        <div className={cn(sizeClasses[size], variantClasses[variant])}>
          {formatCurrency(finalPrice)}
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Base Cost:</span>
            <span>{formatCurrency(baseCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>Markup ({markupSettings?.category_markups[category?.toLowerCase() || ''] || markupSettings?.default_markup_percentage || 0}%):</span>
            <span>{formatCurrency(markupAmount)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Simple price with tooltip for authorized users
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            sizeClasses[size], 
            variantClasses[variant], 
            "cursor-help inline-flex items-center gap-1",
            className
          )}>
            {formatCurrency(finalPrice)}
            <Info className="h-3 w-3 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="space-y-1">
            <div>Base Cost: {formatCurrency(baseCost)}</div>
            <div>Markup: {formatCurrency(markupAmount)}</div>
            <div>Category: {category || 'Default'}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};