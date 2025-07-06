
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, Menu } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday, parseISO } from "date-fns";
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
      isSameDay(parseISO(event.start_time), date)
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
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border">
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={day} className="p-2 text-center text-xs font-medium text-gray-600 border-r last:border-r-0">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, dayIndex) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isDayToday = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] p-1 sm:p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-blue-50 transition-colors relative
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
                ${isDayToday ? 'bg-blue-50' : ''}
              `}
              onClick={() => onDateSelect(day)}
            >
              {/* Day Number */}
              <div className={`
                text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full
                ${isDayToday ? 'bg-blue-500 text-white' : ''}
              `}>
                {format(day, 'd')}
              </div>
              
              {/* Events */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, isMobile ? 2 : 3).map(event => (
                  <div
                    key={event.id}
                    className={`
                      ${getEventTypeColor(event.type)} text-white text-xs px-1.5 py-0.5 rounded cursor-pointer 
                      hover:opacity-80 truncate leading-tight
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    title={`${event.title}${event.client_name ? ` - ${event.client_name}` : ''}`}
                  >
                    <div className="flex items-center space-x-1">
                      <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="truncate">
                        {format(parseISO(event.start_time), 'HH:mm')} {event.title}
                      </span>
                    </div>
                  </div>
                ))}
                {dayEvents.length > (isMobile ? 2 : 3) && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dayEvents.length - (isMobile ? 2 : 3)} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
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
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border">
        {/* Week Header */}
        <div className="grid grid-cols-8 border-b bg-gray-50">
          <div className="p-3 border-r"></div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="p-3 text-center border-r last:border-r-0">
              <div className="text-xs text-gray-600 font-medium">{format(day, 'EEE')}</div>
              <div className={`
                mt-1 text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-full mx-auto
                ${isToday(day) ? 'bg-blue-500 text-white' : 'text-gray-900'}
              `}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        {/* Time Grid */}
        <div className="overflow-auto max-h-[calc(100vh-300px)]">
          <div className="grid grid-cols-8">
            {hours.map(hour => (
              <div key={hour} className="contents">
                {/* Time Label */}
                <div className="p-2 text-xs text-gray-500 border-r border-b text-right pr-3">
                  {format(new Date().setHours(hour, 0), 'HH:mm')}
                </div>
                
                {/* Day Columns */}
                {weekDays.map(day => {
                  const hourEvents = events.filter(event => {
                    const eventDate = parseISO(event.start_time);
                    return isSameDay(eventDate, day) && eventDate.getHours() === hour;
                  });

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className="min-h-[50px] p-1 border-r border-b last:border-r-0 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => onTimeSlotClick(day, hour)}
                    >
                      {hourEvents.map(event => (
                        <div
                          key={event.id}
                          className={`
                            ${getEventTypeColor(event.type)} text-white text-xs p-1.5 rounded mb-1 cursor-pointer 
                            hover:opacity-80 transition-opacity
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          {event.client_name && (
                            <div className="opacity-75 flex items-center text-xs mt-0.5">
                              <User className="w-2.5 h-2.5 mr-1" />
                              <span className="truncate">{event.client_name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'week'] as const).map(viewType => (
              <Button
                key={viewType}
                variant={view === viewType ? "default" : "ghost"}
                size="sm"
                onClick={() => setView(viewType)}
                className="capitalize px-3 py-1.5 text-sm"
              >
                {viewType}
              </Button>
            ))}
          </div>
          
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Event</span>
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
    </div>
  );
};
