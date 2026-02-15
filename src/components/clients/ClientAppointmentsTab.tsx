import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, MapPin, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isPast, isToday } from "date-fns";

interface ClientAppointmentsTabProps {
  clientId: string;
}

export const ClientAppointmentsTab = ({ clientId }: ClientAppointmentsTabProps) => {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['client-appointments', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_id', clientId)
        .order('start_time', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-4">Loading appointments...</div>;
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No appointments scheduled for this client</p>
        <p className="text-xs mt-1">Schedule services from a job to create appointments</p>
      </div>
    );
  }

  const getStatusColor = (startTime: string, endTime: string, status?: string) => {
    if (status === 'cancelled') return 'bg-red-100 text-red-700';
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (isToday(new Date(startTime))) return 'bg-blue-100 text-blue-700';
    if (isPast(new Date(endTime))) return 'bg-gray-100 text-gray-600';
    return 'bg-primary/10 text-primary';
  };

  const getStatusLabel = (startTime: string, endTime: string, status?: string) => {
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'completed') return 'Completed';
    if (isToday(new Date(startTime))) return 'Today';
    if (isPast(new Date(endTime))) return 'Past';
    return 'Upcoming';
  };

  const getTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      consultation: 'Consultation',
      measurement: 'Measurement',
      installation: 'Installation',
      'follow-up': 'Follow-up',
      follow_up: 'Follow-up',
      reminder: 'Reminder',
      meeting: 'Meeting',
      call: 'Call',
    };
    return labels[type || ''] || type || 'Appointment';
  };

  return (
    <div className="space-y-2">
      {appointments.map((apt: any) => (
        <div key={apt.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
          <div className="flex flex-col items-center min-w-[44px] text-center">
            <span className="text-xs text-muted-foreground font-medium">
              {format(new Date(apt.start_time), 'MMM')}
            </span>
            <span className="text-lg font-bold leading-tight">
              {format(new Date(apt.start_time), 'd')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-sm truncate">{apt.title}</span>
              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${getStatusColor(apt.start_time, apt.end_time, apt.status)}`}>
                {getStatusLabel(apt.start_time, apt.end_time, apt.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(apt.start_time), 'h:mm a')} – {format(new Date(apt.end_time), 'h:mm a')}
              </span>
              <span className="text-[10px] px-1.5 py-0 rounded bg-muted">
                {getTypeLabel(apt.appointment_type)}
              </span>
            </div>
            {apt.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{apt.location}</span>
              </div>
            )}
            {apt.video_meeting_link && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Video className="h-3 w-3" />
                <span>Video meeting</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
