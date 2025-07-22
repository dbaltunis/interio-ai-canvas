
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
        {/* SendGrid Integration Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            {hasSendGridIntegration ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p className="font-medium">SendGrid Integration</p>
              <p className="text-sm text-gray-600">
                {hasSendGridIntegration 
                  ? "Email service is configured and ready" 
                  : "Email service not configured"
                }
              </p>
            </div>
          </div>
          <Badge variant={hasSendGridIntegration ? "default" : "destructive"}>
            {hasSendGridIntegration ? "Connected" : "Not Connected"}
          </Badge>
        </div>

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

        {/* Status Alerts */}
        {!hasSendGridIntegration && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Email functionality is limited without SendGrid integration. 
              Please configure your email service in Settings to send emails.
            </AlertDescription>
          </Alert>
        )}

        {!emailSettings && hasSendGridIntegration && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Email settings are required for sending emails. Please configure your verified sender email address in Settings → Email Settings.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Email Settings
          </Button>
          {!hasSendGridIntegration && (
            <Button className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Configure SendGrid
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
