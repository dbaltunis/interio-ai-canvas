import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Upload, FileSpreadsheet, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { usePricingGrids, useCreatePricingGrid, useDeletePricingGrid } from "@/hooks/usePricingGrids";
import type { PricingGrid } from "@/types/database";

interface GridDataStructure {
  widthColumns?: string[];
  dropRows?: Array<{
    drop: string;
    prices: number[];
  }>;
}

export const PricingGridsSection = () => {
  const [gridName, setGridName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState<PricingGrid | null>(null);

  const { data: pricingGrids = [], isLoading } = usePricingGrids();
  const createPricingGrid = useCreatePricingGrid();
  const deletePricingGrid = useDeletePricingGrid();

  const generateCSVTemplate = () => {
    // Simple Drop/Width format
    const csvContent = `Drop/Width,100,200,300,400,500,600,700,800,900,1000,1100,1200,1300,1400,1500
100,23,46,69,92,115,138,161,184,207,230,253,276,299,322,345
200,46,92,138,184,230,276,322,368,414,460,506,552,598,644,690
300,69,138,207,276,345,414,483,552,621,690,759,828,897,966,1035
400,92,184,276,368,460,552,644,736,828,920,1012,1104,1196,1288,1380
500,115,230,345,460,575,690,805,920,1035,1150,1265,1380,1495,1610,1725
600,138,276,414,552,690,828,966,1104,1242,1380,1518,1656,1794,1932,2070
700,161,322,483,644,805,966,1127,1288,1449,1610,1771,1932,2093,2254,2415
800,184,368,552,736,920,1104,1288,1472,1656,1840,2024,2208,2392,2576,2760
900,207,414,621,828,1035,1242,1449,1656,1863,2070,2277,2484,2691,2898,3105
1000,230,460,690,920,1150,1380,1610,1840,2070,2300,2530,2760,2990,3220,3450`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'pricing_grid_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV template downloaded successfully");
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const widthColumns = headers.slice(1); // Remove first column (Drop/Width label)
    
    const gridData = {
      widthColumns,
      dropRows: [] as any[]
    };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        throw new Error(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
      }

      const drop = values[0];
      const prices = values.slice(1).map(price => {
        const num = parseFloat(price);
        if (isNaN(num)) {
          throw new Error(`Invalid price "${price}" at row ${i + 1}`);
        }
        return num;
      });

      gridData.dropRows.push({
        drop,
        prices
      });
    }

    return gridData;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error("Please select a CSV file");
        return;
      }
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleUpload = async () => {
    if (!gridName.trim()) {
      toast.error("Please enter a grid name");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      const fileContent = await selectedFile.text();
      console.log('CSV content:', fileContent);
      
      const gridData = parseCSV(fileContent);
      console.log('Parsed grid data:', gridData);
      
      await createPricingGrid.mutateAsync({
        name: gridName,
        grid_data: gridData
      });
      
      toast.success(`Pricing grid "${gridName}" uploaded successfully`);
      setGridName("");
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('csvFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error(`Failed to process CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the pricing grid "${name}"?`)) {
      return;
    }
    
    try {
      await deletePricingGrid.mutateAsync(id);
      toast.success("Pricing grid deleted successfully");
    } catch (error) {
      console.error('Error deleting pricing grid:', error);
      toast.error("Failed to delete pricing grid");
    }
  };

  const handlePreview = (grid: PricingGrid) => {
    setShowPreview(grid);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">CSV Pricing Grids</h4>
          <p className="text-sm text-brand-neutral">Upload CSV files with drop/width pricing tables for blinds and curtains</p>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={generateCSVTemplate}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Pricing Grid
            </CardTitle>
            <CardDescription>
              Upload CSV files with drop/width pricing tables from your vendors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="gridName">Grid Name</Label>
              <Input 
                id="gridName" 
                placeholder="e.g., Roman Blinds - Premium, Venetian Blinds - Standard" 
                value={gridName}
                onChange={(e) => setGridName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="csvFile">CSV File</Label>
              <Input 
                id="csvFile" 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="text-xs text-green-600 mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
            <Button 
              onClick={handleUpload}
              className="w-full bg-brand-primary hover:bg-brand-accent"
              disabled={!gridName.trim() || !selectedFile || createPricingGrid.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              {createPricingGrid.isPending ? 'Uploading...' : 'Upload & Process Grid'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              CSV Format Guide
            </CardTitle>
            <CardDescription>
              How to structure your CSV pricing files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p><strong>Required Format:</strong></p>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                <div>Drop/Width,100,200,300,400,500</div>
                <div>100,23,46,69,92,115</div>
                <div>200,46,92,138,184,230</div>
                <div>300,69,138,207,276,345</div>
              </div>
              
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>First row: "Drop/Width" then width values</li>
                <li>First column: Drop measurements</li>
                <li>Intersection cells: Prices for that drop/width</li>
                <li>Use consistent units (mm or cm)</li>
                <li>All values must be numbers (no currency symbols)</li>
              </ul>
              
              <p className="mt-3"><strong>Vendor Compatibility:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>✅ Direct upload from most blind suppliers</li>
                <li>✅ Excel exports saved as CSV</li>
                <li>✅ Standard pricing table formats</li>
                <li>✅ Works with your existing vendor data</li>
              </ul>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateCSVTemplate}
                className="w-full mt-3"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Example Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Grids List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Pricing Grids</CardTitle>
          <CardDescription>
            Manage your uploaded CSV pricing grids
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading pricing grids...</div>
          ) : pricingGrids.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-brand-neutral">No pricing grids uploaded yet</p>
              <p className="text-xs text-brand-neutral mt-1">
                Upload your first CSV pricing grid to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pricingGrids.map((grid) => {
                const typedGrid = grid as PricingGrid;
                const typedGridData = typedGrid.grid_data as GridDataStructure;
                return (
                  <div key={typedGrid.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                      <div>
                        <h5 className="font-medium">{typedGrid.name}</h5>
                        <p className="text-xs text-gray-500">
                          {typedGridData?.dropRows?.length || 0} drop ranges × {typedGridData?.widthColumns?.length || 0} width ranges
                        </p>
                        <p className="text-xs text-gray-400">
                          Created {new Date(typedGrid.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={typedGrid.active ? "default" : "secondary"}>
                        {typedGrid.active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(typedGrid)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(typedGrid.id, typedGrid.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{showPreview.name}</h3>
              <Button variant="outline" onClick={() => setShowPreview(null)}>
                Close
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-2 py-1 text-xs">Drop/Width</th>
                    {(showPreview.grid_data as GridDataStructure)?.widthColumns?.map((width: string, index: number) => (
                      <th key={index} className="border border-gray-300 px-2 py-1 text-xs">{width}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(showPreview.grid_data as GridDataStructure)?.dropRows?.map((row: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-2 py-1 text-xs font-medium">{row.drop}</td>
                      {row.prices?.map((price: number, priceIndex: number) => (
                        <td key={priceIndex} className="border border-gray-300 px-2 py-1 text-xs text-right">{price}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
