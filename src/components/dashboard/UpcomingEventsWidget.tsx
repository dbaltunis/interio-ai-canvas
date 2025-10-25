import { useAppointments } from "@/hooks/useAppointments";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Video, CheckCircle2 } from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const UpcomingEventsWidget = () => {
  const { data: appointments, isLoading } = useAppointments();
  const { integration: calendarIntegration } = useGoogleCalendarIntegration();

  const upcomingAppointments = appointments
    ?.filter(apt => !isPast(new Date(apt.start_time)))
    ?.slice(0, 5) || [];

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d, yyyy");
  };


  if (isLoading) {
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
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Upcoming Events</span>
          </CardTitle>
          {calendarIntegration?.active && (
            <Badge variant="outline" className="text-xs shrink-0">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Synced</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-20" />
            <p className="text-xs sm:text-sm">No upcoming appointments</p>
            <Button variant="link" size="sm" className="mt-1 sm:mt-2 text-xs sm:text-sm">
              Schedule your first meeting
            </Button>
          </div>
        ) : (
          upcomingAppointments.map((apt) => {
            const startTime = new Date(apt.start_time);
            const endTime = new Date(apt.end_time);
            
            return (
              <div
                key={apt.id}
                className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center min-w-[50px] sm:min-w-[60px] pt-1">
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">
                    {format(startTime, "MMM")}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-foreground">
                    {format(startTime, "d")}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">
                    {apt.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="truncate">{format(startTime, "h:mm a")}</span>
                    </span>
                    {apt.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{apt.location}</span>
                      </span>
                    )}
                  </div>
                  {apt.description && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
                      {apt.description}
                    </p>
                  )}
                </div>
                
                <Badge variant={isToday(startTime) ? "default" : "secondary"} className="text-[10px] sm:text-xs shrink-0">
                  {getDateLabel(startTime)}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
