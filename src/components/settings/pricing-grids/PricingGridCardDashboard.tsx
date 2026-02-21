import { useState, useMemo } from 'react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Check,
  X,
  Trash2,
  Grid3X3,
  Package,
  AlertCircle,
  CheckCircle2,
  Download,
  Percent
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { getProductTypeDisplayName } from '@/utils/pricing/treatmentGridMapping';
import { cn } from '@/lib/utils';

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

interface ProductTypeGroup {
  productType: string;
  displayName: string;
  grids: GridData[];
  priceGroups: string[];
}

interface PricingGridCardDashboardProps {
  onAddGrid: (productType?: string, priceGroup?: string) => void;
}

export const PricingGridCardDashboard = ({ onAddGrid }: PricingGridCardDashboardProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const confirm = useConfirmDialog();
  
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [editingGridId, setEditingGridId] = useState<string | null>(null);
  const [editMarkupValue, setEditMarkupValue] = useState('');

  // Fetch all pricing grids for the effective account owner (supports multi-tenant)
  const { data: grids = [], isLoading } = useQuery({
    queryKey: ['pricing-grids-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Resolve effective account owner so team members see the account owner's grids
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('parent_account_id')
        .eq('user_id', user.id)
        .maybeSingle();
      const effectiveOwnerId = profile?.parent_account_id || user.id;

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
        .eq('user_id', effectiveOwnerId)
        .eq('active', true)
        .order('product_type', { ascending: true });

      if (error) throw error;
      return (data || []) as GridData[];
    },
    enabled: !!user?.id
  });

  // Group grids by product type
  const productGroups = useMemo<ProductTypeGroup[]>(() => {
    const grouped = new Map<string, GridData[]>();
    
    grids.forEach(grid => {
      const pt = grid.product_type || 'unknown';
      if (!grouped.has(pt)) {
        grouped.set(pt, []);
      }
      grouped.get(pt)!.push(grid);
    });

    return Array.from(grouped.entries()).map(([productType, typeGrids]) => ({
      productType,
      displayName: getProductTypeDisplayName(productType),
      grids: typeGrids,
      priceGroups: [...new Set(typeGrids.map(g => g.price_group).filter(Boolean))]
    })).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [grids]);

  // Mutation for updating markup
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
      queryClient.invalidateQueries({ queryKey: ['pricing-grids-dashboard'] });
      setEditingGridId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update markup');
    }
  });

  // Mutation for deleting grid
  const deleteGridMutation = useMutation({
    mutationFn: async (gridId: string) => {
      const { error } = await supabase
        .from('pricing_grids')
        .update({ active: false })
        .eq('id', gridId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Grid deleted');
      queryClient.invalidateQueries({ queryKey: ['pricing-grids-dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete grid');
    }
  });

  // State for bulk price adjustment dialog
  const [adjustGridId, setAdjustGridId] = useState<string | null>(null);
  const [adjustPercent, setAdjustPercent] = useState('');
  const [adjustMode, setAdjustMode] = useState<'increase' | 'decrease'>('increase');

  // Export grid as CSV
  const handleExportGrid = async (gridId: string, gridName: string) => {
    try {
      const { data: grid, error } = await supabase
        .from('pricing_grids')
        .select('grid_data, name, product_type, price_group, grid_code')
        .eq('id', gridId)
        .single();

      if (error) throw error;
      if (!grid?.grid_data) {
        toast.error('Grid has no data to export');
        return;
      }

      const gd = grid.grid_data as any;
      let csvContent = '';

      // Standard format: widthColumns + dropRows
      if (gd.widthColumns && gd.dropRows) {
        const widths = gd.widthColumns as number[];
        csvContent = 'Drop / Width,' + widths.join(',') + '\n';
        (gd.dropRows as any[]).forEach((row: any) => {
          csvContent += row.drop + ',' + (row.prices as number[]).join(',') + '\n';
        });
      } else if (gd.rows && gd.columns) {
        // Legacy format
        const cols = (gd.columns as any[]).map((c: any) => c.key || `${c.width_min}-${c.width_max}`);
        csvContent = 'Drop Range,' + cols.join(',') + '\n';
        (gd.rows as any[]).forEach((row: any) => {
          const label = `${row.drop_min}-${row.drop_max}`;
          const prices = cols.map((col: string) => row[col] || 0);
          csvContent += label + ',' + prices.join(',') + '\n';
        });
      }

      if (!csvContent) {
        toast.error('Unsupported grid format for export');
        return;
      }

      // Add metadata header
      const header = `# Grid: ${grid.name}\n# Type: ${grid.product_type}\n# Group: ${grid.price_group}\n# Code: ${grid.grid_code}\n`;
      csvContent = header + csvContent;

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pricing_grid_${gridName.replace(/\s+/g, '_')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Grid exported');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export grid');
    }
  };

  // Bulk adjust all prices in a grid by percentage
  const adjustPricesMutation = useMutation({
    mutationFn: async ({ gridId, percent, mode }: { gridId: string; percent: number; mode: 'increase' | 'decrease' }) => {
      const { data: grid, error: fetchError } = await supabase
        .from('pricing_grids')
        .select('grid_data')
        .eq('id', gridId)
        .single();

      if (fetchError) throw fetchError;
      if (!grid?.grid_data) throw new Error('No grid data');

      const gd = { ...(grid.grid_data as any) };
      const multiplier = mode === 'increase' ? (1 + percent / 100) : (1 - percent / 100);

      // Standard format
      if (gd.dropRows) {
        gd.dropRows = (gd.dropRows as any[]).map((row: any) => ({
          ...row,
          prices: (row.prices as number[]).map((p: number) => Math.round(p * multiplier * 100) / 100),
        }));
      }
      // Legacy format
      if (gd.rows && gd.columns) {
        const cols = (gd.columns as any[]).map((c: any) => c.key);
        gd.rows = (gd.rows as any[]).map((row: any) => {
          const updated = { ...row };
          cols.forEach((col: string) => {
            if (typeof updated[col] === 'number') {
              updated[col] = Math.round(updated[col] * multiplier * 100) / 100;
            }
          });
          return updated;
        });
      }

      const { error: updateError } = await supabase
        .from('pricing_grids')
        .update({ grid_data: gd })
        .eq('id', gridId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success('Grid prices adjusted');
      queryClient.invalidateQueries({ queryKey: ['pricing-grids-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-grids'] });
      setAdjustGridId(null);
      setAdjustPercent('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to adjust prices');
    }
  });

  const handleAdjustPrices = () => {
    if (!adjustGridId || !adjustPercent) return;
    const pct = parseFloat(adjustPercent);
    if (isNaN(pct) || pct <= 0) {
      toast.error('Enter a valid percentage');
      return;
    }
    adjustPricesMutation.mutate({ gridId: adjustGridId, percent: pct, mode: adjustMode });
  };

  const toggleExpand = (productType: string) => {
    const next = new Set(expandedTypes);
    if (next.has(productType)) {
      next.delete(productType);
    } else {
      next.add(productType);
    }
    setExpandedTypes(next);
  };

  const handleStartEditMarkup = (gridId: string, currentMarkup: number) => {
    setEditingGridId(gridId);
    setEditMarkupValue(String(currentMarkup || 0));
  };

  const handleSaveMarkup = (gridId: string) => {
    const markup = parseFloat(editMarkupValue) || 0;
    updateMarkupMutation.mutate({ gridId, markup });
  };

  const handleDeleteGrid = async (gridId: string) => {
    const confirmed = await confirm({
      title: "Delete Pricing Grid",
      description: "Are you sure you want to delete this pricing grid?",
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;
    deleteGridMutation.mutate(gridId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Summary stats
  const totalGrids = grids.length;
  const gridsWithMarkup = grids.filter(g => (g.markup_percentage || 0) > 0).length;

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-primary" />
            <span className="font-semibold">{totalGrids} Grids</span>
          </div>
          {totalGrids > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{gridsWithMarkup} with markup</span>
              {totalGrids - gridsWithMarkup > 0 && (
                <>
                  <span className="mx-1">•</span>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>{totalGrids - gridsWithMarkup} at cost</span>
                </>
              )}
            </div>
          )}
        </div>
        <Button onClick={() => onAddGrid()} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Grid
        </Button>
      </div>

      {/* Empty State */}
      {grids.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Grid3X3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="font-semibold mb-1">No Pricing Grids</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload pricing grids to automatically calculate prices for your products
            </p>
            <Button onClick={() => onAddGrid()}>
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Grid
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Product Type Cards */}
      {productGroups.map((group) => (
        <Collapsible 
          key={group.productType} 
          open={expandedTypes.has(group.productType)}
          onOpenChange={() => toggleExpand(group.productType)}
        >
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedTypes.has(group.productType) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">{group.displayName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {group.grids.length} grid{group.grids.length !== 1 ? 's' : ''} • 
                        Groups: {group.priceGroups.join(', ') || 'None'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddGrid(group.productType);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0 pb-3">
                <div className="border-t pt-3 space-y-2">
                  {group.grids.map((grid) => (
                    <div 
                      key={grid.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant="outline" className="shrink-0">
                          {grid.price_group}
                        </Badge>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{grid.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {grid.vendor?.name || 'No supplier'} • {grid.grid_code}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Markup Editor */}
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
                            />
                            <span className="text-xs text-muted-foreground">%</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => handleSaveMarkup(grid.id)}
                            >
                              <Check className="h-3 w-3 text-emerald-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => setEditingGridId(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditMarkup(grid.id, grid.markup_percentage)}
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded text-sm hover:bg-background transition-colors",
                              (grid.markup_percentage || 0) > 0 
                                ? "text-emerald-600" 
                                : "text-amber-600"
                            )}
                          >
                            <span className="font-medium">{grid.markup_percentage || 0}%</span>
                            <Pencil className="h-3 w-3 opacity-50" />
                          </button>
                        )}
                        
                        {/* Adjust Prices */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => setAdjustGridId(grid.id)}
                          title="Adjust all prices"
                        >
                          <Percent className="h-3 w-3" />
                        </Button>

                        {/* Export CSV */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => handleExportGrid(grid.id, grid.name)}
                          title="Export as CSV"
                        >
                          <Download className="h-3 w-3" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteGrid(grid.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}

      {/* Adjust Prices Dialog */}
      <Dialog open={!!adjustGridId} onOpenChange={(open) => { if (!open) setAdjustGridId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust Grid Prices</DialogTitle>
            <DialogDescription>
              Apply a percentage adjustment to all prices in this grid.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <RadioGroup value={adjustMode} onValueChange={(v) => setAdjustMode(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="increase" id="adj_inc" />
                <Label htmlFor="adj_inc" className="cursor-pointer">Increase prices</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="decrease" id="adj_dec" />
                <Label htmlFor="adj_dec" className="cursor-pointer">Decrease prices</Label>
              </div>
            </RadioGroup>
            <div className="space-y-2">
              <Label>Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="e.g., 10"
                  value={adjustPercent}
                  onChange={(e) => setAdjustPercent(e.target.value)}
                />
                <span className="text-sm text-muted-foreground shrink-0">%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustGridId(null)}>Cancel</Button>
            <Button onClick={handleAdjustPrices} disabled={adjustPricesMutation.isPending}>
              {adjustPricesMutation.isPending ? 'Adjusting...' : 'Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
