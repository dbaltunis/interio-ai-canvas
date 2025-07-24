import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useIntegrations } from "@/hooks/useIntegrations";
import type { MYOBExoIntegration } from "@/types/integrations";

interface MYOBExoIntegrationTabProps {
  integration?: MYOBExoIntegration | null;
}

export const MYOBExoIntegrationTab = ({ integration }: MYOBExoIntegrationTabProps) => {
  const { createIntegration, updateIntegration, testConnection } = useIntegrations();
  
  const [formData, setFormData] = useState({
    server_url: integration?.api_credentials?.server_url || '',
    database_id: integration?.api_credentials?.database_id || '',
    username: integration?.api_credentials?.username || '',
    password: integration?.api_credentials?.password || '',
    api_key: integration?.api_credentials?.api_key || '',
    auto_export_quotes: integration?.configuration?.auto_export_quotes ?? false,
    default_gl_account: integration?.configuration?.default_gl_account || '',
    customer_sync: integration?.configuration?.customer_sync ?? true,
    create_purchase_orders: integration?.configuration?.create_purchase_orders ?? false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const integrationData = {
        integration_type: 'myob_exo' as const,
        active: true,
        api_credentials: {
          server_url: formData.server_url,
          database_id: formData.database_id,
          username: formData.username,
          password: formData.password,
          api_key: formData.api_key,
        },
        configuration: {
          auto_export_quotes: formData.auto_export_quotes,
          default_gl_account: formData.default_gl_account,
          tax_code_mapping: {},
          customer_sync: formData.customer_sync,
          create_purchase_orders: formData.create_purchase_orders,
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const testIntegration = {
        ...integration,
        api_credentials: {
          server_url: formData.server_url,
          database_id: formData.database_id,
          username: formData.username,
          password: formData.password,
          api_key: formData.api_key,
        },
      } as MYOBExoIntegration;

      await testConnection.mutateAsync(testIntegration);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">MYOB Exo Integration</h3>
          <p className="text-sm text-muted-foreground">
            Connect to MYOB Exo ERP system for quote export and financial integration
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
            Configure your MYOB Exo server connection details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="server_url">Server URL</Label>
              <Input
                id="server_url"
                placeholder="https://myob-server.company.com"
                value={formData.server_url}
                onChange={(e) => setFormData(prev => ({ ...prev, server_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="database_id">Database ID</Label>
              <Input
                id="database_id"
                placeholder="COMPANY_DB"
                value={formData.database_id}
                onChange={(e) => setFormData(prev => ({ ...prev, database_id: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="MYOB Username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="api_key">API Key (Optional)</Label>
              <Input
                id="api_key"
                type="password"
                placeholder="Enter API key if required"
                value={formData.api_key}
                onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={!formData.server_url || !formData.username || !formData.password || isTesting}
            >
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.server_url || !formData.username || !formData.password || isLoading}
            >
              {isLoading ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
          <CardDescription>
            Configure how quotes and data are exported to MYOB Exo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Export Quotes</Label>
              <p className="text-sm text-muted-foreground">
                Automatically export accepted quotes to MYOB Exo
              </p>
            </div>
            <Switch
              checked={formData.auto_export_quotes}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, auto_export_quotes: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Customer Sync</Label>
              <p className="text-sm text-muted-foreground">
                Synchronize customer data between systems
              </p>
            </div>
            <Switch
              checked={formData.customer_sync}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, customer_sync: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Create Purchase Orders</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create purchase orders from accepted quotes
              </p>
            </div>
            <Switch
              checked={formData.create_purchase_orders}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, create_purchase_orders: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_gl_account">Default GL Account</Label>
            <Input
              id="default_gl_account"
              placeholder="4-1000 (Sales Revenue)"
              value={formData.default_gl_account}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, default_gl_account: e.target.value }))
              }
            />
            <p className="text-sm text-muted-foreground">
              Default general ledger account for sales transactions
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};