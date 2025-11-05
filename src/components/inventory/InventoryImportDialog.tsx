import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, CheckCircle2, AlertTriangle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";

interface ImportResultRow {
  row: number;
  status: "success" | "updated" | "error";
  message?: string;
  sku?: string;
  name?: string;
}

export const InventoryImportDialog: React.FC = () => {
  const { toast } = useToast();
  const canImportInventory = useHasPermission('import_inventory');
  const [open, setOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResultRow[]>([]);

  const allowedKeys = useMemo(
    () => [
      "name","description","sku","category","quantity","unit","cost_price","selling_price","unit_price","supplier","vendor_id","location","reorder_point","active",
      "fabric_width","fabric_composition","fabric_care_instructions","fabric_origin","pattern_repeat_horizontal","pattern_repeat_vertical","fabric_grade","fabric_collection","is_flame_retardant",
      "hardware_finish","hardware_material","hardware_dimensions","hardware_weight","hardware_mounting_type","hardware_load_capacity",
      "price_per_yard","price_per_meter","price_per_unit","markup_percentage",
      "width","height","depth","weight","color","finish","collection_name","image_url",
      "labor_hours","fullness_ratio","service_rate",
      "price_group","product_category"
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
      obj[key] = val;
    });
    return obj;
  };

  const upsertBySku = async (item: Record<string, any>): Promise<"updated" | "inserted"> => {
    // Attach user_id for inserts (RLS)
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id;
    if (!userId) throw new Error("Not authenticated");

    // Derive unit_price if missing
    if (item.unit_price == null) {
      if (typeof item.selling_price === "number") item.unit_price = item.selling_price;
      else if (typeof item.price_per_unit === "number") item.unit_price = item.price_per_unit;
      else if (typeof item.cost_price === "number") item.unit_price = item.cost_price;
      else item.unit_price = 0;
    }

    if (item.sku) {
      // Try update existing by SKU in current account scope
      const { data: updated, error: updErr } = await supabase
        .from("enhanced_inventory_items")
        .update(item)
        .eq("sku", item.sku)
        .select("id")
        .limit(1);
      if (updErr) throw new Error(updErr.message);
      if (updated && updated.length > 0) return "updated";
    }

    const insertPayload = { ...item, user_id: userId, active: item.active ?? true };
    const { error: insErr } = await supabase.from("enhanced_inventory_items").insert([insertPayload as any]);
    if (insErr) throw new Error(insErr.message);
    return "inserted";
  };

  const doImport = async () => {
    if (!csvFile) return;
    setImporting(true);
    setResults([]);
    try {
      const { headers, rows } = await parseCsv();
      const localResults: ImportResultRow[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.every((v) => !v)) continue;
        try {
          const item = toItem(headers, row);
          if (!item.name && !item.sku) throw new Error("Missing name or sku");
          const action = await upsertBySku(item);
          localResults.push({ row: i + 2, status: action === "updated" ? "updated" : "success", sku: item.sku, name: item.name });
        } catch (e: any) {
          localResults.push({ row: i + 2, status: "error", message: e?.message, sku: row[headers.indexOf("sku")], name: row[headers.indexOf("name")] });
        }
      }

      setResults(localResults);
      const ok = localResults.filter((r) => r.status !== "error").length;
      const errs = localResults.filter((r) => r.status === "error").length;
      toast({ title: "Import complete", description: `${ok} processed, ${errs} errors` });
    } catch (e: any) {
      toast({ title: "Import failed", description: e?.message || "Invalid CSV", variant: "destructive" });
    } finally {
      setImporting(false);
    }
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
            <Button disabled={!csvFile || importing} onClick={doImport} className="flex-1">
              {importing ? "Importing..." : "Start Import"}
            </Button>
            <Button type="button" variant="ghost" onClick={downloadSample}>
              <FileText className="mr-2 h-4 w-4" /> Sample CSV
            </Button>
          </div>

          {results.length > 0 && (
            <div className="max-h-56 overflow-auto rounded-md border">
              <div className="grid grid-cols-6 text-xs font-medium px-3 py-2 bg-muted">
                <span>Row</span><span>Status</span><span>SKU</span><span>Name</span><span className="col-span-2">Message</span>
              </div>
              {results.map((r, idx) => (
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
            <p className="text-sm font-medium mb-1">Column tips</p>
            <p className="text-xs text-muted-foreground">
              Whitelisted columns only are imported. Recommended minimal fields: name, sku, category, quantity, unit_price.<br/>
              <strong>Pricing Grid columns:</strong> price_group (grid code/ID), product_category (e.g., roller_blind)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
