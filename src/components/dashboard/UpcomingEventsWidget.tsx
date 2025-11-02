import { useAppointments } from "@/hooks/useAppointments";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Video, CheckCircle2 } from "lucide-react";
import { format, isToday, isTomorrow, isPast, isWithinInterval, addHours } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useHasPermission } from "@/hooks/usePermissions";

export const UpcomingEventsWidget = () => {
  const navigate = useNavigate();
  const canViewCalendar = useHasPermission('view_calendar');
  
  // Only fetch appointments if user has calendar permission
  const { data: appointments, isLoading } = useAppointments();
  
  // Don't show widget at all if no calendar permission
  if (canViewCalendar === false) {
    return null;
  }
  const { integration: calendarIntegration } = useGoogleCalendarIntegration();

  // Filter events to only show those within the next 24 hours
  const now = new Date();
  const next24Hours = addHours(now, 24);
  
  const upcomingAppointments = appointments
    ?.filter(apt => {
      const startTime = new Date(apt.start_time);
      return isWithinInterval(startTime, { start: now, end: next24Hours });
    }) || [];

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d, yyyy");
  };

  if (isLoading || canViewCalendar === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-14 sm:h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Calendar className="h-4 w-4" />
            Upcoming Events
          </CardTitle>
          {calendarIntegration?.active && (
            <Badge variant="outline" className="text-xs h-5">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Synced
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-xs">No upcoming appointments</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {upcomingAppointments.map((apt) => {
            const startTime = new Date(apt.start_time);
            const dateLabel = getDateLabel(startTime);
            
            return (
              <div
                key={apt.id}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg bg-background border border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                onClick={() => navigate(`/?tab=calendar&eventId=${apt.id}`)}
              >
                <div className="flex flex-col items-center justify-center min-w-[40px] sm:min-w-[50px] h-[40px] sm:h-[50px] rounded-lg bg-background border border-border shadow-sm">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {format(startTime, "MMM")}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-foreground leading-none">
                    {format(startTime, "d")}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground break-words line-clamp-1 sm:line-clamp-2">
                    {apt.title}
                  </h4>
                  <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                    <span className="whitespace-nowrap">{format(startTime, "h:mm a")}</span>
                  </div>
                </div>
                
                <Badge 
                  variant={isToday(startTime) ? "default" : "secondary"} 
                  className="text-[10px] sm:text-xs shrink-0 h-5 sm:h-6 px-1.5 sm:px-2.5 flex items-center justify-center font-medium"
                  style={isToday(startTime) ? {} : isTomorrow(startTime) ? { 
                    backgroundColor: 'hsl(var(--primary) / 0.15)',
                    color: 'hsl(var(--primary))',
                    borderColor: 'hsl(var(--primary) / 0.3)'
                  } : {}}
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
