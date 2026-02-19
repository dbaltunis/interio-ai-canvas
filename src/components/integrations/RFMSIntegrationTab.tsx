import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIntegrations } from "@/hooks/useIntegrations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { RFMSIntegration } from "@/types/integrations";
import { RefreshCw, Users, ArrowUpDown, FileText, Info } from "lucide-react";
import rfmsLogo from "@/assets/rfms-logo.svg";

interface RFMSIntegrationTabProps {
  integration?: RFMSIntegration | null;
}

function getFriendlyRFMSError(msg: string): string {
  if (!msg) return "Something went wrong. Please try again.";
  if (msg.includes("credentials") || msg.includes("Check your") || msg.includes("Contact") || msg.includes("Please")) return msg;
  if (msg.includes("non-2xx")) return "The RFMS service encountered an error. Please check your credentials and try again.";
  if (msg.includes("Failed to send") || msg.includes("FunctionsHttpError")) return "Could not reach the RFMS service. Please try again in a moment.";
  if (msg.includes("FunctionsRelayError")) return "The RFMS service is temporarily unavailable. Please try again in a few minutes.";
  return msg;
}

async function extractEdgeFunctionError(error: any, data: any): Promise<string> {
  if (data?.error) return data.error;
  if (error?.context?.responseBody) {
    try {
      const body = JSON.parse(error.context.responseBody);
      if (body?.error) return body.error;
    } catch {}
  }
  return error?.message || "Unknown error";
}

