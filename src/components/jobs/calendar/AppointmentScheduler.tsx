
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, MapPin, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useClients } from "@/hooks/useClients";

interface AppointmentSchedulerProps {
  projectId: string;
}

export const AppointmentScheduler = ({ projectId }: AppointmentSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    title: "",
    description: "",
    appointmentType: "consultation",
    time: "",
    duration: "60",
    location: "",
    clientId: ""
  });

  const { toast } = useToast();
  const createAppointment = useCreateAppointment();
  const { data: clients } = useClients();

  const appointmentTypes = [
    { value: "consultation", label: "Consultation", icon: Users },
    { value: "measurement", label: "Measurement", icon: MapPin },
    { value: "installation", label: "Installation", icon: Clock },
    { value: "follow-up", label: "Follow-up", icon: Users },
  ];

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  const handleScheduleAppointment = async () => {
    if (!selectedDate || !appointmentData.title || !appointmentData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const startTime = new Date(selectedDate);
      const [hours, minutes] = appointmentData.time.split(':');
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + parseInt(appointmentData.duration));

      await createAppointment.mutateAsync({
        title: appointmentData.title,
        description: appointmentData.description,
        appointment_type: appointmentData.appointmentType as any,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        location: appointmentData.location,
        client_id: appointmentData.clientId || null,
        project_id: projectId,
        status: 'scheduled'
      });

      toast({
        title: "Appointment Scheduled",
        description: `${appointmentData.title} scheduled for ${selectedDate.toLocaleDateString()} at ${appointmentData.time}`,
      });

      setShowScheduleDialog(false);
      setAppointmentData({
        title: "",
        description: "",
        appointmentType: "consultation",
        time: "",
        duration: "60",
        location: "",
        clientId: ""
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
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Appointment Title *</Label>
                    <Input
                      value={appointmentData.title}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Initial Consultation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={appointmentData.appointmentType}
                      onValueChange={(value) => setAppointmentData(prev => ({ ...prev, appointmentType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Time *</Label>
                      <Select
                        value={appointmentData.time}
                        onValueChange={(value) => setAppointmentData(prev => ({ ...prev, time: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Duration (min)</Label>
                      <Select
                        value={appointmentData.duration}
                        onValueChange={(value) => setAppointmentData(prev => ({ ...prev, duration: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Select
                      value={appointmentData.clientId}
                      onValueChange={(value) => setAppointmentData(prev => ({ ...prev, clientId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={appointmentData.location}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Client's home, Office"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={appointmentData.description}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Additional notes or agenda items..."
                      rows={3}
                    />
                  </div>

                  {selectedDate && (
                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                      <p className="font-medium text-blue-800">Appointment Summary:</p>
                      <p className="text-blue-700">
                        {selectedDate.toLocaleDateString()} at {appointmentData.time || "..."} 
                        ({appointmentData.duration} minutes)
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleScheduleAppointment} disabled={createAppointment.isPending}>
                      {createAppointment.isPending ? "Scheduling..." : "Schedule Appointment"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                  Select a time slot to schedule an appointment
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {timeSlots.slice(0, 12).map((time) => (
                  <Button
                    key={time}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAppointmentData(prev => ({ ...prev, time }));
                      setShowScheduleDialog(true);
                    }}
                    className="text-xs"
                  >
                    {time}
                  </Button>
                ))}
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowScheduleDialog(true)}
                  className="text-blue-600"
                >
                  View all available times
                </Button>
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
    </div>
  );
};
