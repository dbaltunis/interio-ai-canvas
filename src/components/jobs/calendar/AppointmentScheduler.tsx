
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { EventDialog } from "@/components/calendar/EventDialog";
import { useEventDialog } from "@/hooks/useEventDialog";

interface AppointmentSchedulerProps {
  projectId: string;
}

export const AppointmentScheduler = ({ projectId }: AppointmentSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const eventDialog = useEventDialog();
  const { toast } = useToast();
  const createAppointment = useCreateAppointment();

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  const handleScheduleAppointment = async (appointment: any) => {
    try {
      await createAppointment.mutateAsync({
        title: appointment.title,
        description: appointment.description,
        appointment_type: appointment.appointment_type,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        location: appointment.location,
        project_id: projectId,
        status: 'scheduled'
      });

      toast({
        title: "Appointment Scheduled",
        description: `${appointment.title} scheduled successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Appointment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Schedule Appointment</span>
            <Button
              size="sm"
              onClick={() => eventDialog.openCreate(selectedDate)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <p className="text-muted-foreground">
                  Click "Schedule" to create an appointment for this date
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {timeSlots.slice(0, 12).map((time) => (
                  <Button
                    key={time}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      eventDialog.openCreate(selectedDate);
                    }}
                    className="text-xs"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">
                Select a date from the calendar to see available time slots
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unified Event Dialog */}
      <EventDialog
        mode={eventDialog.mode}
        open={eventDialog.isOpen}
        onOpenChange={eventDialog.close}
        appointment={eventDialog.selectedAppointment}
        selectedDate={eventDialog.selectedDate}
        onSave={handleScheduleAppointment}
        onDelete={(appointmentId) => {
          console.log('Deleting appointment:', appointmentId);
          eventDialog.close();
        }}
        onModeChange={eventDialog.changeMode}
      />
    </div>
  );
};
