
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentScheduler } from "../calendar/AppointmentScheduler";
import { AppointmentsList } from "../calendar/AppointmentsList";
import { CalendarIntegrationCard } from "../calendar/CalendarIntegrationCard";

interface CalendarTabProps {
  projectId: string;
}

export const CalendarTab = ({ projectId }: CalendarTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Project Calendar & Appointments</h2>
      </div>

      {/* Google Calendar Integration Status */}
      <CalendarIntegrationCard />

      {/* Appointment Scheduler */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule New Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentScheduler projectId={projectId} />
        </CardContent>
      </Card>

      {/* Appointments List */}
      <AppointmentsList projectId={projectId} />
    </div>
  );
};
