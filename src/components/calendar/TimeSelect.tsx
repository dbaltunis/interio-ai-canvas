import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

// Generate time slots every 15 minutes
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

// Format time for display (e.g., "9:00 AM")
const formatTimeDisplay = (time: string) => {
  if (!time) return "Select time";
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const TimeSelect = ({ 
  value, 
  onChange, 
  label,
  className,
  disabled = false 
}: TimeSelectProps) => {
  const [open, setOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Scroll to selected time when popover opens
  useEffect(() => {
    if (open && selectedRef.current && scrollContainerRef.current) {
      setTimeout(() => {
        selectedRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' });
      }, 50);
    }
  }, [open]);

  const handleTimeClick = (time: string) => {
    onChange(time);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-8 justify-start text-left font-normal text-xs gap-2 min-w-[100px]",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="h-3 w-3 text-muted-foreground" />
          {formatTimeDisplay(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[140px] p-0 pointer-events-auto" 
        align="start"
      >
        {label && (
          <div className="px-3 py-2 border-b bg-muted/30 pointer-events-auto">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          </div>
        )}
        {/* Using native scrollable div instead of ScrollArea for better compatibility */}
        <div 
          ref={scrollContainerRef}
          className="h-[200px] overflow-y-auto overscroll-contain pointer-events-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="p-1 pointer-events-auto">
            {TIME_SLOTS.map((time) => {
              const isSelected = time === value;
              const [hours] = time.split(':').map(Number);
              const isBusinessHour = hours >= 9 && hours <= 17;
              
              return (
                <button
                  key={time}
                  type="button"
                  ref={isSelected ? selectedRef : undefined}
                  onClick={() => handleTimeClick(time)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-xs rounded-sm transition-colors pointer-events-auto cursor-pointer",
                    "hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-primary text-primary-foreground",
                    !isSelected && isBusinessHour && "font-medium"
                  )}
                >
                  {formatTimeDisplay(time)}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Duration display component
interface DurationBadgeProps {
  startTime: string;
  endTime: string;
  className?: string;
}

export const DurationBadge = ({ startTime, endTime, className }: DurationBadgeProps) => {
  if (!startTime || !endTime) return null;
  
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  let durationMinutes = endTotalMinutes - startTotalMinutes;
  if (durationMinutes <= 0) return null;
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  let display = '';
  if (hours > 0 && minutes > 0) {
    display = `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    display = `${hours}h`;
  } else {
    display = `${minutes}m`;
  }
  
  return (
    <span className={cn(
      "text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded",
      className
    )}>
      {display}
    </span>
  );
};
