import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Trash2, CheckCircle2, AlertCircle, Info, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';

interface TemplateGridManagerProps {
  productType: string;
  systemType: string;
}

interface PricingGrid {
  id: string;
  name: string;
  grid_code: string;
  description: string;
  grid_data: any;
  price_group: string;
  created_at: string;
}

interface GridRule {
  id: string;
  grid_id: string;
  price_group: string;
}

export const TemplateGridManager = ({ productType, systemType }: TemplateGridManagerProps) => {
  const { toast } = useToast();
  const [grids, setGrids] = useState<PricingGrid[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Upload form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [gridName, setGridName] = useState('');
  const [gridDescription, setGridDescription] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  useEffect(() => {
    if (productType && systemType) {
      loadGrids();
    }
  }, [productType, systemType]);

  const loadGrids = async () => {
    try {
      setLoading(true);
      
      // Find all grids for this product_type + system_type
      const { data: rules, error: rulesError } = await supabase
        .from('pricing_grid_rules')
        .select(`
          id,
          grid_id,
          price_group,
          pricing_grids (
            id,
            name,
            grid_code,
            description,
            grid_data,
            created_at
          )
        `)
        .eq('product_type', productType)
        .eq('system_type', systemType)
        .eq('active', true);

      if (rulesError) throw rulesError;

      // Transform the data
      const gridsList = rules?.map((rule: any) => ({
        ...rule.pricing_grids,
        price_group: rule.price_group,
      })) || [];

      setGrids(gridsList);
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
    if (!gridName || !csvFile) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a grid name and CSV file',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      // Parse CSV
      const gridData = await parseCSV(csvFile);

      //Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate grid code from grid name (sanitize for use as code)
      const gridCode = gridName.trim().replace(/\s+/g, '_').toUpperCase();

      // Create the grid
      const { data: newGrid, error: gridError } = await supabase
        .from('pricing_grids')
        .insert([{
          user_id: user.id,
          name: gridName,
          grid_code: gridCode,
          description: gridDescription || `${productType} ${systemType} - ${gridName}`,
          grid_data: gridData,
          active: true,
        }])
        .select()
        .single();

      if (gridError) throw gridError;

      // Create the routing rule
      const { error: ruleError } = await supabase
        .from('pricing_grid_rules')
        .insert([{
          user_id: user.id,
          grid_id: newGrid.id,
          product_type: productType,
          system_type: systemType,
          price_group: gridCode, // Use the grid code as the price group
          active: true,
          priority: 100,
        }]);

      if (ruleError) throw ruleError;

      toast({
        title: 'Success',
        description: 'Pricing grid uploaded and connected',
      });

      // Reset form
      setShowUploadForm(false);
      setGridName('');
      setGridDescription('');
      setCsvFile(null);

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

  const handleDeleteGrid = async (gridId: string, priceGroup: string) => {
    if (!confirm(`Delete pricing grid for Group ${priceGroup}?`)) return;

    try {
      // Delete the rule (grid will be kept but unlinked)
      const { error: ruleError } = await supabase
        .from('pricing_grid_rules')
        .delete()
        .eq('grid_id', gridId)
        .eq('product_type', productType)
        .eq('system_type', systemType);

      if (ruleError) throw ruleError;

      toast({
        title: 'Grid Removed',
        description: 'Pricing grid has been disconnected',
      });

      loadGrids();
    } catch (error: any) {
      console.error('Error deleting grid:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove pricing grid',
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

  if (!productType || !systemType) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please set Product Type and System Type above to manage pricing grids.
        </AlertDescription>
      </Alert>
    );
  }


  return (
    <div className="space-y-6">
      {/* Visual Explanation */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How it works:</strong> Upload CSV pricing grids with custom names. 
          When creating a job, select a fabric with a matching grid name, and the system will automatically use that pricing grid.
        </AlertDescription>
      </Alert>

      {/* Configuration Summary */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Grid Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Product Type:</span>
              <Badge variant="secondary" className="ml-2">{productType}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">System Type:</span>
              <Badge variant="secondary" className="ml-2">{systemType}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Status Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Pricing Grids</CardTitle>
              <CardDescription>
                Grids uploaded for {productType} - {systemType}
              </CardDescription>
            </div>
            {!showUploadForm && (
              <Button onClick={() => setShowUploadForm(true)} size="sm">
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
              <Button onClick={() => setShowUploadForm(true)} size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Grid
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grid Code</TableHead>
                  <TableHead>Grid Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grids.map((grid) => (
                  <TableRow key={grid.id}>
                    <TableCell>
                      <Badge variant="outline">{grid.grid_code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{grid.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {grid.description || '-'}
                      </div>
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
                        onClick={() => handleDeleteGrid(grid.id, grid.price_group)}
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
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Pricing Grid
            </CardTitle>
            <CardDescription>
              Upload a CSV file with width × drop pricing matrix
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="grid_name">Grid Name / Code *</Label>
                <Input
                  id="grid_name"
                  value={gridName}
                  onChange={(e) => setGridName(e.target.value)}
                  placeholder="e.g., RollerCassettePremium or A-Premium"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a unique name or code to identify this pricing grid (e.g., "A", "Premium", "RC-Luxury")
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="grid_description">Description</Label>
              <Textarea
                id="grid_description"
                value={gridDescription}
                onChange={(e) => setGridDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
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
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUploadGrid} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload & Connect'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
