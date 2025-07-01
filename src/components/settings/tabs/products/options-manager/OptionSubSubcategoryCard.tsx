
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OptionExtraItem } from "./OptionExtraItem";
import type { OptionSubSubcategory } from "@/hooks/types/windowCoveringTypes";

interface OptionSubSubcategoryCardProps {
  subSubcategory: OptionSubSubcategory;
  formatCurrency: (amount: number) => string;
  getPricingLabel: (method: string) => string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const OptionSubSubcategoryCard = ({ 
  subSubcategory, 
  formatCurrency, 
  getPricingLabel,
  isExpanded,
  onToggleExpanded 
}: OptionSubSubcategoryCardProps) => {
  return (
    <div>
      <div 
        className="p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
            {subSubcategory.image_url && (
              <img 
                src={subSubcategory.image_url} 
                alt={subSubcategory.name}
                className="w-5 h-5 object-cover rounded border"
              />
            )}
            <div>
              <span className="font-medium text-sm">{subSubcategory.name}</span>
              {subSubcategory.description && (
                <p className="text-xs text-gray-600">{subSubcategory.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {formatCurrency(subSubcategory.base_price)} {getPricingLabel(subSubcategory.pricing_method)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {subSubcategory.extras?.length || 0} extras
            </Badge>
          </div>
        </div>
      </div>

      {/* Extras */}
      {isExpanded && subSubcategory.extras && (
        <div className="ml-8 bg-blue-25">
          {subSubcategory.extras.map((extra) => (
            <OptionExtraItem
              key={extra.id}
              extra={extra}
              formatCurrency={formatCurrency}
              getPricingLabel={getPricingLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
};
