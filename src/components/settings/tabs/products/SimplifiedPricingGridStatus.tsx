/**
 * Simplified Pricing Grid Status for Templates
 * 
 * Shows which price groups have grids uploaded for THIS template's treatment type.
 * Replaces the confusing TemplateGridSelector with auto-matching status.
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Upload, Grid3X3, Info, Sparkles } from 'lucide-react';
import { useEnhancedInventory } from '@/hooks/useEnhancedInventory';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthProvider';
import { doesGridMatchTreatment, getProductTypeDisplayName } from '@/utils/pricing/treatmentGridMapping';
import { TREATMENT_SUBCATEGORIES } from '@/constants/inventorySubcategories';
import type { TreatmentCategory } from '@/utils/treatmentTypeDetection';

interface SimplifiedPricingGridStatusProps {
  treatmentCategory: string;
  onUploadClick?: (priceGroup: string, productType: string) => void;
}

export const SimplifiedPricingGridStatus = ({ 
  treatmentCategory,
  onUploadClick 
}: SimplifiedPricingGridStatusProps) => {
  const { user } = useAuth();
  const { data: inventory = [] } = useEnhancedInventory();

  // Fetch pricing grids for this treatment type
  const { data: grids = [] } = useQuery({
    queryKey: ['pricing-grids-for-treatment', treatmentCategory, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('pricing_grids')
        .select('id, name, grid_code, price_group, product_type, supplier_id')
        .eq('user_id', user.id)
        .eq('active', true);
        
      if (error) throw error;
      
      // Filter to grids that match this treatment category
      return (data || []).filter(grid => 
        doesGridMatchTreatment(grid.product_type, treatmentCategory)
      );
    },
    enabled: !!user?.id && !!treatmentCategory
  });

  // Get compatible subcategories for this treatment
  const compatibleSubcategories = useMemo(() => {
    const config = TREATMENT_SUBCATEGORIES[treatmentCategory as TreatmentCategory];
    return config?.subcategories || [];
  }, [treatmentCategory]);

  // Filter inventory to only items compatible with this treatment
  const relevantInventory = useMemo(() => {
    return inventory.filter(item => {
      if (!item.subcategory) return false;
      const subcatLower = item.subcategory.toLowerCase();
      return compatibleSubcategories.some(sub => 
        sub.toLowerCase() === subcatLower || 
        subcatLower.includes(sub.toLowerCase())
      );
    });
  }, [inventory, compatibleSubcategories]);

  // Calculate price group distribution for relevant materials only
  const priceGroupStats = useMemo(() => {
    const stats: Record<string, { 
      count: number; 
      hasGrid: boolean; 
      gridName?: string;
      gridId?: string;
    }> = {};
    
    // Count materials per price group
    relevantInventory.forEach(item => {
      if (item.price_group) {
        const groupKey = item.price_group.toUpperCase().trim();
        if (!stats[groupKey]) {
          stats[groupKey] = { count: 0, hasGrid: false };
        }
        stats[groupKey].count++;
      }
    });

    // Check which groups have grids
    grids.forEach(grid => {
      if (grid.price_group) {
        const groupKey = grid.price_group.toUpperCase().trim();
        if (stats[groupKey]) {
          stats[groupKey].hasGrid = true;
          stats[groupKey].gridName = grid.name;
          stats[groupKey].gridId = grid.id;
        }
      }
    });

    return stats;
  }, [relevantInventory, grids]);

  const sortedGroups = useMemo(() => {
    return Object.entries(priceGroupStats)
      .sort((a, b) => b[1].count - a[1].count);
  }, [priceGroupStats]);

  const totalMaterials = relevantInventory.length;
  const materialsWithPriceGroup = sortedGroups.reduce((sum, [, stats]) => sum + stats.count, 0);
  const groupsWithGrids = sortedGroups.filter(([, stats]) => stats.hasGrid).length;
  const materialsWithGrids = sortedGroups
    .filter(([, stats]) => stats.hasGrid)
    .reduce((sum, [, stats]) => sum + stats.count, 0);

  // No materials for this treatment type
  if (totalMaterials === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No materials found for {getProductTypeDisplayName(treatmentCategory)}. 
          Import materials with matching subcategories first.
        </AlertDescription>
      </Alert>
    );
  }

  // All materials without price groups
  if (materialsWithPriceGroup === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {totalMaterials} materials found but none have a price group assigned. 
          Assign price groups to materials in Inventory to enable grid pricing.
        </AlertDescription>
      </Alert>
    );
  }

  const coverage = Math.round((materialsWithGrids / materialsWithPriceGroup) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">
            Pricing Grid Status for {getProductTypeDisplayName(treatmentCategory)}
          </CardTitle>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          Grids are auto-matched based on product type + price group
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {totalMaterials} materials total
          </Badge>
          <Badge variant={coverage === 100 ? "default" : "outline"}>
            {coverage}% covered
          </Badge>
          <Badge variant="outline">
            {groupsWithGrids}/{sortedGroups.length} groups have grids
          </Badge>
        </div>

        {/* Price group list */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {sortedGroups.map(([group, stats]) => (
            <div 
              key={group}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                stats.hasGrid 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {stats.hasGrid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Group {group}</span>
                    <span className="text-xs text-muted-foreground">
                      {stats.count} material{stats.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {stats.hasGrid && stats.gridName && (
                    <span className="text-xs text-green-700 dark:text-green-400 truncate block">
                      Using: {stats.gridName}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {stats.hasGrid ? (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    ✓ Ready
                  </Badge>
                ) : onUploadClick ? (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => onUploadClick(group, treatmentCategory)}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </Button>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Missing
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Help text */}
        {groupsWithGrids < sortedGroups.length && (
          <p className="text-xs text-muted-foreground pt-2 border-t">
            Upload pricing grids in the Pricing tab with matching product type and price group.
          </p>
        )}

        {/* Success state */}
        {groupsWithGrids === sortedGroups.length && sortedGroups.length > 0 && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              All price groups have grids! Materials will be priced automatically.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
