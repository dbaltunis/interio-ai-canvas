import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, Download, Trash2, Plus, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PricingGridEditorProps {
  itemType: string;
  onGridChange: (grid: any) => void;
}

export const PricingGridEditor = ({ itemType, onGridChange }: PricingGridEditorProps) => {
  const [pricingGrid, setPricingGrid] = useState<any>({});
  const [csvData, setCsvData] = useState("");
  const { toast } = useToast();

  // Sample CSV templates for different item types
  const getCSVTemplate = () => {
    switch (itemType) {
      case "track":
      case "rod":
        return `Length (m),Price ($)
1.0,45.00
1.5,52.50
2.0,60.00
2.5,67.50
3.0,75.00
4.0,95.00
5.0,115.00
6.0,135.00`;

      case "blind_fabric":
        return `Width (cm),Drop (cm),Price per sqm ($)
60,100,25.00
80,120,24.50
100,150,24.00
120,180,23.50
140,200,23.00
160,220,22.50
180,240,22.00
200,250,21.50`;

      case "bracket":
        return `Quantity,Unit Price ($),Discount (%)
1-4,12.50,0
5-9,12.00,4
10-19,11.50,8
20-49,11.00,12
50+,10.50,16`;

      case "motor":
        return `Motor Type,Base Price ($),Installation ($)
Standard RTS,285.00,75.00
Premium RTS,385.00,85.00
Hardwired,450.00,150.00
Battery,325.00,50.00`;

      default:
        return `Parameter,Value,Price ($)
Standard,Base,25.00
Premium,Enhanced,35.00
Luxury,Premium,45.00`;
    }
  };

  const parseCsvData = (csv: string) => {
    try {
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

      const grid = {
        headers,
        data,
        type: itemType,
        updatedAt: new Date().toISOString()
      };

      setPricingGrid(grid);
      onGridChange(grid);

      toast({
        title: "Success",
        description: "Pricing grid updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV data. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    const template = getCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${itemType}_pricing_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const uploadCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        setCsvData(csv);
        parseCsvData(csv);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            CSV Pricing Grid Editor
          </CardTitle>
          <CardDescription>
            Upload or paste CSV data to create dynamic pricing based on dimensions, quantities, or specifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Badge variant="secondary">{itemType} pricing template</Badge>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="csv-upload">Upload CSV File</Label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={uploadCSV}
              className="mt-1"
            />
          </div>

          <Separator />

          {/* Manual CSV Input */}
          <div>
            <Label htmlFor="csv-data">Or Paste CSV Data</Label>
            <Textarea
              id="csv-data"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder={getCSVTemplate()}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => parseCsvData(csvData)} disabled={!csvData.trim()}>
              Parse CSV Data
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setCsvData("");
                setPricingGrid({});
                onGridChange({});
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Parsed Grid */}
      {pricingGrid.data && pricingGrid.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Grid Preview</CardTitle>
            <CardDescription>
              Preview of your parsed pricing data
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

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Pricing Rules for {itemType}:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {itemType === "track" || itemType === "rod" ? (
                  <>
                    <li>• Prices automatically calculated based on length requirements</li>
                    <li>• Custom cuts available with 10% surcharge for non-standard lengths</li>
                    <li>• Volume discounts apply for orders over 10 units</li>
                  </>
                ) : itemType === "blind_fabric" ? (
                  <>
                    <li>• Pricing calculated per square meter based on width and drop</li>
                    <li>• Minimum order: 1 square meter</li>
                    <li>• Cut charges may apply for non-standard sizes</li>
                  </>
                ) : itemType === "bracket" ? (
                  <>
                    <li>• Quantity breaks automatically applied</li>
                    <li>• Discounts calculated at checkout</li>
                    <li>• Mixed quantities eligible for highest applicable discount</li>
                  </>
                ) : (
                  <>
                    <li>• Custom pricing based on specifications</li>
                    <li>• Installation costs calculated separately</li>
                    <li>• Warranty included in base price</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">For Hardware (Tracks/Rods):</h4>
              <p className="text-sm text-muted-foreground">
                Use length-based pricing. System automatically calculates price based on required length, 
                applying bulk discounts and cut charges as needed.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">For Blind Fabrics:</h4>
              <p className="text-sm text-muted-foreground">
                Use width × drop matrix pricing. Perfect for roller blinds, Romans, and verticals 
                where price depends on total square meterage.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">For Motors:</h4>
              <p className="text-sm text-muted-foreground">
                Different pricing for motor types, installation complexity, and optional accessories 
                like battery packs or wireless controls.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">For Brackets:</h4>
              <p className="text-sm text-muted-foreground">
                Quantity-based pricing with automatic discounts. Ideal for bulk orders where 
                unit price decreases with volume.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};