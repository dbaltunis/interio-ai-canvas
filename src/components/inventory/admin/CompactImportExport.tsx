import { useState } from "react";
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
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Printer,
  ChevronDown,
  FileText,
  Table2
} from "lucide-react";
import { InventoryImportExport } from "../InventoryImportExport";

interface CompactImportExportProps {
  onExportCSV: () => void;
  onPrint: () => void;
}

export const CompactImportExport = ({ onExportCSV, onPrint }: CompactImportExportProps) => {
  const [showImportDialog, setShowImportDialog] = useState(false);

  const exportToExcel = () => {
    // For now, use CSV export (Excel can open CSV files)
    onExportCSV();
  };

  const downloadTemplate = () => {
    const headers = [
      'sku', 'name', 'category', 'subcategory', 'supplier',
      'quantity', 'unit', 'cost_price', 'selling_price', 'location'
    ];
    
    const csvContent = headers.join(',') + '\n' + 
      'SAMPLE-001,Sample Product,fabric,curtain_fabric,Sample Supplier,100,m,10.00,15.00,Warehouse A\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'inventory_import_template.csv';
    link.click();
  };

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

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Inventory
            </DialogTitle>
            <DialogDescription>
              Upload a CSV file to bulk import inventory items
            </DialogDescription>
          </DialogHeader>
          <InventoryImportExport />
        </DialogContent>
      </Dialog>
    </>
  );
};
