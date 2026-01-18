import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DatePickerButtonProps {
  value: string; // yyyy-MM-dd format
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const DatePickerButton = ({
  value,
  onChange,
  className,
  disabled = false
}: DatePickerButtonProps) => {
  const [open, setOpen] = useState(false);
  
  const selectedDate = value ? new Date(value) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-8 justify-start text-left font-normal text-xs gap-2 min-w-[130px]",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarDays className="h-3 w-3 text-muted-foreground" />
          {selectedDate ? format(selectedDate, 'EEE, MMM d') : 'Pick date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 pointer-events-auto" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-2 border-b bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Today: <span className="font-medium text-foreground">{format(new Date(), 'MMM d, yyyy')}</span>
          </p>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};
