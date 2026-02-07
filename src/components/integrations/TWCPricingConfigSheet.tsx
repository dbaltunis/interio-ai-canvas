import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, CheckCircle2, Grid3X3, DollarSign, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { StandardPricingGridData, GridUnit } from "@/types/pricingGrid";

interface TWCPricingConfigSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    name: string;
    metadata?: {
      pricingGroup?: number;
      twc_item_number?: string;
    };
    pricing_grid_data?: any;
  } | null;
}

export const TWCPricingConfigSheet = ({ open, onOpenChange, product }: TWCPricingConfigSheetProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [gridData, setGridData] = useState<any>(product?.pricing_grid_data || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const parsed = parseCSVToGrid(text);
      
      if (!parsed) {
        throw new Error("Invalid CSV format. Expected width columns and drop rows.");
      }
      
      setGridData(parsed);
      toast.success("Grid uploaded", { description: `${parsed.dropRows.length} rows × ${parsed.widthColumns.length} columns` });
    } catch (error: any) {
      toast.error("Upload failed", { description: error.message });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /**
   * Parse CSV to StandardPricingGridData format
   */
  const parseCSVToGrid = (csvText: string): StandardPricingGridData | null => {
    const lines = csvText.trim().split('\n').map(line =>
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );

    if (lines.length < 2) return null;

    // First row is headers (width columns)
    const widthColumns = lines[0].slice(1)
      .map(w => parseFloat(w.replace(/[^0-9.-]/g, '')))
      .filter(w => !isNaN(w) && w > 0)
      .sort((a, b) => a - b);

    if (widthColumns.length === 0) return null;

    // Remaining rows are drop rows with prices
    const dropRows: { drop: number; prices: number[] }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      const drop = parseFloat(row[0].replace(/[^0-9.-]/g, ''));
      if (isNaN(drop) || drop <= 0) continue;

      const prices = row.slice(1).map(p => {
        const price = parseFloat(p.replace(/[^0-9.-]/g, ''));
        return isNaN(price) ? 0 : price;
      });

      dropRows.push({ drop, prices });
    }

    if (dropRows.length === 0) return null;

    // Sort by drop value
    dropRows.sort((a, b) => a.drop - b.drop);

    // Infer unit from max values (>=500 is mm)
    const maxValue = Math.max(...widthColumns, ...dropRows.map(r => r.drop));
    const unit: GridUnit = maxValue >= 500 ? 'mm' : 'cm';

    return { widthColumns, dropRows, unit, version: 1 };
  };

  const handleSave = async () => {
    if (!product?.id || !gridData) return;

    setIsSaving(true);
    try {
      // First get current metadata
      const { data: current } = await supabase
        .from('enhanced_inventory_items')
        .select('metadata')
        .eq('id', product.id)
        .single();

      const currentMetadata = (current?.metadata as Record<string, any>) || {};
      const updatedMetadata = {
        ...currentMetadata,
        pricing_grid_data: gridData
      };

      const { error } = await supabase
        .from('enhanced_inventory_items')
        .update({ metadata: updatedMetadata })
        .eq('id', product.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['twc-imported-products'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      toast.success("Pricing saved");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Save failed", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearGrid = async () => {
    if (!product?.id) return;

    setIsSaving(true);
    try {
      // First get current metadata
      const { data: current } = await supabase
        .from('enhanced_inventory_items')
        .select('metadata')
        .eq('id', product.id)
        .single();

      const currentMetadata = (current?.metadata as Record<string, any>) || {};
      const { pricing_grid_data, ...updatedMetadata } = currentMetadata;

      const { error } = await supabase
        .from('enhanced_inventory_items')
        .update({ metadata: updatedMetadata })
        .eq('id', product.id);

      if (error) throw error;

      setGridData(null);
      queryClient.invalidateQueries({ queryKey: ['twc-imported-products'] });
      toast.success("Pricing cleared");
    } catch (error: any) {
      toast.error("Clear failed", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configure Pricing</SheetTitle>
          <SheetDescription>{product?.name}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* TWC Info */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">TWC Item #</span>
                <Badge variant="outline">{product?.metadata?.twc_item_number || 'N/A'}</Badge>
              </div>
              {product?.metadata?.pricingGroup && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">TWC Pricing Group</span>
                  <Badge variant="secondary">Group {product.metadata.pricingGroup}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Section */}
          <div className="space-y-3">
            <Label>Pricing Grid (CSV)</Label>
            <div className="text-xs text-muted-foreground mb-2">
              Upload a CSV with width columns and drop rows. First row = widths, first column = drops.
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="pricing-grid-upload"
            />
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Pricing Grid CSV
                </>
              )}
            </Button>
          </div>

          {/* Grid Preview */}
          {gridData && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Grid Configured</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={handleClearGrid}
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                    <span>{gridData.widthColumns?.length || 0} width columns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                    <span>{gridData.dropRows?.length || 0} drop rows</span>
                  </div>
                </div>

                {/* Sample prices */}
                {gridData.dropRows && gridData.dropRows.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground mb-1">
                      Sample prices (unit: {gridData.unit || 'cm'}):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {gridData.dropRows.slice(0, 2).flatMap((row: any) =>
                        row.prices?.slice(0, 2).map((price: number, idx: number) => (
                          <Badge key={`${row.drop}-${idx}`} variant="outline" className="text-xs">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {price.toFixed(2)}
                          </Badge>
                        ))
                      )}
                      {gridData.dropRows.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +more prices
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={isSaving || !gridData}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Pricing'
              )}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
