
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Edit, Trash2, ExternalLink } from "lucide-react";
import { useAppointments, useDeleteAppointment } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { useGoogleCalendarSync } from "@/hooks/useGoogleCalendar";
import { format } from "date-fns";

interface AppointmentsListProps {
  projectId: string;
}

export const AppointmentsList = ({ projectId }: AppointmentsListProps) => {
  const { data: appointments, isLoading } = useAppointments();
  const deleteAppointment = useDeleteAppointment();
  const { syncToGoogle, syncFromGoogle, isSyncingToGoogle, isSyncingFromGoogle } = useGoogleCalendarSync();
  const { toast } = useToast();

  const projectAppointments = appointments?.filter(apt => apt.project_id === projectId) || [];

  const getAppointmentTypeColor = (type: string) => {
    const colors = {
      consultation: "bg-blue-100 text-blue-800",
      measurement: "bg-green-100 text-green-800",
      installation: "bg-orange-100 text-orange-800",
      "follow-up": "bg-purple-100 text-purple-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      await deleteAppointment.mutateAsync(appointmentId);
      toast({
        title: "Appointment Deleted",
        description: "The appointment has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive"
      });
    }
  };

  const handleSyncToGoogle = (appointmentId: string) => {
    syncToGoogle(appointmentId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading appointments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Google Calendar Sync
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => syncFromGoogle()}
                disabled={isSyncingFromGoogle}
              >
                {isSyncingFromGoogle ? "Syncing..." : "Import from Google"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Appointments ({projectAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projectAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No appointments scheduled</h3>
              <p className="text-muted-foreground">
                Schedule your first appointment using the calendar above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {projectAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{appointment.title}</h4>
                        <div className="flex gap-2">
                          <Badge className={getAppointmentTypeColor(appointment.appointment_type || '')}>
                            {appointment.appointment_type}
                          </Badge>
                          <Badge className={getStatusColor(appointment.status || '')}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(appointment.start_time), 'MMM d, yyyy')} at{' '}
                            {format(new Date(appointment.start_time), 'h:mm a')}
                          </span>
                        </div>
                        {appointment.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{appointment.location}</span>
                          </div>
                        )}
                      </div>

                      {appointment.description && (
                        <p className="text-sm text-muted-foreground">
                          {appointment.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSyncToGoogle(appointment.id)}
                        disabled={isSyncingToGoogle}
                        title="Sync to Google Calendar"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Edit appointment"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        title="Delete appointment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
