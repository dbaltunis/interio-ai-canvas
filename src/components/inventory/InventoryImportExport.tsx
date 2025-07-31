import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedInventory, useCreateEnhancedInventoryItem, useUpdateEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { Download, Upload, FileSpreadsheet, Database, CheckCircle, XCircle, AlertTriangle, FileDown, FileUp } from "lucide-react";

export const InventoryImportExport = () => {
  const [importData, setImportData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<{
    valid: any[];
    invalid: { item: any; errors: string[]; row: number }[];
  } | null>(null);
  const [importMode, setImportMode] = useState<'create' | 'update' | 'upsert'>('create');
  
  const { data: inventory } = useEnhancedInventory();
  const createMutation = useCreateEnhancedInventoryItem();
  const updateMutation = useUpdateEnhancedInventoryItem();
  const { toast } = useToast();

  // Enhanced export with all fields
  const exportInventory = (format: 'basic' | 'complete' = 'complete') => {
    if (!inventory || inventory.length === 0) {
      toast({
        title: "No Data",
        description: "No inventory items to export",
        variant: "destructive",
      });
      return;
    }

    let headers: string[];
    let csvContent: string;

    if (format === 'basic') {
      headers = [
        "Name", "Description", "Category", "SKU", "Quantity", "Unit Price", 
        "Unit", "Reorder Point", "Supplier", "Location"
      ];
      
      csvContent = [
        headers.join(","),
        ...inventory.map(item => [
          `"${item.name || ""}"`,
          `"${item.description || ""}"`,
          `"${item.category || ""}"`,
          `"${item.sku || ""}"`,
          item.quantity || 0,
          item.unit_price || 0,
          `"${item.unit || ""}"`,
          item.reorder_point || 0,
          `"${item.supplier || ""}"`,
          `"${item.location || ""}"`
        ].join(","))
      ].join("\n");
    } else {
      // Complete export with all fields
      headers = [
        "Name", "Description", "Category", "SKU", "Quantity", "Unit Price", 
        "Unit", "Reorder Point", "Reorder Quantity", "Supplier", "Location",
        "Fabric Width", "Pattern Repeat Vertical", "Pattern Repeat Horizontal", 
        "Fullness Ratio", "Roll Direction", "Collection Name", "Color Code",
        "Pattern Direction", "Transparency Level", "Fire Rating", "Composition",
        "Care Instructions", "Hardware Type", "Material Finish", "Installation Type",
        "Weight Capacity", "Max Length", "Pricing Method", "Specifications",
        "Pricing Grid", "Images", "Compatibility Tags"
      ];

      csvContent = [
        headers.join(","),
        ...inventory.map(item => [
          `"${item.name || ""}"`,
          `"${item.description || ""}"`,
          `"${item.category || ""}"`,
          `"${item.sku || ""}"`,
          item.quantity || 0,
          item.unit_price || 0,
          `"${item.unit || ""}"`,
          item.reorder_point || 0,
          item.reorder_point || 0,
          `"${item.supplier || ""}"`,
          `"${item.location || ""}"`,
          item.fabric_width || "",
          item.pattern_repeat_vertical || "",
          item.pattern_repeat_horizontal || "",
          item.fullness_ratio || "",
          `"${item.fabric_collection || ""}"`,
          `"${item.color || ""}"`,
          `"${item.fabric_composition || ""}"`,
          `"${item.fabric_care_instructions || ""}"`,
          `"${item.hardware_finish || ""}"`,
          `"${item.hardware_material || ""}"`,
          `"${item.hardware_mounting_type || ""}"`,
          item.hardware_load_capacity || "",
          item.hardware_dimensions || "",
          item.markup_percentage || ""
        ].join(","))
      ].join("\n");
    }

    // Download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${format}_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${inventory.length} inventory items (${format} format)`,
    });
  };

  const downloadTemplate = (templateType: 'basic' | 'complete' = 'basic') => {
    let headers: string[];
    let sampleRow: string[];

    if (templateType === 'basic') {
      headers = ["Name", "Description", "Category", "SKU", "Quantity", "Unit Price", "Unit", "Reorder Point", "Supplier", "Location"];
      sampleRow = ["Sample Item", "Description of the item", "fabric", "SKU-001", "10", "25.00", "meters", "5", "Supplier Name", "Warehouse A"];
    } else {
      headers = [
        "Name", "Description", "Category", "SKU", "Quantity", "Unit Price", 
        "Unit", "Reorder Point", "Reorder Quantity", "Supplier", "Location",
        "Fabric Width", "Pattern Repeat Vertical", "Pattern Repeat Horizontal", 
        "Fullness Ratio", "Roll Direction", "Collection Name", "Color Code",
        "Pattern Direction", "Transparency Level", "Fire Rating", "Composition",
        "Care Instructions", "Hardware Type", "Material Finish", "Installation Type",
        "Weight Capacity", "Max Length", "Pricing Method", "Specifications",
        "Pricing Grid", "Images", "Compatibility Tags"
      ];
      sampleRow = [
        "Sample Fabric", "Beautiful curtain fabric", "curtain_fabric", "SF-001", "50", "25.00", 
        "meters", "10", "25", "Fabric Co", "Store A", "140", "32", "0", "2.5", 
        "horizontal", "Collection A", "RED001", "straight", "semi_transparent", "B1", 
        "100% Cotton", "Machine wash cold", "", "", "", "200", "300", "per_unit", 
        "{}", "{}", "image1.jpg;image2.jpg", "curtains;blinds"
      ];
    }

    const csvContent = [headers.join(","), sampleRow.map(val => `"${val}"`).join(",")].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_import_template_${templateType}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: `Downloaded ${templateType} import template`,
    });
  };

  const validateItem = (item: any, row: number): { errors: string[] } => {
    const errors: string[] = [];
    
    if (!item.name?.trim()) {
      errors.push("Name is required");
    }
    
    if (item.quantity !== undefined && (isNaN(item.quantity) || item.quantity < 0)) {
      errors.push("Quantity must be a non-negative number");
    }
    
    if (item.unit_price !== undefined && (isNaN(item.unit_price) || item.unit_price < 0)) {
      errors.push("Unit price must be a non-negative number");
    }
    
    if (item.reorder_point !== undefined && (isNaN(item.reorder_point) || item.reorder_point < 0)) {
      errors.push("Reorder point must be a non-negative number");
    }

    // Validate category if provided
    const validCategories = [
      'curtain_fabric', 'blind_fabric', 'track', 'rod', 'bracket', 
      'motor', 'accessory', 'hardware', 'other'
    ];
    if (item.category && !validCategories.includes(item.category)) {
      errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    return { errors };
  };

  const parseEnhancedCSVData = (csvData: string) => {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header and one data row");
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const validItems: any[] = [];
    const invalidItems: { item: any; errors: string[]; row: number }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length !== headers.length) {
        invalidItems.push({
          item: { row: i + 1 },
          errors: [`Row has ${values.length} values but expected ${headers.length}`],
          row: i + 1
        });
        continue;
      }

      const item: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        
        // Enhanced field mapping
        switch (header.toLowerCase().trim()) {
          case 'name':
            item.name = value;
            break;
          case 'description':
            item.description = value;
            break;
          case 'category':
            item.category = value;
            break;
          case 'sku':
            item.sku = value;
            break;
          case 'quantity':
            item.quantity = value ? parseInt(value) || 0 : 0;
            break;
          case 'unit price':
            item.unit_price = value ? parseFloat(value) || 0 : 0;
            break;
          case 'unit':
            item.unit = value || 'units';
            break;
          case 'reorder point':
            item.reorder_point = value ? parseInt(value) || 0 : 0;
            break;
          case 'reorder quantity':
            item.reorder_quantity = value ? parseInt(value) || 0 : 0;
            break;
          case 'supplier':
            item.supplier = value;
            break;
          case 'location':
            item.location = value;
            break;
          case 'fabric width':
            item.fabric_width = value ? parseFloat(value) : null;
            break;
          case 'pattern repeat vertical':
            item.pattern_repeat_vertical = value ? parseFloat(value) : null;
            break;
          case 'pattern repeat horizontal':
            item.pattern_repeat_horizontal = value ? parseFloat(value) : null;
            break;
          case 'fullness ratio':
            item.fullness_ratio = value ? parseFloat(value) : null;
            break;
          case 'roll direction':
            item.roll_direction = value;
            break;
          case 'collection name':
            item.collection_name = value;
            break;
          case 'color code':
            item.color_code = value;
            break;
          case 'pattern direction':
            item.pattern_direction = value;
            break;
          case 'transparency level':
            item.transparency_level = value;
            break;
          case 'fire rating':
            item.fire_rating = value;
            break;
          case 'composition':
            item.composition = value;
            break;
          case 'care instructions':
            item.care_instructions = value;
            break;
          case 'hardware type':
            item.hardware_type = value;
            break;
          case 'material finish':
            item.material_finish = value;
            break;
          case 'installation type':
            item.installation_type = value;
            break;
          case 'weight capacity':
            item.weight_capacity = value ? parseFloat(value) : null;
            break;
          case 'max length':
            item.max_length = value ? parseFloat(value) : null;
            break;
          case 'pricing method':
            item.pricing_method = value || 'per_unit';
            break;
          case 'specifications':
            try {
              item.specifications = value ? JSON.parse(value) : {};
            } catch {
              item.specifications = {};
            }
            break;
          case 'pricing grid':
            try {
              item.pricing_grid = value ? JSON.parse(value) : null;
            } catch {
              item.pricing_grid = null;
            }
            break;
          case 'images':
            item.images = value ? value.split(';').filter(img => img.trim()) : [];
            break;
          case 'compatibility tags':
            item.compatibility_tags = value ? value.split(';').filter(tag => tag.trim()) : [];
            break;
        }
      });

      // Validate the item
      const validation = validateItem(item, i + 1);
      
      if (validation.errors.length > 0) {
        invalidItems.push({
          item,
          errors: validation.errors,
          row: i + 1
        });
      } else if (item.name) {
        validItems.push(item);
      }
    }

    return { valid: validItems, invalid: invalidItems };
  };

  const validateImportData = () => {
    if (!importData.trim()) {
      toast({
        title: "No Data",
        description: "Please paste CSV data to validate",
        variant: "destructive",
      });
      return;
    }

    try {
      const results = parseEnhancedCSVData(importData);
      setValidationResults(results);
      
      toast({
        title: "Validation Complete",
        description: `${results.valid.length} valid items, ${results.invalid.length} invalid items`,
        variant: results.invalid.length > 0 ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "Failed to validate CSV data",
        variant: "destructive",
      });
    }
  };

  const importInventory = async () => {
    if (!importData.trim()) {
      toast({
        title: "No Data",
        description: "Please paste CSV data to import",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    
    try {
      const results = parseEnhancedCSVData(importData);
      const items = results.valid;
      
      if (items.length === 0) {
        throw new Error("No valid items to import");
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        try {
          if (importMode === 'create') {
            await createMutation.mutateAsync(item);
          } else if (importMode === 'update' && item.sku) {
            // Find existing item by SKU
            const existingItem = inventory?.find(inv => inv.sku === item.sku);
            if (existingItem) {
              await updateMutation.mutateAsync({ id: existingItem.id, ...item });
            } else {
              throw new Error(`Item with SKU ${item.sku} not found for update`);
            }
          } else if (importMode === 'upsert') {
            // Try to find existing item by SKU or name
            const existingItem = inventory?.find(inv => 
              (item.sku && inv.sku === item.sku) || 
              (inv.name === item.name)
            );
            
            if (existingItem) {
              await updateMutation.mutateAsync({ id: existingItem.id, ...item });
            } else {
              await createMutation.mutateAsync(item);
            }
          }
          
          successCount++;
        } catch (error) {
          errorCount++;
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          errors.push(`Row ${i + 1} (${item.name}): ${errorMsg}`);
          console.warn(`Failed to import item ${item.name}:`, error);
        }
        
        // Update progress
        setImportProgress(Math.round(((i + 1) / items.length) * 100));
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} items${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default",
      });

      if (successCount > 0) {
        setImportData("");
        setValidationResults(null);
      }
      
      if (errors.length > 0) {
        console.error("Import errors:", errors);
      }
      
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to parse CSV data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const uploadCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        setImportData(csv);
        setValidationResults(null);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Tabs defaultValue="import" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="import">
          <Upload className="h-4 w-4 mr-2" />
          Import Data
        </TabsTrigger>
        <TabsTrigger value="export">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </TabsTrigger>
      </TabsList>

      <TabsContent value="export" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Export Inventory
            </CardTitle>
            <CardDescription>
              Download your inventory data as CSV files for backup, analysis, or sharing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Current Inventory</div>
                <div className="text-sm text-muted-foreground">
                  {inventory?.length || 0} items ready for export
                </div>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
            </div>

            <div className="grid gap-3">
              <Button 
                onClick={() => exportInventory('basic')}
                disabled={!inventory || inventory.length === 0}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Basic Data (Essential fields only)
              </Button>
              
              <Button 
                onClick={() => exportInventory('complete')}
                disabled={!inventory || inventory.length === 0}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Complete Data (All fields)
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="import" className="space-y-6">
        {/* Import Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Import Mode
            </CardTitle>
            <CardDescription>
              Choose how to handle existing items during import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={importMode === 'create' ? 'default' : 'outline'}
                onClick={() => setImportMode('create')}
                className="text-sm"
              >
                Create Only
              </Button>
              <Button
                variant={importMode === 'update' ? 'default' : 'outline'}
                onClick={() => setImportMode('update')}
                className="text-sm"
              >
                Update Only
              </Button>
              <Button
                variant={importMode === 'upsert' ? 'default' : 'outline'}
                onClick={() => setImportMode('upsert')}
                className="text-sm"
              >
                Create or Update
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {importMode === 'create' && "Only create new items. Skip existing ones."}
              {importMode === 'update' && "Only update existing items by SKU. Skip new ones."}
              {importMode === 'upsert' && "Create new items or update existing ones by SKU/name."}
            </div>
          </CardContent>
        </Card>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Download Templates</CardTitle>
            <CardDescription>
              Download CSV templates to ensure correct data format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Button 
                onClick={() => downloadTemplate('basic')}
                variant="outline"
                className="w-full justify-start"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Basic Template
              </Button>
              <Button 
                onClick={() => downloadTemplate('complete')}
                variant="outline"
                className="w-full justify-start"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Complete Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Inventory Data
            </CardTitle>
            <CardDescription>
              Upload CSV file or paste data to bulk import inventory items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div>
              <Label htmlFor="csv-upload">Upload CSV File (Max 5MB)</Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={uploadCSV}
                className="mt-1"
              />
            </div>

            {/* Manual CSV Input */}
            <div>
              <Label htmlFor="csv-data">Or Paste CSV Data</Label>
              <Textarea
                id="csv-data"
                value={importData}
                onChange={(e) => {
                  setImportData(e.target.value);
                  setValidationResults(null);
                }}
                placeholder="Paste your CSV data here..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            {/* Progress */}
            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing items...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
              </div>
            )}

            {/* Validation Results */}
            {validationResults && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {validationResults.valid.length} Valid
                  </Badge>
                  {validationResults.invalid.length > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {validationResults.invalid.length} Invalid
                    </Badge>
                  )}
                </div>

                {validationResults.invalid.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">Validation Errors:</div>
                        {validationResults.invalid.slice(0, 5).map((invalid, idx) => (
                          <div key={idx} className="text-xs">
                            Row {invalid.row}: {invalid.errors.join(', ')}
                          </div>
                        ))}
                        {validationResults.invalid.length > 5 && (
                          <div className="text-xs">
                            And {validationResults.invalid.length - 5} more errors...
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={validateImportData}
                disabled={!importData.trim() || isImporting}
                variant="outline"
                className="flex-1"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Validate Data
              </Button>
              
              <Button 
                onClick={importInventory}
                disabled={!importData.trim() || isImporting || (validationResults && validationResults.valid.length === 0)}
                className="flex-1"
              >
                {isImporting ? (
                  <>
                    <Database className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setImportData("");
                  setValidationResults(null);
                }}
                disabled={isImporting}
              >
                Clear
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div><strong>Supported formats:</strong> CSV with comma separation</div>
              <div><strong>Required fields:</strong> Name (minimum)</div>
              <div><strong>File size limit:</strong> 5MB maximum</div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};