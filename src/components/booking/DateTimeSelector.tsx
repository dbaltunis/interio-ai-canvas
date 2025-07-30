import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { format, isAfter, startOfDay, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface DateTimeSelectorProps {
  selectedDate?: Date;
  selectedTime?: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  getAvailableSlotsForDate: (date: Date) => TimeSlot[];
}

export const DateTimeSelector = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  getAvailableSlotsForDate
}: DateTimeSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Select Date & Time
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Choose Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between text-left font-normal h-12",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={onDateSelect}
                disabled={(date) => {
                  const today = startOfDay(new Date());
                  if (!isAfter(date, today) && !isSameDay(date, today)) return true;
                  
                  // Check if date has available slots
                  const dateSlots = getAvailableSlotsForDate(date);
                  return dateSlots.length === 0;
                }}
                className="rounded-md border"
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="space-y-3">
            <Label className="text-base font-medium">Available Times</Label>
            {(() => {
              const availableSlots = getAvailableSlotsForDate(selectedDate);
              
              if (availableSlots.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No available times for this date</p>
                  </div>
                );
              }
              
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableSlots.map(slot => (
                    <Button
                      key={slot.startTime}
                      variant={selectedTime === slot.startTime ? "default" : "outline"}
                      size="lg"
                      onClick={() => onTimeSelect(slot.startTime)}
                      className={cn(
                        "h-12 text-sm font-medium",
                        selectedTime === slot.startTime && "shadow-md"
                      )}
                    >
                      {slot.startTime}
                    </Button>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};