
import { Badge } from "@/components/ui/badge";
import type { OptionExtra } from "@/hooks/types/windowCoveringTypes";

interface OptionExtraItemProps {
  extra: OptionExtra;
  formatCurrency: (amount: number) => string;
  getPricingLabel: (method: string) => string;
}

export const OptionExtraItem = ({ extra, formatCurrency, getPricingLabel }: OptionExtraItemProps) => {
  return (
    <div className="p-2 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {extra.image_url && (
            <img 
              src={extra.image_url} 
              alt={extra.name}
              className="w-4 h-4 object-cover rounded border"
            />
          )}
          <div>
            <span className="text-sm font-medium">{extra.name}</span>
            {extra.description && (
              <p className="text-xs text-gray-600">{extra.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Badge variant="secondary" className="text-xs">
            {formatCurrency(extra.base_price)} {getPricingLabel(extra.pricing_method)}
          </Badge>
          {extra.is_required && (
            <Badge variant="destructive" className="text-xs">Required</Badge>
          )}
          {extra.is_default && (
            <Badge variant="default" className="text-xs">Default</Badge>
          )}
        </div>
      </div>
    </div>
  );
};
