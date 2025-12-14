/**
 * Grid Coverage Dashboard
 * 
 * Shows a matrix view of pricing grid coverage across all product types.
 * Helps identify missing grids and provides quick upload actions.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, AlertCircle, BarChart3, Package, Grid3X3, Upload, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedInventory } from '@/hooks/useEnhancedInventory';
import { useAuth } from '@/components/auth/AuthProvider';
import { getProductTypeDisplayName, getProductTypesForSubcategory, SUBCATEGORY_TO_PRODUCT_TYPES } from '@/utils/pricing/treatmentGridMapping';

interface GridCoverageDashboardProps {
  onUploadClick: (productType: string, priceGroup: string) => void;
}

// Product types we care about for grid coverage
const TRACKED_PRODUCT_TYPES = [
  'roller_blinds',
  'roman_blinds',
  'venetian_blinds',
  'cellular_blinds',
  'vertical_blinds',
  'shutters',
  'panel_glide',
  'curtains',
  'awning',
];

export const GridCoverageDashboard = ({ onUploadClick }: GridCoverageDashboardProps) => {
  const { user } = useAuth();
  const { data: inventory = [] } = useEnhancedInventory();

  // Fetch all pricing grids
  const { data: grids = [] } = useQuery({
    queryKey: ['pricing-grids-coverage', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('pricing_grids')
        .select('product_type, price_group, name')
        .eq('user_id', user.id)
        .eq('active', true);

      if (error) return [];
      return data || [];
    },
    enabled: !!user?.id
  });

  // Calculate coverage per product type using improved subcategory matching
  const coverageData = useMemo(() => {
    const result: Record<string, {
      label: string;
      priceGroups: {
        group: string;
        hasGrid: boolean;
        gridName?: string;
        materialCount: number;
      }[];
      totalMaterials: number;
      coveredMaterials: number;
    }> = {};

    // Initialize all product types
    TRACKED_PRODUCT_TYPES.forEach(pt => {
      result[pt] = {
        label: getProductTypeDisplayName(pt),
        priceGroups: [],
        totalMaterials: 0,
        coveredMaterials: 0
      };
    });

    // Map of existing grids: productType|priceGroup -> gridName
    const gridMap = new Map<string, string>();
    grids.forEach(g => {
      if (g.product_type && g.price_group) {
        const key = `${g.product_type.toLowerCase()}|${g.price_group.toUpperCase().trim()}`;
        gridMap.set(key, g.name);
      }
    });

    // Count materials per product type and price group
    // Use subcategory mapping to determine product type
    const materialsByTypeAndGroup = new Map<string, number>();
    
    inventory.forEach(item => {
      if (!item.price_group || !item.subcategory) return;
      
      const group = item.price_group.toUpperCase().trim();
      const subcatLower = item.subcategory.toLowerCase().trim();
      
      // Get product types this subcategory maps to
      let matchedTypes = getProductTypesForSubcategory(subcatLower);
      
      // If no mapping found, try to infer from subcategory name
      if (matchedTypes.length === 0) {
        if (subcatLower.includes('roller')) matchedTypes = ['roller_blinds'];
        else if (subcatLower.includes('roman')) matchedTypes = ['roman_blinds'];
        else if (subcatLower.includes('venetian') || subcatLower.includes('slat')) matchedTypes = ['venetian_blinds'];
        else if (subcatLower.includes('cellular') || subcatLower.includes('honeycomb')) matchedTypes = ['cellular_blinds'];
        else if (subcatLower.includes('vertical')) matchedTypes = ['vertical_blinds'];
        else if (subcatLower.includes('shutter')) matchedTypes = ['shutters'];
        else if (subcatLower.includes('panel')) matchedTypes = ['panel_glide'];
        else if (subcatLower.includes('curtain')) matchedTypes = ['curtains', 'roman_blinds'];
        else if (subcatLower.includes('awning')) matchedTypes = ['awning'];
      }

      // Add to all matched product types
      matchedTypes.forEach(productType => {
        if (result[productType]) {
          const key = `${productType}|${group}`;
          materialsByTypeAndGroup.set(key, (materialsByTypeAndGroup.get(key) || 0) + 1);
        }
      });
    });

    // Build price group arrays for each product type
    materialsByTypeAndGroup.forEach((count, key) => {
      const [productType, group] = key.split('|');
      if (result[productType]) {
        const gridKey = `${productType}|${group}`;
        const hasGrid = gridMap.has(gridKey);
        const gridName = gridMap.get(gridKey);
        
        result[productType].priceGroups.push({
          group,
          hasGrid,
          gridName,
          materialCount: count
        });
        result[productType].totalMaterials += count;
        if (hasGrid) {
          result[productType].coveredMaterials += count;
        }
      }
    });

    // Sort price groups within each product type
    Object.values(result).forEach(pt => {
      pt.priceGroups.sort((a, b) => {
        const aNum = parseInt(a.group);
        const bNum = parseInt(b.group);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        if (!isNaN(aNum)) return -1;
        if (!isNaN(bNum)) return 1;
        return a.group.localeCompare(b.group);
      });
    });

    return result;
  }, [inventory, grids]);

  // Only show product types that have materials
  const activeProductTypes = Object.entries(coverageData)
    .filter(([, data]) => data.totalMaterials > 0);

  if (activeProductTypes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No materials with price groups found.</p>
          <p className="text-sm">Import materials with a price_group column to see coverage.</p>
        </CardContent>
      </Card>
    );
  }

  const totalMissing = activeProductTypes.reduce((sum, [, data]) => 
    sum + data.priceGroups.filter(g => !g.hasGrid).length, 0
  );

  const overallCoverage = activeProductTypes.reduce((acc, [, data]) => {
    acc.total += data.totalMaterials;
    acc.covered += data.coveredMaterials;
    return acc;
  }, { total: 0, covered: 0 });

  const overallPercent = overallCoverage.total > 0 
    ? Math.round((overallCoverage.covered / overallCoverage.total) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Pricing Grid Coverage</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {totalMissing > 0 && (
              <Badge variant="destructive" className="font-normal">
                {totalMissing} missing
              </Badge>
            )}
            <Badge variant={overallPercent === 100 ? "default" : "secondary"} className={overallPercent === 100 ? "bg-green-600" : ""}>
              {overallPercent}% overall
            </Badge>
          </div>
        </div>
        <CardDescription>
          Materials need matching pricing grids by product type + price group
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TooltipProvider>
          {activeProductTypes.map(([productType, data]) => {
            const coverage = data.totalMaterials > 0 
              ? Math.round((data.coveredMaterials / data.totalMaterials) * 100) 
              : 0;
            const missingGroups = data.priceGroups.filter(g => !g.hasGrid);

            return (
              <div key={productType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{data.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      <Package className="h-3 w-3 inline mr-1" />
                      {data.totalMaterials}
                    </span>
                    <Badge 
                      variant={coverage === 100 ? "secondary" : "outline"} 
                      className={coverage === 100 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : ""}
                    >
                      {coverage}%
                    </Badge>
                  </div>
                </div>
                
                <Progress value={coverage} className="h-1.5" />
                
                {/* Price group chips */}
                <div className="flex flex-wrap gap-1.5">
                  {data.priceGroups.map(pg => (
                    <Tooltip key={pg.group}>
                      <TooltipTrigger asChild>
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
                            pg.hasGrid
                              ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300'
                              : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40'
                          }`}
                          onClick={() => !pg.hasGrid && onUploadClick(productType, pg.group)}
                        >
                          {pg.hasGrid ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          <span>{pg.group}</span>
                          <span className="text-[10px] opacity-70">({pg.materialCount})</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {pg.hasGrid ? (
                          <p>Grid: {pg.gridName}</p>
                        ) : (
                          <p>Click to upload grid for Group {pg.group}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                
                {missingGroups.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    onClick={() => onUploadClick(productType, missingGroups[0].group)}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload {missingGroups.length} missing grid{missingGroups.length !== 1 ? 's' : ''}
                  </Button>
                )}
              </div>
            );
          })}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
