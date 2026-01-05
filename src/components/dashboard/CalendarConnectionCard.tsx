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
      <Card variant="analytics" className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              Calendar
            </CardTitle>
            <Badge variant="secondary" className="text-green-700 text-xs shrink-0">
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-muted-foreground">
            Syncing appointments automatically
          </p>
          
          {integration.last_sync && (
            <p className="text-[10px] text-muted-foreground">
              Last synced: {formatDistanceToNow(new Date(integration.last_sync), { addSuffix: true })}
            </p>
          )}
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => syncFromGoogle()}
              disabled={isSyncingFromGoogle}
              className="h-7 gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncingFromGoogle ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => disconnect()}
              className="h-7 text-xs text-destructive hover:text-destructive"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="analytics" className="h-full border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Google Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-xs text-muted-foreground">
          Sync appointments across devices
        </p>
        
        <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
          <li>Two-way sync</li>
          <li>Get notifications</li>
        </ul>
        
        <Button
          onClick={() => connect({ useRedirect: false })}
          className="w-full h-8 text-xs"
          size="sm"
        >
          <Calendar className="h-3 w-3 mr-1.5" />
          Connect Calendar
        </Button>
      </CardContent>
    </Card>
  );
};
