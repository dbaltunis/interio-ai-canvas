import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useVendors } from '@/hooks/useVendors';
import type { StandardPricingGridData, GridUnit } from '@/types/pricingGrid';
import { inferUnit } from '@/types/pricingGrid';

const GRID_PRODUCT_TYPES = [
  { value: 'curtains', label: 'Curtains' },
  { value: 'roman_blinds', label: 'Roman Blinds' },
  { value: 'roller_blinds', label: 'Roller Blinds' },
  { value: 'venetian_blinds', label: 'Venetian Blinds' },
  { value: 'cellular_blinds', label: 'Cellular/Honeycomb' },
  { value: 'vertical_blinds', label: 'Vertical Blinds' },
  { value: 'shutters', label: 'Shutters' },
  { value: 'awnings', label: 'Awnings' },
  { value: 'panel_glide', label: 'Panel Glide' },
];

interface GridEntry {
  id: string;
  priceGroup: string;
  file: File | null;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface BulkGridUploaderProps {
  onComplete: () => void;
}

export const BulkGridUploader = ({ onComplete }: BulkGridUploaderProps) => {
  const [supplierId, setSupplierId] = useState<string>('');
  const [productType, setProductType] = useState<string>('');
  const [gridPrefix, setGridPrefix] = useState('');
  const [entries, setEntries] = useState<GridEntry[]>([
    { id: '1', priceGroup: '', file: null, status: 'pending' }
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: vendors = [] } = useVendors();

  const addEntry = () => {
    setEntries([...entries, { 
      id: Date.now().toString(), 
      priceGroup: '', 
      file: null, 
      status: 'pending' 
    }]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const updateEntry = (id: string, updates: Partial<GridEntry>) => {
    setEntries(entries.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  /**
   * Parse CSV to StandardPricingGridData format
   * CSV format: first column is drop, remaining columns are widths
   * First row is header with width values
   */
  const parseCsvToGridData = (csvText: string): StandardPricingGridData => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have header and data rows');

    const headers = lines[0].split(',').map(h => h.trim());
    // Parse widths as numbers, skip first column (drop header)
    const widthColumns = headers.slice(1).map(w => parseFloat(w.replace(/[^0-9.-]/g, '')) || 0);

    const dropRows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return {
        drop: parseFloat(values[0].replace(/[^0-9.-]/g, '')) || 0,
        prices: values.slice(1).map(p => parseFloat(p.replace(/[^0-9.-]/g, '')) || 0)
      };
    }).sort((a, b) => a.drop - b.drop);

    // Sort widths ascending
    widthColumns.sort((a, b) => a - b);

    // Infer unit from values (>=500 assumed mm)
    const maxValue = Math.max(...widthColumns, ...dropRows.map(r => r.drop));
    const unit: GridUnit = maxValue >= 500 ? 'mm' : 'cm';

    return { widthColumns, dropRows, unit, version: 1 };
  };

  const handleBulkUpload = async () => {
    if (!supplierId || !productType) {
      toast.error('Please select supplier and product type');
      return;
    }

    const validEntries = entries.filter(e => e.priceGroup && e.file);
    if (validEntries.length === 0) {
      toast.error('Please add at least one price group with a CSV file');
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let successCount = 0;

      for (const entry of validEntries) {
        updateEntry(entry.id, { status: 'uploading' });

        try {
          const csvText = await entry.file!.text();
          const gridData = parseCsvToGridData(csvText);
          const gridCode = `${gridPrefix || productType.toUpperCase()}-${entry.priceGroup.toUpperCase()}`;
          const gridName = `${GRID_PRODUCT_TYPES.find(t => t.value === productType)?.label || productType} - Group ${entry.priceGroup.toUpperCase()}`;

          const { error } = await supabase
            .from('pricing_grids')
            .insert({
              user_id: user.id,
              name: gridName,
              grid_code: gridCode,
              grid_data: gridData,
              supplier_id: supplierId,
              product_type: productType,
              price_group: entry.priceGroup.toUpperCase().trim(),
              active: true
            });

          if (error) throw error;

          updateEntry(entry.id, { status: 'success' });
          successCount++;
        } catch (err: any) {
          updateEntry(entry.id, { status: 'error', error: err.message });
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} pricing grid${successCount > 1 ? 's' : ''} created successfully`);
        onComplete();
      }
    } catch (error: any) {
      toast.error(error.message || 'Bulk upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const allEntriesValid = entries.every(e => e.priceGroup && e.file);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Grid Upload
        </CardTitle>
        <CardDescription>
          Upload multiple pricing grids at once for different price groups
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shared settings */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Supplier *</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Product Type *</Label>
            <Select value={productType} onValueChange={setProductType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {GRID_PRODUCT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Grid Code Prefix</Label>
            <Input
              placeholder="e.g., TWC-RB"
              value={gridPrefix}
              onChange={(e) => setGridPrefix(e.target.value)}
            />
          </div>
        </div>

        {/* Grid entries */}
        <div className="space-y-3">
          <Label>Price Groups & CSV Files</Label>
          {entries.map((entry, idx) => (
            <div 
              key={entry.id} 
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                entry.status === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' :
                entry.status === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' :
                'bg-muted/50 border-border'
              }`}
            >
              <span className="text-sm font-medium w-6">{idx + 1}.</span>
              
              <Input
                placeholder="Price Group (e.g., 1, A, B)"
                value={entry.priceGroup}
                onChange={(e) => updateEntry(entry.id, { priceGroup: e.target.value })}
                className="w-32"
                disabled={entry.status === 'uploading' || entry.status === 'success'}
              />

              <Input
                type="file"
                accept=".csv"
                onChange={(e) => updateEntry(entry.id, { file: e.target.files?.[0] || null })}
                className="flex-1"
                disabled={entry.status === 'uploading' || entry.status === 'success'}
              />

              {entry.file && (
                <Badge variant="secondary" className="text-xs">
                  {entry.file.name}
                </Badge>
              )}

              {entry.status === 'uploading' && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}

              {entry.status === 'success' && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}

              {entry.status === 'error' && (
                <Badge variant="destructive" className="text-xs">
                  Error
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeEntry(entry.id)}
                disabled={entries.length === 1 || entry.status === 'uploading'}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={addEntry}
            disabled={isUploading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Another Price Group
          </Button>
        </div>

        <Button
          onClick={handleBulkUpload}
          disabled={isUploading || !supplierId || !productType || !allEntriesValid}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {entries.filter(e => e.priceGroup && e.file).length} Pricing Grid{entries.filter(e => e.priceGroup && e.file).length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
