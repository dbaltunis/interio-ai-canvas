import { useState } from "react";
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
import { RefreshCw, Users, ArrowUpDown, FileText } from "lucide-react";

interface RFMSIntegrationTabProps {
  integration?: RFMSIntegration | null;
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

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

      toast({ title: "Saved", description: "RFMS configuration saved successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save", variant: "destructive" });
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

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Connection Successful",
          description: `Connected to RFMS API v2${data.customer_count != null ? ` (${data.customer_count} customers found)` : ''}`,
        });
      } else {
        throw new Error(data?.error || "Connection test failed");
      }
    } catch (err: any) {
      toast({
        title: "Connection Failed",
        description: err.message || "Could not connect to RFMS",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncQuotes = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('rfms-sync-quotes', {
        body: { direction: 'push' },
      });

      if (error) throw error;

      const parts = [];
      if (data.exported > 0) parts.push(`${data.exported} exported`);
      if (data.updated > 0) parts.push(`${data.updated} updated`);

      toast({
        title: "Quote Sync Complete",
        description: parts.length > 0 ? parts.join(', ') : 'No quotes to sync',
      });
    } catch (err: any) {
      toast({
        title: "Quote Sync Failed",
        description: err.message || "Quote sync failed",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncCustomers = async (direction: 'push' | 'pull' | 'both') => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('rfms-sync-customers', {
        body: { direction },
      });

      if (error) throw error;

      const parts = [];
      if (data.imported > 0) parts.push(`${data.imported} imported`);
      if (data.exported > 0) parts.push(`${data.exported} exported`);
      if (data.updated > 0) parts.push(`${data.updated} updated`);

      toast({
        title: "Sync Complete",
        description: parts.length > 0 ? parts.join(', ') : 'No changes needed',
      });
    } catch (err: any) {
      toast({
        title: "Sync Failed",
        description: err.message || "Customer sync failed",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">RFMS Integration</h3>
          <p className="text-sm text-muted-foreground">
            Connect to RFMS (Retail Floor Management System) for customer and order management
          </p>
        </div>
        {integration && (
          <Badge variant={integration.active ? "default" : "secondary"}>
            {integration.active ? "Active" : "Inactive"}
          </Badge>
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
              disabled={!formData.store_queue || !formData.api_key || isLoading}
            >
              {isLoading ? "Saving..." : "Save Configuration"}
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
                Synchronize customer records between InterioApp and RFMS
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

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sync Measurements</Label>
              <p className="text-sm text-muted-foreground">
                Import measurement data from RFMS
              </p>
            </div>
            <Switch
              checked={formData.sync_measurements}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, sync_measurements: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sync Scheduling</Label>
              <p className="text-sm text-muted-foreground">
                Synchronize job schedules and appointments
              </p>
            </div>
            <Switch
              checked={formData.sync_scheduling}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, sync_scheduling: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Update Job Status</Label>
              <p className="text-sm text-muted-foreground">
                Automatically update job status from RFMS
              </p>
            </div>
            <Switch
              checked={formData.auto_update_job_status}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, auto_update_job_status: checked }))
              }
            />
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
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSyncCustomers('pull')}
                disabled={isSyncing}
              >
                <Users className="h-4 w-4 mr-2" />
                Import Customers
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSyncCustomers('push')}
                disabled={isSyncing}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Export Customers
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSyncCustomers('both')}
                disabled={isSyncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                Full Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncQuotes}
                disabled={isSyncing}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export Quotes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
