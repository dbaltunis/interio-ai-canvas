
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Key, CheckCircle, XCircle, Loader2, ExternalLink, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { useQueryClient } from "@tanstack/react-query";

type ConnectionStatus = 'connected' | 'failed' | 'checking' | 'unknown';

export const SendGridSetup = () => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasSendGridIntegration, integrationData, isLoading: isLoadingStatus } = useIntegrationStatus();
  const queryClient = useQueryClient();

  // Get API key from integration data
  const getStoredApiKey = useCallback((): string => {
    const apiCredentials = integrationData?.api_credentials;
    const config = integrationData?.configuration;
    return apiCredentials?.api_key || config?.api_key || "";
  }, [integrationData]);

  // Test connection (silent mode doesn't show success toast)
  const testSendGridConnection = useCallback(async (testApiKey: string, silent = false): Promise<boolean> => {
    if (!testApiKey?.trim()) {
      if (!silent) {
        toast({
          title: "Connection Failed",
          description: "No API key configured",
          variant: "destructive",
        });
      }
      setConnectionStatus('failed');
      setConnectionError("No API key configured");
      return false;
    }

    setIsTestingConnection(true);
    setConnectionStatus('checking');
    setConnectionError(null);

    try {
      const response = await fetch("https://api.sendgrid.com/v3/user/profile", {
        headers: {
          "Authorization": `Bearer ${testApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const profile = await response.json();
        setConnectionStatus('connected');
        setConnectionError(null);
        if (!silent) {
          toast({
            title: "Connection Successful",
            description: `Connected to SendGrid account: ${profile.email}`,
          });
        }
        return true;
      } else {
        const errorMsg = response.status === 401 
          ? "Invalid API key" 
          : response.status === 403 
            ? "Insufficient permissions" 
            : "Connection failed";
        setConnectionStatus('failed');
        setConnectionError(errorMsg);
        if (!silent) {
          toast({
            title: "Connection Failed",
            description: errorMsg,
            variant: "destructive",
          });
        }
        return false;
      }
    } catch (error) {
      const errorMsg = "Unable to connect to SendGrid";
      setConnectionStatus('failed');
      setConnectionError(errorMsg);
      if (!silent) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to SendGrid. Please check your internet connection.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  }, [toast]);

  // Auto-validate connection on mount when integration exists
  useEffect(() => {
    if (!isLoadingStatus && hasSendGridIntegration) {
      const storedKey = getStoredApiKey();
      if (storedKey) {
        testSendGridConnection(storedKey, true);
      } else {
        setConnectionStatus('failed');
        setConnectionError("API key not found in storage");
      }
    }
  }, [isLoadingStatus, hasSendGridIntegration, getStoredApiKey, testSendGridConnection]);

  const setupSendGridIntegration = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your SendGrid API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First test the connection
      const isValid = await testSendGridConnection(apiKey);
      if (!isValid) {
        setIsLoading(false);
        return;
      }

      // Setup webhook via edge function
      const { data, error } = await supabase.functions.invoke('setup-sendgrid-webhook', {
        body: { sendgrid_api_key: apiKey }
      });

      if (error) {
        console.error("Setup error:", error);
        throw new Error(error.message || "Failed to setup SendGrid integration");
      }

      if (data?.success) {
        toast({
          title: "SendGrid Integration Configured",
          description: "Webhook configured successfully. Email tracking is now active.",
        });
        
        // Refresh integration status
        queryClient.invalidateQueries({ queryKey: ['integration-status'] });
        setApiKey("");
      } else {
        throw new Error(data?.error || "Setup failed");
      }
    } catch (error) {
      console.error("Integration setup error:", error);
      toast({
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "Failed to setup SendGrid integration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectIntegration = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('integration_settings')
        .update({ active: false })
        .eq('user_id', user.id)
        .eq('integration_type', 'sendgrid');

      if (error) throw error;

      toast({
        title: "Integration Disconnected",
        description: "SendGrid integration has been disabled",
      });

      queryClient.invalidateQueries({ queryKey: ['integration-status'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect integration",
        variant: "destructive",
      });
    }
  };

  // Render connection status badge
  const renderStatusBadge = () => {
    if (!hasSendGridIntegration) return null;

    switch (connectionStatus) {
      case 'checking':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Checking...
          </Badge>
        );
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Connection Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Custom SendGrid Integration (Optional)
              {renderStatusBadge()}
            </CardTitle>
            <CardDescription>
              Connect your own SendGrid account for custom branding and unlimited emails
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasSendGridIntegration ? (
          <>
            {/* Setup Instructions */}
            <Alert className="border-blue-200 bg-blue-50">
              <Key className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Optional Premium Feature:</strong> This is only needed if you want to use your own SendGrid account for custom email branding. The default email service (500 emails/month) works without this.
                <br />
                <a 
                  href="https://app.sendgrid.com/settings/api_keys" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-2 font-medium"
                >
                  Get your SendGrid API key here
                  <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>

            {/* API Key Input */}
            <div className="space-y-2">
              <Label htmlFor="sendgrid-api-key">SendGrid API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="sendgrid-api-key"
                  type="password"
                  placeholder="SG.xxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => testSendGridConnection(apiKey)}
                  disabled={!apiKey.trim() || isTestingConnection}
                >
                  {isTestingConnection ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Test"
                  )}
                </Button>
              </div>
            </div>

            {/* Setup Button */}
            <Button 
              onClick={setupSendGridIntegration}
              disabled={!apiKey.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up integration...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Setup SendGrid Integration
                </>
              )}
            </Button>

          </>
        ) : (
          <>
            {/* Integration Status - Dynamic based on actual connection state */}
            <div className="space-y-4">
              {connectionStatus === 'connected' && (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">SendGrid Connected</p>
                      <p className="text-sm text-green-700">
                        Email service is verified and ready to send emails
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {connectionStatus === 'failed' && (
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Connection Failed</p>
                      <p className="text-sm text-red-700">
                        {connectionError || "Unable to connect to SendGrid. Please re-enter your API key."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {connectionStatus === 'checking' && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                    <div>
                      <p className="font-medium text-yellow-800">Verifying Connection...</p>
                      <p className="text-sm text-yellow-700">
                        Testing connection to SendGrid
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {connectionStatus === 'unknown' && (
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-800">Status Unknown</p>
                      <p className="text-sm text-gray-700">
                        Click "Test Connection" to verify
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Integration Details */}
              {integrationData?.configuration && (
                <div className="space-y-2 text-sm bg-muted p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Webhook Status:</span>
                    <Badge variant="default" className={integrationData.configuration.webhook_configured ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {integrationData.configuration.webhook_configured ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>
                      {integrationData.last_sync
                        ? new Date(integrationData.last_sync).toLocaleDateString() 
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => testSendGridConnection(getStoredApiKey(), false)}
                  disabled={isTestingConnection}
                  className="flex-1"
                >
                  {isTestingConnection ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
                <Button
                  variant="destructive"
                  onClick={disconnectIntegration}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>

              {/* Re-enter API Key option when connection fails */}
              {connectionStatus === 'failed' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <Key className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Troubleshooting:</strong> Your API key may have been revoked or expired. 
                    Disconnect and re-setup with a new API key from SendGrid.
                  </AlertDescription>
                </Alert>
              )}

              {/* Warning */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Disconnecting will disable email sending and tracking. You can reconnect anytime.
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
