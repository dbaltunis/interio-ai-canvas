import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isAfter, startOfDay, isSameDay, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

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
  const [displayMonth, setDisplayMonth] = useState(new Date());

  const handlePrevMonth = () => setDisplayMonth(subMonths(displayMonth, 1));
  const handleNextMonth = () => setDisplayMonth(addMonths(displayMonth, 1));

  const availableSlots = selectedDate ? getAvailableSlotsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Select Date & Time</h3>
        <p className="text-sm text-muted-foreground">Choose a date that works for you</p>
      </div>

      {/* Calendar */}
      <div className="border border-border rounded-xl p-4 bg-card">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h4 className="font-semibold text-foreground">
            {format(displayMonth, "MMMM yyyy")}
          </h4>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          disabled={(date) => {
            const today = startOfDay(new Date());
            if (!isAfter(date, today) && !isSameDay(date, today)) return true;
            const dateSlots = getAvailableSlotsForDate(date);
            return dateSlots.length === 0;
          }}
          className="w-full"
          classNames={{
            months: "flex flex-col",
            month: "space-y-4",
            caption: "hidden",
            nav: "hidden",
            table: "w-full border-collapse",
            head_row: "flex justify-between",
            head_cell: "text-muted-foreground font-medium text-xs w-10 text-center",
            row: "flex justify-between mt-2",
            cell: "text-center text-sm relative p-0",
            day: cn(
              "h-10 w-10 p-0 font-normal rounded-lg transition-all duration-200",
              "hover:bg-primary/10 hover:text-primary",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "aria-selected:opacity-100"
            ),
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            day_today: "border-2 border-primary/50",
            day_outside: "text-muted-foreground/50",
            day_disabled: "text-muted-foreground/30 hover:bg-transparent cursor-not-allowed",
          }}
        />
      </div>

      {/* Time Selection */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <Label className="text-base font-medium text-foreground">
                Available times for {format(selectedDate, "EEEE, MMM d")}
              </Label>
            </div>
            
            {availableSlots.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 bg-muted/50 rounded-xl border border-dashed border-border"
              >
                <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground font-medium">No available times</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Please select another date</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.map((slot, index) => (
                  <motion.div
                    key={slot.startTime}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Button
                      variant={selectedTime === slot.startTime ? "default" : "outline"}
                      size="sm"
                      onClick={() => onTimeSelect(slot.startTime)}
                      className={cn(
                        "w-full h-12 text-base font-medium transition-all duration-200",
                        selectedTime === slot.startTime 
                          ? "shadow-md scale-105 font-semibold" 
                          : "bg-slate-50 border-slate-200 hover:bg-primary/5 hover:border-primary hover:text-primary"
                      )}
                    >
                      {slot.startTime}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
