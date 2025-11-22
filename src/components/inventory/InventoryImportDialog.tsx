import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, CheckCircle2, AlertTriangle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";
import { useBatchInventoryImport, ImportResultRow } from "@/hooks/useBatchInventoryImport";
import { ImportProgressIndicator } from "./ImportProgressIndicator";

export const InventoryImportDialog: React.FC = () => {
  const { toast } = useToast();
  const canImportInventory = useHasPermission('import_inventory');
  const [open, setOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const { state, startImport, pause, resume, reset } = useBatchInventoryImport();

  const allowedKeys = useMemo(
    () => [
      "name","description","sku","category","quantity","unit","cost_price","selling_price","unit_price","supplier","vendor_id","location","reorder_point","active",
      "fabric_width","fabric_composition","fabric_care_instructions","fabric_origin","pattern_repeat_horizontal","pattern_repeat_vertical","fabric_grade","fabric_collection","is_flame_retardant",
      "hardware_finish","hardware_material","hardware_dimensions","hardware_weight","hardware_mounting_type","hardware_load_capacity",
      "price_per_yard","price_per_meter","price_per_unit","markup_percentage",
      "width","height","depth","weight","color","finish","collection_name","image_url",
      "labor_hours","fullness_ratio","service_rate",
      "price_group","product_category","tags"
    ],
    []
  );

  const numericKeys = useMemo(
    () => new Set([
      "quantity","cost_price","selling_price","unit_price","reorder_point",
      "fabric_width","pattern_repeat_horizontal","pattern_repeat_vertical",
      "hardware_weight","hardware_load_capacity",
      "price_per_yard","price_per_meter","price_per_unit","markup_percentage",
      "width","height","depth","weight","labor_hours","fullness_ratio","service_rate"
    ]),
    []
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast({ title: "Invalid file", description: "Please select a .csv file", variant: "destructive" });
      return;
    }
    setCsvFile(file);
  };

  const parseCsv = async (): Promise<{ headers: string[]; rows: string[][] }> => {
    if (!csvFile) throw new Error("No CSV selected");
    const text = await csvFile.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
    const rows = lines.slice(1).map((line) => line.split(",").map((v) => v.replace(/"/g, "").trim()));
    return { headers, rows };
  };

  const toItem = (headers: string[], row: string[]) => {
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      const key = h.trim();
      let val: any = row[i];
      if (val === undefined || val === "") return;
      if (!allowedKeys.includes(key)) return; // allowlist only
      if (numericKeys.has(key)) {
        const n = Number(val);
        if (!Number.isNaN(n)) val = n;
        else return;
      }
      if (key === "active") {
        val = String(val).toLowerCase() === "true";
      }
      if (key === "tags") {
        val = String(val).split(',').map(t => t.trim()).filter(t => t);
      }
      obj[key] = val;
    });
    return obj;
  };

  const doImport = async () => {
    if (!csvFile) return;
    
    try {
      const { headers, rows } = await parseCsv();
      const parsedItems = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.every((v) => !v)) continue;
        
        try {
          const item = toItem(headers, row);
          if (!item.name && !item.sku) throw new Error("Missing name or sku");
          
          parsedItems.push({
            data: item,
            rowNumber: i + 2,
          });
        } catch (e: any) {
          // Add error items to parsed list so they show in results
          parsedItems.push({
            data: { name: row[headers.indexOf("name")], sku: row[headers.indexOf("sku")] },
            rowNumber: i + 2,
          });
        }
      }

      const result = await startImport(parsedItems);
      
      const successCount = result.results.filter(r => r.status === 'success').length;
      const updatedCount = result.results.filter(r => r.status === 'updated').length;
      const errorCount = result.results.filter(r => r.status === 'error').length;
      
      toast({ 
        title: "Import complete", 
        description: `${successCount} inserted, ${updatedCount} updated, ${errorCount} errors` 
      });
    } catch (e: any) {
      toast({ 
        title: "Import failed", 
        description: e?.message || "Invalid CSV", 
        variant: "destructive" 
      });
    }
  };

  const handleCancel = () => {
    pause();
    reset();
  };

  const downloadSample = () => {
    const headers = [
      "name","sku","category","quantity","unit","cost_price","selling_price","unit_price","supplier","location","reorder_point","price_group","product_category"
    ];
    const sample = [
      ["Wave Track - 2.4m","WT-2400","hardware","10","pcs","35","59","59","DrapeCo","A1","2","",""],
      ["Linen Fabric - White","LINEN-WHITE","fabric","120","m","12","22","22","Textiles Ltd","Rack B","20","GRID001","roller_blind"],
      ["Sheer Fabric - Ivory","SHEER-IVY","fabric","85","m","","","","Fabrics Inc","Rack C","15","GRID002","roller_blind"],
    ];
    const csv = [headers.join(","), ...sample.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "inventory_import_sample.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={!canImportInventory}>
          {!canImportInventory && <Shield className="mr-2 h-4 w-4" />}
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Inventory from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="inventory-csv">Upload CSV File</Label>
            <Input id="inventory-csv" type="file" accept=".csv" onChange={handleFile} className="mt-1" />
            {csvFile && (
              <p className="text-xs text-muted-foreground mt-1">Selected: {csvFile.name}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              disabled={!csvFile || state.status === 'processing' || state.status === 'preparing'} 
              onClick={doImport} 
              className="flex-1"
            >
              {state.status === 'preparing' ? "Preparing..." : state.status === 'processing' ? "Processing..." : "Start Import"}
            </Button>
            <Button type="button" variant="ghost" onClick={downloadSample}>
              <FileText className="mr-2 h-4 w-4" /> Sample CSV
            </Button>
          </div>

          {(state.status === 'preparing' || state.status === 'processing' || state.status === 'paused') && (
            <ImportProgressIndicator
              current={state.progress.current}
              total={state.progress.total}
              percentage={state.progress.percentage}
              successCount={state.progress.successCount}
              updatedCount={state.progress.updatedCount}
              errorCount={state.progress.errorCount}
              status={state.status}
              canPause={state.canPause}
              canResume={state.canResume}
              onPause={pause}
              onResume={resume}
              onCancel={handleCancel}
            />
          )}

          {state.results.length > 0 && (
            <div className="max-h-56 overflow-auto rounded-md border">
              <div className="grid grid-cols-6 text-xs font-medium px-3 py-2 bg-muted">
                <span>Row</span><span>Status</span><span>SKU</span><span>Name</span><span className="col-span-2">Message</span>
              </div>
              {state.results.map((r, idx) => (
                <div key={idx} className="grid grid-cols-6 text-xs px-3 py-2 border-t">
                  <span>{r.row}</span>
                  <span className={r.status === 'error' ? 'text-destructive' : r.status === 'updated' ? 'text-yellow-600' : 'text-green-600'}>
                    {r.status === 'success' && <span className="inline-flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/>Inserted</span>}
                    {r.status === 'updated' && <span className="inline-flex items-center text-yellow-700"><AlertTriangle className="w-3 h-3 mr-1"/>Updated</span>}
                    {r.status === 'error' && <span className="inline-flex items-center text-destructive"><AlertTriangle className="w-3 h-3 mr-1"/>Error</span>}
                  </span>
                  <span>{r.sku || '-'}</span>
                  <span className="truncate">{r.name || '-'}</span>
                  <span className="col-span-2 truncate" title={r.message}>{r.message || '-'}</span>
                </div>
              ))}
            </div>
          )}

          <Separator />
          
          <div>
            <p className="text-sm font-medium mb-2">CSV Format Example - Copy this structure:</p>
            <div className="bg-muted p-3 rounded-md overflow-x-auto">
              <table className="text-xs font-mono w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-1">name</th>
                    <th className="text-left p-1">sku</th>
                    <th className="text-left p-1">category</th>
                    <th className="text-left p-1">quantity</th>
                    <th className="text-left p-1">unit_price</th>
                    <th className="text-left p-1 text-primary font-bold">price_group</th>
                    <th className="text-left p-1 text-primary font-bold">product_category</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="p-1">Fabric White</td>
                    <td className="p-1">FAB-001</td>
                    <td className="p-1">fabric</td>
                    <td className="p-1">100</td>
                    <td className="p-1">25</td>
                    <td className="p-1 text-primary font-bold">GRID001</td>
                    <td className="p-1 text-primary font-bold">roller_blind</td>
                  </tr>
                  <tr>
                    <td className="p-1">Track 2.4m</td>
                    <td className="p-1">TRK-2400</td>
                    <td className="p-1">hardware</td>
                    <td className="p-1">20</td>
                    <td className="p-1">65</td>
                    <td className="p-1 text-muted-foreground">(empty)</td>
                    <td className="p-1 text-muted-foreground">(empty)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Pricing Grid columns:</strong> Use <code className="bg-background px-1 rounded">price_group</code> for grid code and <code className="bg-background px-1 rounded">product_category</code> for category (e.g., roller_blind). Leave empty if no grid.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
