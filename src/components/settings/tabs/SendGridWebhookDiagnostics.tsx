import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Activity,
  AlertCircle,
  CheckCircle,
  Settings,  
  RefreshCw,
  Zap,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DiagnosticResult {
  webhook_status: string;
  webhook_url: string;
  sendgrid_api_status: string;
  sendgrid_webhook_settings: any;
  recent_emails: any[];
  recent_analytics: any[];
  recommendations: string[];
}

export const SendGridWebhookDiagnostics = () => {
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-sendgrid-webhook');
      
      if (error) {
        throw error;
      }

      setDiagnostic(data.diagnostic);
      toast({
        title: "Diagnostics Complete",
        description: "SendGrid webhook diagnostics completed successfully."
      });
    } catch (error: any) {
      console.error("Diagnostics error:", error);
      toast({
        title: "Diagnostics Failed",
        description: error.message || "Failed to run diagnostics",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runWebhookSetup = async () => {
    setIsSetupRunning(true);
    try {
      // First get the SendGrid API key from integration settings
      const { data: integrationData } = await supabase
        .from('integration_settings')
        .select('api_credentials')
        .eq('integration_type', 'sendgrid')
        .maybeSingle();

      const apiCredentials = integrationData?.api_credentials as { api_key?: string } | null;
      
      if (!apiCredentials?.api_key) {
        throw new Error("No SendGrid API key found. Please configure SendGrid integration first.");
      }

      const { data, error } = await supabase.functions.invoke('setup-sendgrid-webhook', {
        body: {
          sendgrid_api_key: apiCredentials.api_key
        }
      });
      
      if (error) {
        throw error;
      }

      toast({
        title: "Webhook Setup Complete", 
        description: "SendGrid webhook has been configured successfully."
      });

      // Re-run diagnostics to see the updated status
      await runDiagnostics();
    } catch (error: any) {
      console.error("Webhook setup error:", error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to setup webhook",
        variant: "destructive"
      });
    } finally {
      setIsSetupRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "configured":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "not_configured":
      case "no_key":
      case "invalid_key":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "configured":
        return "bg-green-50 text-green-700 border-green-200";
      case "not_configured":
      case "no_key":
      case "invalid_key":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            SendGrid Webhook Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This tool helps diagnose email tracking issues by checking your SendGrid webhook configuration.
            If your emails show fewer opens than expected, this usually means the webhook isn't receiving events from SendGrid.
          </p>
          
          <div className="flex gap-3">
            <Button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="flex items-center gap-2"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? "Running..." : "Run Diagnostics"}
            </Button>
            
            <Button
              onClick={runWebhookSetup}
              disabled={isSetupRunning}
              className="flex items-center gap-2"
            >
              <Settings className={`h-4 w-4 ${isSetupRunning ? 'animate-spin' : ''}`} />
              {isSetupRunning ? "Setting up..." : "Setup Webhook"}
            </Button>
          </div>

          {diagnostic && (
            <div className="space-y-4">
              <Separator />
              
              {/* Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${getStatusColor(diagnostic.sendgrid_api_status)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(diagnostic.sendgrid_api_status)}
                    <span className="font-medium">SendGrid API</span>
                  </div>
                  <p className="text-sm">Status: {diagnostic.sendgrid_api_status}</p>
                </div>
                
                <div className={`p-4 rounded-lg border ${getStatusColor(diagnostic.webhook_status)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(diagnostic.webhook_status)}
                    <span className="font-medium">Webhook Status</span>
                  </div>
                  <p className="text-sm">Status: {diagnostic.webhook_status}</p>
                </div>
              </div>

              {/* SendGrid Webhook Settings */}
              {diagnostic.sendgrid_webhook_settings && (
                <div className="space-y-2">
                  <h4 className="font-medium">SendGrid Webhook Settings</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <div>URL: {diagnostic.sendgrid_webhook_settings.url || "Not set"}</div>
                    <div>Enabled: {diagnostic.sendgrid_webhook_settings.enabled ? "✅" : "❌"}</div>
                    <div>Open Tracking: {diagnostic.sendgrid_webhook_settings.open ? "✅" : "❌"}</div>
                    <div>Click Tracking: {diagnostic.sendgrid_webhook_settings.click ? "✅" : "❌"}</div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Recent Emails</h4>
                  <div className="space-y-1">
                    {diagnostic.recent_emails.slice(0, 3).map((email) => (
                      <div key={email.id} className="text-sm p-2 bg-gray-50 rounded">
                        <div>Opens: {email.open_count || 0} | Clicks: {email.click_count || 0}</div>
                        <div className="text-xs text-muted-foreground">
                          Status: {email.status} | {new Date(email.sent_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {diagnostic.recent_emails.length === 0 && (
                      <div className="text-sm text-muted-foreground">No recent emails found</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Recent Analytics Events</h4>
                  <div className="space-y-1">
                    {diagnostic.recent_analytics.slice(0, 3).map((event) => (
                      <div key={event.id} className="text-sm p-2 bg-gray-50 rounded">
                        <div>{event.event_type}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {diagnostic.recent_analytics.length === 0 && (
                      <div className="text-sm text-muted-foreground">No analytics events found</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="font-medium">Recommendations</h4>
                <div className="space-y-2">
                  {diagnostic.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm p-2 bg-blue-50 border border-blue-200 rounded">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>

              {/* Helpful Links */}
              <div className="space-y-2">
                <h4 className="font-medium">Helpful Links</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => window.open("https://app.sendgrid.com/settings/mail_settings", "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />
                    SendGrid Settings
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => window.open("https://docs.sendgrid.com/for-developers/tracking-events/event", "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />
                    SendGrid Webhook Docs
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};