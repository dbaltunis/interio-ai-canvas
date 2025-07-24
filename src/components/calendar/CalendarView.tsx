import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppointments } from "@/hooks/useAppointments";
import { CalendarEventDialog } from "./CalendarEventDialog";
import { AppointmentSchedulerManager } from "./AppointmentSchedulerManager";

export const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const { data: appointments = [], isLoading } = useAppointments();

  // Filter appointments for the selected date or current view
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.start_time), date)
    );
  };

  const getAppointmentsForMonth = () => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return aptDate >= start && aptDate <= end;
    });
  };

  const monthAppointments = getAppointmentsForMonth();
  const dayAppointments = getAppointmentsForDate(selectedDate);

  const renderMonthView = () => {
    const days = eachDayOfInterval({
      start: startOfMonth(selectedDate),
      end: endOfMonth(selectedDate)
    });

    return (
      <div className="grid grid-cols-7 gap-1 p-4">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map(day => {
          const dayAppointments = getAppointmentsForDate(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[100px] p-2 border border-border cursor-pointer hover:bg-muted/50 transition-colors",
                isSelected && "bg-brand-primary/10 border-brand-primary",
                isCurrentDay && "bg-blue-50 border-blue-200"
              )}
              onClick={() => setSelectedDate(day)}
            >
              <div className={cn(
                "text-sm font-medium mb-1",
                isCurrentDay && "text-blue-600",
                isSelected && "text-brand-primary"
              )}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map(apt => (
                  <div
                    key={apt.id}
                    className="text-xs p-1 bg-brand-primary/20 text-brand-primary rounded truncate cursor-pointer hover:bg-brand-primary/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAppointment(apt);
                      setShowEventDialog(true);
                    }}
                  >
                    {format(new Date(apt.start_time), 'HH:mm')} {apt.title}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="space-y-1 p-4">
        <div className="text-lg font-semibold mb-4">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </div>
        
        <div className="space-y-2">
          {hours.map(hour => {
            const hourAppointments = dayAppointments.filter(apt => 
              new Date(apt.start_time).getHours() === hour
            );
            
            return (
              <div key={hour} className="flex items-start gap-4 min-h-[50px] border-b border-border/50">
                <div className="w-16 text-sm text-muted-foreground pt-2">
                  {format(new Date().setHours(hour, 0), 'HH:mm')}
                </div>
                
                <div className="flex-1 space-y-1">
                  {hourAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className="p-2 bg-brand-primary/10 border border-brand-primary/20 rounded cursor-pointer hover:bg-brand-primary/20"
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setShowEventDialog(true);
                      }}
                    >
                      <div className="font-medium text-sm">{apt.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {format(new Date(apt.start_time), 'HH:mm')} - {format(new Date(apt.end_time), 'HH:mm')}
                        {apt.location && (
                          <>
                            <MapPin className="h-3 w-3" />
                            {apt.location}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Calendar</h1>
          <p className="text-muted-foreground">Manage appointments and scheduling</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setSelectedDate(newDate);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="px-4 py-2 text-lg font-semibold">
              {format(selectedDate, 'MMMM yyyy')}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setSelectedDate(newDate);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={() => {
              setSelectedAppointment(null);
              setShowEventDialog(true);
            }}
            className="bg-brand-primary hover:bg-brand-accent text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week" disabled>Week</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="schedulers">Schedulers</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {renderMonthView()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {renderDayView()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedulers" className="space-y-4">
          <AppointmentSchedulerManager />
        </TabsContent>
      </Tabs>

      {/* Today's Appointments Sidebar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {isToday(selectedDate) ? "Today's Appointments" : `Appointments for ${format(selectedDate, 'MMM d')}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading appointments...</div>
          ) : dayAppointments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No appointments scheduled
            </div>
          ) : (
            <div className="space-y-3">
              {dayAppointments.map(apt => (
                <div
                  key={apt.id}
                  className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedAppointment(apt);
                    setShowEventDialog(true);
                  }}
                >
                  <div className="font-medium">{apt.title}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {format(new Date(apt.start_time), 'HH:mm')} - {format(new Date(apt.end_time), 'HH:mm')}
                  </div>
                  {apt.location && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3" />
                      {apt.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Dialog */}
      <CalendarEventDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        appointment={selectedAppointment}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default CalendarView;