
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { OptionSubcategoryCard } from "./OptionSubcategoryCard";
import type { OptionCategory } from "@/hooks/types/windowCoveringTypes";

interface OptionCategoryCardProps {
  category: OptionCategory;
  formatCurrency: (amount: number) => string;
  getPricingLabel: (method: string) => string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  expandedSubcategories: Set<string>;
  onToggleSubcategory: (id: string) => void;
  expandedSubSubcategories: Set<string>;
  onToggleSubSubcategory: (id: string) => void;
}

export const OptionCategoryCard = ({ 
  category, 
  formatCurrency, 
  getPricingLabel,
  isExpanded,
  onToggleExpanded,
  expandedSubcategories,
  onToggleSubcategory,
  expandedSubSubcategories,
  onToggleSubSubcategory
}: OptionCategoryCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Category Level */}
        <div 
          className="p-4 border-b bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={onToggleExpanded}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              {category.image_url && (
                <img 
                  src={category.image_url} 
                  alt={category.name}
                  className="w-8 h-8 object-cover rounded border"
                />
              )}
              <div>
                <h5 className="font-semibold text-brand-primary">{category.name}</h5>
                {category.description && (
                  <p className="text-sm text-gray-600">{category.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {category.is_required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {category.subcategories?.length || 0} subcategories
              </Badge>
            </div>
          </div>
        </div>

        {/* Subcategories */}
        {isExpanded && category.subcategories && (
          <div className="ml-4">
            {category.subcategories.map((subcategory) => (
              <OptionSubcategoryCard
                key={subcategory.id}
                subcategory={subcategory}
                formatCurrency={formatCurrency}
                getPricingLabel={getPricingLabel}
                isExpanded={expandedSubcategories.has(subcategory.id)}
                onToggleExpanded={() => onToggleSubcategory(subcategory.id)}
                expandedSubSubcategories={expandedSubSubcategories}
                onToggleSubSubcategory={onToggleSubSubcategory}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
