import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Clock, User, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

export const RecentAppointmentsWidget = () => {
  const navigate = useNavigate();
  
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["recent-appointment-bookings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First get user's schedulers
      const { data: schedulers } = await supabase
        .from("appointment_schedulers")
        .select("id")
        .eq("user_id", user.id);

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
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            Recent Appointments
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
            <CalendarCheck className="h-4 w-4" />
            Recent Appointments
          </CardTitle>
          <Badge variant="outline" className="text-xs h-5">
            {bookings?.length || 0} Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!bookings || bookings.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CalendarCheck className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-xs">No appointments booked yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
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
                    className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                    onClick={() => navigate(`/?tab=calendar`)}
                  >
                    <div className="flex flex-col items-center justify-center w-[40px] h-[40px] shrink-0 rounded-lg bg-background border border-border shadow-sm">
                      <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">
                        {format(appointmentDate, "MMM")}
                      </span>
                      <span className="text-xl font-bold text-foreground leading-none">
                        {format(appointmentDate, "d")}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h4 className="font-semibold text-xs text-foreground truncate break-all">
                        {booking.customer_name}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span className="truncate">{booking.appointment_time} • {booking.scheduler?.name}</span>
                      </div>
                    </div>
                    
                    <Badge 
                      variant="secondary"
                      className="text-[10px] shrink-0 h-5 px-2 font-medium capitalize"
                      style={{
                        backgroundColor: statusColor.bg,
                        color: statusColor.text,
                        borderColor: statusColor.border
                      }}
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
