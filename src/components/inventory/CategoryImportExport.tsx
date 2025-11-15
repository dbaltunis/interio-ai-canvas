import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedInventory, useCreateEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { Download, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { 
  parseFabricCSV, 
  parseHardwareCSV, 
  parseWallpaperCSV, 
  parseTrimmingsCSV,
  exportCategoryInventory 
} from "@/utils/categoryImportExport";

type CategoryType = 'fabrics' | 'hardware' | 'wallpaper' | 'trimmings';

interface CategoryImportExportProps {
  category: CategoryType;
  onImportComplete?: () => void;
}

const CATEGORY_CONFIG = {
  fabrics: {
    label: 'Fabrics',
    templateFile: '/templates/fabrics_import_template.csv',
    dbCategory: 'fabric',
    parser: parseFabricCSV,
    fieldCount: 20
  },
  hardware: {
    label: 'Hardware',
    templateFile: '/templates/hardware_import_template.csv',
    dbCategory: 'hardware',
    parser: parseHardwareCSV,
    fieldCount: 18
  },
  wallpaper: {
    label: 'Wallpaper',
    templateFile: '/templates/wallpaper_import_template.csv',
    dbCategory: 'wallcovering',
    parser: parseWallpaperCSV,
    fieldCount: 21
  },
  trimmings: {
    label: 'Trimmings',
    templateFile: '/templates/trimmings_import_template.csv',
    dbCategory: 'trimming',
    parser: parseTrimmingsCSV,
    fieldCount: 16
  }
};

export const CategoryImportExport = ({ category, onImportComplete }: CategoryImportExportProps) => {
  const [importData, setImportData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    valid: any[];
    invalid: { item: any; errors: string[]; row: number }[];
  } | null>(null);

  const { data: inventory } = useEnhancedInventory();
  const createMutation = useCreateEnhancedInventoryItem();
  const { toast } = useToast();
  
  const config = CATEGORY_CONFIG[category];

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = config.templateFile;
    link.download = `${category}_import_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Template Downloaded",
      description: `${config.label} import template with ${config.fieldCount} fields downloaded successfully`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      setImportData(csvData);
      validateImport(csvData);
    };
    reader.readAsText(file);
  };

  const validateImport = (csvData: string) => {
    try {
      const results = config.parser(csvData);
      setValidationResults(results);
      
      if (results.valid.length > 0) {
        toast({
          title: "Validation Complete",
          description: `${results.valid.length} valid items, ${results.invalid.length} errors`,
        });
      } else {
        toast({
          title: "Validation Failed",
          description: "No valid items found",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Failed to parse CSV",
        variant: "destructive",
      });
    }
  };

  const executeImport = async () => {
    if (!validationResults?.valid.length) return;

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const item of validationResults.valid) {
        try {
          await createMutation.mutateAsync({
            ...item,
            category: config.dbCategory,
            active: true,
          });
          successCount++;
        } catch (error) {
          console.error('Failed to import item:', item.name, error);
          errorCount++;
        }
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} ${config.label.toLowerCase()}${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      });

      setImportData("");
      setValidationResults(null);
      onImportComplete?.();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "An error occurred during import",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = () => {
    if (!inventory) return;
    
    const categoryItems = inventory.filter(item => item.category === config.dbCategory);
    
    if (categoryItems.length === 0) {
      toast({
        title: "No Data",
        description: `No ${config.label.toLowerCase()} to export`,
        variant: "destructive",
      });
      return;
    }

    const csvContent = exportCategoryInventory(categoryItems, category);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${category}_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${categoryItems.length} ${config.label.toLowerCase()}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          {config.label} Import / Export
        </CardTitle>
        <CardDescription>
          Import or export {config.label.toLowerCase()} using CSV files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Section */}
        <div className="space-y-2">
          <Label>Export {config.label}</Label>
          <Button 
            onClick={handleExport} 
            variant="outline" 
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Export {config.label} to CSV
          </Button>
        </div>

        {/* Import Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Import {config.label}</Label>
            <Button 
              onClick={downloadTemplate} 
              variant="outline" 
              className="w-full"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Download {config.label} Template ({config.fieldCount} fields)
            </Button>
          </div>

          <div className="space-y-2">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isImporting}
            />
            <p className="text-xs text-muted-foreground">
              Upload a CSV file with {config.label.toLowerCase()} data
            </p>
          </div>

          {/* Validation Results */}
          {validationResults && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>{validationResults.valid.length} valid items</span>
                  </div>
                  {validationResults.invalid.length > 0 && (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span>{validationResults.invalid.length} items with errors</span>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {validationResults.invalid.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {validationResults.invalid.map((item, idx) => (
                    <Alert key={idx} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">Row {item.row}: {item.item.name || 'Unknown'}</div>
                        <ul className="text-xs mt-1 space-y-1">
                          {item.errors.map((error, i) => (
                            <li key={i}>• {error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {validationResults.valid.length > 0 && (
                <Button 
                  onClick={executeImport} 
                  disabled={isImporting}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? 'Importing...' : `Import ${validationResults.valid.length} ${config.label}`}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
