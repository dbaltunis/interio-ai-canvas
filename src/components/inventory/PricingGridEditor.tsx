import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Download, Trash2, Plus, FileSpreadsheet, Grid3X3, List, Edit3, Save, X, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PricingGridEditorProps {
  itemType: string;
  onGridChange: (grid: any) => void;
}

type GridFormat = 'traditional' | 'structured';

type GridData = {
  format: GridFormat;
  headers: string[];
  data: any[];
  matrixData?: {
    widthColumns: number[];
    dropRows: number[];
    prices: { [key: string]: number };
  };
  type: string;
  updatedAt: string;
};

export const PricingGridEditor = ({ itemType, onGridChange }: PricingGridEditorProps) => {
  const [pricingGrid, setPricingGrid] = useState<GridData | null>(null);
  const [csvData, setCsvData] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<GridFormat>('traditional');
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showMatrixEditor, setShowMatrixEditor] = useState(false);
  const { toast } = useToast();

  // Enhanced CSV templates for both formats
  const getCSVTemplate = (format: GridFormat = selectedFormat) => {
    if (format === 'traditional') {
      // Traditional matrix format - like the user's example
      switch (itemType) {
        case "blind_fabric":
          return `,60,80,100,120,140,160,180,200
60,25.00,24.80,24.60,24.40,24.20,24.00,23.80,23.60
80,24.80,24.60,24.40,24.20,24.00,23.80,23.60,23.40
100,24.60,24.40,24.20,24.00,23.80,23.60,23.40,23.20
120,24.40,24.20,24.00,23.80,23.60,23.40,23.20,23.00
140,24.20,24.00,23.80,23.60,23.40,23.20,23.00,22.80
160,24.00,23.80,23.60,23.40,23.20,23.00,22.80,22.60
180,23.80,23.60,23.40,23.20,23.00,22.80,22.60,22.40
200,23.60,23.40,23.20,23.00,22.80,22.60,22.40,22.20`;
        
        case "track":
        case "rod":
          return `,1.0,1.5,2.0,2.5,3.0,4.0,5.0,6.0
Standard,45.00,52.50,60.00,67.50,75.00,95.00,115.00,135.00
Premium,55.00,62.50,70.00,77.50,85.00,105.00,125.00,145.00
Deluxe,65.00,72.50,80.00,87.50,95.00,115.00,135.00,155.00`;

        default:
          return `,Option 1,Option 2,Option 3,Option 4
Size S,25.00,28.00,32.00,36.00
Size M,30.00,33.00,37.00,41.00
Size L,35.00,38.00,42.00,46.00
Size XL,40.00,43.00,47.00,51.00`;
      }
    } else {
      // Structured list format
      switch (itemType) {
        case "track":
        case "rod":
          return `Length (m),Type,Price ($)
1.0,Standard,45.00
1.5,Standard,52.50
2.0,Standard,60.00
2.5,Standard,67.50
3.0,Standard,75.00
1.0,Premium,55.00
1.5,Premium,62.50
2.0,Premium,70.00`;

        case "blind_fabric":
          return `Width (cm),Drop (cm),Price per sqm ($)
60,60,25.00
60,80,24.80
80,60,24.80
80,80,24.60
100,60,24.60
100,80,24.40`;

        default:
          return `Parameter,Value,Price ($)
Standard,Base,25.00
Premium,Enhanced,35.00
Luxury,Premium,45.00`;
      }
    }
  };

  const parseTraditionalMatrix = (csv: string): GridData => {
    const lines = csv.trim().split('\n');
    const headerLine = lines[0].split(',');
    const widthColumns = headerLine.slice(1).map(h => parseFloat(h.trim())).filter(n => !isNaN(n));
    
    const matrixData = {
      widthColumns,
      dropRows: [] as number[],
      prices: {} as { [key: string]: number }
    };

    const data: any[] = [];
    const headers = ['Drop/Width', ...widthColumns.map(w => w.toString())];

    lines.slice(1).forEach(line => {
      const values = line.split(',');
      const dropValue = parseFloat(values[0].trim());
      
      if (!isNaN(dropValue)) {
        matrixData.dropRows.push(dropValue);
        const row: any = { 'Drop/Width': dropValue };
        
        values.slice(1).forEach((priceStr, index) => {
          const price = parseFloat(priceStr.trim());
          if (!isNaN(price) && index < widthColumns.length) {
            const width = widthColumns[index];
            row[width.toString()] = price;
            matrixData.prices[`${width}-${dropValue}`] = price;
          }
        });
        
        data.push(row);
      }
    });

    return {
      format: 'traditional',
      headers,
      data,
      matrixData,
      type: itemType,
      updatedAt: new Date().toISOString()
    };
  };

  const parseStructuredList = (csv: string): GridData => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      return row;
    });

    return {
      format: 'structured',
      headers,
      data,
      type: itemType,
      updatedAt: new Date().toISOString()
    };
  };

  const parseCsvData = (csv: string) => {
    try {
      // Auto-detect format based on structure
      const lines = csv.trim().split('\n');
      const firstLine = lines[0].split(',');
      
      // If first cell is empty and rest are numbers, likely traditional matrix
      const isTraditionalMatrix = firstLine[0].trim() === '' && 
                                  firstLine.slice(1).some(cell => !isNaN(parseFloat(cell.trim())));

      const grid = isTraditionalMatrix ? 
        parseTraditionalMatrix(csv) : 
        parseStructuredList(csv);

      setPricingGrid(grid);
      onGridChange(grid);

      toast({
        title: "Success",
        description: `Pricing grid updated successfully (${grid.format} format)`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV data. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = (format: GridFormat = selectedFormat) => {
    try {
      const template = getCSVTemplate(format);
      const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${itemType}_pricing_template_${format}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Template Downloaded",
        description: `${itemType} ${format} template downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download Failed", 
        description: "Failed to download template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportCurrentGrid = (format: GridFormat) => {
    if (!pricingGrid) return;

    try {
      let csvContent = '';
      
      if (format === 'traditional' && pricingGrid.matrixData) {
        // Export as traditional matrix
        const { widthColumns, dropRows, prices } = pricingGrid.matrixData;
        csvContent = ',' + widthColumns.join(',') + '\n';
        
        dropRows.forEach(drop => {
          const row = [drop.toString()];
          widthColumns.forEach(width => {
            const price = prices[`${width}-${drop}`] || '';
            row.push(price.toString());
          });
          csvContent += row.join(',') + '\n';
        });
      } else {
        // Export as structured list
        csvContent = pricingGrid.headers.join(',') + '\n';
        pricingGrid.data.forEach(row => {
          const values = pricingGrid.headers.map(header => row[header] || '');
          csvContent += values.join(',') + '\n';
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${itemType}_pricing_grid_${format}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Grid Exported",
        description: `Pricing grid exported as ${format} format`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export grid. Please try again.",
        variant: "destructive",
      });
    }
  };

  const uploadCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          setCsvData(csv);
          parseCsvData(csv);
        } catch (error) {
          toast({
            title: "Upload Failed",
            description: "Failed to read the CSV file",
            variant: "destructive",
          });
        }
      };
      reader.onerror = () => {
        toast({
          title: "Upload Failed",
          description: "Failed to read the CSV file",
          variant: "destructive",
        });
      };
      reader.readAsText(file);
    }
  };

  const clearGrid = () => {
    setCsvData("");
    setPricingGrid(null);
    onGridChange({});
  };

  const MatrixEditor = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5" />
          Visual Matrix Editor
        </CardTitle>
        <CardDescription>
          Click cells to edit prices directly in the matrix
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pricingGrid?.matrixData && (
          <div className="overflow-auto max-h-96 border rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted sticky top-0">
                  <th className="border border-border p-2 text-left font-medium min-w-20">Drop\Width</th>
                  {pricingGrid.matrixData.widthColumns.map((width, index) => (
                    <th key={index} className="border border-border p-2 text-center font-medium min-w-20">
                      {width}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pricingGrid.matrixData.dropRows.map((drop, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-muted/50">
                    <td className="border border-border p-2 font-medium bg-muted/30">
                      {drop}
                    </td>
                    {pricingGrid.matrixData!.widthColumns.map((width, colIndex) => {
                      const key = `${width}-${drop}`;
                      const price = pricingGrid.matrixData!.prices[key];
                      const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                      
                      return (
                        <td key={colIndex} className="border border-border p-1">
                          {isEditing ? (
                            <div className="flex gap-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-8 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const newPrice = parseFloat(editValue);
                                    if (!isNaN(newPrice)) {
                                      const updatedGrid = { ...pricingGrid };
                                      updatedGrid.matrixData!.prices[key] = newPrice;
                                      
                                      // Update data array as well
                                      const dataRowIndex = updatedGrid.data.findIndex(row => 
                                        row['Drop/Width'] === drop
                                      );
                                      if (dataRowIndex >= 0) {
                                        updatedGrid.data[dataRowIndex][width.toString()] = newPrice;
                                      }
                                      
                                      setPricingGrid(updatedGrid);
                                      onGridChange(updatedGrid);
                                    }
                                    setEditingCell(null);
                                    setEditValue("");
                                  } else if (e.key === 'Escape') {
                                    setEditingCell(null);
                                    setEditValue("");
                                  }
                                }}
                              />
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setEditingCell(null);
                                  setEditValue("");
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="h-8 flex items-center justify-center cursor-pointer hover:bg-accent/50 rounded text-sm"
                              onClick={() => {
                                setEditingCell({ row: rowIndex, col: colIndex });
                                setEditValue(price?.toString() || '');
                              }}
                            >
                              {price ? `$${price.toFixed(2)}` : '-'}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Enhanced Pricing Grid Editor
          </CardTitle>
          <CardDescription>
            Choose between traditional matrix format or structured list format for your pricing data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format Selection */}
          <div className="flex items-center gap-4">
            <Label>Format:</Label>
            <Select value={selectedFormat} onValueChange={(value: GridFormat) => setSelectedFormat(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="traditional">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    Traditional Matrix
                  </div>
                </SelectItem>
                <SelectItem value="structured">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Structured List
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline">
              {selectedFormat === 'traditional' ? 'Industry Standard' : 'Easy to Edit'}
            </Badge>
          </div>

          {/* Template Download */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={() => downloadTemplate('traditional')}>
              <Download className="h-4 w-4 mr-2" />
              Matrix Template
            </Button>
            <Button variant="outline" onClick={() => downloadTemplate('structured')}>
              <Download className="h-4 w-4 mr-2" />
              List Template
            </Button>
            <Badge variant="secondary">{itemType} templates</Badge>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="csv-upload">Upload CSV File (Auto-detects format)</Label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={uploadCSV}
              className="mt-1"
            />
          </div>

          <Separator />

          {/* Manual CSV Input with Tabs */}
          <Tabs value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as GridFormat)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="traditional" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Matrix Format
              </TabsTrigger>
              <TabsTrigger value="structured" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List Format
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="traditional">
              <div>
                <Label htmlFor="csv-data-matrix">Paste Matrix CSV Data</Label>
                <Textarea
                  id="csv-data-matrix"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder={getCSVTemplate('traditional')}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Matrix format: First row = width columns, first column = drop rows, intersections = prices
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="structured">
              <div>
                <Label htmlFor="csv-data-list">Paste List CSV Data</Label>
                <Textarea
                  id="csv-data-list"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder={getCSVTemplate('structured')}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  List format: Each row represents one pricing rule with header columns
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => parseCsvData(csvData)} disabled={!csvData.trim()}>
              Parse CSV Data
            </Button>
            <Button variant="outline" onClick={clearGrid}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
            {pricingGrid && (
              <>
                <Button variant="outline" onClick={() => exportCurrentGrid('traditional')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Matrix
                </Button>
                <Button variant="outline" onClick={() => exportCurrentGrid('structured')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export List
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Matrix Editor for Traditional Format */}
      {pricingGrid?.format === 'traditional' && pricingGrid.matrixData && (
        <MatrixEditor />
      )}

      {/* Preview Grid */}
      {pricingGrid && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Pricing Grid Preview ({pricingGrid.format} format)
            </CardTitle>
            <CardDescription>
              {pricingGrid.format === 'traditional' 
                ? 'Traditional matrix format - industry standard layout'
                : 'Structured list format - easy to read and edit'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    {pricingGrid.headers?.map((header: string, index: number) => (
                      <th key={index} className="border border-border p-2 text-left font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pricingGrid.data?.map((row: any, index: number) => (
                    <tr key={index} className="hover:bg-muted/50">
                      {pricingGrid.headers?.map((header: string, cellIndex: number) => (
                        <td key={cellIndex} className="border border-border p-2">
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pricingGrid.format === 'traditional' && pricingGrid.matrixData && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-2 text-primary">Matrix Summary:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Width Range:</span> {Math.min(...pricingGrid.matrixData.widthColumns)} - {Math.max(...pricingGrid.matrixData.widthColumns)}
                  </div>
                  <div>
                    <span className="font-medium">Drop Range:</span> {Math.min(...pricingGrid.matrixData.dropRows)} - {Math.max(...pricingGrid.matrixData.dropRows)}
                  </div>
                  <div>
                    <span className="font-medium">Price Points:</span> {Object.keys(pricingGrid.matrixData.prices).length}
                  </div>
                  <div>
                    <span className="font-medium">Dimensions:</span> {pricingGrid.matrixData.widthColumns.length} × {pricingGrid.matrixData.dropRows.length}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Format Comparison & Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Traditional Matrix Format</h4>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Best for:</strong> Window coverings, fabric pricing, complex dimension-based pricing</p>
                <p><strong>Advantages:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Industry standard format</li>
                  <li>Visual grid layout familiar to users</li>
                  <li>Efficient for large price matrices</li>
                  <li>Easy to spot pricing patterns</li>
                </ul>
                <p><strong>Use when:</strong> You have products priced by width × drop dimensions</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Structured List Format</h4>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Best for:</strong> Simple pricing, hardware, accessories, motors</p>
                <p><strong>Advantages:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Easy to read and edit</li>
                  <li>Flexible column structure</li>
                  <li>Clear pricing rules</li>
                  <li>Better for complex descriptions</li>
                </ul>
                <p><strong>Use when:</strong> You have varied pricing criteria or simple item lists</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};