export const RFMSIntegrationTab = ({ integration }: RFMSIntegrationTabProps) => {
  const { createIntegration, updateIntegration } = useIntegrations();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    api_url: integration?.api_credentials?.api_url || 'https://api.rfms.online/v2',
    store_queue: integration?.api_credentials?.store_queue || '',
    api_key: integration?.api_credentials?.api_key || '',
    sync_customers: integration?.configuration?.sync_customers ?? true,
    sync_quotes: integration?.configuration?.sync_quotes ?? true,
    sync_measurements: integration?.configuration?.sync_measurements ?? true,
    sync_scheduling: integration?.configuration?.sync_scheduling ?? true,
    auto_update_job_status: integration?.configuration?.auto_update_job_status ?? false,
    measurement_units: integration?.configuration?.measurement_units || 'metric',
  });

  // Track saved values for hasChanges detection
  const savedValues = useMemo(() => ({
    api_url: integration?.api_credentials?.api_url || 'https://api.rfms.online/v2',
    store_queue: integration?.api_credentials?.store_queue || '',
    api_key: integration?.api_credentials?.api_key || '',
    sync_customers: integration?.configuration?.sync_customers ?? true,
    sync_quotes: integration?.configuration?.sync_quotes ?? true,
    sync_measurements: integration?.configuration?.sync_measurements ?? true,
    sync_scheduling: integration?.configuration?.sync_scheduling ?? true,
    auto_update_job_status: integration?.configuration?.auto_update_job_status ?? false,
    measurement_units: integration?.configuration?.measurement_units || 'metric',
  }), [integration]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(savedValues);
  }, [formData, savedValues]);

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [syncingAction, setSyncingAction] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const integrationData = {
        integration_type: 'rfms' as const,
        active: true,
        api_credentials: {
          api_url: formData.api_url,
          store_queue: formData.store_queue,
          api_key: formData.api_key,
        },
        configuration: {
          sync_customers: formData.sync_customers,
          sync_quotes: formData.sync_quotes,
          sync_measurements: formData.sync_measurements,
          sync_scheduling: formData.sync_scheduling,
          auto_update_job_status: formData.auto_update_job_status,
          measurement_units: formData.measurement_units as 'metric' | 'imperial',
        },
        last_sync: null,
      };

      if (integration) {
        await updateIntegration.mutateAsync({
          id: integration.id,
          updates: integrationData,
        });
      } else {
        await createIntegration.mutateAsync(integrationData);
      }

      toast({ title: "RFMS Configuration Saved", description: "Your credentials have been stored. Use 'Test Connection' to verify they work." });
    } catch (err: any) {
      toast({ title: "Could not save RFMS settings", description: err.message || "Check your credentials are correct and try again.", variant: "warning" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('rfms-test-connection', {
        body: {
          api_url: formData.api_url,
          store_queue: formData.store_queue,
          api_key: formData.api_key,
        },
      });

      if (error) {
        const realMessage = await extractEdgeFunctionError(error, data);
        throw new Error(realMessage);
      }

      if (data?.success) {
        toast({
          title: "Connection Successful",
          description: `Connected to RFMS API v2${data.customer_count != null ? ` (${data.customer_count} customers found)` : ''}`,
        });
      } else {
        throw new Error(data?.error || "Connection test returned no result");
      }
    } catch (err: any) {
      toast({
        title: "RFMS Connection Failed",
        description: getFriendlyRFMSError(err.message),
        variant: "warning",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncQuotes = async (direction: 'push' | 'pull' | 'both' = 'push') => {
    const actionKey = `quotes-${direction}`;
    setSyncingAction(actionKey);
    try {
      const { data, error } = await supabase.functions.invoke('rfms-sync-quotes', {
        body: { direction },
      });

      if (error) {
        const realMessage = await extractEdgeFunctionError(error, data);
        throw new Error(realMessage);
      }

      if (!data?.success) {
        throw new Error(data?.error || "Sync returned no results");
      }

      const parts = [];
      if (data.imported > 0) parts.push(`${data.imported} imported`);
      if (data.exported > 0) parts.push(`${data.exported} exported`);
      if (data.updated > 0) parts.push(`${data.updated} updated`);
      if (data.skipped > 0) parts.push(`${data.skipped} skipped`);
      if (data.errors?.length > 0) parts.push(`${data.errors.length} errors`);

      toast({
        title: "Quote Sync Complete",
        description: parts.length > 0 ? parts.join(', ') : 'No quotes found to sync',
      });
    } catch (err: any) {
      toast({
        title: "Quote Sync Failed",
        description: getFriendlyRFMSError(err.message),
        variant: "warning",
      });
    } finally {
      setSyncingAction(null);
    }
  };

  const handleSyncCustomers = async (direction: 'push' | 'pull' | 'both') => {
    const actionKey = `customers-${direction}`;
    setSyncingAction(actionKey);
    try {
      const { data, error } = await supabase.functions.invoke('rfms-sync-customers', {
        body: { direction },
      });

      if (error) {
        const realMessage = await extractEdgeFunctionError(error, data);
        throw new Error(realMessage);
      }

      if (!data?.success) {
        throw new Error(data?.error || "Sync returned no results");
      }

      const parts = [];
      if (data.imported > 0) parts.push(`${data.imported} imported`);
      if (data.exported > 0) parts.push(`${data.exported} exported`);
      if (data.updated > 0) parts.push(`${data.updated} updated`);
      if (data.skipped > 0) parts.push(`${data.skipped} skipped`);
      if (data.errors?.length > 0) parts.push(`${data.errors.length} warnings`);

      const errorDetails = data.errors?.length > 0 ? `\n${data.errors[0]}` : '';

      toast({
        title: "Customer Sync Complete",
        description: (parts.length > 0 ? parts.join(', ') : 'No changes needed') + errorDetails,
      });
    } catch (err: any) {
      toast({
        title: "Customer Sync Failed",
        description: getFriendlyRFMSError(err.message),
        variant: "warning",
      });
    } finally {
      setSyncingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={rfmsLogo} alt="RFMS" className="h-12 w-auto" />
          <div>
            <h3 className="text-lg font-medium">RFMS Integration</h3>
            <p className="text-sm text-muted-foreground">
              Connect to RFMS (Retail Floor Management System) for customer and order management
            </p>
          </div>
        </div>
        {integration && (
          (() => {
            if (!integration.active) return <Badge variant="secondary">Inactive</Badge>;
            if (integration.last_sync) return <Badge variant="success-solid">Connected</Badge>;
            return <Badge variant="outline">Configured</Badge>;
          })()
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
          <CardDescription>
            Enter your RFMS API credentials. You can find these in your RFMS account settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="api_url">API URL</Label>
              <Input
                id="api_url"
                placeholder="https://api.rfms.online/v2"
                value={formData.api_url}
                onChange={(e) => setFormData(prev => ({ ...prev, api_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store_queue">Store Queue Token</Label>
              <Input
                id="store_queue"
                placeholder="store-xxxxxxxxxxxx"
                value={formData.store_queue}
                onChange={(e) => setFormData(prev => ({ ...prev, store_queue: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                placeholder="Enter your RFMS API key"
                value={formData.api_key}
                onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={!formData.store_queue || !formData.api_key || isTesting}
            >
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.store_queue || !formData.api_key || isLoading || !hasChanges}
              variant={hasChanges ? "default" : "secondary"}
            >
              {isLoading ? "Saving..." : hasChanges ? "Save Configuration" : "Saved"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Settings</CardTitle>
          <CardDescription>
            Configure what data to synchronize with RFMS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sync Customers</Label>
              <p className="text-sm text-muted-foreground">
                Import customer records from RFMS into InterioApp
              </p>
            </div>
            <Switch
              checked={formData.sync_customers}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, sync_customers: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sync Quotes & Orders</Label>
              <p className="text-sm text-muted-foreground">
                Push quotes and orders to RFMS
              </p>
            </div>
            <Switch
              checked={formData.sync_quotes}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, sync_quotes: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between opacity-60">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label>Sync Measurements</Label>
                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Import measurement data from RFMS
              </p>
            </div>
            <Switch checked={false} disabled />
          </div>

          <div className="flex items-center justify-between opacity-60">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label>Sync Scheduling</Label>
                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Synchronize job schedules and appointments
              </p>
            </div>
            <Switch checked={false} disabled />
          </div>

          <div className="flex items-center justify-between opacity-60">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label>Auto Update Job Status</Label>
                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically update job status from RFMS
              </p>
            </div>
            <Switch checked={false} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="measurement_units">Measurement Units</Label>
            <Select
              value={formData.measurement_units}
              onValueChange={(value: 'metric' | 'imperial') =>
                setFormData(prev => ({ ...prev, measurement_units: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select measurement units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (cm, m)</SelectItem>
                <SelectItem value="imperial">Imperial (in, ft)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {integration?.active && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Sync</CardTitle>
            <CardDescription>
              Manually trigger data synchronization with RFMS
              {integration.last_sync && (
                <span className="block mt-1 text-xs">
                  Last synced: {new Date(integration.last_sync).toLocaleString()}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSyncCustomers('pull')}
                disabled={syncingAction !== null}
              >
                {syncingAction === 'customers-pull' ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
                Import Customers
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSyncCustomers('both')}
                disabled={syncingAction !== null}
              >
                {syncingAction === 'customers-both' ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Full Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSyncQuotes('push')}
                disabled={syncingAction !== null}
              >
                {syncingAction === 'quotes-push' ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                Export Quotes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSyncQuotes('pull')}
                disabled={syncingAction !== null}
              >
                {syncingAction === 'quotes-pull' ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <ArrowUpDown className="h-4 w-4 mr-2" />}
                Import Quotes
              </Button>
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Customer export to RFMS is not available — the RFMS v2 API does not support creating customers via API. 
                Please create customers directly in RFMS, then use "Import Customers" to sync them here.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
