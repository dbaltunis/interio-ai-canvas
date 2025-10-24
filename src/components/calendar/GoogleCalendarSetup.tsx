import { useGoogleCalendarIntegration, useGoogleCalendarSync } from "@/hooks/useGoogleCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

export const GoogleCalendarSetup = () => {
  const { integration, isLoading, isConnected, connect, disconnect, isConnecting, isDisconnecting } = useGoogleCalendarIntegration();
  const { syncFromGoogle, isSyncingFromGoogle } = useGoogleCalendarSync();

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
              Sync your appointments with Google Calendar
            </CardDescription>
          </div>
          {isConnected && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-medium">Calendar ID:</p>
              <p className="text-sm text-muted-foreground font-mono break-all">
                {integration?.calendar_id || 'primary'}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => syncFromGoogle()} 
                variant="default"
                disabled={isSyncingFromGoogle}
                className="flex-1"
              >
                {isSyncingFromGoogle ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing Events...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Events from Google
                  </>
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
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Google Calendar to automatically sync appointments and keep everything in one place.
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
