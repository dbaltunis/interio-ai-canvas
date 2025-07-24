import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";

const CalendarView = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Calendar</h1>
          <p className="text-muted-foreground">Manage appointments and scheduling</p>
        </div>
        
        <Button className="bg-brand-primary hover:bg-brand-accent text-white">
          <CalendarIcon className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Calendar Integration Ready</h3>
            <p className="text-muted-foreground mb-4">
              Calendar system is being initialized. Full functionality will be available shortly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;