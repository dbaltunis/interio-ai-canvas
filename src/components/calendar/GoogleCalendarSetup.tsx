import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, ExternalLink, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendar";

export const GoogleCalendarSetup = () => {
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const { integration, isLoading, isConnected, connect, disconnect, isConnecting, isDisconnecting } = useGoogleCalendarIntegration();

  const setupSteps = [
    {
      title: "Go to Google Cloud Console",
      description: "Visit console.cloud.google.com and create a new project or select an existing one",
      action: "Open Console",
      url: "https://console.cloud.google.com"
    },
    {
      title: "Enable Calendar API",
      description: "In the APIs & Services section, enable the Google Calendar API for your project",
      action: "Find APIs",
      url: "https://console.cloud.google.com/apis/library"
    },
    {
      title: "Create OAuth Credentials",
      description: "Create OAuth 2.0 Client ID credentials for a web application",
      action: "Create Credentials",
      url: "https://console.cloud.google.com/apis/credentials"
    },
    {
      title: "Configure OAuth Consent",
      description: "Set up the OAuth consent screen with your app information",
      action: "Configure Consent",
      url: "https://console.cloud.google.com/apis/credentials/consent"
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading Google Calendar status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-primary" />
          <div className="flex-1">
            Google Calendar
            {isConnected ? (
              <Badge className="ml-2" variant="default">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge className="ml-2" variant="secondary">
                Not Connected
              </Badge>
            )}
          </div>
          <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Google Calendar Setup Guide</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    To connect Google Calendar, you need to set up OAuth credentials in Google Cloud Console.
                    This is a one-time setup required for security.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  {setupSteps.map((step, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="min-w-[24px] h-6 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{step.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => window.open(step.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            {step.action}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> After creating credentials, you'll need to add your Client ID and Client Secret 
                    to the Supabase secrets. Contact your administrator for help with this step.
                  </AlertDescription>
                </Alert>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect your Google Calendar to automatically sync appointments and events between InteriorApp and Gmail.
        </p>

        {isConnected ? (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Connected to Google Calendar</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Your appointments will automatically sync with Google Calendar
              </p>
            </div>
            
            {integration && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Calendar ID: {integration.calendar_id || 'Primary'}</p>
                <p>Sync Status: {integration.sync_enabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => disconnect()}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Google Calendar integration requires OAuth setup. Click the setup guide above for instructions.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => connect()}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? "Connecting..." : "Connect Google Calendar"}
            </Button>
            
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">What you get:</p>
              <ul className="space-y-1 ml-3">
                <li>• Automatic appointment sync</li>
                <li>• Two-way calendar integration</li>
                <li>• Real-time updates</li>
                <li>• No manual export/import needed</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};