import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedInventory, useCreateEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { Download, Upload, FileSpreadsheet, Database } from "lucide-react";

export const InventoryImportExport = () => {
  const [importData, setImportData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const { data: inventory } = useEnhancedInventory();
  const createMutation = useCreateEnhancedInventoryItem();
  const { toast } = useToast();

  const exportInventory = () => {
    if (!inventory || inventory.length === 0) {
      toast({
        title: "No Data",
        description: "No inventory items to export",
        variant: "destructive",
      });
      return;
    }

    // Create CSV headers
    const headers = [
      "Name", "Description", "Category", "SKU", "Quantity", "Unit Price", 
      "Unit", "Reorder Point", "Reorder Quantity", "Supplier", "Location",
      "Fabric Width", "Pattern Repeat", "Hardware Type", "Material Finish"
    ];

    // Convert inventory to CSV
    const csvContent = [
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
        item.reorder_quantity || 0,
        `"${item.supplier || ""}"`,
        `"${item.location || ""}"`,
        item.fabric_width || "",
        item.pattern_repeat_vertical || "",
        `"${item.hardware_type || ""}"`,
        `"${item.material_finish || ""}"`
      ].join(","))
    ].join("\n");

    // Download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${inventory.length} inventory items`,
    });
  };

  const parseCSVData = (csvData: string) => {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header and one data row");
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const items = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length !== headers.length) {
        console.warn(`Row ${i + 1} has ${values.length} values but expected ${headers.length}`);
        continue;
      }

      const item: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        
        // Map CSV headers to database fields
        switch (header.toLowerCase()) {
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
            item.quantity = parseInt(value) || 0;
            break;
          case 'unit price':
            item.unit_price = parseFloat(value) || 0;
            break;
          case 'unit':
            item.unit = value || 'units';
            break;
          case 'reorder point':
            item.reorder_point = parseInt(value) || 0;
            break;
          case 'reorder quantity':
            item.reorder_quantity = parseInt(value) || 0;
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
          case 'pattern repeat':
            item.pattern_repeat_vertical = value ? parseFloat(value) : null;
            break;
          case 'hardware type':
            item.hardware_type = value;
            break;
          case 'material finish':
            item.material_finish = value;
            break;
        }
      });

      if (item.name) { // Only add items with names
        items.push(item);
      }
    }

    return items;
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
    try {
      const items = parseCSVData(importData);
      
      let successCount = 0;
      let errorCount = 0;

      for (const item of items) {
        try {
          await createMutation.mutateAsync(item);
          successCount++;
        } catch (error) {
          errorCount++;
          console.warn(`Failed to import item ${item.name}:`, error);
        }
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} items${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      });

      if (successCount > 0) {
        setImportData("");
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to parse CSV data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const uploadCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        setImportData(csv);
      };
      reader.readAsText(file);
    }
  };

  const sampleCSV = `Name,Description,Category,SKU,Quantity,Unit Price,Unit,Reorder Point,Reorder Quantity,Supplier,Location,Fabric Width,Pattern Repeat,Hardware Type,Material Finish
"Sample Fabric","Beautiful curtain fabric","curtain_fabric","SF-001",50,25.00,"meters",10,25,"Fabric Co","Store A",140,0,"","",
"Sample Track","Professional track system","track","ST-001",20,75.00,"units",5,15,"Track Co","Store B","","","curtain_track","chrome"`;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Inventory
          </CardTitle>
          <CardDescription>
            Download your inventory data as a CSV file for backup or analysis
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

          <Button 
            onClick={exportInventory}
            disabled={!inventory || inventory.length === 0}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Inventory
          </CardTitle>
          <CardDescription>
            Upload CSV data to bulk import inventory items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {/* Manual CSV Input */}
          <div>
            <Label htmlFor="csv-data">Or Paste CSV Data</Label>
            <Textarea
              id="csv-data"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder={sampleCSV}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={importInventory}
              disabled={!importData.trim() || isImporting}
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
              onClick={() => setImportData("")}
            >
              Clear
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <strong>CSV Format:</strong> Name, Description, Category, SKU, Quantity, Unit Price, Unit, etc.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};