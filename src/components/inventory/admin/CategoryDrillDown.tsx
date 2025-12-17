import { useState } from "react";
import { ChevronRight, ChevronDown, Package, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryData {
  category: string;
  count: number;
  costValue: number;
  retailValue: number;
  subcategories?: { name: string; count: number; costValue: number; retailValue: number }[];
}

interface CategoryDrillDownProps {
  categories: CategoryData[];
  currencySymbol: string;
  totalRetail: number;
  onCategoryClick?: (category: string) => void;
}

export const CategoryDrillDown = ({
  categories,
  currencySymbol,
  totalRetail,
  onCategoryClick
}: CategoryDrillDownProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getMargin = (cost: number, retail: number) => {
    return retail > 0 ? ((retail - cost) / retail) * 100 : 0;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      fabric: "🧵",
      material: "🪵",
      hardware: "🔩",
      wallcovering: "🎨",
      services: "🛠️",
      accessories: "✨"
    };
    return icons[category.toLowerCase()] || "📦";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Inventory by Category
        </h3>
      </div>

      <div className="space-y-1">
        {categories.map((cat) => {
          const isExpanded = expandedCategory === cat.category;
          const margin = getMargin(cat.costValue, cat.retailValue);
          const shareOfTotal = totalRetail > 0 ? (cat.retailValue / totalRetail) * 100 : 0;

          return (
            <div key={cat.category} className="rounded-lg overflow-hidden">
              {/* Category Row */}
              <button
                onClick={() => {
                  setExpandedCategory(isExpanded ? null : cat.category);
                  onCategoryClick?.(cat.category);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 text-left transition-all",
                  "hover:bg-muted/50 rounded-lg",
                  isExpanded && "bg-muted/50"
                )}
              >
                {/* Expand Icon */}
                <div className="text-muted-foreground">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>

                {/* Category Icon & Name */}
                <div className="flex items-center gap-2 min-w-[140px]">
                  <span className="text-lg">{getCategoryIcon(cat.category)}</span>
                  <span className="font-medium">{cat.category}</span>
                  <Badge variant="secondary" className="text-xs ml-1">
                    {cat.count}
                  </Badge>
                </div>

                {/* Progress Bar (Share of Total) */}
                <div className="flex-1 max-w-[200px] hidden md:block">
                  <Progress value={shareOfTotal} className="h-1.5" />
                </div>

                {/* Values */}
                <div className="flex items-center gap-4 md:gap-6 text-sm ml-auto">
                  <div className="text-right hidden sm:block">
                    <p className="text-muted-foreground text-xs">Cost</p>
                    <p className="font-medium tabular-nums">{currencySymbol}{formatValue(cat.costValue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">Retail</p>
                    <p className="font-medium tabular-nums">{currencySymbol}{formatValue(cat.retailValue)}</p>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="text-muted-foreground text-xs">GP%</p>
                    <p className={cn(
                      "font-semibold tabular-nums",
                      margin >= 40 ? "text-emerald-600 dark:text-emerald-400" :
                      margin >= 25 ? "text-primary" :
                      "text-amber-600 dark:text-amber-400"
                    )}>
                      {margin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && cat.subcategories && cat.subcategories.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-8 pl-4 border-l-2 border-muted space-y-1 py-2">
                      {cat.subcategories.map((sub) => {
                        const subMargin = getMargin(sub.costValue, sub.retailValue);
                        return (
                          <div
                            key={sub.name}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30 text-sm"
                          >
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground capitalize flex-1">{sub.name}</span>
                            <Badge variant="outline" className="text-xs">{sub.count}</Badge>
                            <span className="tabular-nums text-muted-foreground hidden sm:block">
                              {currencySymbol}{formatValue(sub.costValue)}
                            </span>
                            <span className="tabular-nums font-medium">
                              {currencySymbol}{formatValue(sub.retailValue)}
                            </span>
                            <span className={cn(
                              "tabular-nums text-xs font-medium min-w-[45px] text-right",
                              subMargin >= 40 ? "text-emerald-600" : subMargin >= 25 ? "text-primary" : "text-amber-600"
                            )}>
                              {subMargin.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
