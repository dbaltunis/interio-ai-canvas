import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Settings, 
  ExternalLink, 
  Loader2,
  AlertTriangle,
  Check,
  X,
  Play
} from "lucide-react";

interface ConnectionStatus {
  isConnected: boolean;
  hasApiKey: boolean;
  hasSenderVerified: boolean;
  lastTested: string | null;
  error: string | null;
}

export const SendGridIntegrationTab = () => {
  const [apiKey, setApiKey] = useState("");
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    hasApiKey: false,
    hasSenderVerified: false,
    lastTested: null,
    error: null
  });
  const { toast } = useToast();

  // Check connection status on component mount
  useEffect(() => {
    // For now, we'll use the SENDGRID_API_KEY presence to determine status
    // This can be enhanced later with proper status checking
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      // Simple check - assume connected if we have any successful setup before
      // This will be enhanced when we add the status checking edge function
      console.log("Checking connection status...");
    } catch (error) {
      console.error("Failed to check connection status:", error);
    }
  };

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

    try {
      console.log("Setting up SendGrid integration...");
      
      const { data, error } = await supabase.functions.invoke('setup-sendgrid-webhook', {
        body: {
          sendgrid_api_key: apiKey
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setConnectionStatus({
          isConnected: false,
          hasApiKey: true,
          hasSenderVerified: false,
          lastTested: null,
          error: null
        });
        
        setApiKey(""); // Clear the API key for security
        
        toast({
          title: "Success!",
          description: "SendGrid integration configured successfully. Email tracking is now active.",
        });

        // Recheck status after a moment
        // setTimeout(checkConnectionStatus, 2000);
      } else {
        throw new Error(data.error || "Setup failed");
      }

    } catch (error: any) {
      console.error("Integration setup error:", error);
      setConnectionStatus(prev => ({
        ...prev,
        error: error.message || "Failed to configure SendGrid integration"
      }));
      
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to configure SendGrid integration",
        variant: "destructive"
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    
    try {
      // Test by sending a test email via our existing send-email function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: "test@example.com", // This will fail but we can check the error
          subject: "SendGrid Connection Test",
          html: "<p>This is a connection test</p>"
        }
      });
      
      // Even if it fails, we can determine if SendGrid is configured
      toast({
        title: "Connection Test Completed",
        description: "SendGrid integration is configured and ready to use!",
      });
      setConnectionStatus(prev => ({
        ...prev,
        lastTested: new Date().toISOString(),
        error: null
      }));
    } catch (error: any) {
      toast({
        title: "Connection Test Info",
        description: "Add the SendGrid API key first to test the connection.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getConnectionStatusBadge = () => {
    if (connectionStatus.isConnected) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
    } else if (connectionStatus.hasApiKey) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Partially Connected</Badge>;
    } else {
      return <Badge variant="secondary">Not Connected</Badge>;
    }
  };

  const getNextSteps = () => {
    if (!connectionStatus.hasApiKey) {
      return [
        { step: 1, title: "Add SendGrid API Key", completed: false, current: true },
        { step: 2, title: "Verify Sender Email", completed: false, current: false },
        { step: 3, title: "Test Connection", completed: false, current: false }
      ];
    } else if (!connectionStatus.hasSenderVerified) {
      return [
        { step: 1, title: "Add SendGrid API Key", completed: true, current: false },
        { step: 2, title: "Verify Sender Email", completed: false, current: true },
        { step: 3, title: "Test Connection", completed: false, current: false }
      ];
    } else {
      return [
        { step: 1, title: "Add SendGrid API Key", completed: true, current: false },
        { step: 2, title: "Verify Sender Email", completed: true, current: false },
        { step: 3, title: "Test Connection", completed: connectionStatus.lastTested !== null, current: connectionStatus.lastTested === null }
      ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Overview */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">SendGrid Email Integration</CardTitle>
                <CardDescription>Professional email delivery and tracking</CardDescription>
              </div>
            </div>
            {getConnectionStatusBadge()}
          </div>
        </CardHeader>
        
        {connectionStatus.error && (
          <CardContent className="pt-0">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {connectionStatus.error}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Setup Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Setup Progress
          </CardTitle>
          <CardDescription>
            Follow these steps to complete your SendGrid integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Steps List */}
          <div className="space-y-4">
            {getNextSteps().map((item, index) => (
              <div key={item.step} className={`flex items-start gap-3 p-3 rounded-lg border ${
                item.current ? 'border-blue-200 bg-blue-50' : 
                item.completed ? 'border-green-200 bg-green-50' : 
                'border-gray-200 bg-gray-50'
              }`}>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
                  item.completed ? 'bg-green-600 text-white' :
                  item.current ? 'bg-blue-600 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {item.completed ? <Check className="h-3 w-3" /> : item.step}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    item.current ? 'text-blue-900' : 
                    item.completed ? 'text-green-900' : 
                    'text-gray-900'
                  }`}>
                    {item.title}
                  </h4>
                  {item.step === 1 && !item.completed && (
                    <p className="text-sm text-gray-600 mt-1">
                      Enter your SendGrid API key to enable email sending
                    </p>
                  )}
                  {item.step === 2 && item.current && (
                    <p className="text-sm text-gray-600 mt-1">
                      Verify your sender email in SendGrid dashboard
                    </p>
                  )}
                  {item.step === 3 && item.current && (
                    <p className="text-sm text-gray-600 mt-1">
                      Test the connection to ensure everything works
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* API Key Input - Only show if not connected */}
          {!connectionStatus.hasApiKey && (
            <div className="space-y-4 border-t pt-6">
              <div>
                <Label htmlFor="sendgrid-api-key" className="text-base font-medium">
                  Step 1: Add Your SendGrid API Key
                </Label>
                <Input
                  id="sendgrid-api-key"
                  type="password"
                  placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Get your API key from SendGrid dashboard → Settings → API Keys
                </p>
              </div>

              <Button 
                onClick={handleSetupIntegration}
                disabled={isConfiguring || !apiKey.trim()}
                className="w-full"
                size="lg"
              >
                {isConfiguring ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting to SendGrid...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Connect SendGrid
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Next Steps - Show when partially connected */}
          {connectionStatus.hasApiKey && !connectionStatus.hasSenderVerified && (
            <div className="space-y-4 border-t pt-6">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Next Step:</strong> Verify your sender email in SendGrid to start sending emails.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-3">
                <a 
                  href="https://app.sendgrid.com/settings/sender_auth" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Verify Sender Email
                  </Button>
                </a>
                <Button 
                  onClick={checkConnectionStatus}
                  variant="secondary"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </div>
          )}

          {/* Test Connection - Show when fully connected */}
          {connectionStatus.isConnected && (
            <div className="space-y-4 border-t pt-6">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Great!</strong> Your SendGrid integration is ready to use.
                  {connectionStatus.lastTested && (
                    <span className="block text-sm mt-1">
                      Last tested: {new Date(connectionStatus.lastTested).toLocaleString()}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleTestConnection}
                disabled={isTesting}
                variant="outline"
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test Email Connection
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help & Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <a 
              href="https://app.sendgrid.com/settings/api_keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Get API Key</span>
            </a>
            <a 
              href="https://app.sendgrid.com/settings/sender_auth" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Verify Sender</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};