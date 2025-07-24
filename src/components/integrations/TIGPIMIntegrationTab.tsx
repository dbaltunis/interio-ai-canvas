import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useIntegrations } from "@/hooks/useIntegrations";
import type { TIGPIMIntegration } from "@/types/integrations";

interface TIGPIMIntegrationTabProps {
  integration?: TIGPIMIntegration | null;
}

export const TIGPIMIntegrationTab = ({ integration }: TIGPIMIntegrationTabProps) => {
  const { createIntegration, updateIntegration, testConnection } = useIntegrations();
  
  const [formData, setFormData] = useState({
    api_url: integration?.api_credentials?.api_url || '',
    api_key: integration?.api_credentials?.api_key || '',
    username: integration?.api_credentials?.username || '',
    auto_sync_products: integration?.configuration?.auto_sync_products || false,
    sync_interval_hours: integration?.configuration?.sync_interval_hours || 24,
    sync_pricing: integration?.configuration?.sync_pricing ?? true,
    sync_availability: integration?.configuration?.sync_availability ?? true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const integrationData = {
        integration_type: 'tig_pim' as const,
        active: true,
        api_credentials: {
          api_url: formData.api_url,
          api_key: formData.api_key,
          username: formData.username,
        },
        configuration: {
          auto_sync_products: formData.auto_sync_products,
          sync_interval_hours: formData.sync_interval_hours,
          sync_pricing: formData.sync_pricing,
          sync_availability: formData.sync_availability,
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
          api_url: formData.api_url,
          api_key: formData.api_key,
          username: formData.username,
        },
      } as TIGPIMIntegration;

      await testConnection.mutateAsync(testIntegration);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">TIG PIM Integration</h3>
          <p className="text-sm text-muted-foreground">
            Connect to TIG Product Information Management system
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
            Configure your TIG PIM API connection details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="api_url">API URL</Label>
              <Input
                id="api_url"
                placeholder="https://api.tigpim.com"
                value={formData.api_url}
                onChange={(e) => setFormData(prev => ({ ...prev, api_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                placeholder="Enter your API key"
                value={formData.api_key}
                onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username (Optional)</Label>
              <Input
                id="username"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={!formData.api_url || !formData.api_key || isTesting}
            >
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.api_url || !formData.api_key || isLoading}
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
            Configure what data to synchronize from TIG PIM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Sync Products</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync product data at regular intervals
              </p>
            </div>
            <Switch
              checked={formData.auto_sync_products}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, auto_sync_products: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sync Pricing</Label>
              <p className="text-sm text-muted-foreground">
                Include pricing information in sync
              </p>
            </div>
            <Switch
              checked={formData.sync_pricing}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, sync_pricing: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sync Availability</Label>
              <p className="text-sm text-muted-foreground">
                Include stock levels and availability
              </p>
            </div>
            <Switch
              checked={formData.sync_availability}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, sync_availability: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sync_interval">Sync Interval (hours)</Label>
            <Input
              id="sync_interval"
              type="number"
              min="1"
              max="168"
              value={formData.sync_interval_hours}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, sync_interval_hours: parseInt(e.target.value) || 24 }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};