import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Trash2, CheckCircle2, Info, FileText, Download, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { useVendors, useCreateVendor } from '@/hooks/useVendors';
import { useIntegrations } from '@/hooks/useIntegrations';

interface TemplateGridManagerProps {
  // No props needed - grids are now assigned directly to inventory items
}

interface PricingGrid {
  id: string;
  name: string;
  grid_code: string;
  description: string;
  grid_data: any;
  created_at: string;
  supplier_id?: string | null;
  product_type?: string | null;
  price_group?: string | null;
}

interface SupplierOption {
  id: string;
  name: string;
  isIntegrated?: boolean;
}

const PRODUCT_TYPES = [
  { value: 'roller_blinds', label: 'Roller Blinds' },
  { value: 'venetian_blinds', label: 'Venetian Blinds' },
  { value: 'vertical_blinds', label: 'Vertical Blinds' },
  { value: 'cellular_blinds', label: 'Cellular/Honeycomb Blinds' },
  { value: 'shutters', label: 'Plantation Shutters' },
  { value: 'panel_glide', label: 'Panel Track/Glide' },
  { value: 'awning', label: 'Awnings' },
  { value: 'curtains', label: 'Curtains' },
  { value: 'roman_blinds', label: 'Roman Blinds' },
];

// Supplier integrations that provide product data
const SUPPLIER_INTEGRATION_TYPES = ['twc', 'tigpim', 'somfy'];

