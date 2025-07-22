import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useEmailSettings } from "@/hooks/useEmailSettings";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const EmailValidationDiagnostics = () => {
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagnosticsResults, setDiagnosticsResults] = useState<any>(null);
  const { data: emailSettings } = useEmailSettings();
  const { hasSendGridIntegration } = useIntegrationStatus();
  const { toast } = useToast();

  const runCompleteDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      checks: []
    };

    try {
      // Check 1: Authentication
      const { data: { user } } = await supabase.auth.getUser();
      results.checks.push({
        name: "User Authentication",
        status: user ? "pass" : "fail",
        message: user ? `Authenticated as ${user.email}` : "No authenticated user"
      });

      if (!user) {
        setDiagnosticsResults(results);
        setIsRunningDiagnostics(false);
        return;
      }

      // Check 2: SendGrid Integration
      const { data: integration } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('integration_type', 'sendgrid')
        .eq('active', true)
        .maybeSingle();

      results.checks.push({
        name: "SendGrid Integration",
        status: integration ? "pass" : "fail",
        message: integration ? "SendGrid integration found and active" : "No active SendGrid integration"
      });

      // Check 3: Email Settings
      const { data: settings } = await supabase
        .from('email_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      results.checks.push({
        name: "Email Settings",
        status: settings && settings.from_email ? "pass" : "fail",
        message: settings ? `From email: ${settings.from_email}` : "No email settings configured"
      });

      // Check 4: SendGrid API Key Test
      let sendgridApiKey: string | null = null;
      
      // Safely extract API key from JSON field
      if (integration?.api_credentials && typeof integration.api_credentials === 'object' && integration.api_credentials !== null) {
        const credentials = integration.api_credentials as Record<string, any>;
        sendgridApiKey = credentials.api_key || null;
      }

      if (sendgridApiKey) {
        try {
          const response = await fetch("https://api.sendgrid.com/v3/user/profile", {
            headers: {
              "Authorization": `Bearer ${sendgridApiKey}`,
            },
          });
          
          results.checks.push({
            name: "SendGrid API Key",
            status: response.ok ? "pass" : "fail",
            message: response.ok ? "API key is valid" : `API key test failed: ${response.status}`
          });
        } catch (error) {
          results.checks.push({
            name: "SendGrid API Key",
            status: "fail",
            message: `API key test error: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      } else {
        results.checks.push({
          name: "SendGrid API Key",
          status: "fail",
          message: "No API key found in integration settings"
        });
      }

      // Check 5: Test Edge Function
      try {
        const { error } = await supabase.functions.invoke('send-email', {
          body: {
            test: true,
            to: "test@example.com",
            subject: "Test",
            html: "Test",
            emailId: "test"
          }
        });

        results.checks.push({
          name: "Send Email Function",
          status: "pass",
          message: "Edge function is accessible"
        });
      } catch (error) {
        results.checks.push({
          name: "Send Email Function",
          status: "fail",
          message: `Edge function error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

    } catch (error) {
      results.checks.push({
        name: "Diagnostics Error",
        status: "fail",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setDiagnosticsResults(results);
    setIsRunningDiagnostics(false);

    const failedChecks = results.checks.filter((check: any) => check.status === 'fail');
    if (failedChecks.length === 0) {
      toast({
        title: "All Checks Passed",
        description: "Email system is configured correctly",
      });
    } else {
      toast({
        title: "Issues Found",
        description: `${failedChecks.length} issues need attention`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-100 text-green-800">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      default:
        return <Badge variant="secondary">Warning</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Email System Diagnostics
          <Button 
            onClick={runCompleteDiagnostics}
            disabled={isRunningDiagnostics}
            size="sm"
          >
            {isRunningDiagnostics ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Diagnostics
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm font-medium">SendGrid Integration</span>
            {hasSendGridIntegration ? (
              <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
            ) : (
              <Badge variant="destructive">Not Connected</Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm font-medium">Email Settings</span>
            {emailSettings?.from_email ? (
              <Badge variant="default" className="bg-green-100 text-green-800">Configured</Badge>
            ) : (
              <Badge variant="destructive">Missing</Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm font-medium">Ready to Send</span>
            {hasSendGridIntegration && emailSettings?.from_email ? (
              <Badge variant="default" className="bg-green-100 text-green-800">Yes</Badge>
            ) : (
              <Badge variant="destructive">No</Badge>
            )}
          </div>
        </div>

        {/* Detailed Diagnostics Results */}
        {diagnosticsResults && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Detailed Results</h4>
              <span className="text-sm text-gray-500">
                Run at {new Date(diagnosticsResults.timestamp).toLocaleString()}
              </span>
            </div>
            
            {diagnosticsResults.checks.map((check: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(check.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{check.name}</span>
                    {getStatusBadge(check.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Common Issues and Solutions */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Common Issues:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Sender email not verified in SendGrid</li>
              <li>• Email settings not configured</li>
              <li>• SendGrid integration not set up</li>
              <li>• API key missing or invalid</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
