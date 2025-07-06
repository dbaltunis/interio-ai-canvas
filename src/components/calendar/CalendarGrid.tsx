
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
    <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground border-b">
          {isMobile ? day.charAt(0) : day}
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
            className={`min-h-[60px] sm:min-h-[80px] p-0.5 sm:p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
              !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
            } ${isSelected ? 'ring-1 sm:ring-2 ring-blue-500' : ''}`}
            onClick={() => onDateSelect(day)}
          >
            <div className={`text-xs sm:text-sm font-medium mb-1 ${
              isToday ? 'bg-blue-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs' : ''
            }`}>
              {format(day, 'd')}
            </div>
            <div className="space-y-0.5">
              {dayEvents.slice(0, isMobile ? 1 : 2).map(event => (
                <div
                  key={event.id}
                  className={`${getEventTypeColor(event.type)} text-white text-[10px] sm:text-xs px-1 py-0.5 rounded cursor-pointer hover:opacity-80 truncate`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  title={event.title}
                >
                  {isMobile ? event.title.substring(0, 8) + '...' : event.title}
                </div>
              ))}
              {dayEvents.length > (isMobile ? 1 : 2) && (
                <div className="text-[10px] sm:text-xs text-gray-500 px-1">
                  +{dayEvents.length - (isMobile ? 1 : 2)}
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
      <div className="overflow-auto max-h-[500px] sm:max-h-[600px]">
        <div className="grid grid-cols-8 gap-0.5 sm:gap-1 min-w-[600px] sm:min-w-[800px]">
          <div className="p-1 sm:p-2"></div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="p-1 sm:p-2 text-center border-b">
              <div className="font-medium text-xs sm:text-sm">{format(day, 'EEE')}</div>
              <div className={`text-sm sm:text-lg ${isSameDay(day, new Date()) ? 'bg-blue-500 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mx-auto text-xs sm:text-base' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
          {hours.map(hour => (
            <>
              <div key={`hour-${hour}`} className="p-1 text-[10px] sm:text-xs text-gray-500 border-r">
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
                    className="min-h-[30px] sm:min-h-[40px] p-0.5 border border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onTimeSlotClick(day, hour)}
                  >
                    {hourEvents.map(event => (
                      <div
                        key={event.id}
                        className={`${getEventTypeColor(event.type)} text-white text-[10px] sm:text-xs p-1 rounded mb-0.5 cursor-pointer hover:opacity-80`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        {event.client_name && !isMobile && (
                          <div className="opacity-75 flex items-center text-[10px]">
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
    <Card className="w-full">
      <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto">
          <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
            {(['month', 'week'] as const).map(viewType => (
              <Button
                key={viewType}
                variant={view === viewType ? "default" : "ghost"}
                size="sm"
                onClick={() => setView(viewType)}
                className="capitalize text-xs sm:text-sm flex-1 sm:flex-none"
              >
                {viewType}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <CardContent className="p-2 sm:p-4">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
      </CardContent>
    </Card>
  );
};