export const TemplateGridManager = ({}: TemplateGridManagerProps) => {
  const { toast } = useToast();
  const { data: vendors = [] } = useVendors();
  const { integrations } = useIntegrations();
  const createVendor = useCreateVendor();
  
  const [grids, setGrids] = useState<PricingGrid[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const uploadFormRef = useRef<HTMLDivElement>(null);
  
  // Upload form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [gridName, setGridName] = useState('');
  const [gridDescription, setGridDescription] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [supplierId, setSupplierId] = useState<string>('');
  const [productType, setProductType] = useState<string>('');
  const [priceGroup, setPriceGroup] = useState<string>('');
  
  // Inline supplier creation
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  // Merge vendors with active supplier integrations
  const allSuppliers = useMemo((): SupplierOption[] => {
    const supplierList: SupplierOption[] = vendors.map(v => ({
      id: v.id,
      name: v.name,
      isIntegrated: false,
    }));
    
    // Add integrated suppliers if active and not already in vendors
    const activeSupplierIntegrations = integrations.filter(
      i => SUPPLIER_INTEGRATION_TYPES.includes(i.integration_type) && i.active
    );
    
    for (const integration of activeSupplierIntegrations) {
      const integrationName = integration.integration_type.toUpperCase();
      const alreadyExists = supplierList.some(
        s => s.name.toLowerCase() === integrationName.toLowerCase()
      );
      
      if (!alreadyExists) {
        // Use integration ID as the supplier ID for integrated suppliers
        supplierList.push({
          id: `integration-${integration.id}`,
          name: integrationName,
          isIntegrated: true,
        });
      }
    }
    
    return supplierList;
  }, [vendors, integrations]);

  // Auto-select if only one supplier
  useEffect(() => {
    if (allSuppliers.length === 1 && !supplierId && showUploadForm) {
      setSupplierId(allSuppliers[0].id);
    }
  }, [allSuppliers, supplierId, showUploadForm]);

  useEffect(() => {
    loadGrids();
  }, []);

  const loadGrids = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Load all grids for this user with supplier info
      const { data: gridsList, error } = await supabase
        .from('pricing_grids')
        .select('*, vendors:supplier_id(name)')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGrids(gridsList || []);
    } catch (error: any) {
      console.error('Error loading grids:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pricing grids',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error('CSV must have at least a header row and one data row');
          }

          // Parse header row (width ranges)
          const headerCells = lines[0].split(',');
          const widthRanges = headerCells.slice(1).map(cell => cell.trim());

          // Parse data rows
          const dropRanges: string[] = [];
          const prices: number[][] = [];

          for (let i = 1; i < lines.length; i++) {
            const cells = lines[i].split(',');
            const dropRange = cells[0].trim();
            const rowPrices = cells.slice(1).map(cell => parseFloat(cell.trim()));

            dropRanges.push(dropRange);
            prices.push(rowPrices);
          }

          resolve({ widthRanges, dropRanges, prices });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleUploadGrid = async () => {
    if (!gridName || !csvFile || !supplierId || !productType || !priceGroup) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields: Supplier, Product Type, Price Group, Grid Name, and CSV file',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      // Parse CSV
      const gridData = await parseCSV(csvFile);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Handle integrated supplier IDs - need to get or create a real vendor record
      let actualSupplierId = supplierId;
      if (supplierId.startsWith('integration-')) {
        // Find the supplier name from our merged list
        const selectedSupplier = allSuppliers.find(s => s.id === supplierId);
        if (selectedSupplier) {
          // Check if a vendor with this name already exists, if not create one
          const existingVendor = vendors.find(v => 
            v.name.toLowerCase() === selectedSupplier.name.toLowerCase()
          );
          
          if (existingVendor) {
            actualSupplierId = existingVendor.id;
          } else {
            // Create a new vendor for this integration
            const newVendor = await createVendor.mutateAsync({
              name: selectedSupplier.name,
              active: true,
            });
            actualSupplierId = newVendor.id;
          }
        }
      }

      // Generate grid code from grid name (sanitize for use as code)
      const gridCode = gridName.trim().replace(/\s+/g, '_').toUpperCase();

      // Create the grid with auto-matching fields
      const { error: gridError } = await supabase
        .from('pricing_grids')
        .insert([{
          user_id: user.id,
          name: gridName,
          grid_code: gridCode,
          description: gridDescription || gridName,
          grid_data: gridData,
          supplier_id: actualSupplierId,
          product_type: productType,
          price_group: priceGroup.toUpperCase(),
          active: true,
        }]);

      if (gridError) throw gridError;

      toast({
        title: 'Success',
        description: `Pricing grid "${gridName}" uploaded. Fabrics with Price Group "${priceGroup.toUpperCase()}" from this supplier will auto-match.`,
      });

      // Reset form
      setShowUploadForm(false);
      setGridName('');
      setGridDescription('');
      setCsvFile(null);
      setSupplierId('');
      setProductType('');
      setPriceGroup('');

      // Reload grids
      loadGrids();
    } catch (error: any) {
      console.error('Error uploading grid:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload pricing grid',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteGrid = async (gridId: string, gridName: string) => {
    if (!confirm(`Delete pricing grid "${gridName}"?`)) return;

    try {
      // Delete the grid directly
      const { error } = await supabase
        .from('pricing_grids')
        .delete()
        .eq('id', gridId);

      if (error) throw error;

      toast({
        title: 'Grid Deleted',
        description: 'Pricing grid has been removed',
      });

      loadGrids();
    } catch (error: any) {
      console.error('Error deleting grid:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete pricing grid',
        variant: 'destructive',
      });
    }
  };

  const downloadSampleCSV = () => {
    const sampleCSV = `Drop/Width,100,150,200,250,300
150,120,140,160,180,200
200,150,175,200,225,250
250,180,210,240,270,300
300,210,245,280,315,350`;

    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pricing_grid_sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Sample Downloaded',
      description: 'Check your downloads folder',
    });
  };

  const getVendorName = (grid: any) => {
    return grid.vendors?.name || 'Not assigned';
  };

  const getProductTypeLabel = (type: string | null | undefined) => {
    if (!type) return 'Not assigned';
    return PRODUCT_TYPES.find(pt => pt.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Visual Explanation */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Auto-Matching:</strong> Upload pricing grids with Supplier + Product Type + Price Group. 
          When you select a fabric in a quote, the system automatically finds the matching grid based on the fabric's Price Group and Supplier.
        </AlertDescription>
      </Alert>

      {/* Grid Status Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Pricing Grids</CardTitle>
              <CardDescription>
                Grids auto-match to fabrics based on Supplier + Price Group
              </CardDescription>
            </div>
            {!showUploadForm && (
              <Button onClick={() => {
                setShowUploadForm(true);
                setTimeout(() => uploadFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
              }} size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Grid
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-4">Loading grids...</p>
          ) : grids.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No pricing grids uploaded yet</p>
              <Button onClick={() => {
                setShowUploadForm(true);
                setTimeout(() => uploadFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
              }} size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Grid
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grid Name</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Product Type</TableHead>
                  <TableHead>Price Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grids.map((grid) => (
                  <TableRow key={grid.id}>
                    <TableCell>
                      <div className="font-medium">{grid.name}</div>
                      <div className="text-xs text-muted-foreground">{grid.grid_code}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getVendorName(grid)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getProductTypeLabel(grid.product_type)}</Badge>
                    </TableCell>
                    <TableCell>
                      {grid.price_group ? (
                        <Badge variant="default">{grid.price_group}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGrid(grid.id, grid.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upload Form */}
      {showUploadForm && (
        <Card ref={uploadFormRef} className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Pricing Grid
            </CardTitle>
            <CardDescription>
              Upload a CSV pricing grid and configure auto-matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Auto-matching fields */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                {!showAddSupplier ? (
                  <Select 
                    value={supplierId} 
                    onValueChange={(value) => {
                      if (value === '__new__') {
                        setShowAddSupplier(true);
                      } else {
                        setSupplierId(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {allSuppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          <span className="flex items-center gap-2">
                            {supplier.name}
                            {supplier.isIntegrated && (
                              <Badge variant="secondary" className="text-xs py-0">Integrated</Badge>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                      <SelectItem value="__new__">
                        <span className="flex items-center gap-1 text-primary">
                          <Plus className="h-3 w-3" />
                          Add New Supplier
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={newSupplierName}
                      onChange={(e) => setNewSupplierName(e.target.value)}
                      placeholder="Supplier name"
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={async () => {
                        if (!newSupplierName.trim()) return;
                        try {
                          const newVendor = await createVendor.mutateAsync({
                            name: newSupplierName.trim(),
                            active: true,
                          });
                          setSupplierId(newVendor.id);
                          setNewSupplierName('');
                          setShowAddSupplier(false);
                          toast({
                            title: 'Supplier Created',
                            description: `"${newSupplierName}" has been added`,
                          });
                        } catch (error) {
                          console.error('Error creating supplier:', error);
                        }
                      }}
                      disabled={createVendor.isPending || !newSupplierName.trim()}
                    >
                      {createVendor.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Add'
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddSupplier(false);
                        setNewSupplierName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {allSuppliers.length === 0 
                    ? 'No suppliers yet - add your first one above'
                    : 'The supplier this pricing grid is from'
                  }
                </p>
              </div>

              <div>
                <Label htmlFor="product_type">Product Type *</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  What product type uses this grid
                </p>
              </div>

              <div>
                <Label htmlFor="price_group">Price Group *</Label>
                <Input
                  id="price_group"
                  value={priceGroup}
                  onChange={(e) => setPriceGroup(e.target.value)}
                  placeholder="e.g., A, B, Premium"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Fabrics with this Price Group will use this grid
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="grid_name">Grid Name *</Label>
                <Input
                  id="grid_name"
                  value={gridName}
                  onChange={(e) => setGridName(e.target.value)}
                  placeholder="e.g., Roller Blind Premium"
                />
              </div>

              <div>
                <Label htmlFor="grid_description">Description</Label>
                <Input
                  id="grid_description"
                  value={gridDescription}
                  onChange={(e) => setGridDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="csv_file">CSV File *</Label>
              <Input
                id="csv_file"
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload a CSV with Drop/Width in first column, width values in header, and prices in cells
              </p>
            </div>

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>CSV Format:</strong> First row: Drop/Width, 100, 150, 200, etc. 
                Data rows: 150, 120, 140, 160, etc.
                <Button variant="link" size="sm" className="ml-2 p-0 h-auto" onClick={downloadSampleCSV}>
                  <Download className="h-3 w-3 mr-1" />
                  Download Sample
                </Button>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadForm(false);
                  setGridName('');
                  setGridDescription('');
                  setCsvFile(null);
                  setSupplierId('');
                  setProductType('');
                  setPriceGroup('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUploadGrid} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Grid'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
