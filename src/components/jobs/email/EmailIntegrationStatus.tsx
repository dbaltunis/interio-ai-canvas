
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Mail, Settings } from "lucide-react";
import { useEmailSetupStatus } from "@/hooks/useIntegrationStatus";

export const EmailIntegrationStatus = () => {
  const { hasEmailSettings, hasSendGridIntegration, emailLimit, isLoading } = useEmailSetupStatus();

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-muted">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto animate-pulse" />
            <p className="text-muted-foreground">Loading email settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // New user - not configured yet
  if (!hasEmailSettings) {
    return (
      <Card className="border-blue-200">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Set Up Email Sending</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Configure your sender details to start sending emails to clients. Takes less than 1 minute.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button 
                size="lg"
                className="gap-2"
                onClick={() => { 
                  const url = new URL(window.location.href);
                  url.pathname = '/';
                  url.search = 'tab=settings&subtab=email';
                  window.location.href = url.toString();
                }}
              >
                <Settings className="h-4 w-4" />
                Set Up Now
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              ✓ {emailLimit} included • ✓ Advanced tracking • ✓ Ready in 1 minute
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Configured user - show simple status (don't need to refetch email settings, already have the info)
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
                {emailLimit}
              </Badge>
            </div>
            <p className="text-sm text-green-700 mb-3">
              Your email sending is configured and ready to use.
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
