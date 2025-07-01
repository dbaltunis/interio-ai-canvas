
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OptionSubSubcategoryCard } from "./OptionSubSubcategoryCard";
import type { OptionSubcategory } from "@/hooks/types/windowCoveringTypes";

interface OptionSubcategoryCardProps {
  subcategory: OptionSubcategory;
  formatCurrency: (amount: number) => string;
  getPricingLabel: (method: string) => string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  expandedSubSubcategories: Set<string>;
  onToggleSubSubcategory: (id: string) => void;
}

export const OptionSubcategoryCard = ({ 
  subcategory, 
  formatCurrency, 
  getPricingLabel,
  isExpanded,
  onToggleExpanded,
  expandedSubSubcategories,
  onToggleSubSubcategory
}: OptionSubcategoryCardProps) => {
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
            {subcategory.image_url && (
              <img 
                src={subcategory.image_url} 
                alt={subcategory.name}
                className="w-6 h-6 object-cover rounded border"
              />
            )}
            <div>
              <h6 className="font-medium">{subcategory.name}</h6>
              {subcategory.description && (
                <p className="text-xs text-gray-600">{subcategory.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {formatCurrency(subcategory.base_price)} {getPricingLabel(subcategory.pricing_method)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {subcategory.sub_subcategories?.length || 0} options
            </Badge>
          </div>
        </div>
      </div>

      {/* Sub-subcategories */}
      {isExpanded && subcategory.sub_subcategories && (
        <div className="ml-6 bg-gray-25">
          {subcategory.sub_subcategories.map((subSubcategory) => (
            <OptionSubSubcategoryCard
              key={subSubcategory.id}
              subSubcategory={subSubcategory}
              formatCurrency={formatCurrency}
              getPricingLabel={getPricingLabel}
              isExpanded={expandedSubSubcategories.has(subSubcategory.id)}
              onToggleExpanded={() => onToggleSubSubcategory(subSubcategory.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
