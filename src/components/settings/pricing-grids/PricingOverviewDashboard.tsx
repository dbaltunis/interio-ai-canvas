/**
 * Pricing Overview Dashboard
 * 
 * Comprehensive view of all pricing across product types, grids, and categories.
 * Provides visibility into markup hierarchy and bulk editing capabilities.
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  Package, 
  Percent,
  Pencil,
  Check,
  X,
  Info,
  Layers,
  Grid3X3,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useMarkupSettings } from '@/hooks/useMarkupSettings';
import { toast } from 'sonner';
import { getProductTypeDisplayName } from '@/utils/pricing/treatmentGridMapping';
import { cn } from '@/lib/utils';
import { InventoryMarkupCoverage } from './InventoryMarkupCoverage';
import { TemplatesByPricingMethod } from './TemplatesByPricingMethod';
import { MarkupCalculatorTool } from './MarkupCalculatorTool';

interface GridData {
  id: string;
  name: string;
  grid_code: string;
  product_type: string;
  price_group: string;
  markup_percentage: number;
  description: string | null;
  created_at: string;
  vendor?: { name: string } | null;
}

interface ProductTypeSummary {
  productType: string;
  displayName: string;
  grids: GridData[];
  totalGrids: number;
  gridsWithMarkup: number;
  gridsAtZero: number;
  avgMarkup: number;
  minMarkup: number;
  maxMarkup: number;
  priceGroups: string[];
}

export const PricingOverviewDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: markupSettings } = useMarkupSettings();
  
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [selectedGrids, setSelectedGrids] = useState<Set<string>>(new Set());
  const [bulkMarkupValue, setBulkMarkupValue] = useState('');
  const [editingGridId, setEditingGridId] = useState<string | null>(null);
  const [editMarkupValue, setEditMarkupValue] = useState('');
  const [showHierarchy, setShowHierarchy] = useState(false);

  // Fetch all pricing grids
  const { data: grids = [], isLoading } = useQuery({
    queryKey: ['pricing-grids-overview', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('pricing_grids')
        .select(`
          id,
          name,
          grid_code,
          product_type,
          price_group,
          markup_percentage,
          description,
          created_at,
          vendor:supplier_id (name)
        `)
        .eq('user_id', user.id)
        .eq('active', true)
        .order('product_type', { ascending: true });
      
      if (error) throw error;
      return (data || []) as GridData[];
    },
    enabled: !!user?.id
  });

  // Group grids by product type
  const productTypeSummaries = useMemo<ProductTypeSummary[]>(() => {
    const grouped = new Map<string, GridData[]>();
    
    grids.forEach(grid => {
      const pt = grid.product_type || 'unknown';
      if (!grouped.has(pt)) {
        grouped.set(pt, []);
      }
      grouped.get(pt)!.push(grid);
    });

    return Array.from(grouped.entries()).map(([productType, typeGrids]) => {
      const markups = typeGrids.map(g => g.markup_percentage || 0);
      const withMarkup = markups.filter(m => m > 0).length;
      
      return {
        productType,
        displayName: getProductTypeDisplayName(productType),
        grids: typeGrids,
        totalGrids: typeGrids.length,
        gridsWithMarkup: withMarkup,
        gridsAtZero: typeGrids.length - withMarkup,
        avgMarkup: markups.length > 0 ? Math.round(markups.reduce((a, b) => a + b, 0) / markups.length) : 0,
        minMarkup: markups.length > 0 ? Math.min(...markups) : 0,
        maxMarkup: markups.length > 0 ? Math.max(...markups) : 0,
        priceGroups: [...new Set(typeGrids.map(g => g.price_group).filter(Boolean))]
      };
    }).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [grids]);

  // Summary stats
  const stats = useMemo(() => {
    const total = grids.length;
    const withMarkup = grids.filter(g => (g.markup_percentage || 0) > 0).length;
    const atZero = total - withMarkup;
    const allMarkups = grids.map(g => g.markup_percentage || 0);
    const avg = allMarkups.length > 0 ? Math.round(allMarkups.reduce((a, b) => a + b, 0) / allMarkups.length) : 0;
    
    return { total, withMarkup, atZero, avg };
  }, [grids]);

  // Mutation for updating single grid markup
  const updateMarkupMutation = useMutation({
    mutationFn: async ({ gridId, markup }: { gridId: string; markup: number }) => {
      const { error } = await supabase
        .from('pricing_grids')
        .update({ markup_percentage: markup })
        .eq('id', gridId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Markup updated');
      queryClient.invalidateQueries({ queryKey: ['pricing-grids-overview'] });
      setEditingGridId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update markup');
    }
  });

  // Mutation for bulk updating markups
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ gridIds, markup }: { gridIds: string[]; markup: number }) => {
      const { error } = await supabase
        .from('pricing_grids')
        .update({ markup_percentage: markup })
        .in('id', gridIds);
      if (error) throw error;
    },
    onSuccess: (_, { gridIds }) => {
      toast.success(`Updated ${gridIds.length} grids`);
      queryClient.invalidateQueries({ queryKey: ['pricing-grids-overview'] });
      setSelectedGrids(new Set());
      setBulkMarkupValue('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update markups');
    }
  });

  const toggleExpand = (productType: string) => {
    const next = new Set(expandedTypes);
    if (next.has(productType)) {
      next.delete(productType);
    } else {
      next.add(productType);
    }
    setExpandedTypes(next);
  };

  const toggleGridSelect = (gridId: string) => {
    const next = new Set(selectedGrids);
    if (next.has(gridId)) {
      next.delete(gridId);
    } else {
      next.add(gridId);
    }
    setSelectedGrids(next);
  };

  const selectAllInType = (grids: GridData[]) => {
    const next = new Set(selectedGrids);
    grids.forEach(g => next.add(g.id));
    setSelectedGrids(next);
  };

  const handleBulkUpdate = () => {
    const markup = parseFloat(bulkMarkupValue) || 0;
    if (selectedGrids.size === 0) {
      toast.error('Select grids to update');
      return;
    }
    bulkUpdateMutation.mutate({ gridIds: Array.from(selectedGrids), markup });
  };

  const getStatusColor = (gridsWithMarkup: number, totalGrids: number) => {
    if (totalGrids === 0) return 'text-muted-foreground';
    const ratio = gridsWithMarkup / totalGrids;
    if (ratio === 1) return 'text-emerald-600';
    if (ratio > 0.5) return 'text-amber-600';
    return 'text-destructive';
  };

  const getStatusBadge = (summary: ProductTypeSummary) => {
    if (summary.gridsAtZero === 0) {
      return <Badge className="bg-emerald-500 text-xs">All marked up</Badge>;
    }
    if (summary.gridsWithMarkup > 0) {
      return <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">{summary.gridsAtZero} at cost</Badge>;
    }
    return <Badge variant="destructive" className="text-xs">No markup</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading pricing data...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Grids</p>
              </div>
              <Grid3X3 className="h-8 w-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-600">{stats.withMarkup}</p>
                <p className="text-xs text-muted-foreground">With Markup</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500/40" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.atZero}</p>
                <p className="text-xs text-muted-foreground">At Cost (0%)</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500/40" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.avg}%</p>
                <p className="text-xs text-muted-foreground">Avg Markup</p>
              </div>
              <Percent className="h-8 w-8 text-blue-500/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Markup Hierarchy Explainer */}
      <Collapsible open={showHierarchy} onOpenChange={setShowHierarchy}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">How Markup Priority Works</CardTitle>
                </div>
                {showHierarchy ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border">
                  <span className="font-medium">Grid Markup</span>
                  <Badge variant="secondary" className="text-xs">Highest</Badge>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border">
                  <span>Category Markup</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30 border">
                  <span>Global Default</span>
                  <span className="text-xs text-muted-foreground">({markupSettings?.default_markup_percentage || 0}%)</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/20 border">
                  <span className="text-muted-foreground">Minimum</span>
                  <span className="text-xs text-muted-foreground">({markupSettings?.minimum_markup_percentage || 0}%)</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Grid-specific markup takes priority. If 0%, category markup is used. If category is 0%, global default applies. Minimum markup ensures you never sell below threshold.
              </p>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Inventory Markup Coverage */}
      <InventoryMarkupCoverage />

      {/* Templates by Pricing Method */}
      <TemplatesByPricingMethod />

      {/* What Will Apply Calculator */}
      <MarkupCalculatorTool />

      {/* Bulk Actions Bar */}
      {selectedGrids.size > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{selectedGrids.size} selected</Badge>
              <div className="flex items-center gap-2">
                <span className="text-sm">Set markup to:</span>
                <Input
                  type="number"
                  min="0"
                  max="500"
                  step="0.5"
                  placeholder="0"
                  value={bulkMarkupValue}
                  onChange={(e) => setBulkMarkupValue(e.target.value)}
                  className="w-20 h-8"
                />
                <span className="text-sm text-muted-foreground">%</span>
                <Button 
                  size="sm" 
                  onClick={handleBulkUpdate}
                  disabled={bulkUpdateMutation.isPending}
                >
                  Apply to All
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedGrids(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Type Cards */}
      {grids.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No pricing grids found.</p>
            <p className="text-sm">Upload grids in the Pricing Grids section.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <TooltipProvider>
            {productTypeSummaries.map((summary) => (
              <Collapsible 
                key={summary.productType} 
                open={expandedTypes.has(summary.productType)}
                onOpenChange={() => toggleExpand(summary.productType)}
              >
                <Card className="overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {expandedTypes.has(summary.productType) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <div>
                            <h3 className="font-semibold">{summary.displayName}</h3>
                            <p className="text-xs text-muted-foreground">
                              {summary.totalGrids} grid{summary.totalGrids !== 1 ? 's' : ''} • 
                              Groups: {summary.priceGroups.join(', ') || 'None'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Markup Range */}
                          {summary.totalGrids > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-right">
                                  <p className={cn("text-sm font-medium", getStatusColor(summary.gridsWithMarkup, summary.totalGrids))}>
                                    {summary.minMarkup === summary.maxMarkup 
                                      ? `${summary.minMarkup}%` 
                                      : `${summary.minMarkup}% - ${summary.maxMarkup}%`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">markup range</p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Average: {summary.avgMarkup}%</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {getStatusBadge(summary)}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-3">
                      <div className="border-t pt-3">
                        {/* Select all button */}
                        <div className="flex items-center justify-between mb-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => selectAllInType(summary.grids)}
                          >
                            Select all {summary.totalGrids} grids
                          </Button>
                        </div>
                        
                        {/* Grid list */}
                        <div className="space-y-1.5">
                          {summary.grids.map((grid) => (
                            <div 
                              key={grid.id}
                              className={cn(
                                "flex items-center justify-between p-2 rounded-lg border transition-colors",
                                selectedGrids.has(grid.id) 
                                  ? "bg-primary/10 border-primary/30" 
                                  : "bg-muted/30 hover:bg-muted/50"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={selectedGrids.has(grid.id)}
                                  onCheckedChange={() => toggleGridSelect(grid.id)}
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{grid.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      Group {grid.price_group}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {grid.grid_code}
                                    {grid.vendor?.name && ` • ${grid.vendor.name}`}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Inline markup edit */}
                              <div className="flex items-center gap-2">
                                {editingGridId === grid.id ? (
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="500"
                                      step="0.5"
                                      value={editMarkupValue}
                                      onChange={(e) => setEditMarkupValue(e.target.value)}
                                      className="w-16 h-7 text-xs"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          updateMarkupMutation.mutate({ 
                                            gridId: grid.id, 
                                            markup: parseFloat(editMarkupValue) || 0 
                                          });
                                        }
                                        if (e.key === 'Escape') setEditingGridId(null);
                                      }}
                                    />
                                    <span className="text-xs">%</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => updateMarkupMutation.mutate({ 
                                        gridId: grid.id, 
                                        markup: parseFloat(editMarkupValue) || 0 
                                      })}
                                    >
                                      <Check className="h-3 w-3 text-emerald-500" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => setEditingGridId(null)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Badge 
                                    variant={grid.markup_percentage > 0 ? "default" : "outline"}
                                    className={cn(
                                      "cursor-pointer hover:opacity-80 text-xs",
                                      grid.markup_percentage > 0 ? "bg-emerald-500" : ""
                                    )}
                                    onClick={() => {
                                      setEditingGridId(grid.id);
                                      setEditMarkupValue(String(grid.markup_percentage || 0));
                                    }}
                                  >
                                    <Pencil className="h-3 w-3 mr-1" />
                                    {grid.markup_percentage > 0 ? `+${grid.markup_percentage}%` : '0%'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </TooltipProvider>
        </div>
      )}

      {/* At-Risk Products Alert */}
      {stats.atZero > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader className="py-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-sm text-amber-700 dark:text-amber-400">
                Products Selling at Cost
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-2">
              {stats.atZero} pricing grid{stats.atZero !== 1 ? 's have' : ' has'} 0% markup and will use fallback settings or sell at cost price.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {grids
                .filter(g => !g.markup_percentage || g.markup_percentage === 0)
                .slice(0, 10)
                .map(g => (
                  <Badge 
                    key={g.id} 
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-amber-100"
                    onClick={() => {
                      setExpandedTypes(prev => new Set([...prev, g.product_type]));
                      setEditingGridId(g.id);
                      setEditMarkupValue('');
                    }}
                  >
                    {g.name}
                  </Badge>
                ))}
              {stats.atZero > 10 && (
                <Badge variant="outline" className="text-xs">
                  +{stats.atZero - 10} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
