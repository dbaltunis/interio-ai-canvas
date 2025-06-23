
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ChevronLeft, ChevronRight, Mail, Users } from "lucide-react";

const mockEvents = [
  {
    id: 1,
    title: "Client Consultation - Wilson Residence",
    date: "2024-01-20",
    time: "10:00 AM",
    type: "consultation",
    client: "Sarah Wilson"
  },
  {
    id: 2,
    title: "Installation - Chen Home",
    date: "2024-01-22",
    time: "2:00 PM", 
    type: "installation",
    client: "Michael Chen"
  },
  {
    id: 3,
    title: "Measurement - Thompson Office",
    date: "2024-01-25",
    time: "9:00 AM",
    type: "measurement",
    client: "Emma Thompson"
  }
];

export const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState("month");

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "consultation": return "bg-blue-100 text-blue-800";
      case "installation": return "bg-green-100 text-green-800";
      case "measurement": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">
            Manage appointments, installations, and project deadlines
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Button>
      </div>

      {/* Calendar Tabs */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>January 2024</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="month">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </TabsContent>
                <TabsContent value="week">
                  <div className="text-center py-8 text-muted-foreground">
                    Week view coming soon
                  </div>
                </TabsContent>
                <TabsContent value="day">
                  <div className="text-center py-8 text-muted-foreground">
                    Day view coming soon
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Your scheduled appointments and tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{event.time}</span>
                    </div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.client}</p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Mail className="mr-1 h-3 w-3" />
                        Remind
                      </Button>
                      <Button variant="outline" size="sm">
                        <Users className="mr-1 h-3 w-3" />
                        Invite
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
};
