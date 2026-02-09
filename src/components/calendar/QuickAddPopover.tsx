import { useState, useRef, useEffect, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Clock, Palette, ChevronRight } from "lucide-react";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useCalendarPermissions } from "@/hooks/useCalendarPermissions";
import { useToast } from "@/hooks/use-toast";

const DURATION_CHIPS = [
  { label: "25m", minutes: 25 },
  { label: "30m", minutes: 30 },
  { label: "45m", minutes: 45 },
  { label: "1h", minutes: 60 },
  { label: "1.5h", minutes: 90 },
];

const EVENT_TYPES = [
  { value: "meeting", label: "Meeting", color: "#3B82F6" },
  { value: "consultation", label: "Consult", color: "#22C55E" },
  { value: "installation", label: "Install", color: "#F59E0B" },
  { value: "call", label: "Call", color: "#EF4444" },
  { value: "measurement", label: "Measure", color: "#8B5CF6" },
  { value: "follow-up", label: "Follow-up", color: "#06B6D4" },
];

const COLOR_DOTS = [
  "#6366F1", "#3B82F6", "#22C55E", "#F59E0B",
  "#EF4444", "#EC4899", "#8B5CF6", "#14B8A6",
];

interface QuickAddPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  startTime: string;
  endTime?: string;
  onMoreOptions?: (prefill: { title: string; date: Date; startTime: string; endTime: string; color: string; type: string }) => void;
  children?: React.ReactNode;
}

export const QuickAddPopover = ({
  open,
  onOpenChange,
  date,
  startTime,
  endTime: initialEndTime,
  onMoreOptions,
  children,
}: QuickAddPopoverProps) => {
  const [title, setTitle] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedType, setSelectedType] = useState("meeting");
  const [selectedColor, setSelectedColor] = useState("#6366F1");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const createAppointment = useCreateAppointment();
  const { canCreateAppointments, isPermissionLoaded } = useCalendarPermissions();
  const { toast } = useToast();

  // Calculate initial duration from startTime-endTime range
  useEffect(() => {
    if (initialEndTime && startTime) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = initialEndTime.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0 && diff <= 180) {
        setSelectedDuration(diff);
      }
    }
  }, [startTime, initialEndTime]);

  // Auto-focus input when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setTitle("");
      setSelectedDuration(60);
      setSelectedType("meeting");
      setSelectedColor("#6366F1");
      setShowColorPicker(false);
    }
  }, [open]);

  const computedEndTime = useCallback(() => {
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + selectedDuration;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  }, [startTime, selectedDuration]);

  const handleSave = async () => {
    if (!title.trim()) {
      inputRef.current?.focus();
      return;
    }

    if (isPermissionLoaded && !canCreateAppointments) {
      toast({ title: "Permission Denied", description: "You don't have permission to create appointments.", variant: "destructive" });
      return;
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    const end = computedEndTime();

    try {
      await createAppointment.mutateAsync({
        title: title.trim(),
        start_time: `${dateStr}T${startTime}:00`,
        end_time: `${dateStr}T${end}:00`,
        appointment_type: selectedType as any,
        color: selectedColor,
      });
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  const handleMoreOptions = () => {
    onMoreOptions?.({
      title: title.trim(),
      date,
      startTime,
      endTime: computedEndTime(),
      color: selectedColor,
      type: selectedType,
    });
    onOpenChange(false);
  };

  const endTimeStr = computedEndTime();

  // Use an invisible trigger when no children provided
  const trigger = children || <div className="hidden" />;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 overflow-hidden shadow-xl"
        side="right"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header with date/time */}
        <div className="bg-muted/30 px-4 py-2.5 border-b flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground/80">{format(date, 'EEE, MMM d')}</span>
          <span>&middot;</span>
          <span className="tabular-nums">{startTime} &ndash; {endTimeStr}</span>
        </div>

        <div className="p-4 space-y-3">
          {/* Title input */}
          <Input
            ref={inputRef}
            placeholder="Event title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-9 text-sm font-medium border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary px-0"
            autoComplete="off"
          />

          {/* Duration chips */}
          <div>
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Duration</div>
            <div className="flex gap-1.5">
              {DURATION_CHIPS.map(chip => (
                <button
                  key={chip.minutes}
                  type="button"
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                    selectedDuration === chip.minutes
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => setSelectedDuration(chip.minutes)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Event type pills */}
          <div>
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Type</div>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition-all flex items-center gap-1 ${
                    selectedType === type.value
                      ? 'ring-1 ring-offset-1 shadow-sm'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: `${type.color}18`,
                    color: type.color,
                    ...(selectedType === type.value ? { ringColor: type.color } : {}),
                  }}
                  onClick={() => {
                    setSelectedType(type.value);
                    setSelectedColor(type.color);
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color selector */}
          <div>
            <button
              type="button"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <div className="w-3.5 h-3.5 rounded-full border border-border/50" style={{ backgroundColor: selectedColor }} />
              <Palette className="h-3 w-3" />
              <span>Color</span>
            </button>
            {showColorPicker && (
              <div className="flex gap-1.5 mt-2">
                {COLOR_DOTS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-5 h-5 rounded-full transition-all ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1 h-8"
              onClick={handleSave}
              disabled={createAppointment.isPending || !title.trim()}
            >
              {createAppointment.isPending ? 'Creating...' : 'Save'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground"
              onClick={handleMoreOptions}
            >
              More options
              <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
