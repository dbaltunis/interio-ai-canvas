
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, Calendar as CalendarIcon, Edit } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday, parseISO, differenceInMinutes, differenceInHours, addHours } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  type: 'appointment' | 'reminder' | 'client_meeting' | 'consultation' | 'measurement' | 'installation' | 'follow-up' | 'meeting' | 'call';
  color: string;
  client_name?: string;
  location?: string;
}

interface CalendarGridProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
  onNewEventClick: () => void;
  showTodaysEvents: boolean;
  onToggleTodaysEvents: (show: boolean) => void;
}

export const CalendarGrid = ({ 
  events, 
  selectedDate, 
  onDateSelect, 
  onEventClick, 
  onEditEvent,
  onTimeSlotClick,
  onNewEventClick,
  showTodaysEvents,
  onToggleTodaysEvents
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
      case 'consultation': return 'bg-blue-500';
      case 'measurement': return 'bg-green-500';
      case 'installation': return 'bg-purple-500';
      case 'follow-up': return 'bg-orange-500';
      case 'meeting': return 'bg-indigo-500';
      case 'call': return 'bg-pink-500';
      case 'reminder': return 'bg-yellow-500';
      case 'appointment': return 'bg-blue-500';
      case 'client_meeting': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const todaysEvents = events.filter(event => 
    isSameDay(parseISO(event.start_time), new Date())
  );

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
                min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-blue-50 transition-colors relative
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
                ${isDayToday ? 'bg-blue-50' : ''}
              `}
              onClick={() => onDateSelect(day)}
            >
              {/* Day Number */}
              <div className={`
                text-sm font-medium mb-2 w-7 h-7 flex items-center justify-center rounded-full
                ${isDayToday ? 'bg-blue-500 text-white' : ''}
              `}>
                {format(day, 'd')}
              </div>
              
              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, isMobile ? 2 : 4).map(event => (
                  <div
                    key={event.id}
                    className={`
                      group ${getEventTypeColor(event.type)} text-white text-xs px-2 py-1 rounded cursor-pointer 
                      hover:opacity-90 truncate leading-tight relative transition-all duration-200 hover:shadow-md
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    title={`${event.title}${event.client_name ? ` - ${event.client_name}` : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 flex-1 min-w-0">
                        <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">
                          {format(parseISO(event.start_time), 'HH:mm')} {event.title}
                        </span>
                      </div>
                      {!event.id.startsWith('email-') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 p-0 h-4 w-4 hover:bg-white/20 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditEvent(event);
                          }}
                        >
                          <Edit className="w-2.5 h-2.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {dayEvents.length > (isMobile ? 2 : 4) && (
                  <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                    +{dayEvents.length - (isMobile ? 2 : 4)} more
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
          <div className="p-3 border-r text-xs font-medium text-gray-600">Time</div>
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
          <div className="relative">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-8 relative border-b border-gray-100">
                {/* Time Label */}
                <div className="p-3 text-xs text-gray-500 border-r text-right pr-3 h-16 flex items-center justify-end bg-gray-50">
                  {format(new Date().setHours(hour, 0), 'HH:mm')}
                </div>
                
                {/* Day Columns */}
                {weekDays.map(day => {
                  const dayEvents = events.filter(event => {
                    const eventDate = parseISO(event.start_time);
                    const eventHour = eventDate.getHours();
                    return isSameDay(eventDate, day) && eventHour === hour;
                  });

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className="h-16 p-1 border-r last:border-r-0 hover:bg-blue-50 cursor-pointer transition-colors relative group"
                      onClick={() => onTimeSlotClick(day, hour)}
                    >
                      {/* Quick add button on hover */}
                      <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center transition-opacity">
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>

                      {dayEvents.map(event => {
                        const startTime = parseISO(event.start_time);
                        const endTime = parseISO(event.end_time);
                        const durationMinutes = differenceInMinutes(endTime, startTime);
                        
                        // Default to 2 hours if duration is less than 30 minutes or not specified
                        const displayDuration = durationMinutes < 30 ? 120 : durationMinutes;
                        const durationHours = displayDuration / 60;
                        
                        // Calculate height based on duration (64px per hour for better visibility)
                        const height = Math.max(durationHours * 64, 48); // Minimum 48px height
                        
                        return (
                          <div
                            key={event.id}
                            className={`
                              group/event ${getEventTypeColor(event.type)} text-white text-xs p-2 rounded-lg mb-1 cursor-pointer 
                              hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg absolute left-1 right-1 z-10
                            `}
                            style={{ 
                              height: `${height}px`,
                              top: `${(startTime.getMinutes() / 60) * 64}px`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium truncate flex-1">{event.title}</div>
                              {!event.id.startsWith('email-') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="opacity-0 group-hover/event:opacity-100 p-0 h-4 w-4 hover:bg-white/20 transition-opacity ml-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditEvent(event);
                                  }}
                                >
                                  <Edit className="w-2.5 h-2.5" />
                                </Button>
                              )}
                            </div>
                            <div className="text-xs opacity-90 mb-1">
                              {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                            </div>
                            {event.client_name && (
                              <div className="opacity-75 flex items-center text-xs truncate">
                                <User className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                                <span className="truncate">{event.client_name}</span>
                              </div>
                            )}
                            {event.location && height > 80 && (
                              <div className="opacity-75 flex items-center text-xs mt-1 truncate">
                                <MapPin className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="h-9 w-9 p-0 hover:bg-blue-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="h-9 w-9 p-0 hover:bg-blue-50"
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

          {/* Today's Events Toggle */}
          <Button
            variant={showTodaysEvents ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleTodaysEvents(!showTodaysEvents)}
            className="gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Today ({todaysEvents.length})
          </Button>
          
          <Button onClick={onNewEventClick} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
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
