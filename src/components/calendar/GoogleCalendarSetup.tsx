import { useGoogleCalendarIntegration, useGoogleCalendarSync } from "@/hooks/useGoogleCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export const GoogleCalendarSetup = () => {
  const { integration, isLoading, isConnected, connect, disconnect, isConnecting, isDisconnecting, accountOwnerIntegration } = useGoogleCalendarIntegration();
  const { syncFromGoogle, isSyncingFromGoogle } = useGoogleCalendarSync();
  
  // Show account owner's integration status if user is not owner
  const displayIntegration = accountOwnerIntegration || integration;
  const isAccountOwnerConnection = !!accountOwnerIntegration && !integration;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Google Calendar
            </CardTitle>
            <CardDescription>
              {isAccountOwnerConnection
                ? "Your account uses the owner's Google Calendar integration"
                : isConnected 
                ? "Your calendar is syncing automatically with Google Calendar" 
                : "Connect your Google Calendar to sync events automatically"}
            </CardDescription>
          </div>
          {isConnected && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Auto-Sync Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAccountOwnerConnection && (
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              Your organization's Google Calendar is connected. All appointments sync automatically.
            </AlertDescription>
          </Alert>
        )}
        
        {isConnected || isAccountOwnerConnection ? (
          <div className="space-y-4">
            {displayIntegration?.calendar_id && (
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium">Calendar ID:</p>
                <p className="text-sm text-muted-foreground font-mono break-all">
                  {displayIntegration.calendar_id}
                </p>
                {isAccountOwnerConnection && (
                  <Badge variant="secondary" className="mt-2">Account Owner's Calendar</Badge>
                )}
              </div>
            )}
            
            {displayIntegration && (displayIntegration as any).last_sync && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last synced: {format(new Date((displayIntegration as any).last_sync), "PPp")}</span>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                ✨ Automatic Two-Way Sync Active
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Events you create here appear in Google Calendar instantly</li>
                <li>• Google Calendar events sync to InterioApp automatically</li>
                <li>• Changes made in either place are reflected everywhere</li>
              </ul>
            </div>

            {!isAccountOwnerConnection && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => syncFromGoogle()} 
                  variant="outline"
                  disabled={isSyncingFromGoogle}
                  className="flex-1"
                >
                  {isSyncingFromGoogle ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    "Manual Sync Now"
                  )}
                </Button>
                
                <Button 
                  onClick={() => disconnect()} 
                  variant="destructive"
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    'Disconnect'
                  )}
                </Button>
              </div>
            )}
            
            {isAccountOwnerConnection && (
              <Button 
                onClick={() => syncFromGoogle()} 
                variant="outline"
                disabled={isSyncingFromGoogle}
                className="w-full"
              >
                {isSyncingFromGoogle ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  "Manual Sync Now"
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4" />
              <span>Not connected</span>
            </div>

            <p className="text-sm text-muted-foreground">
              Connect your Google Calendar to automatically sync appointments and keep everything in one place. Events sync in both directions automatically.
            </p>
            
            <Button 
              onClick={() => connect({})} 
              disabled={isConnecting}
              size="lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Connect Google Calendar
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
