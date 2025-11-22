
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Mail, Settings, AlertTriangle } from "lucide-react";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { useEmailSettings } from "@/hooks/useEmailSettings";

export const EmailIntegrationStatus = () => {
  const { hasSendGridIntegration, integrationData } = useIntegrationStatus();
  const { data: emailSettings } = useEmailSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Integration Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Service Status - Always Ready */}
        <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Email Service</p>
              <p className="text-sm text-green-700">
                Built-in email service ready (500 emails/month included) with advanced tracking
              </p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ready</Badge>
        </div>

        {/* Custom SendGrid Status - Optional */}
        {hasSendGridIntegration && (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Custom SendGrid (Premium)</p>
                <p className="text-sm text-blue-700">
                  Using your own SendGrid for unlimited emails
                </p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>
          </div>
        )}

        {/* Email Settings Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            {emailSettings ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            <div>
              <p className="font-medium">Email Settings</p>
              <p className="text-sm text-gray-600">
                {emailSettings 
                  ? `From: ${emailSettings.from_name} <${emailSettings.from_email}>` 
                  : "Default sender information not configured"
                }
              </p>
            </div>
          </div>
          <Badge variant={emailSettings ? "default" : "secondary"}>
            {emailSettings ? "Configured" : "Default"}
          </Badge>
        </div>

        {/* Status Alerts - Only show if email settings not configured */}
        {!emailSettings && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="space-y-2">
                <p className="font-medium">Configure Your Sender Details</p>
                <p>Set up your sender name and email to personalize emails sent to clients.</p>
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => { 
                    const url = new URL(window.location.href);
                    url.pathname = '/settings';
                    url.search = '';
                    window.location.href = url.toString();
                  }}
                >
                  Configure Email Settings
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => { 
              const url = new URL(window.location.href);
              url.pathname = '/';
              url.search = 'tab=settings&subtab=email';
              window.location.href = url.toString();
            }}
          >
            <Settings className="h-4 w-4" />
            Email Settings
          </Button>
          {!hasSendGridIntegration && (
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => { 
                const url = new URL(window.location.href);
                url.pathname = '/';
                url.search = 'tab=settings&subtab=integrations';
                window.location.href = url.toString();
              }}
            >
              <Mail className="h-4 w-4" />
              Upgrade to Custom SendGrid
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
