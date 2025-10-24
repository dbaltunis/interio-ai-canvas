import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle } from "lucide-react";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendar";

export const GoogleCalendarSetup = () => {
  const { integration, isLoading, isConnected, connect, disconnect, isConnecting, isDisconnecting } = useGoogleCalendarIntegration();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <CardTitle>Google Calendar</CardTitle>
          {isConnected && (
            <Badge variant="default" className="ml-auto">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
        <CardDescription>
          Sync your appointments automatically with your Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="font-medium text-green-900 dark:text-green-100">Connected</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your appointments are syncing with Google Calendar
                </p>
              </div>
            </div>

            {integration && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Calendar</span>
                  <span className="font-medium">{integration.calendar_id || 'Primary Calendar'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Sync Status</span>
                  <span className="font-medium">
                    {integration.sync_enabled ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
            )}

            <Button
              variant="destructive"
              onClick={() => disconnect()}
              disabled={isDisconnecting}
              className="w-full"
            >
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect Calendar'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Google Calendar to automatically sync appointments. You'll be asked to authorize access to your calendar.
            </p>

            <Button
              onClick={() => connect({})}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
            </Button>

            <div className="space-y-2 text-sm text-muted-foreground pt-2 border-t">
              <p className="font-medium text-foreground">Benefits:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Automatic two-way sync</li>
                <li>Real-time calendar updates</li>
                <li>No manual entry needed</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};