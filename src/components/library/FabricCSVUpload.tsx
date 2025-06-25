
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, AlertCircle, CheckCircle, FileText, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFabricImport } from "@/hooks/useFabricImport";

interface CSVRow {
  vendor_name: string;
  collection_name: string;
  fabric_name: string;
  fabric_code: string;
  width_cm: string;
  pattern_repeat_v_cm: string;
  pattern_repeat_h_cm: string;
  weight: string;
  type: string;
  color: string;
  pattern: string;
  confidential_price: string;
  retail_price: string;
  cost_per_unit: string;
  initial_quantity: string;
  reorder_point: string;
  supplier_sku: string;
  lead_time_days: string;
  description: string;
  tags: string;
  image_filename: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export const FabricCSVUpload = ({ onClose }: { onClose: () => void }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const { toast } = useToast();
  const fabricImport = useFabricImport();

  const downloadTemplate = () => {
    const template = [
      [
        "vendor_name", "collection_name", "fabric_name", "fabric_code", "width_cm", 
        "pattern_repeat_v_cm", "pattern_repeat_h_cm", "weight", "type", "color", 
        "pattern", "confidential_price", "retail_price", "cost_per_unit", 
        "initial_quantity", "reorder_point", "supplier_sku", "lead_time_days", 
        "description", "tags", "image_filename"
      ],
      [
        "Fibre Naturelle", "Classic Collection", "Velvet Royal", "VR-001", "140", 
        "32", "28", "350gsm", "Velvet", "Navy Blue", "Solid", "25.50", "45.00", 
        "22.00", "50", "10", "FN-VR-001", "14", "Luxurious velvet fabric perfect for curtains", 
        "luxury,velvet,curtains", "velvet-royal-navy.jpg"
      ]
    ];

    const csvContent = template.map(row => 
      row.map(cell => `"${cell}"`).join(",")
    ).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fabric_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCsv = (content: string): CSVRow[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row as CSVRow;
    });
  };

  const validateData = (data: CSVRow[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const requiredFields = ['vendor_name', 'fabric_name', 'fabric_code'];

    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field as keyof CSVRow]) {
          errors.push({
            row: index + 2,
            field,
            message: `${field} is required`
          });
        }
      });

      // Validate numeric fields
      const numericFields = ['width_cm', 'pattern_repeat_v_cm', 'pattern_repeat_h_cm', 'confidential_price', 'retail_price'];
      numericFields.forEach(field => {
        const value = row[field as keyof CSVRow];
        if (value && isNaN(Number(value))) {
          errors.push({
            row: index + 2,
            field,
            message: `${field} must be a valid number`
          });
        }
      });
    });

    return errors;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const data = parseCsv(content);
        setCsvData(data);
        const errors = validateData(data);
        setValidationErrors(errors);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImageFiles(files);
    }
  };

  const processUpload = async () => {
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Errors",
        description: "Please fix all validation errors before proceeding.",
        variant: "destructive",
      });
      return;
    }

    try {
      await fabricImport.mutateAsync({
        csvData,
        imageFiles: imageFiles || undefined
      });
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Fabric CSV Import
              </CardTitle>
              <CardDescription>
                Upload a CSV file with fabric data including vendors, collections, and inventory details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Badge variant="secondary">CSV Format Required</Badge>
              </div>

              <div>
                <Label htmlFor="csv-upload">CSV File</Label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>

              {csvData.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Loaded {csvData.length} fabric records from CSV file.
                  </AlertDescription>
                </Alert>
              )}

              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Found {validationErrors.length} validation errors. Please review and fix them.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {csvData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  Review the fabric data before importing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Collection</TableHead>
                        <TableHead>Fabric Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Retail Price</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.slice(0, 10).map((row, index) => {
                        const rowErrors = validationErrors.filter(e => e.row === index + 2);
                        return (
                          <TableRow key={index}>
                            <TableCell>{row.vendor_name}</TableCell>
                            <TableCell>{row.collection_name}</TableCell>
                            <TableCell>{row.fabric_name}</TableCell>
                            <TableCell>{row.fabric_code}</TableCell>
                            <TableCell>{row.type}</TableCell>
                            <TableCell>${row.retail_price}</TableCell>
                            <TableCell>
                              {rowErrors.length > 0 ? (
                                <Badge variant="destructive">Errors</Badge>
                              ) : (
                                <Badge variant="secondary">Valid</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {csvData.length > 10 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Showing first 10 of {csvData.length} records
                    </p>
                  )}
                </div>

                {validationErrors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-destructive mb-2">Validation Errors:</h4>
                    <div className="space-y-1 max-h-32 overflow-auto">
                      {validationErrors.slice(0, 10).map((error, index) => (
                        <p key={index} className="text-sm text-destructive">
                          Row {error.row}: {error.field} - {error.message}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No data to preview. Please upload a CSV file first.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Fabric Images
              </CardTitle>
              <CardDescription>
                Upload images for your fabrics. Match filenames to the image_filename column in your CSV.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="images-upload">Fabric Images</Label>
                <Input
                  id="images-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="mt-1"
                />
              </div>

              {imageFiles && imageFiles.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Selected Images ({imageFiles.length})</h4>
                  <div className="grid grid-cols-4 gap-2 max-h-32 overflow-auto">
                    {Array.from(imageFiles).slice(0, 12).map((file, index) => (
                      <div key={index} className="text-xs p-2 bg-gray-50 rounded truncate">
                        {file.name}
                      </div>
                    ))}
                  </div>
                  {imageFiles.length > 12 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      And {imageFiles.length - 12} more images...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button variant="outline" onClick={onClose} disabled={fabricImport.isPending}>
          Cancel
        </Button>
        <Button 
          onClick={processUpload} 
          disabled={csvData.length === 0 || validationErrors.length > 0 || fabricImport.isPending}
          className="bg-brand-primary hover:bg-brand-secondary"
        >
          {fabricImport.isPending ? "Processing..." : `Import ${csvData.length} Fabrics`}
        </Button>
      </div>
    </div>
  );
};
