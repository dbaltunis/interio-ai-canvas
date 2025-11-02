import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  MapPin,
  Plus,
  Filter,
  Settings,
  Link2,
  Bell
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, isToday, addWeeks, subWeeks } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { UnifiedAppointmentDialog } from "./UnifiedAppointmentDialog";
import { AppointmentSchedulerSlider } from "./AppointmentSchedulerSlider";
import { CalendarFilters } from "./filters/CalendarFilters";
import { CalendarFilterState } from "./CalendarFilters";

export const MobileCalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSchedulerSlider, setShowSchedulerSlider] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [filters, setFilters] = useState<CalendarFilterState>({
    searchTerm: "",
    userIds: [],
    eventTypes: [],
    statuses: []
  });
  
  const { data: appointments = [] } = useAppointments();
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Get current week for mobile view
  const startDate = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  
  // Filter appointments for selected date
  const dayAppointments = appointments.filter(apt => 
    apt.start_time && isSameDay(new Date(apt.start_time), selectedDate)
  );

  const handlePrevWeek = () => setSelectedDate(subWeeks(selectedDate, 1));
  const handleNextWeek = () => setSelectedDate(addWeeks(selectedDate, 1));
  
  const handleEventClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowEditDialog(true);
  };
  
  const handleCreateEvent = () => {
    setShowCreateDialog(true);
  };
  
  const handleFiltersChange = (visibleSources: string[]) => {
    // Handle filter changes
  };

  return (
    <div className={cn("flex flex-col animate-fade-in h-full", isMobile ? "p-4" : "p-6")}>
      {/* Hidden button for programmatic trigger from CreateActionDialog */}
      <button 
        data-create-event
        className="hidden"
        onClick={() => setShowCreateDialog(true)}
        aria-hidden="true"
      />
      
      {/* Header with Actions */}
      <div className="flex items-center justify-between gap-2 mb-4 shrink-0">
        <div className="flex-1 min-w-0">
          <h2 className={cn("font-bold truncate", isMobile ? "text-lg" : "text-xl")}>
            {format(selectedDate, 'MMMM yyyy')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {dayAppointments.length} {dayAppointments.length === 1 ? 'event' : 'events'}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(isMobile && "h-8 w-8 p-0")}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSchedulerSlider(true)}
            className={cn(isMobile && "h-8 w-8 p-0")}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Popover open={showCalendarPicker} onOpenChange={setShowCalendarPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(isMobile && "h-8 w-8 p-0")}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 border-b bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  Today: <span className="font-medium text-foreground">{format(new Date(), 'MMM dd, yyyy')}</span>
                </p>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setShowCalendarPicker(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
            className={cn(isMobile && "text-xs px-2 h-8")}
          >
            Today
          </Button>
          <Button
            size="sm"
            onClick={handleCreateEvent}
            className={cn("shrink-0", isMobile && "h-8 w-8 p-0 sm:w-auto sm:px-3")}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">New</span>
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="mb-4 shrink-0">
          <CalendarFilters onFiltersChange={handleFiltersChange} />
        </div>
      )}

      {/* Week Navigation */}
      <Card className="overflow-hidden mb-4 shrink-0">
        <CardContent className={cn(isMobile ? "p-2" : "p-3")}>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevWeek}
              className={cn("shrink-0", isMobile ? "h-8 w-8 p-0" : "h-10 w-10")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 grid grid-cols-7 gap-0.5">
              {weekDays.map((day, i) => {
                const isSelected = isSameDay(day, selectedDate);
                const today = isToday(day);
                const hasEvents = appointments.some(apt => 
                  apt.start_time && isSameDay(new Date(apt.start_time), day)
                );
                
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg transition-all relative",
                      isMobile ? "p-1.5 gap-0.5" : "p-2 gap-1",
                      isSelected && "bg-primary text-primary-foreground shadow-md scale-105",
                      !isSelected && today && "bg-accent",
                      !isSelected && !today && "hover:bg-muted"
                    )}
                  >
                    <span className={cn(
                      "font-medium",
                      isMobile ? "text-[10px]" : "text-xs"
                    )}>
                      {format(day, 'EEE')}
                    </span>
                    <span className={cn(
                      "font-bold",
                      isMobile ? "text-base" : "text-lg"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {hasEvents && !isSelected && (
                      <div className={cn(
                        "absolute rounded-full bg-primary",
                        isMobile ? "bottom-0.5 h-1 w-1" : "bottom-1 h-1.5 w-1.5"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextWeek}
              className={cn("shrink-0", isMobile ? "h-8 w-8 p-0" : "h-10 w-10")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Events List - Scrollable */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <h3 className={cn(
          "font-semibold text-muted-foreground mb-3 shrink-0",
          isMobile ? "text-xs" : "text-sm"
        )}>
          {format(selectedDate, 'EEEE, MMMM d')}
        </h3>
        
        <div className="flex-1 overflow-y-auto">
          {dayAppointments.length === 0 ? (
            <Card>
              <CardContent className={cn(
                "text-center",
                isMobile ? "p-8" : "p-12"
              )}>
                <CalendarIcon className={cn(
                  "mx-auto mb-3 text-muted-foreground",
                  isMobile ? "h-12 w-12" : "h-16 w-16"
                )} />
                <p className={cn(
                  "text-muted-foreground",
                  isMobile ? "text-sm" : "text-base"
                )}>
                  No events scheduled
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 pb-4">
            {dayAppointments.map((apt) => (
              <Card 
                key={apt.id} 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
                onClick={() => handleEventClick(apt)}
              >
                <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-semibold line-clamp-1",
                          isMobile ? "text-sm" : "text-base"
                        )}>
                          {apt.title}
                        </h4>
                        {apt.description && (
                          <p className={cn(
                            "text-muted-foreground line-clamp-2",
                            isMobile ? "text-xs mt-0.5" : "text-sm mt-1"
                          )}>
                            {apt.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {apt.notification_enabled && (
                          <Bell className="h-3 w-3 text-primary" />
                        )}
                        <Badge 
                          variant="outline" 
                          className={cn("", isMobile && "text-xs px-1.5")}
                        >
                          {apt.status || 'scheduled'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "flex flex-wrap gap-3 text-muted-foreground",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      {apt.start_time && (
                        <div className="flex items-center gap-1">
                          <Clock className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                          <span>{format(new Date(apt.start_time), 'h:mm a')}</span>
                          {apt.end_time && (
                            <span>- {format(new Date(apt.end_time), 'h:mm a')}</span>
                          )}
                        </div>
                      )}
                      {apt.location && (
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <MapPin className={cn(isMobile ? "h-3 w-3" : "h-4 w-4", "shrink-0")} />
                          <span className="truncate">{apt.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <div 
                  className="h-1 bg-gradient-to-r from-primary/50 to-primary"
                  style={{
                    background: apt.color 
                      ? `linear-gradient(to right, ${apt.color}80, ${apt.color})` 
                      : undefined
                  }}
                />
              </Card>
            ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Create/Edit Event Dialog */}
      <UnifiedAppointmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        appointment={null}
        selectedDate={selectedDate}
      />
      
      <UnifiedAppointmentDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        appointment={selectedAppointment}
        selectedDate={selectedDate}
      />
      
      {/* Scheduler/Booking Links */}
      <AppointmentSchedulerSlider
        isOpen={showSchedulerSlider}
        onClose={() => setShowSchedulerSlider(false)}
      />
    </div>
  );
};
