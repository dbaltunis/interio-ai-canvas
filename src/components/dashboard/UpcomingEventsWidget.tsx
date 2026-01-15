import { useAppointments } from "@/hooks/useAppointments";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Video, CheckCircle2 } from "lucide-react";
import { PixelCalendarIcon } from "@/components/icons/PixelArtIcons";
import { format, isToday, isTomorrow, isPast, isWithinInterval, addHours } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useHasPermission } from "@/hooks/usePermissions";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export const UpcomingEventsWidget = () => {
  const navigate = useNavigate();
  const canViewCalendar = useHasPermission('view_calendar');
  const { data: userPreferences } = useUserPreferences();
  
  // Only fetch appointments if user has calendar permission
  const { data: appointments, isLoading } = useAppointments();
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const { integration: calendarIntegration } = useGoogleCalendarIntegration();
  
  // Don't show widget at all if no calendar permission
  if (canViewCalendar === false) {
    return null;
  }

  // Get user timezone and date format preferences
  const userTimezone = userPreferences?.timezone || 'UTC';
  const userDateFormat = userPreferences?.date_format || 'MM/dd/yyyy';
  const userTimeFormat = userPreferences?.time_format || '12h';
  
  // Convert date format to date-fns format
  const convertToDateFnsFormat = (format: string) => {
    const formatMap: Record<string, string> = {
      'MM/dd/yyyy': 'MM/dd/yyyy',
      'dd/MM/yyyy': 'dd/MM/yyyy',
      'yyyy-MM-dd': 'yyyy-MM-dd',
      'dd-MMM-yyyy': 'dd-MMM-yyyy',
    };
    return formatMap[format] || 'MM/dd/yyyy';
  };
  
  const dateFnsFormat = convertToDateFnsFormat(userDateFormat);
  const timeFnsFormat = userTimeFormat === '24h' ? 'HH:mm' : 'h:mm a';

  // Filter events to only show those within the next 24 hours (in user's timezone)
  const now = new Date();
  const next24Hours = addHours(now, 24);
  
  const upcomingAppointments = appointments
    ?.filter(apt => {
      const startTime = toZonedTime(new Date(apt.start_time), userTimezone);
      return isWithinInterval(startTime, { start: now, end: next24Hours });
    }) || [];

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return formatInTimeZone(date, userTimezone, "MMM d, yyyy");
  };

  if (isLoading || canViewCalendar === undefined) {
    return (
      <Card variant="analytics">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="analytics" className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Upcoming Events
          </CardTitle>
          {calendarIntegration?.active && (
            <Badge variant="secondary" className="text-xs h-5">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Synced
            </Badge>
          )}
        </div>
      </CardHeader>
        <CardContent className="pt-0">
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex justify-center mb-3">
              <PixelCalendarIcon size={48} />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Your schedule is clear</p>
            <p className="text-xs text-muted-foreground">No upcoming appointments</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-3">
            <div className="space-y-1.5">
              {upcomingAppointments.map((apt) => {
            // Convert UTC time to user's timezone for display
            const startTime = toZonedTime(new Date(apt.start_time), userTimezone);
            const dateLabel = getDateLabel(startTime);
            
            return (
              <div
                key={apt.id}
                className="flex items-center gap-2 p-2 rounded-md bg-background border border-border/50 hover:bg-muted/50 transition-all cursor-pointer"
                onClick={() => navigate(`/?tab=calendar&eventId=${apt.id}`)}
              >
                <div className="flex flex-col items-center justify-center min-w-[36px] h-[36px] rounded-md bg-muted/50 border border-border/50">
                  <span className="text-[8px] font-medium text-muted-foreground uppercase">
                    {formatInTimeZone(new Date(apt.start_time), userTimezone, "MMM")}
                  </span>
                  <span className="text-sm font-semibold text-foreground leading-none">
                    {formatInTimeZone(new Date(apt.start_time), userTimezone, "d")}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-xs text-foreground line-clamp-1">
                    {apt.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5 shrink-0" />
                    <span>{formatInTimeZone(new Date(apt.start_time), userTimezone, timeFnsFormat)}</span>
                  </div>
                </div>
                
                <Badge 
                  variant="secondary" 
                  className="text-[10px] shrink-0 h-5 px-1.5 font-medium"
                >
                  {dateLabel}
                </Badge>
              </div>
            );
          })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
