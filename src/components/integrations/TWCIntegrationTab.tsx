import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Truck, Check, AlertCircle, Eye, EyeOff, Package, RefreshCw } from "lucide-react";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import twcLogo from "@/assets/twc-logo.png";

export const TWCIntegrationTab = () => {
  const { integrations, createIntegration, updateIntegration, testConnection } = useIntegrations();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    api_url: "https://twc.qodo.au/twcpublic",
    api_key: "780F580F3D0942DF87256F6A4563FFE1",
    environment: "staging" as "staging" | "production",
    auto_sync_options: false,
    sync_fabrics: true,
    sync_colors: true,
    active: false,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const twcIntegration = integrations.find(
    (integration) => integration.integration_type === "twc"
  ) as any;

  useEffect(() => {
    if (twcIntegration) {
      const apiCreds = twcIntegration.api_credentials || {};
      const config = twcIntegration.configuration || {};
      setFormData({
        api_url: apiCreds.api_url || "https://twc.qodo.au/twcpublic",
        api_key: apiCreds.api_key || "",
        environment: apiCreds.environment || "staging",
        auto_sync_options: config.auto_sync_options || false,
        sync_fabrics: config.sync_fabrics !== false,
        sync_colors: config.sync_colors !== false,
        active: twcIntegration.active || false,
      });
    }
  }, [twcIntegration]);

  const handleSave = async () => {
    if (!formData.api_url || !formData.api_key) {
      toast({
        title: "Missing Information",
        description: "Please fill in API URL and API Key.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const integrationData = {
        integration_type: "twc" as const,
        api_credentials: {
          api_url: formData.api_url,
          api_key: formData.api_key,
          environment: formData.environment,
        },
        configuration: {
          auto_sync_options: formData.auto_sync_options,
          sync_fabrics: formData.sync_fabrics,
          sync_colors: formData.sync_colors,
          default_item_mapping: {},
        },
        active: formData.active,
        last_sync: null,
      };

      if (twcIntegration) {
        await updateIntegration.mutateAsync({
          id: twcIntegration.id,
          updates: integrationData,
        });
      } else {
        await createIntegration.mutateAsync(integrationData);
      }
    } catch (error) {
      console.error("Error saving TWC integration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!twcIntegration) {
      toast({
        title: "Save Configuration First",
        description: "Please save your TWC configuration before testing.",
        variant: "destructive",
      });
      return;
    }

    await testConnection.mutateAsync(twcIntegration);
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={twcLogo} alt="TWC Logo" className="h-12 w-12 rounded-lg" />
              <div>
                <CardTitle className="text-lg">TWC Online Ordering</CardTitle>
                <CardDescription>
                  Connect to TWC for automated blind ordering
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {twcIntegration?.active ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure your TWC API connection. Staging credentials are pre-filled for testing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="environment">Environment</Label>
            <Select
              value={formData.environment}
              onValueChange={(value: "staging" | "production") => 
                setFormData({ 
                  ...formData, 
                  environment: value,
                  api_url: value === "staging" 
                    ? "https://twc.qodo.au/twcpublic" 
                    : formData.api_url
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staging">Staging (Testing)</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.environment === "staging" 
                ? "Testing environment - orders won't be processed" 
                : "Live environment - real orders will be sent"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_url">API URL *</Label>
            <Input
              id="api_url"
              placeholder="https://twc.qodo.au/twcpublic"
              value={formData.api_url}
              onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              TWC API base URL (staging URL pre-filled)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_key">API Key *</Label>
            <div className="relative">
              <Input
                id="api_key"
                type={showApiKey ? "text" : "password"}
                placeholder="780F580F3D0942DF87256F6A4563FFE1"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your TWC API Key (staging key pre-filled for testing)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Enable TWC Integration</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Saving..." : "Save Configuration"}
            </Button>
            {twcIntegration && (
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={testConnection.isPending}
              >
                {testConnection.isPending ? "Testing..." : "Test Connection"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Product Sync Settings</CardTitle>
          <CardDescription>
            Configure how TWC product data syncs with your inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sync_fabrics">Sync Fabrics</Label>
              <p className="text-xs text-muted-foreground">
                Import fabric options from TWC catalog
              </p>
            </div>
            <Switch
              id="sync_fabrics"
              checked={formData.sync_fabrics}
              onCheckedChange={(checked) => setFormData({ ...formData, sync_fabrics: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sync_colors">Sync Colors</Label>
              <p className="text-xs text-muted-foreground">
                Import color options from TWC catalog
              </p>
            </div>
            <Switch
              id="sync_colors"
              checked={formData.sync_colors}
              onCheckedChange={(checked) => setFormData({ ...formData, sync_colors: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto_sync_options">Auto-Sync Product Options</Label>
              <p className="text-xs text-muted-foreground">
                Automatically update options when TWC catalog changes
              </p>
            </div>
            <Switch
              id="auto_sync_options"
              checked={formData.auto_sync_options}
              onCheckedChange={(checked) => setFormData({ ...formData, auto_sync_options: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Card */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to integrate with TWC Online Ordering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
              </div>
              <div>
                <h4 className="font-medium">Test with Staging Credentials</h4>
                <p className="text-sm text-muted-foreground">
                  The staging API URL and key are pre-filled. Save configuration and test the connection to verify it works.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
              </div>
              <div>
                <h4 className="font-medium">Request Production Credentials</h4>
                <p className="text-sm text-muted-foreground">
                  Contact TWC to receive your production API URL and API Key after successful testing.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
              </div>
              <div>
                <h4 className="font-medium">Configure Product Sync</h4>
                <p className="text-sm text-muted-foreground">
                  Enable fabric and color syncing to import TWC's product catalog into your inventory.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
              </div>
              <div>
                <h4 className="font-medium">Browse Product Library</h4>
                <p className="text-sm text-muted-foreground">
                  After setup, go to Settings → Products → Suppliers to browse and import TWC products.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
