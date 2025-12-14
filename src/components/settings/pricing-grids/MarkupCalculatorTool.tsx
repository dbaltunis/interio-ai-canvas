/**
 * "What Will Apply" Markup Calculator Tool
 * Interactive tool to see what markup applies to a product
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, ChevronRight, Grid3X3 } from 'lucide-react';
import { useMarkupSettings } from '@/hooks/useMarkupSettings';
import { resolveMarkup, ResolvedMarkup } from '@/utils/pricing/markupResolver';
import { cn } from '@/lib/utils';

const PRODUCT_TYPES = [
  { value: 'curtains', label: 'Curtains & Drapes', category: 'curtains' },
  { value: 'romans', label: 'Roman Blinds', category: 'curtains' },
  { value: 'roller', label: 'Roller Blinds', category: 'blinds' },
  { value: 'venetian', label: 'Venetian Blinds', category: 'blinds' },
  { value: 'cellular', label: 'Cellular Blinds', category: 'blinds' },
  { value: 'shutters', label: 'Shutters', category: 'shutters' },
  { value: 'fabric', label: 'Fabric (per meter)', category: 'fabric' },
  { value: 'hardware', label: 'Hardware & Tracks', category: 'hardware' },
  { value: 'installation', label: 'Installation Services', category: 'installation' },
];

const PRICING_METHODS = [
  { value: 'grid', label: 'Pricing Grid' },
  { value: 'per_meter', label: 'Per Running Meter' },
  { value: 'per_sqm', label: 'Per Square Meter' },
  { value: 'fixed', label: 'Fixed Price' },
];

export const MarkupCalculatorTool = () => {
  const { data: markupSettings } = useMarkupSettings();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [hasGridMarkup, setHasGridMarkup] = useState<boolean>(false);

  const selectedProductData = PRODUCT_TYPES.find(p => p.value === selectedProduct);

  const getResult = (): ResolvedMarkup | null => {
    if (!selectedProduct || !selectedMethod) return null;

    const category = selectedProductData?.category || selectedProduct;
    
    // Simulate markup resolution
    const result = resolveMarkup({
      productMarkup: undefined,
      gridMarkup: hasGridMarkup && selectedMethod === 'grid' ? 35 : undefined, // Example grid markup
      category,
      subcategory: selectedProduct,
      markupSettings: markupSettings || undefined
    });

    return result;
  };

  const result = getResult();

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          What Markup Will Apply?
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-3">
          {/* Product Type */}
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-muted-foreground mb-1 block">Product Type</label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select product..." />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map(pt => (
                  <SelectItem key={pt.value} value={pt.value}>
                    {pt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pricing Method */}
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-muted-foreground mb-1 block">Pricing Method</label>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select method..." />
              </SelectTrigger>
              <SelectContent>
                {PRICING_METHODS.map(pm => (
                  <SelectItem key={pm.value} value={pm.value}>
                    {pm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grid Markup Toggle */}
          {selectedMethod === 'grid' && (
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs text-muted-foreground mb-1 block">Grid has markup?</label>
              <Select 
                value={hasGridMarkup ? 'yes' : 'no'} 
                onValueChange={(v) => setHasGridMarkup(v === 'yes')}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes (e.g., 35%)</SelectItem>
                  <SelectItem value="no">No (0%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 min-w-[200px]">
              <ChevronRight className="h-4 w-4 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "text-sm",
                    result.percentage > 0 ? "bg-emerald-500" : "bg-amber-500"
                  )}>
                    +{result.percentage}%
                  </Badge>
                  {result.source === 'grid' && (
                    <Grid3X3 className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  From: {result.sourceName}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Hierarchy Visual */}
        {result && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">Resolution path:</p>
            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              {['grid', 'subcategory', 'category', 'global', 'minimum'].map((source, idx) => {
                const isActive = result.source === source;
                const isSkipped = idx < ['grid', 'subcategory', 'category', 'global', 'minimum'].indexOf(result.source);
                
                return (
                  <div key={source} className="flex items-center gap-1.5">
                    <span className={cn(
                      "px-2 py-0.5 rounded",
                      isActive ? "bg-primary text-primary-foreground font-medium" : 
                      isSkipped ? "text-muted-foreground line-through" : "text-muted-foreground"
                    )}>
                      {source === 'grid' ? 'Grid' :
                       source === 'subcategory' ? 'Subcategory' :
                       source === 'category' ? 'Category' :
                       source === 'global' ? 'Default' : 'Minimum'}
                    </span>
                    {idx < 4 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
