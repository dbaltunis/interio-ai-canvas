import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, Trash2, Grid3x3 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SampleDataHelper } from './SampleDataHelper';
import { PricingGridExplainer } from './PricingGridExplainer';

export const PricingGridManager = () => {
  const [newGridName, setNewGridName] = useState('');
  const [newGridCode, setNewGridCode] = useState('');
  const [newGridDescription, setNewGridDescription] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch pricing grids
  const { data: grids, isLoading, refetch } = useQuery({
    queryKey: ['pricing-grids'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pricing_grids')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const parseCsvToGridData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have header and data rows');

    // First row is headers (widths)
    const headers = lines[0].split(',').map(h => h.trim());
    const widthColumns = headers.slice(1); // Skip first column (Drop)

    // Remaining rows are drop values with prices
    const dropRows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return {
        drop: values[0],
        prices: values.slice(1).map(p => parseFloat(p) || 0)
      };
    });

    return {
      widthColumns,
      dropRows
    };
  };

  const handleCreateGrid = async () => {
    if (!newGridName || !newGridCode) {
      toast.error('Please provide grid name and code');
      return;
    }

    if (!csvFile) {
      toast.error('Please upload a CSV file');
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Read CSV file
      const csvText = await csvFile.text();
      const gridData = parseCsvToGridData(csvText);

      // Create grid
      const { error } = await supabase
        .from('pricing_grids')
        .insert({
          user_id: user.id,
          name: newGridName,
          grid_code: newGridCode,
          description: newGridDescription || null,
          grid_data: gridData,
          active: true
        });

      if (error) throw error;

      toast.success('Pricing grid created successfully');
      setNewGridName('');
      setNewGridCode('');
      setNewGridDescription('');
      setCsvFile(null);
      refetch();
    } catch (error: any) {
      console.error('Error creating pricing grid:', error);
      toast.error(error.message || 'Failed to create pricing grid');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteGrid = async (gridId: string) => {
    if (!confirm('Are you sure you want to delete this pricing grid?')) return;

    try {
      const { error } = await supabase
        .from('pricing_grids')
        .update({ active: false })
        .eq('id', gridId);

      if (error) throw error;

      toast.success('Pricing grid deleted');
      refetch();
    } catch (error: any) {
      console.error('Error deleting pricing grid:', error);
      toast.error('Failed to delete pricing grid');
    }
  };

  return (
    <div className="space-y-6">
      {/* Help Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Global Pricing Grids</h2>
        <PricingGridExplainer />
      </div>

      {/* Sample CSV Helper */}
      <SampleDataHelper />

      {/* Create New Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Pricing Grid
          </CardTitle>
          <CardDescription>
            Upload a CSV file with pricing data. Format: First column is Drop (cm), header row is Width (cm), cells are prices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>CSV Format:</strong> First row should be widths (e.g., 50, 100, 150...), first column should be drops (e.g., 100, 150, 200...), and cells contain prices.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grid-name">Grid Name *</Label>
              <Input
                id="grid-name"
                placeholder="e.g., Roller Blind - Standard"
                value={newGridName}
                onChange={(e) => setNewGridName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grid-code">Grid Code *</Label>
              <Input
                id="grid-code"
                placeholder="e.g., RB-STD-2024"
                value={newGridCode}
                onChange={(e) => setNewGridCode(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grid-description">Description</Label>
            <Textarea
              id="grid-description"
              placeholder="Optional description"
              value={newGridDescription}
              onChange={(e) => setNewGridDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File *</Label>
            <div className="flex gap-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="flex-1"
              />
              {csvFile && (
                <Button variant="outline" size="sm" onClick={() => setCsvFile(null)}>
                  Clear
                </Button>
              )}
            </div>
            {csvFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {csvFile.name}
              </p>
            )}
          </div>

          <Button 
            onClick={handleCreateGrid} 
            disabled={isUploading || !newGridName || !newGridCode || !csvFile}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Creating...' : 'Create Pricing Grid'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Grids */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            Existing Pricing Grids
          </CardTitle>
          <CardDescription>
            Manage your pricing grids
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !grids || grids.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pricing grids yet. Create one above.</p>
          ) : (
            <div className="space-y-2">
              {grids.map((grid) => (
                <div 
                  key={grid.id} 
                  className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-card-foreground">{grid.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Code: {grid.grid_code}
                      {grid.description && ` • ${grid.description}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {new Date(grid.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGrid(grid.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
