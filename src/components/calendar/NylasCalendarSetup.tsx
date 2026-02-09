import { useNylasCalendarIntegration, useNylasCalendarSync } from "@/hooks/useNylasCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export const NylasCalendarSetup = () => {
  const { integration, isLoading, isConnected, connect, disconnect, isConnecting, isDisconnecting, accountOwnerIntegration } = useNylasCalendarIntegration();
  const { syncFromNylas, isSyncingFromNylas } = useNylasCalendarSync();

  const displayIntegration = accountOwnerIntegration || integration;
  const isAccountOwnerConnection = !!accountOwnerIntegration && !integration;

  const providerLabel = integration?.provider === 'microsoft'
    ? 'Microsoft/Outlook'
    : integration?.provider === 'google'
      ? 'Google'
      : 'Calendar';

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
              Nylas Calendar (Google & Outlook)
            </CardTitle>
            <CardDescription>
              {isAccountOwnerConnection
                ? "Your account uses the owner's Nylas calendar integration"
                : isConnected
                  ? `Connected to ${providerLabel} via Nylas — syncing automatically`
                  : "Connect your Google or Outlook calendar via Nylas for seamless two-way sync"}
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
              Your organization's calendar is connected via Nylas. All appointments sync automatically.
            </AlertDescription>
          </Alert>
        )}

        {isConnected || isAccountOwnerConnection ? (
          <div className="space-y-4">
            {displayIntegration && (
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium">Connected Account:</p>
                <p className="text-sm text-muted-foreground">
                  {(displayIntegration as any).email || 'Connected Calendar'}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {(displayIntegration as any).provider === 'microsoft' ? 'Microsoft' : (displayIntegration as any).provider === 'google' ? 'Google' : 'Calendar'}
                  </Badge>
                  <Badge variant="outline">via Nylas</Badge>
                </div>
              </div>
            )}

            {displayIntegration?.last_sync && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last synced: {format(new Date(displayIntegration.last_sync), "PPp")}</span>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Two-Way Sync Active
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>Events you create here appear in your calendar</li>
                <li>Calendar events sync to InterioApp automatically</li>
                <li>Works with both Google and Microsoft calendars</li>
              </ul>
            </div>

            {!isAccountOwnerConnection && (
              <div className="flex gap-2">
                <Button
                  onClick={() => syncFromNylas()}
                  variant="outline"
                  disabled={isSyncingFromNylas}
                  className="flex-1"
                >
                  {isSyncingFromNylas ? (
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
                onClick={() => syncFromNylas()}
                variant="outline"
                disabled={isSyncingFromNylas}
                className="w-full"
              >
                {isSyncingFromNylas ? (
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
              Connect your Google or Microsoft/Outlook calendar through Nylas for automatic two-way sync. No separate Microsoft Azure setup needed.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => connect({ provider: 'google' })}
                disabled={isConnecting}
                size="lg"
                className="flex-1"
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

              <Button
                onClick={() => connect({ provider: 'microsoft' })}
                disabled={isConnecting}
                size="lg"
                variant="outline"
                className="flex-1"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Connect Outlook Calendar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
