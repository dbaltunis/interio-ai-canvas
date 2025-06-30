
import { Info } from "lucide-react";

type PricingMethod = 'per-unit' | 'per-meter' | 'per-sqm' | 'fabric-based' | 'fixed' | 'percentage';

interface PricingMethodInfoProps {
  pricingMethod: PricingMethod;
}

export const PricingMethodInfo = ({ pricingMethod }: PricingMethodInfoProps) => {
  const getPricingMethodDescription = (method: PricingMethod) => {
    switch (method) {
      case 'per-unit':
        return 'Fixed price per unit/panel';
      case 'per-meter':
        return 'Price per linear meter of track/rail width';
      case 'per-sqm':
        return 'Price per square meter (width × drop)';
      case 'fabric-based':
        return 'Price based on main fabric usage (width × drop × fullness) - ideal for linings that follow fabric calculations';
      case 'fixed':
        return 'One-time fixed cost regardless of size';
      case 'percentage':
        return 'Percentage of total fabric cost';
      default:
        return '';
    }
  };

  if (!pricingMethod) return null;

  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <strong>How this works:</strong> {getPricingMethodDescription(pricingMethod)}
        </div>
      </div>
    </div>
  );
};
