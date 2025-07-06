
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  type: 'appointment' | 'reminder' | 'client_meeting';
  color: string;
  client_name?: string;
  location?: string;
}

interface CalendarGridProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export const CalendarGrid = ({ 
  events, 
  selectedDate, 
  onDateSelect, 
  onEventClick, 
  onTimeSlotClick 
}: CalendarGridProps) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start_time), date)
    );
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-500';
      case 'reminder': return 'bg-orange-500';
      case 'client_meeting': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b">
          {day}
        </div>
      ))}
      {calendarDays.map(day => {
        const dayEvents = getEventsForDate(day);
        const isCurrentMonth = isSameMonth(day, currentMonth);
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());

        return (
          <div
            key={day.toISOString()}
            className={`min-h-[80px] p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
              !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
            } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => onDateSelect(day)}
          >
            <div className={`text-sm font-medium mb-1 ${
              isToday ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
            }`}>
              {format(day, 'd')}
            </div>
            <div className="space-y-0.5">
              {dayEvents.slice(0, 2).map(event => (
                <div
                  key={event.id}
                  className={`${getEventTypeColor(event.type)} text-white text-xs px-1 py-0.5 rounded cursor-pointer hover:opacity-80 truncate`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-gray-500 px-1">
                  +{dayEvents.length - 2}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekDays = eachDayOfInterval({ 
      start: weekStart, 
      end: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000) 
    });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="overflow-auto max-h-[600px]">
        <div className="grid grid-cols-8 gap-1 min-w-[800px]">
          <div className="p-2"></div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="p-2 text-center border-b">
              <div className="font-medium">{format(day, 'EEE')}</div>
              <div className={`text-lg ${isSameDay(day, new Date()) ? 'bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
          {hours.map(hour => (
            <>
              <div key={`hour-${hour}`} className="p-1 text-xs text-gray-500 border-r">
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
              {weekDays.map(day => {
                const hourEvents = events.filter(event => {
                  const eventDate = new Date(event.start_time);
                  return isSameDay(eventDate, day) && eventDate.getHours() === hour;
                });

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="min-h-[40px] p-0.5 border border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onTimeSlotClick(day, hour)}
                  >
                    {hourEvents.map(event => (
                      <div
                        key={event.id}
                        className={`${getEventTypeColor(event.type)} text-white text-xs p-1 rounded mb-0.5 cursor-pointer hover:opacity-80`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <div className="font-medium truncate text-xs">{event.title}</div>
                        {event.client_name && (
                          <div className="opacity-75 flex items-center text-xs">
                            <User className="w-2 h-2 mr-1" />
                            <span className="truncate">{event.client_name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="flex-1">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map(viewType => (
              <Button
                key={viewType}
                variant={view === viewType ? "default" : "ghost"}
                size="sm"
                onClick={() => setView(viewType)}
                className="capitalize"
              >
                {viewType}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && (
          <div className="text-center py-8">
            Day view coming soon...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
