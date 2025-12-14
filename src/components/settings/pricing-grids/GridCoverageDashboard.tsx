import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, BarChart3, Package, Grid3x3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedInventory } from '@/hooks/useEnhancedInventory';

const PRODUCT_TYPES = [
  { value: 'roller_blinds', label: 'Roller Blinds' },
  { value: 'venetian_blinds', label: 'Venetian Blinds' },
  { value: 'cellular_blinds', label: 'Cellular/Honeycomb' },
  { value: 'vertical_blinds', label: 'Vertical Blinds' },
  { value: 'shutters', label: 'Shutters' },
  { value: 'awnings', label: 'Awnings' },
  { value: 'panel_glide', label: 'Panel Glide' },
];

interface GridCoverageDashboardProps {
  onUploadClick: (productType: string, priceGroup: string) => void;
}

export const GridCoverageDashboard = ({ onUploadClick }: GridCoverageDashboardProps) => {
  const { data: inventory = [] } = useEnhancedInventory();

  // Fetch all pricing grids
  const { data: grids = [] } = useQuery({
    queryKey: ['pricing-grids-coverage'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('pricing_grids')
        .select('product_type, price_group')
        .eq('user_id', user.id)
        .eq('active', true);

      if (error) return [];
      return data || [];
    }
  });

  // Calculate coverage per product type
  const coverageData = useMemo(() => {
    const result: Record<string, {
      label: string;
      priceGroups: {
        group: string;
        hasGrid: boolean;
        materialCount: number;
      }[];
      totalMaterials: number;
      coveredMaterials: number;
    }> = {};

    // Initialize all product types
    PRODUCT_TYPES.forEach(pt => {
      result[pt.value] = {
        label: pt.label,
        priceGroups: [],
        totalMaterials: 0,
        coveredMaterials: 0
      };
    });

    // Map of existing grids
    const gridMap = new Map<string, boolean>();
    grids.forEach(g => {
      if (g.product_type && g.price_group) {
        gridMap.set(`${g.product_type}|${g.price_group.toUpperCase()}`, true);
      }
    });

    // Count materials per product type and price group
    const materialsByTypeAndGroup = new Map<string, number>();
    inventory.forEach(item => {
      if (item.price_group) {
        const group = item.price_group.toUpperCase();
        // Infer product type from subcategory
        let productType = '';
        const sub = item.subcategory?.toLowerCase() || '';
        if (sub.includes('roller')) productType = 'roller_blinds';
        else if (sub.includes('venetian')) productType = 'venetian_blinds';
        else if (sub.includes('cellular') || sub.includes('honeycomb')) productType = 'cellular_blinds';
        else if (sub.includes('vertical')) productType = 'vertical_blinds';
        else if (sub.includes('shutter')) productType = 'shutters';
        else if (sub.includes('awning')) productType = 'awnings';
        else if (sub.includes('panel')) productType = 'panel_glide';

        if (productType) {
          const key = `${productType}|${group}`;
          materialsByTypeAndGroup.set(key, (materialsByTypeAndGroup.get(key) || 0) + 1);
        }
      }
    });

    // Build price group arrays for each product type
    materialsByTypeAndGroup.forEach((count, key) => {
      const [productType, group] = key.split('|');
      if (result[productType]) {
        const hasGrid = gridMap.has(key);
        result[productType].priceGroups.push({
          group,
          hasGrid,
          materialCount: count
        });
        result[productType].totalMaterials += count;
        if (hasGrid) {
          result[productType].coveredMaterials += count;
        }
      }
    });

    // Sort price groups
    Object.values(result).forEach(pt => {
      pt.priceGroups.sort((a, b) => {
        // Numeric groups first, then alphabetic
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
          <Grid3x3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No materials with price groups found.</p>
          <p className="text-sm">Import materials with price_group column to see coverage.</p>
        </CardContent>
      </Card>
    );
  }

  const totalMissing = activeProductTypes.reduce((sum, [, data]) => 
    sum + data.priceGroups.filter(g => !g.hasGrid).length, 0
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Pricing Grid Coverage</CardTitle>
          </div>
          {totalMissing > 0 && (
            <Badge variant="destructive" className="font-normal">
              {totalMissing} missing grid{totalMissing !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
                    {data.totalMaterials} materials
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
                  <div
                    key={pg.group}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${
                      pg.hasGrid
                        ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300'
                        : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300 cursor-pointer hover:bg-amber-100'
                    }`}
                    onClick={() => !pg.hasGrid && onUploadClick(productType, pg.group)}
                  >
                    {pg.hasGrid ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    <span>Group {pg.group}</span>
                    <span className="text-[10px] opacity-70">({pg.materialCount})</span>
                  </div>
                ))}
              </div>
              
              {missingGroups.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-amber-600 hover:text-amber-700"
                  onClick={() => onUploadClick(productType, missingGroups[0].group)}
                >
                  Upload missing grids for {data.label}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
