import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PricingGridData {
  widthRanges: string[];
  dropRanges: string[];
  prices: number[][];
}

interface PricingGridUploaderProps {
  onDataChange: (data: PricingGridData | null) => void;
  initialData?: PricingGridData | null;
}

export const PricingGridUploader = ({ onDataChange, initialData }: PricingGridUploaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [gridData, setGridData] = useState<PricingGridData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSampleData = () => {
    const sampleData: PricingGridData = {
      widthRanges: ["0-100cm", "101-150cm", "151-200cm", "201-250cm", "251-300cm"],
      dropRanges: ["0-150cm", "151-200cm", "201-250cm", "251-300cm", "301cm+"],
      prices: [
        [120, 140, 160, 180, 200],
        [150, 175, 200, 225, 250],
        [180, 210, 240, 270, 300],
        [210, 245, 280, 315, 350],
        [240, 280, 320, 360, 400]
      ]
    };
    return sampleData;
  };

  const downloadSampleGrid = () => {
    const sampleData = generateSampleData();
    
    // Create CSV content
    let csvContent = "Drop/Width," + sampleData.widthRanges.join(",") + "\n";
    
    sampleData.dropRanges.forEach((dropRange, dropIndex) => {
      const row = [dropRange, ...sampleData.prices[dropIndex]];
      csvContent += row.join(",") + "\n";
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pricing_grid_sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Sample Downloaded",
      description: "Sample pricing grid CSV has been downloaded"
    });
  };

  const parseCSVFile = (file: File): Promise<PricingGridData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error("CSV must have at least a header row and one data row");
          }

          // Parse header row (width ranges)
          const headerCells = lines[0].split(',');
          const widthRanges = headerCells.slice(1).map(cell => cell.trim());

          // Parse data rows
          const dropRanges: string[] = [];
          const prices: number[][] = [];

          for (let i = 1; i < lines.length; i++) {
            const cells = lines[i].split(',');
            if (cells.length !== headerCells.length) {
              throw new Error(`Row ${i + 1} has incorrect number of columns`);
            }

            const dropRange = cells[0].trim();
            const rowPrices = cells.slice(1).map((cell, index) => {
              const price = parseFloat(cell.trim());
              if (isNaN(price)) {
                throw new Error(`Invalid price at row ${i + 1}, column ${index + 2}: "${cell}"`);
              }
              return price;
            });

            dropRanges.push(dropRange);
            prices.push(rowPrices);
          }

          resolve({ widthRanges, dropRanges, prices });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError("Please upload a CSV file");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await parseCSVFile(file);
      setGridData(data);
      onDataChange(data);
      
      toast({
        title: "Grid Uploaded",
        description: "Pricing grid has been successfully uploaded and parsed"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to parse file";
      setError(errorMessage);
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearGrid = () => {
    setGridData(null);
    setError(null);
    onDataChange(null);
    
    toast({
      title: "Grid Cleared",
      description: "Pricing grid has been removed"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Pricing Grid Upload
        </CardTitle>
        <CardDescription>
          Upload a CSV file with width × drop matrix pricing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="pricing_grid_file">Upload CSV File</Label>
            <Input
              ref={fileInputRef}
              id="pricing_grid_file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2 items-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadSampleGrid}
              className="whitespace-nowrap"
            >
              <Download className="h-4 w-4 mr-2" />
              Sample
            </Button>
            {gridData && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearGrid}
                className="whitespace-nowrap"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>Processing file...</AlertDescription>
          </Alert>
        )}

        {gridData && !isLoading && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Pricing grid loaded: {gridData.dropRanges.length} drop ranges × {gridData.widthRanges.length} width ranges
            </AlertDescription>
          </Alert>
        )}

        {gridData && (
          <div className="border rounded-lg">
            <div className="p-3 bg-muted">
              <h4 className="font-medium">Pricing Grid Preview</h4>
              <p className="text-sm text-muted-foreground">
                {gridData.dropRanges.length} × {gridData.widthRanges.length} matrix
              </p>
            </div>
            <div className="max-h-64 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Drop/Width</TableHead>
                    {gridData.widthRanges.map((width, index) => (
                      <TableHead key={index} className="text-center min-w-20">
                        {width}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gridData.dropRanges.map((drop, dropIndex) => (
                    <TableRow key={dropIndex}>
                      <TableCell className="font-medium">{drop}</TableCell>
                      {gridData.prices[dropIndex].map((price, priceIndex) => (
                        <TableCell key={priceIndex} className="text-center">
                          ${price}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>CSV Format Requirements:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>First row: Drop/Width, Width Range 1, Width Range 2, etc.</li>
            <li>Data rows: Drop Range, Price 1, Price 2, etc.</li>
            <li>All prices must be numeric values</li>
            <li>Download the sample for the correct format</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};