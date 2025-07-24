import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIntegrations } from "@/hooks/useIntegrations";
import type { RFMSIntegration } from "@/types/integrations";

interface RFMSIntegrationTabProps {
  integration?: RFMSIntegration | null;
}

export const RFMSIntegrationTab = ({ integration }: RFMSIntegrationTabProps) => {
  const { createIntegration, updateIntegration, testConnection } = useIntegrations();
  
  const [formData, setFormData] = useState({
    api_url: integration?.api_credentials?.api_url || '',
    api_key: integration?.api_credentials?.api_key || '',
    client_id: integration?.api_credentials?.client_id || '',
    sync_measurements: integration?.configuration?.sync_measurements ?? true,
    sync_scheduling: integration?.configuration?.sync_scheduling ?? true,
    auto_update_job_status: integration?.configuration?.auto_update_job_status ?? false,
    measurement_units: integration?.configuration?.measurement_units || 'metric',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const integrationData = {
        integration_type: 'rfms' as const,
        active: true,
        api_credentials: {
          api_url: formData.api_url,
          api_key: formData.api_key,
          client_id: formData.client_id,
        },
        configuration: {
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
          client_id: formData.client_id,
        },
      } as RFMSIntegration;

      await testConnection.mutateAsync(testIntegration);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">RFMS Integration</h3>
          <p className="text-sm text-muted-foreground">
            Connect to Retail Floor Management System for measurements and scheduling
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
            Configure your RFMS API connection details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="api_url">API URL</Label>
              <Input
                id="api_url"
                placeholder="https://api.rfms.com"
                value={formData.api_url}
                onChange={(e) => setFormData(prev => ({ ...prev, api_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_id">Client ID</Label>
              <Input
                id="client_id"
                placeholder="Your RFMS client ID"
                value={formData.client_id}
                onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
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
              disabled={!formData.api_url || !formData.api_key || !formData.client_id || isTesting}
            >
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.api_url || !formData.api_key || !formData.client_id || isLoading}
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
    </div>
  );
};