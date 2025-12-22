import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ParsedRow {
  name: string;
  sku?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  cost_price?: number;
  selling_price?: number;
  quantity?: number;
  unit?: string;
  width_cm?: number;
  tags?: string[];
}

interface ColumnMapping {
  name: string;
  sku: string;
  category: string;
  subcategory: string;
  description: string;
  cost_price: string;
  selling_price: string;
  quantity: string;
  unit: string;
  width_cm: string;
  tags: string;
}

const DEFAULT_MAPPING: ColumnMapping = {
  name: 'name',
  sku: 'sku',
  category: 'category',
  subcategory: 'subcategory',
  description: 'description',
  cost_price: 'cost_price',
  selling_price: 'selling_price',
  quantity: 'quantity',
  unit: 'unit',
  width_cm: 'width_cm',
  tags: 'tags',
};

export const BulkInventoryImport = () => {
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>(DEFAULT_MAPPING);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: 'Invalid CSV',
            description: 'CSV must have a header row and at least one data row.',
            variant: 'destructive',
          });
          return;
        }

        // Parse headers
        const headers = parseCSVLine(lines[0]);
        setCsvHeaders(headers);

        // Parse data rows
        const data = lines.slice(1).map(line => parseCSVLine(line));
        setCsvData(data);

        // Auto-detect column mappings
        autoDetectMappings(headers);

        setImportResult(null);
        toast({
          title: 'File loaded',
          description: `Found ${data.length} rows with ${headers.length} columns.`,
        });
      } catch (error) {
        console.error('CSV parsing error:', error);
        toast({
          title: 'Parse error',
          description: 'Failed to parse CSV file. Please check the format.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const autoDetectMappings = (headers: string[]) => {
    const newMapping = { ...DEFAULT_MAPPING };
    const lowerHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_'));

    // Auto-detect based on common column names
    const mappingRules: Record<keyof ColumnMapping, string[]> = {
      name: ['name', 'product_name', 'item_name', 'title', 'product'],
      sku: ['sku', 'product_code', 'code', 'item_code', 'part_number'],
      category: ['category', 'type', 'product_type', 'item_type'],
      subcategory: ['subcategory', 'sub_category', 'subtype'],
      description: ['description', 'desc', 'details', 'notes'],
      cost_price: ['cost_price', 'cost', 'purchase_price', 'buy_price', 'wholesale_price'],
      selling_price: ['selling_price', 'sell_price', 'price', 'retail_price', 'rrp'],
      quantity: ['quantity', 'qty', 'stock', 'stock_quantity', 'on_hand'],
      unit: ['unit', 'uom', 'unit_of_measure', 'measurement_unit'],
      width_cm: ['width_cm', 'width', 'fabric_width', 'material_width'],
      tags: ['tags', 'labels', 'keywords'],
    };

    Object.entries(mappingRules).forEach(([field, patterns]) => {
      const matchIndex = lowerHeaders.findIndex(h => patterns.some(p => h.includes(p)));
      if (matchIndex >= 0) {
        (newMapping as any)[field] = headers[matchIndex];
      }
    });

    setMapping(newMapping);
  };

  const handleImport = async () => {
    if (csvData.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      setIsImporting(false);
      return;
    }

    const results = { success: 0, failed: 0, errors: [] as string[] };
    const headerIndexMap: Record<string, number> = {};
    csvHeaders.forEach((h, i) => { headerIndexMap[h] = i; });

    // Process in batches of 50
    const batchSize = 50;
    for (let i = 0; i < csvData.length; i += batchSize) {
      const batch = csvData.slice(i, i + batchSize);
      const items = batch.map((row, rowIdx) => {
        try {
          const getValue = (field: keyof ColumnMapping) => {
            const colName = mapping[field];
            const colIndex = headerIndexMap[colName];
            return colIndex !== undefined ? row[colIndex] : undefined;
          };

          const name = getValue('name');
          if (!name) {
            throw new Error(`Row ${i + rowIdx + 2}: Missing name`);
          }

          // Parse tags - support comma-separated or JSON array
          let tags: string[] = [];
          const tagsValue = getValue('tags');
          if (tagsValue) {
            try {
              tags = JSON.parse(tagsValue);
            } catch {
              tags = tagsValue.split(',').map(t => t.trim()).filter(Boolean);
            }
          }

          return {
            user_id: user.user!.id,
            name: name,
            sku: getValue('sku') || null,
            category: getValue('category') || null,
            subcategory: getValue('subcategory') || null,
            description: getValue('description') || null,
            cost_price: parseFloat(getValue('cost_price') || '0') || 0,
            selling_price: parseFloat(getValue('selling_price') || '0') || null,
            quantity: parseInt(getValue('quantity') || '0') || 0,
            unit: getValue('unit') || 'units',
            width_cm: parseFloat(getValue('width_cm') || '0') || null,
            tags: tags.length > 0 ? tags : null,
            active: true,
          };
        } catch (error: any) {
          results.errors.push(error.message);
          results.failed++;
          return null;
        }
      }).filter(Boolean);

      if (items.length > 0) {
        const { error } = await supabase
          .from('enhanced_inventory_items')
          .upsert(items as any[], { 
            onConflict: 'user_id,sku',
            ignoreDuplicates: false 
          });

        if (error) {
          results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
          results.failed += items.length;
        } else {
          results.success += items.length;
        }
      }

      setImportProgress(Math.round(((i + batch.length) / csvData.length) * 100));
    }

    setIsImporting(false);
    setImportResult(results);
    queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });

    if (results.success > 0) {
      toast({
        title: 'Import complete',
        description: `Successfully imported ${results.success} items${results.failed > 0 ? `, ${results.failed} failed` : ''}.`,
      });
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ['name', 'sku', 'category', 'subcategory', 'description', 'cost_price', 'selling_price', 'quantity', 'unit', 'width_cm', 'tags'];
    const sampleData = [
      ['Blockout Fabric White', 'FAB-BLK-001', 'Fabric', 'Blockout', 'Premium blockout fabric', '45.00', '89.00', '100', 'meters', '280', 'blockout,white,wide'],
      ['Roller Tube 38mm', 'TUBE-38', 'Hardware', 'Tubes', '38mm aluminum roller tube', '12.50', '25.00', '50', 'units', '', 'roller,tube'],
    ];
    
    const csvContent = [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setCsvHeaders([]);
    setCsvData([]);
    setImportResult(null);
    setImportProgress(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Bulk Inventory Import
        </CardTitle>
        <CardDescription>
          Import inventory items from a CSV file. Existing items with matching SKU will be updated.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button variant="ghost" size="sm" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          {csvData.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Column Mapping */}
        {csvHeaders.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Column Mapping</Label>
              <Badge variant="secondary">{csvData.length} rows</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(Object.keys(DEFAULT_MAPPING) as (keyof ColumnMapping)[]).map((field) => (
                <div key={field} className="space-y-1">
                  <Label className="text-xs capitalize">{field.replace('_', ' ')}</Label>
                  <Select
                    value={mapping[field]}
                    onValueChange={(value) => setMapping({ ...mapping, [field]: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Not mapped --</SelectItem>
                      {csvHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-3 py-2 text-sm font-medium">
                Preview (first 3 rows)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      {csvHeaders.slice(0, 6).map((header) => (
                        <th key={header} className="px-2 py-1 text-left font-medium">
                          {header}
                        </th>
                      ))}
                      {csvHeaders.length > 6 && <th className="px-2 py-1">...</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-t">
                        {row.slice(0, 6).map((cell, j) => (
                          <td key={j} className="px-2 py-1 truncate max-w-[150px]">
                            {cell}
                          </td>
                        ))}
                        {row.length > 6 && <td className="px-2 py-1">...</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Import Button */}
            <div className="flex items-center gap-4">
              <Button
                onClick={handleImport}
                disabled={isImporting || !mapping.name}
              >
                {isImporting ? 'Importing...' : `Import ${csvData.length} Items`}
              </Button>
              {isImporting && (
                <div className="flex-1">
                  <Progress value={importProgress} className="h-2" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {importResult && (
          <Alert variant={importResult.failed > 0 ? 'destructive' : 'default'}>
            {importResult.failed > 0 ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="flex items-center gap-4">
                <span className="text-green-600">{importResult.success} imported</span>
                {importResult.failed > 0 && (
                  <span className="text-destructive">{importResult.failed} failed</span>
                )}
              </div>
              {importResult.errors.length > 0 && (
                <ul className="mt-2 text-xs space-y-1">
                  {importResult.errors.slice(0, 5).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li>...and {importResult.errors.length - 5} more errors</li>
                  )}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
