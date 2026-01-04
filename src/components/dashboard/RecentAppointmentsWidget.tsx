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
  
  // Don't show widget at all if no calendar permission
  if (canViewCalendar === false) {
    return null;
  }
  
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
                const statusColors = {
                  confirmed: { bg: 'hsl(var(--primary) / 0.15)', text: 'hsl(var(--primary))', border: 'hsl(var(--primary) / 0.3)' },
                  pending: { bg: 'hsl(var(--warning) / 0.15)', text: 'hsl(var(--warning))', border: 'hsl(var(--warning) / 0.3)' },
                  cancelled: { bg: 'hsl(var(--destructive) / 0.15)', text: 'hsl(var(--destructive))', border: 'hsl(var(--destructive) / 0.3)' },
                };
                const statusColor = statusColors[booking.status as keyof typeof statusColors] || statusColors.pending;
                
                return (
                <div
                  key={booking.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                  onClick={() => navigate(`/?tab=calendar`)}
                >
                  <div className="flex flex-col items-center justify-center min-w-[50px] w-[50px] h-[50px] rounded-lg bg-primary/5 border border-primary/20 shadow-sm shrink-0">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {format(appointmentDate, "MMM")}
                    </span>
                    <span className="text-2xl font-bold text-foreground leading-none">
                      {format(appointmentDate, "d")}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Bell className="h-3.5 w-3.5 text-primary shrink-0" />
                      <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                        {booking.customer_name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span className="line-clamp-1">
                        {booking.appointment_time} • {booking.scheduler?.name || 'Appointment'}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Badge 
                        variant="secondary"
                        className="text-[10px] h-5 px-2.5 font-medium capitalize"
                        style={{
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          borderColor: statusColor.border
                        }}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
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
