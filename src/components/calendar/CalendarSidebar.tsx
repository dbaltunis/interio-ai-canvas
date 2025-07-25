import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, isToday, addDays } from "date-fns";
import { useState } from "react";
import { Clock, MapPin, Settings, Link2 } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import { useAppointmentSchedulers } from "@/hooks/useAppointmentSchedulers";
import { useToast } from "@/hooks/use-toast";

interface CalendarSidebarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onBookingLinks: () => void;
}

export const CalendarSidebar = ({ currentDate, onDateChange, onBookingLinks }: CalendarSidebarProps) => {
  const [sidebarDate, setSidebarDate] = useState<Date | undefined>(currentDate);
  const { data: appointments } = useAppointments();
  const { data: schedulers } = useAppointmentSchedulers();
  const { toast } = useToast();

  // Get upcoming events (next 7 days)
  const upcomingEvents = appointments?.filter(appointment => {
    const eventDate = new Date(appointment.start_time);
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return eventDate >= today && eventDate <= nextWeek;
  }).slice(0, 5) || [];

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSidebarDate(date);
      onDateChange(date);
    }
  };

  return (
    <div className="w-80 border-r bg-background h-full flex flex-col space-y-4 p-4">
      {/* Mini Calendar - Moved up */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={sidebarDate}
            onSelect={handleDateSelect}
            className="rounded-md border-0 p-0"
            classNames={{
              months: "flex flex-col space-y-4",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
              day: "h-8 w-8 p-0 font-normal hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_hidden: "invisible",
            }}
          />
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <div key={event.id} className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                <div className="font-medium text-sm truncate">{event.title}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(event.start_time), 'MMM d, HH:mm')}
                </div>
                {event.location && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {event.location}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              No upcoming events
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};