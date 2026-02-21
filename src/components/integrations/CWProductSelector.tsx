import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Link, ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CWProductLink {
  /** CW product range ID */
  cw_product_range_id: string;
  /** CW product type ID */
  cw_product_type_id: string;
  /** CW product material ID */
  cw_product_material_id: string;
  /** Human-readable names for display */
  cw_range_name?: string;
  cw_type_name?: string;
  cw_material_name?: string;
}

interface CWProductSelectorProps {
  value: CWProductLink | null;
  onChange: (link: CWProductLink | null) => void;
  /** Optional: show in compact mode (fewer labels, suitable for inline forms) */
  compact?: boolean;
}

/**
 * CWProductSelector
 *
 * Allows users to link an inventory item to a CW Trade Hub product.
 *
 * Step 1: Enter Range ID and Type ID (found in CW Trade Hub portal or catalog)
 * Step 2: Click "Verify" — calls the CW API to confirm the IDs are valid and loads available materials
 * Step 3: Select the matching material from the dropdown
 * Step 4: Save — the link is stored in the parent form
 *
 * The IDs are stored in inventory_item.specifications as:
 *   cw_product_range_id, cw_product_type_id, cw_product_material_id
 *   cw_range_name, cw_type_name, cw_material_name (for display)
 */
export const CWProductSelector = ({ value, onChange, compact = false }: CWProductSelectorProps) => {
  const { toast } = useToast();
  const [rangeId, setRangeId] = useState(value?.cw_product_range_id || "");
  const [typeId, setTypeId] = useState(value?.cw_product_type_id || "");
  const [selectedMaterialId, setSelectedMaterialId] = useState(value?.cw_product_material_id || "");
  const [verifyState, setVerifyState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "success"; rangeName: string; typeName: string; materials: Array<{ id: number; name: string }> }
  >({ status: "idle" });

  const isLinked = !!(value?.cw_product_range_id && value?.cw_product_material_id);
  const canVerify = rangeId.trim().length > 0 && typeId.trim().length > 0;

  const handleVerify = async () => {
    if (!canVerify) return;
    setVerifyState({ status: "loading" });
    try {
      const { data, error } = await supabase.functions.invoke("cw-catalog", {
        body: { apiToken: null }, // will be fetched from integration_settings server-side
        // Pass params via headers since we can't use GET query params with invoke
      });

      // Use direct URL with query params via fetch fallback
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cw-catalog?action=verify-ids&rangeId=${encodeURIComponent(rangeId)}&typeId=${encodeURIComponent(typeId)}`,
        {
          headers: {
            "Authorization": `Bearer ${session?.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      );

      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Verification failed");

      const result = json.data;
      if (!result?.materials || result.materials.length === 0) {
        throw new Error("No materials found for these IDs. Please check your Range ID and Type ID.");
      }

      setVerifyState({
        status: "success",
        rangeName: result.rangeName || `Range ${rangeId}`,
        typeName: result.typeName || `Type ${typeId}`,
        materials: result.materials,
      });

      // Auto-select if only one material
      if (result.materials.length === 1) {
        setSelectedMaterialId(String(result.materials[0].id));
      } else if (value?.cw_product_material_id) {
        setSelectedMaterialId(value.cw_product_material_id);
      }
    } catch (err: any) {
      setVerifyState({ status: "error", message: err.message });
    }
  };

  const handleSave = () => {
    if (verifyState.status !== "success") return;
    const material = verifyState.materials.find(m => String(m.id) === selectedMaterialId);
    if (!material) {
      toast({ title: "Select a material", description: "Please select a material from the list.", variant: "destructive" });
      return;
    }
    onChange({
      cw_product_range_id: rangeId.trim(),
      cw_product_type_id: typeId.trim(),
      cw_product_material_id: selectedMaterialId,
      cw_range_name: verifyState.rangeName,
      cw_type_name: verifyState.typeName,
      cw_material_name: material.name,
    });
    toast({ title: "CW Product Linked", description: `${verifyState.rangeName} → ${verifyState.typeName} → ${material.name}` });
  };

  const handleUnlink = () => {
    onChange(null);
    setRangeId("");
    setTypeId("");
    setSelectedMaterialId("");
    setVerifyState({ status: "idle" });
  };

  const handleReset = () => {
    setVerifyState({ status: "idle" });
    setSelectedMaterialId("");
  };

  // ── Already linked — show summary + unlink ──────────────────────────────────
  if (isLinked) {
    return (
      <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">CW Product Linked</span>
          </div>
          <Button size="sm" variant="ghost" className="h-6 text-xs text-muted-foreground" onClick={handleUnlink}>
            Unlink
          </Button>
        </div>
        <div className="text-xs text-green-800 dark:text-green-200 space-y-0.5">
          {value?.cw_range_name && <div><span className="opacity-70">Range:</span> {value.cw_range_name}</div>}
          {value?.cw_type_name && <div><span className="opacity-70">Type:</span> {value.cw_type_name}</div>}
          {value?.cw_material_name && <div><span className="opacity-70">Material:</span> {value.cw_material_name}</div>}
          <div className="font-mono opacity-60 pt-0.5">
            {value?.cw_product_range_id} / {value?.cw_product_type_id} / {value?.cw_product_material_id}
          </div>
        </div>
      </div>
    );
  }

  // ── Not linked — show form ───────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-muted text-xs text-muted-foreground">
          <ExternalLink className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            Find your <strong>Range ID</strong> and <strong>Type ID</strong> in the CW Trade Hub portal under
            Products → select a product range → note the IDs in the URL or catalog.
            Contact your CW Systems account manager if you need help.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Range ID</Label>
          <Input
            placeholder="e.g. 15"
            value={rangeId}
            onChange={e => { setRangeId(e.target.value); handleReset(); }}
            className="h-8 text-sm font-mono"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Type ID</Label>
          <Input
            placeholder="e.g. 21"
            value={typeId}
            onChange={e => { setTypeId(e.target.value); handleReset(); }}
            className="h-8 text-sm font-mono"
          />
        </div>
      </div>

      {verifyState.status === "idle" && (
        <Button
          size="sm"
          variant="outline"
          disabled={!canVerify}
          onClick={handleVerify}
          className="w-full"
        >
          <Link className="h-3.5 w-3.5 mr-1.5" />
          Verify IDs &amp; Load Materials
        </Button>
      )}

      {verifyState.status === "loading" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
          <Loader2 className="h-4 w-4 animate-spin" />
          Contacting CW Trade Hub...
        </div>
      )}

      {verifyState.status === "error" && (
        <div className="space-y-2">
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-xs flex items-start gap-1.5">
              <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              {verifyState.message}
            </AlertDescription>
          </Alert>
          <Button size="sm" variant="outline" onClick={handleVerify} className="h-7 text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Try Again
          </Button>
        </div>
      )}

      {verifyState.status === "success" && (
        <div className="space-y-2">
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-2.5">
            <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
              ✓ {verifyState.rangeName} — {verifyState.typeName}
            </p>
            <div className="space-y-1">
              <Label className="text-xs">Select Material</Label>
              <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Choose material..." />
                </SelectTrigger>
                <SelectContent>
                  {verifyState.materials.map(m => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={!selectedMaterialId}
              onClick={handleSave}
              className="flex-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Link to CW Product
            </Button>
            <Button size="sm" variant="ghost" onClick={handleReset} className="h-8">
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
