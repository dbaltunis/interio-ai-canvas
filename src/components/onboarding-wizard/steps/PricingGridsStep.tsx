import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid3X3, Download, Upload, Plus, Trash2, FileSpreadsheet } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';

interface StepProps {
  data: OnboardingData;
  updateSection: (section: keyof OnboardingData, data: any) => void;
  isSaving: boolean;
}

interface PricingGrid {
  name: string;
  product_type: string;
  csv_data: string;
}

const PRODUCT_TYPES = [
  'Roller Blinds',
  'Venetian Blinds',
  'Cellular/Honeycomb',
  'Vertical Blinds',
  'Roman Blinds',
  'Shutters',
  'Awnings',
  'Other',
];

export const PricingGridsStep = ({ data, updateSection }: StepProps) => {
  const pricingGrids = data.pricing_grids || { grids: [] };
  const [newGrid, setNewGrid] = useState<PricingGrid>({ name: '', product_type: '', csv_data: '' });

  const handleAddGrid = () => {
    if (newGrid.name && newGrid.product_type && newGrid.csv_data) {
      const updatedGrids = [...(pricingGrids.grids || []), newGrid];
      updateSection('pricing_grids', { grids: updatedGrids });
      setNewGrid({ name: '', product_type: '', csv_data: '' });
    }
  };

  const handleRemoveGrid = (index: number) => {
    const updatedGrids = (pricingGrids.grids || []).filter((_, i) => i !== index);
    updateSection('pricing_grids', { grids: updatedGrids });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewGrid(prev => ({ ...prev, csv_data: event.target?.result as string }));
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-primary" />
          Pricing Grids
        </CardTitle>
        <CardDescription>
          Upload pricing grids for your window covering products. Grids use Width × Drop dimensions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Download Template */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div>
            <div className="font-medium text-sm">Pricing Grid Template</div>
            <div className="text-xs text-muted-foreground">
              CSV format: First column = drop (height), first row = width
            </div>
          </div>
          <a href="/templates/pricing_grid_template.csv" download>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </a>
        </div>

        {/* Add New Grid */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Pricing Grid
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grid-name">Grid Name</Label>
              <Input
                id="grid-name"
                placeholder="e.g., Standard Roller"
                value={newGrid.name}
                onChange={(e) => setNewGrid(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-type">Product Type</Label>
              <Select
                value={newGrid.product_type}
                onValueChange={(value) => setNewGrid(prev => ({ ...prev, product_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grid-csv">Upload CSV</Label>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="grid-csv"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="grid-csv"
                  className="flex items-center justify-center gap-2 h-10 px-3 border rounded-md cursor-pointer hover:bg-accent transition-colors text-sm"
                >
                  <Upload className="h-4 w-4" />
                  {newGrid.csv_data ? 'File loaded ✓' : 'Choose file'}
                </label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddGrid}
            disabled={!newGrid.name || !newGrid.product_type || !newGrid.csv_data}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Grid
          </Button>
        </div>

        {/* Uploaded Grids List */}
        {pricingGrids.grids && pricingGrids.grids.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Uploaded Grids</h3>
            <div className="space-y-2">
              {pricingGrids.grids.map((grid, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{grid.name}</div>
                      <div className="text-xs text-muted-foreground">{grid.product_type}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveGrid(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <strong>Note:</strong> Pricing grids define prices based on width and drop combinations. 
          You can add more grids later in Settings → Templates.
        </div>
      </CardContent>
    </Card>
  );
};
