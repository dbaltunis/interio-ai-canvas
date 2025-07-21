
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

interface CalendarTabProps {
  projectId: string;
}

export const CalendarTab = ({ projectId }: CalendarTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Project Calendar</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium mb-2">No appointments scheduled</h3>
            <p className="text-gray-500 mb-4">
              Schedule consultations, measurements, and installation appointments for this project.
            </p>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule First Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
