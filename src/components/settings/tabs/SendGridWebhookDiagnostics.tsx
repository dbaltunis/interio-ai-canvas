
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
  ExternalLink,
  ArrowRight,
  Copy
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

  const copyWebhookUrl = () => {
    const webhookUrl = "https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/sendgrid-webhook";
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copied",
      description: "Webhook URL copied to clipboard"
    });
  };

  const renderActionableRecommendations = (recommendations: string[]) => {
    return recommendations.map((rec, index) => {
      // Skip positive recommendations (starting with ✅) as they don't need action
      if (rec.startsWith("✅")) {
        return (
          <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">{rec.replace("✅ ", "")}</span>
            </div>
          </div>
        );
      }

      // Parse the recommendation to provide actionable steps
      if (rec.includes("No SendGrid API key found") || rec.includes("no_key")) {
        return (
          <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-800 mb-2">SendGrid API Key Missing</h4>
                <p className="text-sm text-red-700 mb-3">You need to configure your SendGrid API key first.</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-red-600" />
                    <span>Go to Settings → Integrations → SendGrid</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-red-600" />
                    <span>Enter your SendGrid API key there</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (rec.includes("Webhook is not configured") || rec.includes("not_configured")) {
        return (
          <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-800 mb-2">Webhook Setup Required</h4>
                <p className="text-sm text-orange-700 mb-3">Click the "Setup Webhook" button above to automatically configure email tracking.</p>
                <Button 
                  onClick={runWebhookSetup}
                  disabled={isSetupRunning}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSetupRunning ? "Setting up..." : "Setup Webhook Now"}
                </Button>
              </div>
            </div>
          </div>
        );
      }

      if (rec.includes("SendGrid webhook is disabled") || rec.includes("disabled")) {
        return (
          <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800 mb-2">Manual SendGrid Setup Needed</h4>
                <p className="text-sm text-yellow-700 mb-3">You need to manually enable the webhook in SendGrid dashboard.</p>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-yellow-600" />
                    <span>Go to SendGrid Dashboard → Settings → Mail Settings → Event Webhook</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-yellow-600" />
                    <span>Enable the webhook and set events: Delivered, Opens, Clicks, Bounces</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-yellow-600" />
                    <span>Use this URL:</span>
                  </div>
                  <div className="flex gap-2 items-center bg-white p-2 rounded border">
                    <code className="text-xs font-mono flex-1">
                      https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/sendgrid-webhook
                    </code>
                    <Button variant="outline" size="sm" onClick={copyWebhookUrl}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("https://app.sendgrid.com/settings/mail_settings", "_blank")}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open SendGrid Settings
                </Button>
              </div>
            </div>
          </div>
        );
      }

      if (rec.includes("No emails show any opens") || rec.includes("no opens")) {
        return (
          <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-800 mb-2">Email Tracking Not Working</h4>
                <p className="text-sm text-blue-700 mb-3">Your emails aren't recording opens/clicks. This usually means the webhook isn't receiving events.</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-blue-600" />
                    <span>First, try clicking "Setup Webhook" above</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-blue-600" />
                    <span>If that doesn't work, manually configure in SendGrid (see instructions below)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-blue-600" />
                    <span>Send a test email and check if tracking works</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (rec.includes("invalid_key") || rec.includes("Invalid")) {
        return (
          <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-800 mb-2">Invalid SendGrid API Key</h4>
                <p className="text-sm text-red-700 mb-3">Your SendGrid API key is invalid or has insufficient permissions.</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-red-600" />
                    <span>Check your API key in SendGrid dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-3 w-3 text-red-600" />
                    <span>Ensure it has "Mail Send" permissions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Skip rendering unrecognized recommendations instead of showing generic gray box
      console.log("Unrecognized recommendation pattern:", rec);
      return null;
    }).filter(Boolean); // Remove null entries
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

              {/* Actionable Recommendations */}
              {diagnostic.recommendations && diagnostic.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">What You Need To Do</h4>
                  <div className="space-y-3">
                    {renderActionableRecommendations(diagnostic.recommendations)}
                  </div>
                </div>
              )}

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
