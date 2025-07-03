import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, AlertCircle, Mail, Settings, ExternalLink } from "lucide-react";

export const SendGridIntegrationTab = () => {
  const [apiKey, setApiKey] = useState("");
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<'none' | 'configured' | 'error'>('none');
  const [statusMessage, setStatusMessage] = useState("");
  const { toast } = useToast();

  const handleSetupIntegration = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your SendGrid API key",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey.startsWith('SG.')) {
      toast({
        title: "Invalid API Key",
        description: "SendGrid API keys should start with 'SG.'",
        variant: "destructive"
      });
      return;
    }

    setIsConfiguring(true);
    setStatusMessage("");

    try {
      console.log("Setting up SendGrid integration...");
      
      const { data, error } = await supabase.functions.invoke('setup-sendgrid-webhook', {
        body: {
          sendgrid_api_key: apiKey
        }
      });

      if (error) {
        console.error("Setup error:", error);
        throw error;
      }

      console.log("Setup response:", data);

      if (data.success) {
        setIntegrationStatus('configured');
        setStatusMessage(data.message);
        setApiKey(""); // Clear the API key for security
        
        toast({
          title: "Success!",
          description: "SendGrid integration configured successfully. Email tracking is now active.",
        });
      } else {
        throw new Error(data.error || "Setup failed");
      }

    } catch (error: any) {
      console.error("Integration setup error:", error);
      setIntegrationStatus('error');
      setStatusMessage(error.message || "Failed to configure SendGrid integration");
      
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to configure SendGrid integration",
        variant: "destructive"
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>SendGrid Integration</CardTitle>
          </div>
          <CardDescription>
            Configure SendGrid for reliable email delivery and automatic tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Display */}
          {integrationStatus !== 'none' && (
            <Alert className={integrationStatus === 'configured' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {integrationStatus === 'configured' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={integrationStatus === 'configured' ? 'text-green-800' : 'text-red-800'}>
                  {statusMessage}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Integration Setup */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="sendgrid-api-key">SendGrid API Key</Label>
              <Input
                id="sendgrid-api-key"
                type="password"
                placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Your API key will be used to automatically configure email tracking webhooks
              </p>
            </div>

            <Button 
              onClick={handleSetupIntegration}
              disabled={isConfiguring || !apiKey.trim()}
              className="w-full"
            >
              {isConfiguring ? (
                "Configuring Integration..."
              ) : (
                "Setup SendGrid Integration"
              )}
            </Button>
          </div>

          {/* Features List */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              What this setup includes:
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                Automatic webhook configuration for email tracking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                Real-time delivery, open, and click tracking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                Bounce and spam report handling
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                Analytics and performance metrics
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                Template variable processing
              </li>
            </ul>
          </div>

          {/* Help Links */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-3">Need help getting your API key?</p>
            <div className="flex flex-wrap gap-2">
              <a 
                href="https://app.sendgrid.com/settings/api_keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs border rounded cursor-pointer hover:bg-gray-50"
              >
                <ExternalLink className="h-3 w-3" />
                SendGrid API Keys
              </a>
              <a 
                href="https://docs.sendgrid.com/ui/account-and-settings/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs border rounded cursor-pointer hover:bg-gray-50"
              >
                <ExternalLink className="h-3 w-3" />
                API Key Documentation
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};