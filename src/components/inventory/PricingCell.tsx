import { Badge } from "@/components/ui/badge";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getPricingMethodSuffix, normalizePricingMethod, PRICING_METHODS } from "@/constants/pricingMethods";

interface PricingCellProps {
  item: {
    pricing_method?: string | null;
    price_group?: string | null;
    pricing_grid_id?: string | null;
    selling_price?: number | null;
    price_per_meter?: number | null;
    cost_price?: number | null;
  };
  showCost?: boolean;
  className?: string;
}

/**
 * Dynamic price display component for Library views.
 * 
 * RULES:
 * 1. If item has price_group OR pricing_method='pricing-grid' → Show badge with group
 * 2. Otherwise → Use getPricingMethodSuffix() for correct unit suffix
 * 3. NEVER hardcode '/m', '/yd', '/roll' in display logic
 */
export const PricingCell = ({ item, showCost = false, className }: PricingCellProps) => {
  const { formatCurrency } = useFormattedCurrency();
  const { units } = useMeasurementUnits();
  const isMetric = units?.system === 'metric';
  
  // Normalize the pricing method
  const normalizedMethod = normalizePricingMethod(item.pricing_method || '');
  
  // Grid pricing - show price group badge
  const isGrid = item.price_group || 
                 item.pricing_grid_id || 
                 normalizedMethod === PRICING_METHODS.PRICING_GRID;
  
  if (isGrid) {
    // Format price group display - handle various formats
    const groupDisplay = item.price_group 
      ? (item.price_group.toLowerCase().includes('group') 
          ? item.price_group 
          : `Group ${item.price_group}`)
      : 'Grid';
      
    return (
      <Badge variant="outline" className={className}>
        {groupDisplay}
      </Badge>
    );
  }
  
  // Get appropriate price and suffix
  const price = showCost 
    ? (item.cost_price ?? 0) 
    : (item.price_per_meter ?? item.selling_price ?? 0);
  const suffix = getPricingMethodSuffix(normalizedMethod, isMetric);
  
  // Handle fixed pricing (no suffix)
  if (normalizedMethod === PRICING_METHODS.FIXED && suffix === '') {
    return (
      <span className={className}>
        {formatCurrency(price)}
      </span>
    );
  }
  
  return (
    <span className={className}>
      {formatCurrency(price)}{suffix}
    </span>
  );
};
