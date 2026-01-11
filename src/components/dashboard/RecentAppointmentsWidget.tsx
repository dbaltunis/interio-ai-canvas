import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Clock, User, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useHasPermission } from "@/hooks/usePermissions";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

export const RecentAppointmentsWidget = () => {
  const navigate = useNavigate();
  const canViewCalendar = useHasPermission('view_calendar');
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["recent-appointment-bookings", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      // First get user's schedulers
      const { data: schedulers } = await supabase
        .from("appointment_schedulers")
        .select("id")
        .eq("user_id", effectiveOwnerId);

      if (!schedulers || schedulers.length === 0) return [];

      const schedulerIds = schedulers.map(s => s.id);

      // Then get bookings for those schedulers
      const { data, error } = await supabase
        .from("appointments_booked")
        .select(`
          *,
          scheduler:appointment_schedulers(
            id,
            name,
            slug,
            duration
          )
        `)
        .in("scheduler_id", schedulerIds)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: canViewCalendar === true && !!effectiveOwnerId, // Only fetch if user has calendar permission
  });

  // Don't show widget at all if no calendar permission - AFTER all hooks are called
  if (canViewCalendar === false) {
    return null;
  }

  if (isLoading || canViewCalendar === undefined) {
    return (
      <Card variant="analytics">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Bell className="h-4 w-4" />
            Recent Appointments
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
            <Bell className="h-4 w-4 text-primary" />
            Recent Appointments
          </CardTitle>
          <Badge variant="secondary" className="text-xs h-5">
            {bookings?.length || 0} Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!bookings || bookings.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-1.5 opacity-20" />
            <p className="text-xs">No appointments booked yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-3">
            <div className="space-y-1.5">
              {bookings.map((booking) => {
                const appointmentDate = parseISO(booking.appointment_date);
                
                return (
                <div
                  key={booking.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-background border border-border/50 hover:bg-muted/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/?tab=calendar`)}
                >
                  <div className="flex flex-col items-center justify-center min-w-[36px] h-[36px] rounded-md bg-muted/50 border border-border/50 shrink-0">
                    <span className="text-[8px] font-medium text-muted-foreground uppercase">
                      {format(appointmentDate, "MMM")}
                    </span>
                    <span className="text-sm font-semibold text-foreground leading-none">
                      {format(appointmentDate, "d")}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs text-foreground line-clamp-1">
                      {booking.customer_name}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5 shrink-0" />
                      <span className="line-clamp-1">
                        {booking.appointment_time} • {booking.scheduler?.name || 'Appointment'}
                      </span>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="secondary"
                    className="text-[10px] h-5 px-1.5 font-medium capitalize shrink-0"
                  >
                    {booking.status}
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
