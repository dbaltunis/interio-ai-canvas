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

  const getLocationIcon = (type?: string) => {
    if (type === "video") return <Video className="h-4 w-4" />;
    if (type === "in_person") return <MapPin className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
          {calendarIntegration?.active && (
            <Badge variant="outline" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Synced
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No upcoming appointments</p>
            <Button variant="link" size="sm" className="mt-2">
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
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center min-w-[60px] pt-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {format(startTime, "MMM")}
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {format(startTime, "d")}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate">
                    {apt.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                    </span>
                    {apt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {apt.location}
                      </span>
                    )}
                  </div>
                  {apt.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {apt.description}
                    </p>
                  )}
                </div>
                
                <Badge variant={isToday(startTime) ? "default" : "secondary"} className="text-xs">
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
