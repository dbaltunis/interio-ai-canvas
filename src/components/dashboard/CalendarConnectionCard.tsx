import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendar";
import { useGoogleCalendarSync } from "@/hooks/useGoogleCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const CalendarConnectionCard = () => {
  const { integration, connect, disconnect } = useGoogleCalendarIntegration();
  const { syncFromGoogle, isSyncingFromGoogle } = useGoogleCalendarSync();

  const isConnected = integration?.active;

  if (isConnected) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Google Calendar Connected
            </CardTitle>
            <Badge variant="outline" className="text-green-700 border-green-300">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Your calendar is syncing appointments automatically
          </p>
          
          {integration.last_sync && (
            <p className="text-xs text-muted-foreground">
              Last synced: {formatDistanceToNow(new Date(integration.last_sync), { addSuffix: true })}
            </p>
          )}
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => syncFromGoogle()}
              disabled={isSyncingFromGoogle}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncingFromGoogle ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => disconnect()}
              className="text-destructive hover:text-destructive"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-5 w-5" />
          Connect Google Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Sync your appointments with Google Calendar to stay organized across all your devices
        </p>
        
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Two-way sync keeps everything up to date</li>
          <li>View appointments in your favorite calendar app</li>
          <li>Get notifications on all your devices</li>
        </ul>
        
        <Button
          onClick={() => connect({ useRedirect: false })}
          className="w-full flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Connect Calendar
        </Button>
      </CardContent>
    </Card>
  );
};
