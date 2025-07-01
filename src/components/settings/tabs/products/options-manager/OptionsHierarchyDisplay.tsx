
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { OptionCategoryCard } from "./OptionCategoryCard";
import type { OptionCategory } from "@/hooks/types/windowCoveringTypes";

interface OptionsHierarchyDisplayProps {
  categories: OptionCategory[];
}

export const OptionsHierarchyDisplay = ({ categories }: OptionsHierarchyDisplayProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [expandedSubSubcategories, setExpandedSubSubcategories] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string, type: 'category' | 'subcategory' | 'subsubcategory') => {
    const setterMap = {
      category: setExpandedCategories,
      subcategory: setExpandedSubcategories,
      subsubcategory: setExpandedSubSubcategories
    };
    
    const setter = setterMap[type];
    setter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getPricingLabel = (method: string) => {
    const labels: Record<string, string> = {
      'per-unit': 'per unit',
      'per-meter': 'per meter',
      'per-sqm': 'per sqm',
      'fixed': 'fixed',
      'percentage': '%',
      'per-item': 'per item'
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium">Available Option Categories</h4>
        <Badge variant="outline">{categories.length} categories</Badge>
      </div>

      {categories.map((category) => (
        <OptionCategoryCard
          key={category.id}
          category={category}
          formatCurrency={formatCurrency}
          getPricingLabel={getPricingLabel}
          isExpanded={expandedCategories.has(category.id)}
          onToggleExpanded={() => toggleExpanded(category.id, 'category')}
          expandedSubcategories={expandedSubcategories}
          onToggleSubcategory={(id) => toggleExpanded(id, 'subcategory')}
          expandedSubSubcategories={expandedSubSubcategories}
          onToggleSubSubcategory={(id) => toggleExpanded(id, 'subsubcategory')}
        />
      ))}

      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-brand-neutral mb-4">
            This hierarchical structure will be available for selection when customers configure their window coverings.
          </p>
          <p className="text-xs text-gray-500">
            Note: The pricing logic for this hierarchical system will be implemented in the calculator and job creation flow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
