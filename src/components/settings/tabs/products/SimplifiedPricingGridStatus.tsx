/**
 * Simplified Pricing Grid Status for Templates
 * 
 * Shows which price groups have grids uploaded for THIS template's treatment type.
 * Includes mismatch detection between inventory price groups and grid price groups.
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Upload, Grid3X3, Info, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';
import { useEnhancedInventory } from '@/hooks/useEnhancedInventory';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthProvider';
import { doesGridMatchTreatment, getProductTypeDisplayName, getProductTypesForSubcategory } from '@/utils/pricing/treatmentGridMapping';
import { TREATMENT_SUBCATEGORIES } from '@/constants/inventorySubcategories';
import type { TreatmentCategory } from '@/utils/treatmentTypeDetection';
import { Link } from 'react-router-dom';

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

  // Fetch ALL pricing grids (we'll filter and check matches)
  const { data: allGrids = [] } = useQuery({
    queryKey: ['pricing-grids-all', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('pricing_grids')
        .select('id, name, grid_code, price_group, product_type, supplier_id')
        .eq('user_id', user.id)
        .eq('active', true);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Get compatible subcategories for this treatment
  const compatibleSubcategories = useMemo(() => {
    const config = TREATMENT_SUBCATEGORIES[treatmentCategory as TreatmentCategory];
    return config?.subcategories || [];
  }, [treatmentCategory]);

  // Filter inventory to only items compatible with this treatment
  // Using improved matching that checks for exact match OR contains
  const relevantInventory = useMemo(() => {
    if (!treatmentCategory) return [];
    
    return inventory.filter(item => {
      if (!item.subcategory) return false;
      
      const subcatLower = item.subcategory.toLowerCase().trim();
      const itemName = (item.name || '').toLowerCase();
      
      // First, check direct subcategory match
      const directMatch = compatibleSubcategories.some(sub => {
        const subLower = sub.toLowerCase();
        return subcatLower === subLower || 
               subcatLower.includes(subLower) || 
               subLower.includes(subcatLower);
      });
      
      if (directMatch) {
        // For blind_material, additionally check if item name matches treatment
        if (subcatLower === 'blind_material') {
          // Exclude items that clearly belong to other categories
          const treatmentLower = treatmentCategory.toLowerCase();
          
          // For venetian, only include if name contains venetian/slat
          if (treatmentLower.includes('venetian')) {
            return itemName.includes('venetian') || itemName.includes('slat');
          }
          // For cellular, only include if name contains cellular/honeycomb
          if (treatmentLower.includes('cellular')) {
            return itemName.includes('cellular') || itemName.includes('honeycomb') || itemName.includes('honeycell');
          }
          // For roller, include unless it's clearly something else
          if (treatmentLower.includes('roller')) {
            return !itemName.includes('venetian') && 
                   !itemName.includes('vertical') && 
                   !itemName.includes('shutter') &&
                   !itemName.includes('curtain track');
          }
        }
        return true;
      }
      
      // Fallback: Check if item's subcategory maps to this treatment's product type
      const productTypes = getProductTypesForSubcategory(subcatLower);
      const treatmentLower = treatmentCategory.toLowerCase();
      return productTypes.some(pt => 
        pt === treatmentLower || 
        treatmentLower.includes(pt) || 
        pt.includes(treatmentLower.replace('_blinds', '').replace('_', ''))
      );
    });
  }, [inventory, compatibleSubcategories, treatmentCategory]);

  // Filter grids that match this treatment
  const matchingGrids = useMemo(() => {
    return allGrids.filter(grid => 
      doesGridMatchTreatment(grid.product_type, treatmentCategory)
    );
  }, [allGrids, treatmentCategory]);

  // Calculate price group distribution and detect mismatches
  const analysisResult = useMemo(() => {
    // Price groups from inventory
    const inventoryGroups = new Map<string, number>();
    relevantInventory.forEach(item => {
      if (item.price_group) {
        const groupKey = item.price_group.toUpperCase().trim();
        inventoryGroups.set(groupKey, (inventoryGroups.get(groupKey) || 0) + 1);
      }
    });

    // Price groups from grids
    const gridGroups = new Map<string, { id: string; name: string }>();
    matchingGrids.forEach(grid => {
      if (grid.price_group) {
        const groupKey = grid.price_group.toUpperCase().trim();
        gridGroups.set(groupKey, { id: grid.id, name: grid.name });
      }
    });

    // Build combined stats
    const allGroupKeys = new Set([...inventoryGroups.keys(), ...gridGroups.keys()]);
    const stats: Record<string, { 
      inventoryCount: number; 
      hasGrid: boolean; 
      gridName?: string;
      gridId?: string;
      isOrphanGrid?: boolean; // Grid exists but no matching materials
    }> = {};

    allGroupKeys.forEach(group => {
      const invCount = inventoryGroups.get(group) || 0;
      const gridInfo = gridGroups.get(group);
      
      stats[group] = {
        inventoryCount: invCount,
        hasGrid: !!gridInfo,
        gridName: gridInfo?.name,
        gridId: gridInfo?.id,
        isOrphanGrid: !!gridInfo && invCount === 0
      };
    });

    // Detect mismatch: materials use different groups than grids
    const inventoryGroupList = Array.from(inventoryGroups.keys()).sort();
    const gridGroupList = Array.from(gridGroups.keys()).sort();
    
    const hasMismatch = inventoryGroupList.length > 0 && 
                        gridGroupList.length > 0 && 
                        !inventoryGroupList.some(g => gridGroupList.includes(g));

    return {
      stats,
      inventoryGroupList,
      gridGroupList,
      hasMismatch,
      orphanGrids: gridGroupList.filter(g => !inventoryGroups.has(g))
    };
  }, [relevantInventory, matchingGrids]);

  const { stats: priceGroupStats, hasMismatch, inventoryGroupList, gridGroupList, orphanGrids } = analysisResult;

  const sortedGroups = useMemo(() => {
    return Object.entries(priceGroupStats)
      .filter(([, s]) => s.inventoryCount > 0) // Only show groups with materials
      .sort((a, b) => {
        // Sort: numeric first, then alphabetic
        const aNum = parseInt(a[0]);
        const bNum = parseInt(b[0]);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        if (!isNaN(aNum)) return -1;
        if (!isNaN(bNum)) return 1;
        return a[0].localeCompare(b[0]);
      });
  }, [priceGroupStats]);

  const totalMaterials = relevantInventory.length;
  const materialsWithPriceGroup = sortedGroups.reduce((sum, [, stats]) => sum + stats.inventoryCount, 0);
  const materialsWithoutPriceGroup = totalMaterials - materialsWithPriceGroup;
  const groupsWithGrids = sortedGroups.filter(([, stats]) => stats.hasGrid).length;
  const materialsWithGrids = sortedGroups
    .filter(([, stats]) => stats.hasGrid)
    .reduce((sum, [, stats]) => sum + stats.inventoryCount, 0);

  // No materials for this treatment type
  if (totalMaterials === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No materials found for {getProductTypeDisplayName(treatmentCategory)}. 
          Import materials with matching subcategories ({compatibleSubcategories.join(', ')}) first.
        </AlertDescription>
      </Alert>
    );
  }

  const coverage = materialsWithPriceGroup > 0 
    ? Math.round((materialsWithGrids / materialsWithPriceGroup) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {/* Mismatch Warning */}
      {hasMismatch && (
        <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Price Group Mismatch Detected</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Your materials use price groups: <strong>{inventoryGroupList.join(', ')}</strong></p>
            <p>But your grids use price groups: <strong>{gridGroupList.join(', ')}</strong></p>
            <p className="text-sm mt-2">
              To fix: Either update your grids' price_group to match materials, 
              or update materials' price_group in Inventory to match your grids.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Orphan Grids Warning */}
      {orphanGrids.length > 0 && !hasMismatch && (
        <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            You have grids for groups <strong>{orphanGrids.join(', ')}</strong> but no materials with those price groups.
          </AlertDescription>
        </Alert>
      )}

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
            Grids auto-match by product type + price group
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {totalMaterials} materials
            </Badge>
            {materialsWithoutPriceGroup > 0 && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                {materialsWithoutPriceGroup} without price group
              </Badge>
            )}
            <Badge variant={coverage === 100 ? "default" : "outline"} className={coverage === 100 ? "bg-green-600" : ""}>
              {coverage}% covered
            </Badge>
            <Badge variant="outline">
              {groupsWithGrids}/{sortedGroups.length} groups ready
            </Badge>
          </div>

          {/* All materials without price groups */}
          {materialsWithPriceGroup === 0 && totalMaterials > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {totalMaterials} materials found but none have a price group assigned. 
                <Link to="/inventory" className="ml-1 text-primary underline inline-flex items-center gap-1">
                  Assign price groups in Inventory <ExternalLink className="h-3 w-3" />
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Price group list */}
          {sortedGroups.length > 0 && (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
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
                          {stats.inventoryCount} material{stats.inventoryCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {stats.hasGrid && stats.gridName && (
                        <span className="text-xs text-green-700 dark:text-green-400 truncate block">
                          Grid: {stats.gridName}
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
          )}

          {/* Help text */}
          {groupsWithGrids < sortedGroups.length && sortedGroups.length > 0 && (
            <p className="text-xs text-muted-foreground pt-2 border-t">
              <Link to="/settings?tab=pricing" className="text-primary underline">
                Upload pricing grids
              </Link>
              {' '}with product type "{getProductTypeDisplayName(treatmentCategory)}" and matching price group.
            </p>
          )}

          {/* Success state */}
          {groupsWithGrids === sortedGroups.length && sortedGroups.length > 0 && !hasMismatch && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-400">
                All price groups have grids! Materials will be priced automatically.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
