import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  MapPin,
  Users 
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, isToday } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { cn } from "@/lib/utils";

export const MobileCalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthView, setShowMonthView] = useState(false);
  const { data: appointments = [] } = useAppointments();

  // Get next 7 days for week view
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate), i));
  
  // Filter appointments for selected date
  const dayAppointments = appointments.filter(apt => 
    apt.start_time && isSameDay(new Date(apt.start_time), selectedDate)
  );

  return (
    <div className="p-4 space-y-4">
      {/* Simplified Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{format(selectedDate, 'MMMM yyyy')}</h2>
          <p className="text-sm text-muted-foreground">
            {dayAppointments.length} {dayAppointments.length === 1 ? 'event' : 'events'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMonthView(!showMonthView)}
        >
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Week View Slider */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 grid grid-cols-7 gap-1">
              {weekDays.map((day, i) => {
                const isSelected = isSameDay(day, selectedDate);
                const hasEvents = appointments.some(apt => 
                  apt.start_time && isSameDay(new Date(apt.start_time), day)
                );
                
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors relative",
                      isSelected && "bg-primary text-primary-foreground",
                      !isSelected && isToday(day) && "bg-accent",
                      !isSelected && !isToday(day) && "hover:bg-muted"
                    )}
                  >
                    <span className="text-xs font-medium">
                      {format(day, 'EEE')}
                    </span>
                    <span className={cn(
                      "text-lg font-bold",
                      isSelected && "text-primary-foreground"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {hasEvents && !isSelected && (
                      <div className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Events */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
          {format(selectedDate, 'EEEE, MMMM d')}
        </h3>
        
        {dayAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No events scheduled</p>
            </CardContent>
          </Card>
        ) : (
          dayAppointments.map((apt) => (
            <Card key={apt.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{apt.title}</h4>
                      {apt.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {apt.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {apt.status || 'scheduled'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {apt.start_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(apt.start_time), 'h:mm a')}</span>
                      </div>
                    )}
                    {apt.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{apt.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <div className="h-1 bg-primary" />
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
