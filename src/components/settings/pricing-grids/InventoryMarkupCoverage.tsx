/**
 * Inventory Markup Coverage
 * Shows how markups apply to different inventory categories
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shirt, 
  Blinds, 
  Wrench, 
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useEnhancedInventory } from '@/hooks/useEnhancedInventory';
import { useMarkupSettings } from '@/hooks/useMarkupSettings';
import { cn } from '@/lib/utils';

interface CategorySummary {
  category: string;
  displayName: string;
  icon: React.ReactNode;
  itemCount: number;
  withGrid: number;
  withoutGrid: number;
  effectiveMarkup: number;
  markupSource: string;
}

export const InventoryMarkupCoverage = () => {
  const { data: inventory = [] } = useEnhancedInventory();
  const { data: markupSettings } = useMarkupSettings();
  
  const defaultMarkup = markupSettings?.default_markup_percentage || 0;
  const categoryMarkups = markupSettings?.category_markups || {};

  const categorySummaries = useMemo<CategorySummary[]>(() => {
    // Count items by category
    const categoryMap: Record<string, { items: any[], withGrid: number }> = {};
    
    inventory.forEach(item => {
      const cat = item.category || 'other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { items: [], withGrid: 0 };
      }
      categoryMap[cat].items.push(item);
      if (item.pricing_grid_id || item.price_group) {
        categoryMap[cat].withGrid++;
      }
    });

    const getCategoryIcon = (cat: string) => {
      switch (cat.toLowerCase()) {
        case 'fabric': return <Shirt className="h-4 w-4" />;
        case 'material': return <Blinds className="h-4 w-4" />;
        case 'hardware': return <Wrench className="h-4 w-4" />;
        case 'service': return <Package className="h-4 w-4" />;
        default: return <Layers className="h-4 w-4" />;
      }
    };

    const getCategoryDisplayName = (cat: string) => {
      const names: Record<string, string> = {
        fabric: 'Fabrics',
        material: 'Materials (Blinds)',
        hardware: 'Hardware & Tracks',
        service: 'Services & Installation',
        heading: 'Headings',
        lining: 'Linings',
        other: 'Other'
      };
      return names[cat.toLowerCase()] || cat;
    };

    const getEffectiveMarkup = (cat: string): { markup: number; source: string } => {
      // Check category-specific markup
      const catKey = cat.toLowerCase();
      
      // Map inventory categories to markup setting keys
      const categoryToMarkupKey: Record<string, string> = {
        fabric: 'fabric',
        material: 'blinds',
        hardware: 'hardware',
        service: 'installation',
        heading: 'fabric',
        lining: 'fabric'
      };
      
      const markupKey = categoryToMarkupKey[catKey] || catKey;
      const catMarkup = categoryMarkups[markupKey];
      
      if (catMarkup && catMarkup > 0) {
        return { markup: catMarkup, source: `Category: ${markupKey}` };
      }
      
      if (defaultMarkup > 0) {
        return { markup: defaultMarkup, source: 'Default' };
      }
      
      return { markup: 0, source: 'None (at cost)' };
    };

    return Object.entries(categoryMap)
      .map(([cat, data]) => {
        const { markup, source } = getEffectiveMarkup(cat);
        return {
          category: cat,
          displayName: getCategoryDisplayName(cat),
          icon: getCategoryIcon(cat),
          itemCount: data.items.length,
          withGrid: data.withGrid,
          withoutGrid: data.items.length - data.withGrid,
          effectiveMarkup: markup,
          markupSource: source
        };
      })
      .filter(s => s.itemCount > 0)
      .sort((a, b) => b.itemCount - a.itemCount);
  }, [inventory, categoryMarkups, defaultMarkup]);

  const totalItems = inventory.length;
  const itemsWithGrid = inventory.filter(i => i.pricing_grid_id || i.price_group).length;
  const coveragePercent = totalItems > 0 ? Math.round((itemsWithGrid / totalItems) * 100) : 0;

  if (inventory.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Inventory Markup Coverage
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{itemsWithGrid}/{totalItems} with grids</span>
            <Progress value={coveragePercent} className="w-20 h-2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categorySummaries.map((summary) => (
            <div 
              key={summary.category}
              className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-background">
                  {summary.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{summary.displayName}</p>
                  <p className="text-xs text-muted-foreground">{summary.itemCount} items</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {summary.withGrid > 0 ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {summary.withGrid > 0 ? `${summary.withGrid} w/grid` : 'No grids'}
                  </span>
                </div>
                <Badge 
                  variant={summary.effectiveMarkup > 0 ? "default" : "outline"}
                  className={cn(
                    "text-xs",
                    summary.effectiveMarkup > 0 ? "bg-emerald-500" : ""
                  )}
                >
                  +{summary.effectiveMarkup}%
                </Badge>
              </div>
              
              <p className="text-[10px] text-muted-foreground mt-1 truncate">
                → {summary.markupSource}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
