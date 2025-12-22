import { useState, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Printer,
  ChevronDown,
  FileText,
  Table2,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import { ImportProgressIndicator } from "../ImportProgressIndicator";
import { useEnhancedInventory, useCreateEnhancedInventoryItem, useUpdateEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CompactImportExportProps {
  onExportCSV: () => void;
  onPrint: () => void;
}

type ImportMode = 'create' | 'update' | 'upsert';
type ImportStatus = 'idle' | 'preparing' | 'processing' | 'paused' | 'completed' | 'error';

interface ImportState {
  status: ImportStatus;
  current: number;
  total: number;
  successCount: number;
  updatedCount: number;
  errorCount: number;
  errors: string[];
}

export const CompactImportExport = ({ onExportCSV, onPrint }: CompactImportExportProps) => {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importMode, setImportMode] = useState<ImportMode>('upsert');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importState, setImportState] = useState<ImportState>({
    status: 'idle',
    current: 0,
    total: 0,
    successCount: 0,
    updatedCount: 0,
    errorCount: 0,
    errors: []
  });
  const pauseSignal = useRef({ paused: false });
  const cancelSignal = useRef({ cancelled: false });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: inventory } = useEnhancedInventory();
  const createMutation = useCreateEnhancedInventoryItem();
  const updateMutation = useUpdateEnhancedInventoryItem();
  const queryClient = useQueryClient();

  const exportToExcel = () => {
    // For now, use CSV export (Excel can open CSV files)
    onExportCSV();
  };

  const downloadTemplate = () => {
    const headers = [
      'sku', 'name', 'category', 'subcategory', 'supplier',
      'quantity', 'unit', 'cost_price', 'selling_price', 'location', 'tags'
    ];
    
    const csvContent = headers.join(',') + '\n' + 
      'SAMPLE-001,Sample Product,fabric,curtain_fabric,Sample Supplier,100,m,10.00,15.00,Warehouse A,cotton;sheer\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'inventory_import_template.csv';
    link.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportState({
        status: 'idle',
        current: 0,
        total: 0,
        successCount: 0,
        updatedCount: 0,
        errorCount: 0,
        errors: []
      });
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header and one data row");
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    const items: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length !== headers.length) continue;

      const item: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        
        switch (header) {
          case 'name': item.name = value; break;
          case 'description': item.description = value; break;
          case 'category': item.category = value; break;
          case 'subcategory': item.subcategory = value; break;
          case 'sku': item.sku = value; break;
          case 'quantity': item.quantity = value ? parseInt(value) || 0 : 0; break;
          case 'unit price':
          case 'selling_price':
          case 'selling price': item.selling_price = value ? parseFloat(value) || 0 : 0; break;
          case 'cost_price':
          case 'cost price': item.cost_price = value ? parseFloat(value) || 0 : 0; break;
          case 'unit': item.unit = value || 'units'; break;
          case 'reorder_point':
          case 'reorder point': item.reorder_point = value ? parseInt(value) || 0 : 0; break;
          case 'supplier': item.supplier = value; break;
          case 'location': item.location = value; break;
          case 'fabric_width':
          case 'fabric width': item.fabric_width = value ? parseFloat(value) : null; break;
          case 'fullness_ratio':
          case 'fullness ratio': item.fullness_ratio = value ? parseFloat(value) : null; break;
          case 'tags':
            item.tags = value ? value.split(';').map((t: string) => t.trim().toLowerCase()).filter(Boolean) : [];
            break;
        }
      });

      if (item.name) {
        items.push(item);
      }
    }

    return items;
  };

  const startImport = async () => {
    if (!selectedFile) return;

    pauseSignal.current.paused = false;
    cancelSignal.current.cancelled = false;

    setImportState(prev => ({
      ...prev,
      status: 'preparing',
      current: 0,
      successCount: 0,
      updatedCount: 0,
      errorCount: 0,
      errors: []
    }));

    try {
      const text = await selectedFile.text();
      const items = parseCSV(text);

      if (items.length === 0) {
        throw new Error("No valid items found in CSV");
      }

      setImportState(prev => ({
        ...prev,
        status: 'processing',
        total: items.length
      }));

      let successCount = 0;
      let updatedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < items.length; i++) {
        // Check for cancel
        if (cancelSignal.current.cancelled) {
          setImportState(prev => ({
            ...prev,
            status: 'error',
            errors: [...prev.errors, 'Import cancelled by user']
          }));
          return;
        }

        // Check for pause
        while (pauseSignal.current.paused) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (cancelSignal.current.cancelled) {
            setImportState(prev => ({
              ...prev,
              status: 'error',
              errors: [...prev.errors, 'Import cancelled by user']
            }));
            return;
          }
        }

        const item = items[i];

        try {
          if (importMode === 'create') {
            await createMutation.mutateAsync(item);
            successCount++;
          } else if (importMode === 'update' && item.sku) {
            const existingItem = inventory?.find(inv => inv.sku === item.sku);
            if (existingItem) {
              await updateMutation.mutateAsync({ id: existingItem.id, ...item });
              updatedCount++;
            } else {
              errors.push(`Row ${i + 2}: SKU "${item.sku}" not found for update`);
              errorCount++;
            }
          } else if (importMode === 'upsert') {
            const existingItem = inventory?.find(inv => 
              (item.sku && inv.sku === item.sku) || 
              (inv.name === item.name)
            );
            
            if (existingItem) {
              await updateMutation.mutateAsync({ id: existingItem.id, ...item });
              updatedCount++;
            } else {
              await createMutation.mutateAsync(item);
              successCount++;
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Row ${i + 2}: ${errorMsg}`);
          errorCount++;
        }

        setImportState(prev => ({
          ...prev,
          current: i + 1,
          successCount,
          updatedCount,
          errorCount,
          errors
        }));
      }

      setImportState(prev => ({
        ...prev,
        status: 'completed'
      }));

      // Refresh inventory
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });

      toast.success(`Import completed: ${successCount} added, ${updatedCount} updated, ${errorCount} errors`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Import failed';
      setImportState(prev => ({
        ...prev,
        status: 'error',
        errors: [errorMsg]
      }));
      toast.error(errorMsg);
    }
  };

  const handlePause = () => {
    pauseSignal.current.paused = true;
    setImportState(prev => ({ ...prev, status: 'paused' }));
  };

  const handleResume = () => {
    pauseSignal.current.paused = false;
    setImportState(prev => ({ ...prev, status: 'processing' }));
  };

  const handleCancel = () => {
    cancelSignal.current.cancelled = true;
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportState({
      status: 'idle',
      current: 0,
      total: 0,
      successCount: 0,
      updatedCount: 0,
      errorCount: 0,
      errors: []
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const percentage = importState.total > 0 
    ? Math.round((importState.current / importState.total) * 100) 
    : 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onExportCSV}>
            <Table2 className="h-4 w-4 mr-2" />
            Export to CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportToExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onPrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadTemplate}>
            <FileText className="h-4 w-4 mr-2" />
            Download Template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Import Dialog with Good Progress Indicator */}
      <Dialog open={showImportDialog} onOpenChange={(open) => {
        if (!open && importState.status === 'processing') {
          // Don't close while processing
          return;
        }
        setShowImportDialog(open);
        if (!open) resetImport();
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Inventory
            </DialogTitle>
            <DialogDescription>
              Upload a CSV file to bulk import or update inventory items
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Import Mode Selection */}
            {importState.status === 'idle' && (
              <>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Import Mode</Label>
                  <RadioGroup 
                    value={importMode} 
                    onValueChange={(v) => setImportMode(v as ImportMode)}
                    className="space-y-2"
                  >
                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="upsert" id="upsert" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="upsert" className="font-medium cursor-pointer flex items-center gap-2">
                          Smart Import (Recommended)
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Updates existing items by SKU/name, creates new ones if not found
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="create" id="create" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="create" className="font-medium cursor-pointer">Add New Only</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Creates new items only (may create duplicates if items exist)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="update" id="update" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="update" className="font-medium cursor-pointer">Update Existing by SKU</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Only updates items with matching SKU (requires SKU column)
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select CSV File</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-muted-foreground
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90
                      file:cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                    </p>
                  )}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Large imports (2500+ items) are supported and will be processed in batches. You can pause or cancel at any time.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button 
                    onClick={startImport} 
                    disabled={!selectedFile}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Start Import
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={downloadTemplate}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                </div>
              </>
            )}

            {/* Progress Indicator */}
            {importState.status !== 'idle' && (
              <div className="space-y-4">
                <ImportProgressIndicator
                  current={importState.current}
                  total={importState.total}
                  percentage={percentage}
                  successCount={importState.successCount}
                  updatedCount={importState.updatedCount}
                  errorCount={importState.errorCount}
                  status={importState.status}
                  canPause={importState.status === 'processing'}
                  canResume={importState.status === 'paused'}
                  onPause={handlePause}
                  onResume={handleResume}
                  onCancel={handleCancel}
                />

                {/* Error List */}
                {importState.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importState.errors.slice(0, 5).map((error, i) => (
                      <Alert key={i} variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">{error}</AlertDescription>
                      </Alert>
                    ))}
                    {importState.errors.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{importState.errors.length - 5} more errors
                      </p>
                    )}
                  </div>
                )}

                {/* Completed Actions */}
                {(importState.status === 'completed' || importState.status === 'error') && (
                  <div className="flex gap-2">
                    <Button onClick={resetImport} className="flex-1">
                      Import Another File
                    </Button>
                    <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                      Close
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
