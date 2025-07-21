
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Mail, Key, CheckCircle, XCircle, Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { useQueryClient } from "@tanstack/react-query";

export const SendGridSetup = () => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();
  const { hasSendGridIntegration, integrationData } = useIntegrationStatus();
  const queryClient = useQueryClient();

  const testSendGridConnection = async (testApiKey: string) => {
    setIsTestingConnection(true);
    try {
      const response = await fetch("https://api.sendgrid.com/v3/user/profile", {
        headers: {
          "Authorization": `Bearer ${testApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const profile = await response.json();
        toast({
          title: "Connection Successful",
          description: `Connected to SendGrid account: ${profile.email}`,
        });
        return true;
      } else {
        toast({
          title: "Connection Failed",
          description: "Invalid SendGrid API key or insufficient permissions",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to SendGrid. Please check your internet connection.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              SendGrid Email Service
              {hasSendGridIntegration && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Configure SendGrid for email delivery and tracking
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasSendGridIntegration ? (
          <>
            {/* Setup Instructions */}
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                You'll need a SendGrid API key with "Mail Send" permissions. 
                <a 
                  href="https://app.sendgrid.com/settings/api_keys" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 ml-1"
                >
                  Get your API key here
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

            {/* What This Does */}
            <div className="space-y-3">
              <Separator />
              <div>
                <h4 className="font-medium mb-2">What this integration provides:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Email delivery through SendGrid's infrastructure
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Real-time delivery tracking and analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Open and click tracking for emails
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Bounce and spam report handling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Webhook integration for real-time updates
                  </li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Integration Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">SendGrid Connected</p>
                    <p className="text-sm text-green-700">
                      Email service is configured and ready to send emails
                    </p>
                  </div>
                </div>
              </div>

              {/* Integration Details */}
              {integrationData?.configuration && (
                <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Webhook Status:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {integrationData.configuration.webhook_configured ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
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
                  onClick={() => testSendGridConnection(integrationData?.api_credentials?.api_key || "")}
                  disabled={isTestingConnection}
                  className="flex-1"
                >
                  {isTestingConnection ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
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
