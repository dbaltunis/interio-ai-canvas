import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useIntegrations } from "@/hooks/useIntegrations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { NetSuiteIntegration } from "@/types/integrations";
import { RefreshCw, Users, ArrowUpDown, FileText, ShieldCheck } from "lucide-react";
import netsuiteLogo from "@/assets/netsuite-logo.svg";

interface NetSuiteIntegrationTabProps {
  integration?: NetSuiteIntegration | null;
}

export const NetSuiteIntegrationTab = ({ integration }: NetSuiteIntegrationTabProps) => {
  const { createIntegration, updateIntegration } = useIntegrations();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    account_id: integration?.api_credentials?.account_id || '',
    consumer_key: integration?.api_credentials?.consumer_key || '',
    consumer_secret: integration?.api_credentials?.consumer_secret || '',
    token_id: integration?.api_credentials?.token_id || '',
    token_secret: integration?.api_credentials?.token_secret || '',
    sync_customers: integration?.configuration?.sync_customers ?? true,
    sync_estimates: integration?.configuration?.sync_estimates ?? true,
    sync_sales_orders: integration?.configuration?.sync_sales_orders ?? true,
    sync_invoices: integration?.configuration?.sync_invoices ?? false,
    auto_create_customers: integration?.configuration?.auto_create_customers ?? true,
    default_subsidiary: integration?.configuration?.default_subsidiary || '',
    default_currency: integration?.configuration?.default_currency || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const integrationData = {
        integration_type: 'netsuite' as const,
        active: true,
        api_credentials: {
          account_id: formData.account_id,
          consumer_key: formData.consumer_key,
          consumer_secret: formData.consumer_secret,
          token_id: formData.token_id,
          token_secret: formData.token_secret,
        },
        configuration: {
          sync_customers: formData.sync_customers,
          sync_estimates: formData.sync_estimates,
          sync_sales_orders: formData.sync_sales_orders,
          sync_invoices: formData.sync_invoices,
          auto_create_customers: formData.auto_create_customers,
          default_subsidiary: formData.default_subsidiary || undefined,
          default_currency: formData.default_currency || undefined,
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

      toast({ title: "NetSuite Configuration Saved", description: "Your credentials have been stored. Use 'Test Connection' to verify they work." });
    } catch (err: any) {
      toast({ title: "Could not save NetSuite settings", description: err.message || "Check your credentials are correct and try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('netsuite-test-connection', {
        body: {
          account_id: formData.account_id,
          consumer_key: formData.consumer_key,
          consumer_secret: formData.consumer_secret,
          token_id: formData.token_id,
          token_secret: formData.token_secret,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Connection Successful",
          description: `Connected to NetSuite${data.customer_count != null ? ` (${data.customer_count} customers found)` : ''}`,
        });
      } else {
        throw new Error(data?.error || "Connection test failed");
      }
    } catch (err: any) {
      const msg = err.message || "";
      const isEdgeFnMissing = msg.includes("Failed to send") || msg.includes("FunctionsHttpError") || msg.includes("non-2xx");
      toast({
        title: "NetSuite Connection Failed",
        description: isEdgeFnMissing
          ? "The NetSuite backend service is not deployed yet. Please deploy the Edge Functions via Supabase CLI first."
          : `Could not connect to NetSuite. ${msg}. Check your Account ID and TBA credentials are correct.`,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncCustomers = async (direction: 'push' | 'pull' | 'both') => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('netsuite-sync-customers', {
        body: { direction },
      });

      if (error) throw error;

      const parts = [];
      if (data.imported > 0) parts.push(`${data.imported} imported`);
      if (data.exported > 0) parts.push(`${data.exported} exported`);
      if (data.updated > 0) parts.push(`${data.updated} updated`);

      toast({
        title: "Customer Sync Complete",
        description: parts.length > 0 ? parts.join(', ') : 'No changes needed',
      });
    } catch (err: any) {
      const msg = err.message || "";
      const isEdgeFnMissing = msg.includes("Failed to send") || msg.includes("FunctionsHttpError");
      toast({
        title: "Customer Sync Failed",
        description: isEdgeFnMissing
          ? "The NetSuite sync service is not deployed yet. Deploy Edge Functions via Supabase CLI first."
          : `Customer sync failed. ${msg}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncOrders = async (recordType: 'estimate' | 'salesOrder', direction: 'push' | 'pull') => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('netsuite-sync-orders', {
        body: { direction, recordType },
      });

      if (error) throw error;

      const label = recordType === 'salesOrder' ? 'Sales Order' : 'Estimate';
      const parts = [];
      if (data.exported > 0) parts.push(`${data.exported} exported`);
      if (data.updated > 0) parts.push(`${data.updated} updated`);

      toast({
        title: `${label} Sync Complete`,
        description: parts.length > 0 ? parts.join(', ') : `No ${label.toLowerCase()}s to sync`,
      });
    } catch (err: any) {
      const msg = err.message || "";
      const isEdgeFnMissing = msg.includes("Failed to send") || msg.includes("FunctionsHttpError");
      toast({
        title: "Order Sync Failed",
        description: isEdgeFnMissing
          ? "The NetSuite sync service is not deployed yet. Deploy Edge Functions via Supabase CLI first."
          : `Order sync failed. ${msg}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const hasCredentials = formData.account_id && formData.consumer_key && formData.token_id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={netsuiteLogo} alt="NetSuite" className="h-12 w-auto" />
          <div>
            <h3 className="text-lg font-medium">NetSuite Integration</h3>
            <p className="text-sm text-muted-foreground">
              Connect to Oracle NetSuite for customer, estimate, and sales order synchronization
            </p>
          </div>
        </div>
        {integration && (
          <Badge variant={integration.active ? "default" : "secondary"}>
            {integration.active ? "Active" : "Inactive"}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Token-Based Authentication (TBA)
          </CardTitle>
          <CardDescription>
            Enter your NetSuite TBA credentials. You can generate these in Setup &gt; Integration &gt; Manage Integrations in NetSuite.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ns_account_id">Account ID</Label>
              <Input
                id="ns_account_id"
                placeholder="e.g. 1234567_SB1 or TSTDRV1234567"
                value={formData.account_id}
                onChange={(e) => setFormData(prev => ({ ...prev, account_id: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Found in Setup &gt; Company &gt; Company Information. Use underscores for sandbox (e.g. 1234567_SB1).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ns_consumer_key">Consumer Key</Label>
              <Input
                id="ns_consumer_key"
                type="password"
                placeholder="Enter consumer key"
                value={formData.consumer_key}
                onChange={(e) => setFormData(prev => ({ ...prev, consumer_key: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ns_consumer_secret">Consumer Secret</Label>
              <Input
                id="ns_consumer_secret"
                type="password"
                placeholder="Enter consumer secret"
                value={formData.consumer_secret}
                onChange={(e) => setFormData(prev => ({ ...prev, consumer_secret: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ns_token_id">Token ID</Label>
              <Input
                id="ns_token_id"
                type="password"
                placeholder="Enter token ID"
                value={formData.token_id}
                onChange={(e) => setFormData(prev => ({ ...prev, token_id: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ns_token_secret">Token Secret</Label>
              <Input
                id="ns_token_secret"
                type="password"
                placeholder="Enter token secret"
                value={formData.token_secret}
                onChange={(e) => setFormData(prev => ({ ...prev, token_secret: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={!hasCredentials || isTesting}
            >
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasCredentials || isLoading}
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
            Configure what data to synchronize with NetSuite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sync Customers</Label>
              <p className="text-sm text-muted-foreground">
                Synchronize client records as NetSuite customers
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
              <Label>Sync Estimates</Label>
              <p className="text-sm text-muted-foreground">
                Push quotes to NetSuite as Estimate records
              </p>
            </div>
            <Switch
              checked={formData.sync_estimates}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, sync_estimates: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sync Sales Orders</Label>
              <p className="text-sm text-muted-foreground">
                Push confirmed orders to NetSuite as Sales Orders
              </p>
            </div>
            <Switch
              checked={formData.sync_sales_orders}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, sync_sales_orders: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sync Invoices</Label>
              <p className="text-sm text-muted-foreground">
                Pull invoice status and payment details from NetSuite
              </p>
            </div>
            <Switch
              checked={formData.sync_invoices}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, sync_invoices: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Create Customers</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create NetSuite customer when pushing an order for a new client
              </p>
            </div>
            <Switch
              checked={formData.auto_create_customers}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, auto_create_customers: checked }))
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="ns_subsidiary">Default Subsidiary ID</Label>
              <Input
                id="ns_subsidiary"
                placeholder="e.g. 1 (for OneWorld accounts)"
                value={formData.default_subsidiary}
                onChange={(e) => setFormData(prev => ({ ...prev, default_subsidiary: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Required for NetSuite OneWorld</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ns_currency">Default Currency ID</Label>
              <Input
                id="ns_currency"
                placeholder="e.g. 1 for AUD"
                value={formData.default_currency}
                onChange={(e) => setFormData(prev => ({ ...prev, default_currency: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {integration?.active && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Sync</CardTitle>
            <CardDescription>
              Manually trigger data synchronization with NetSuite
              {integration.last_sync && (
                <span className="block mt-1 text-xs">
                  Last synced: {new Date(integration.last_sync).toLocaleString()}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Customers</h4>
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
                    Full Customer Sync
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Estimates &amp; Orders</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncOrders('estimate', 'push')}
                    disabled={isSyncing}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Push Estimates
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncOrders('salesOrder', 'push')}
                    disabled={isSyncing}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Push Sales Orders
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncOrders('estimate', 'pull')}
                    disabled={isSyncing}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Pull Estimates
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
