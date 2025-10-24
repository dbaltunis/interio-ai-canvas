import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Globe, Key, CheckCircle2, AlertCircle, Copy, RefreshCw, Send, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIntegrations } from "@/hooks/useIntegrations";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

interface WebsiteAPIIntegrationTabProps {
  integration?: any;
}

export const WebsiteAPIIntegrationTab = ({ integration }: WebsiteAPIIntegrationTabProps) => {
  const { toast } = useToast();
  const { updateIntegration, createIntegration } = useIntegrations();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  
  const [websiteUrl, setWebsiteUrl] = useState(integration?.configuration?.website_url || "");
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState(integration?.configuration?.webhook_url || "");
  
  // Generate API key for the user's website to authenticate with your system
  const generateApiKey = () => {
    const key = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(key);
    toast({
      title: "API Key Generated",
      description: "Save this key securely - it won't be shown again.",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const testConnection = async () => {
    if (!websiteUrl) {
      toast({
        title: "Error",
        description: "Please enter your website URL",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Test the website connection
      const response = await fetch(websiteUrl, { method: 'HEAD' });
      
      setTestResult({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString(),
      });

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: `Successfully connected to ${websiteUrl}`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: `Status: ${response.status} ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfiguration = async () => {
    if (!websiteUrl || !apiKey) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const integrationData = {
        integration_type: "website_api" as const,
        active: true,
        api_credentials: {
          api_key: apiKey,
        },
        configuration: {
          website_url: websiteUrl,
          webhook_url: webhookUrl,
        },
      };

      if (integration?.id) {
        await updateIntegration.mutateAsync({
          id: integration.id,
          updates: integrationData as any,
        });
      } else {
        await createIntegration.mutateAsync(integrationData as any);
      }

      toast({
        title: "Success",
        description: "Website API integration configured successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = integration?.active || false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Website & Online Store API</CardTitle>
                <CardDescription>
                  Connect your website or online store via REST API
                </CardDescription>
              </div>
            </div>
            {isActive && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Integration Guide</AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              <p className="text-sm">This integration allows your website to:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>Sync orders and quotes in real-time</li>
                <li>Update product inventory automatically</li>
                <li>Receive customer information</li>
                <li>Send order status updates via webhooks</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website-url">Website URL *</Label>
              <div className="flex gap-2">
                <Input
                  id="website-url"
                  placeholder="https://your-store.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  onClick={testConnection}
                  disabled={isTesting || !websiteUrl}
                >
                  {isTesting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your website or online store URL
              </p>
            </div>

            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {testResult.success ? "Connection Successful" : "Connection Failed"}
                </AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {testResult.success
                    ? `Status: ${testResult.status} ${testResult.statusText}`
                    : testResult.error}
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key *</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Generate or enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button variant="outline" onClick={generateApiKey}>
                  <Key className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
              {apiKey && (
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                    {apiKey}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(apiKey, "API Key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                This key will be used to authenticate API requests from your website
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL (Optional)</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-store.com/api/webhooks/orders"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Endpoint to receive order status updates and notifications
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">API Endpoints</h4>
              <div className="space-y-2 text-xs">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-primary">POST /api/quotes</code>
                    <Badge variant="secondary" className="text-xs">Create Quote</Badge>
                  </div>
                  <p className="text-muted-foreground">Create a new quote from your website</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-primary">GET /api/products</code>
                    <Badge variant="secondary" className="text-xs">List Products</Badge>
                  </div>
                  <p className="text-muted-foreground">Retrieve product catalog and pricing</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-primary">POST /api/orders</code>
                    <Badge variant="secondary" className="text-xs">Create Order</Badge>
                  </div>
                  <p className="text-muted-foreground">Submit a new order from your store</p>
                </div>
              </div>
            </div>

            <Alert>
              <ExternalLink className="h-4 w-4" />
              <AlertTitle>Documentation</AlertTitle>
              <AlertDescription className="text-xs">
                View full API documentation and integration examples in our developer portal
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={saveConfiguration}
              disabled={isLoading || !websiteUrl || !apiKey}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
