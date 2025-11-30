
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Mail, Settings, AlertTriangle } from "lucide-react";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { useEmailSettings } from "@/hooks/useEmailSettings";

export const EmailIntegrationStatus = () => {
  const { hasSendGridIntegration } = useIntegrationStatus();
  const { data: emailSettings } = useEmailSettings();

  // Email service is always ready - show clean status
  const senderInfo = emailSettings?.from_name && emailSettings?.from_email
    ? `${emailSettings.from_name} (${emailSettings.from_email})`
    : 'Default sender (noreply@interioapp.com)';

  if (!emailSettings) {
    // New user - show ready status with customize option
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-green-900">✅ Email Service Ready</h3>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  500/month
                </Badge>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Using default sender (noreply@interioapp.com)
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 bg-white hover:bg-gray-50"
                onClick={() => { 
                  const url = new URL(window.location.href);
                  url.pathname = '/';
                  url.search = 'tab=settings&subtab=email';
                  window.location.href = url.toString();
                }}
              >
                <Settings className="h-3 w-3" />
                Customize Sender
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Configured user - show simple status
  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-green-900">Email Service Active</h3>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                {hasSendGridIntegration ? 'Unlimited' : '500/month'}
              </Badge>
            </div>
            <p className="text-sm text-green-700 mb-3">
              Sending as <span className="font-medium">{emailSettings.from_name}</span> ({emailSettings.from_email})
            </p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 bg-white hover:bg-gray-50"
                onClick={() => { 
                  const url = new URL(window.location.href);
                  url.pathname = '/';
                  url.search = 'tab=settings&subtab=email';
                  window.location.href = url.toString();
                }}
              >
                <Settings className="h-3 w-3" />
                Settings
              </Button>
              {!hasSendGridIntegration && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white hover:bg-gray-50"
                  onClick={() => { 
                    const url = new URL(window.location.href);
                    url.pathname = '/';
                    url.search = 'tab=settings&subtab=integrations';
                    window.location.href = url.toString();
                  }}
                >
                  Upgrade to Unlimited
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
