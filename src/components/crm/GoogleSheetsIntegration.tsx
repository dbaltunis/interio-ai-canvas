import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, Download, Upload, Link } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SheetLink {
  id: string;
  sheet_url: string;
  tab_name: string;
  column_map: Record<string, string>;
  is_two_way: boolean;
  created_at: string;
}

export const GoogleSheetsIntegration = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [tabName, setTabName] = useState("Sheet1");
  const [columnMapping, setColumnMapping] = useState(`{
  "Client": "name",
  "Status": "status",
  "Shopify Plugin Payments": "plugin_payments_eur",
  "Invoice payments": "invoice_payments_eur", 
  "Stripe subscriptions": "stripe_subs_eur",
  "Next step": "next_action",
  "Next date": "next_action_date",
  "Notes": "notes",
  "row_id": "row_id"
}`);
  const [isTwoWay, setIsTwoWay] = useState(false);
  const [showAppsScript, setShowAppsScript] = useState(false);

  const queryClient = useQueryClient();

  // Fetch existing sheet links
  const { data: sheetLinks = [] } = useQuery({
    queryKey: ["sheetLinks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_sheet_links")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as SheetLink[];
    },
  });

  const saveSheetLink = useMutation({
    mutationFn: async (linkData: { sheet_url: string; tab_name: string; column_map: Record<string, string>; is_two_way: boolean }) => {
      const { data, error } = await supabase
        .from("crm_sheet_links")
        .insert(linkData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sheetLinks"] });
      toast.success("Sheet link saved successfully");
      setIsOpen(false);
    },
  });

  const pullFromSheet = useMutation({
    mutationFn: async (linkId: string) => {
      const { data, error } = await supabase.functions.invoke("sheets-pull", {
        body: { linkId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crmV2Accounts"] });
      toast.success(`Pulled ${data.updatedRows || 0} rows from sheet`);
    },
    onError: (error) => {
      toast.error(`Pull failed: ${error.message}`);
    }
  });

  const updateTwoWaySync = useMutation({
    mutationFn: async ({ linkId, enabled }: { linkId: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .from("crm_sheet_links")
        .update({ is_two_way: enabled })
        .eq("id", linkId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sheetLinks"] });
      toast.success("Two-way sync updated");
    },
  });

  const handleSave = () => {
    try {
      const parsedMapping = JSON.parse(columnMapping);
      saveSheetLink.mutate({
        sheet_url: sheetUrl,
        tab_name: tabName,
        column_map: parsedMapping,
        is_two_way: isTwoWay
      });
    } catch (error) {
      toast.error("Invalid JSON in column mapping");
    }
  };

  const activeLink = sheetLinks[0]; // Use first link for now

  const generateAppsScript = (linkId: string) => {
    const webhookUrl = `${window.location.origin}/api/sheets/webhook?linkId=${linkId}`;
    return `/* Google Apps Script (Extensions → Apps Script) */
function onEdit(e){
  try{
    var s=e.source.getActiveSheet();
    var headers=s.getRange(1,1,1,s.getLastColumn()).getValues()[0];
    var r=e.range.getRow();
    if(r===1) return; // ignore header changes
    var vals=s.getRange(r,1,1,s.getLastColumn()).getValues()[0];
    var data={}; 
    for(var i=0;i<headers.length;i++){ 
      data[headers[i]]=vals[i]; 
    }
    var rowIdIndex=headers.indexOf('row_id');
    var rowId = rowIdIndex>=0 ? vals[rowIdIndex] : null;
    UrlFetchApp.fetch('${webhookUrl}',{
      method:'post',
      contentType:'application/json',
      payload: JSON.stringify({row_id: rowId, values: data})
    });
  }catch(err){ 
    Logger.log(err); 
  }
}`;
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Connect Google Sheet
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connect Google Sheet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sheetUrl">Sheet URL</Label>
              <Input
                id="sheetUrl"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>
            
            <div>
              <Label htmlFor="tabName">Tab Name</Label>
              <Input
                id="tabName"
                value={tabName}
                onChange={(e) => setTabName(e.target.value)}
                placeholder="Sheet1"
              />
            </div>
            
            <div>
              <Label htmlFor="columnMapping">Column Mapping (JSON)</Label>
              <Textarea
                id="columnMapping"
                value={columnMapping}
                onChange={(e) => setColumnMapping(e.target.value)}
                rows={10}
                className="font-mono text-sm"
                placeholder='{"Sheet Column": "field_name", ...}'
              />
              <p className="text-xs text-muted-foreground mt-1">
                Map sheet column names to database fields
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="twoWay"
                checked={isTwoWay}
                onCheckedChange={setIsTwoWay}
              />
              <Label htmlFor="twoWay">Enable two-way sync</Label>
            </div>
            
            <Button onClick={handleSave} disabled={saveSheetLink.isPending}>
              Save Connection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {activeLink && (
        <>
          <Button
            variant="outline"
            onClick={() => pullFromSheet.mutate(activeLink.id)}
            disabled={pullFromSheet.isPending}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Pull Latest
          </Button>
          
          <Button
            variant="outline"
            onClick={() => updateTwoWaySync.mutate({ 
              linkId: activeLink.id, 
              enabled: !activeLink.is_two_way 
            })}
            disabled={updateTwoWaySync.isPending}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {activeLink.is_two_way ? "Disable" : "Enable"} Push
          </Button>

          {activeLink.is_two_way && (
            <Button
              variant="outline"
              onClick={() => setShowAppsScript(!showAppsScript)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Apps Script
            </Button>
          )}
        </>
      )}

      {showAppsScript && activeLink && (
        <Dialog open={showAppsScript} onOpenChange={setShowAppsScript}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Google Apps Script Setup</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Copy this script to your Google Sheet (Extensions → Apps Script) to enable real-time updates:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-xs overflow-auto max-h-64">
                  {generateAppsScript(activeLink.id)}
                </pre>
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(generateAppsScript(activeLink.id));
                  toast.success("Script copied to clipboard");
                }}
              >
                Copy Script
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};