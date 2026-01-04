import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDashboardDate, PRESETS } from "@/contexts/DashboardDateContext";

const PRESET_ORDER = [
  "today",
  "yesterday",
  "7days",
  "30days",
  "90days",
  "month",
  "last-month",
  "quarter",
  "year",
];

export const DashboardDateFilter = () => {
  const { dateRange, setPreset, setCustomRange } = useDashboardDate();
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState<Date | undefined>(undefined);
  const [customEnd, setCustomEnd] = useState<Date | undefined>(undefined);

  const handlePresetClick = (preset: string) => {
    setPreset(preset);
    setOpen(false);
  };

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      setCustomRange(customStart, customEnd);
      setOpen(false);
    }
  };

  const formatDateRange = () => {
    return `${format(dateRange.startDate, "MMM d")} - ${format(dateRange.endDate, "MMM d, yyyy")}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 px-3 rounded-lg text-xs font-medium gap-2 border-border/60 bg-background hover:bg-muted",
            open && "ring-2 ring-primary/20"
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="hidden sm:inline text-foreground">{dateRange.label}</span>
          <span className="hidden md:inline text-muted-foreground text-[10px]">
            {formatDateRange()}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 shadow-lg" 
        align="end"
        sideOffset={8}
      >
        <div className="flex">
          {/* Presets Panel */}
          <div className="w-40 border-r border-border/50 p-2">
            <div className="space-y-0.5">
              {PRESET_ORDER.map((key) => {
                const preset = PRESETS[key];
                if (!preset) return null;
                const isActive = dateRange.preset === key;
                return (
                  <button
                    key={key}
                    onClick={() => handlePresetClick(key)}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{preset.label}</span>
                      {isActive && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="border-t border-border/50 mt-2 pt-2">
              <p className="px-3 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Custom Range
              </p>
            </div>
          </div>

          {/* Calendar Panel */}
          <div className="p-3">
            <div className="flex gap-2">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1 px-1">Start Date</p>
                <Calendar
                  mode="single"
                  selected={customStart}
                  onSelect={setCustomStart}
                  disabled={(date) => date > new Date()}
                  className="rounded-md border-0"
                />
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1 px-1">End Date</p>
                <Calendar
                  mode="single"
                  selected={customEnd}
                  onSelect={setCustomEnd}
                  disabled={(date) => date > new Date() || (customStart ? date < customStart : false)}
                  className="rounded-md border-0"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-3 pt-3 border-t border-border/50">
              <Button
                size="sm"
                onClick={handleApplyCustom}
                disabled={!customStart || !customEnd}
                className="h-7 text-xs px-4"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
