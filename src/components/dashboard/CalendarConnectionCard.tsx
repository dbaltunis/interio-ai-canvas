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
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 shrink-0" />
              <span className="truncate">Calendar Connected</span>
            </CardTitle>
            <Badge variant="outline" className="text-green-700 border-green-300 text-xs shrink-0">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Syncing appointments automatically
          </p>
          
          {integration.last_sync && (
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Last synced: {formatDistanceToNow(new Date(integration.last_sync), { addSuffix: true })}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => syncFromGoogle()}
              disabled={isSyncingFromGoogle}
              className="flex items-center gap-2 text-xs"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isSyncingFromGoogle ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Now</span>
              <span className="sm:hidden">Sync</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => disconnect()}
              className="text-destructive hover:text-destructive text-xs"
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
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="truncate">Connect Google Calendar</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Sync appointments across all your devices
        </p>
        
        <ul className="text-[10px] sm:text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Two-way sync</li>
          <li className="hidden sm:list-item">View in your calendar app</li>
          <li>Get notifications</li>
        </ul>
        
        <Button
          onClick={() => connect({ useRedirect: false })}
          className="w-full flex items-center gap-2 text-xs sm:text-sm"
          size="sm"
        >
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
          Connect Calendar
        </Button>
      </CardContent>
    </Card>
  );
};
