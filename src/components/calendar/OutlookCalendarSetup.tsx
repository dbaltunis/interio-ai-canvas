import { useOutlookCalendarIntegration, useOutlookCalendarSync } from "@/hooks/useOutlookCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, XCircle, Clock, Mail, PauseCircle } from "lucide-react";
import { format } from "date-fns";

export const OutlookCalendarSetup = () => {
  const { integration, isLoading, isConnected, connect, disconnect, toggleSync, isConnecting, isDisconnecting, isTogglingSyncEnabled, accountOwnerIntegration } = useOutlookCalendarIntegration();
  const { syncFromOutlook, isSyncingFromOutlook } = useOutlookCalendarSync();

  const displayIntegration = accountOwnerIntegration || integration;
  const isAccountOwnerConnection = !!accountOwnerIntegration && !integration;
  const syncEnabled = displayIntegration?.sync_enabled ?? true;

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
              <Mail className="h-5 w-5" />
              Outlook Calendar
            </CardTitle>
            <CardDescription>
              {isAccountOwnerConnection
                ? "Your account uses the owner's Outlook Calendar integration"
                : isConnected
                ? "Your calendar is syncing automatically with Outlook Calendar"
                : "Connect your Outlook/Microsoft 365 Calendar to sync events automatically"}
            </CardDescription>
          </div>
          {isConnected && (
            <Badge variant={syncEnabled ? "default" : "secondary"} className="flex items-center gap-1">
              {syncEnabled ? <CheckCircle2 className="h-3 w-3" /> : <PauseCircle className="h-3 w-3" />}
              {syncEnabled ? "Auto-Sync Active" : "Sync Paused"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAccountOwnerConnection && (
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              Your organization's Outlook Calendar is connected. All appointments sync automatically.
            </AlertDescription>
          </Alert>
        )}

        {isConnected || isAccountOwnerConnection ? (
          <div className="space-y-4">
            {displayIntegration?.calendar_id && (
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium">Calendar:</p>
                <p className="text-sm text-muted-foreground">
                  {isAccountOwnerConnection
                    ? "Connected Calendar"
                    : displayIntegration.calendar_id === 'primary'
                      ? 'Primary Calendar'
                      : displayIntegration.calendar_id}
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
                Two-Way Sync Active
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>Events you create here appear in Outlook Calendar instantly</li>
                <li>Outlook Calendar events sync to InterioApp automatically</li>
                <li>Microsoft Teams meeting links are generated automatically</li>
              </ul>
            </div>

            {!isAccountOwnerConnection && (
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label>Automatic Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync events between InterioApp and Outlook
                  </p>
                </div>
                <Switch
                  checked={syncEnabled}
                  onCheckedChange={(checked) => toggleSync(checked)}
                  disabled={isTogglingSyncEnabled}
                />
              </div>
            )}

            {!isAccountOwnerConnection && (
              <div className="flex gap-2">
                <Button
                  onClick={() => syncFromOutlook()}
                  variant="outline"
                  disabled={isSyncingFromOutlook}
                  className="flex-1"
                >
                  {isSyncingFromOutlook ? (
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
                onClick={() => syncFromOutlook()}
                variant="outline"
                disabled={isSyncingFromOutlook}
                className="w-full"
              >
                {isSyncingFromOutlook ? (
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
              Connect your Microsoft 365 or Outlook account to automatically sync appointments. Events sync in both directions and Teams meeting links are generated automatically.
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
                  <Mail className="mr-2 h-4 w-4" />
                  Connect Outlook Calendar
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
