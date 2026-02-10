import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Clock, Palette, ChevronRight } from "lucide-react";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useCalendarPermissions } from "@/hooks/useCalendarPermissions";
import { useToast } from "@/hooks/use-toast";
import { DURATION_CHIPS, EVENT_TYPES, COLOR_DOTS } from "./calendarConstants";
import { useCalendarTeamGroups } from "@/hooks/useCalendarTeamGroups";

interface QuickAddPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  startTime: string;
  endTime?: string;
  onMoreOptions?: (prefill: { title: string; date: Date; startTime: string; endTime: string; color: string; type: string }) => void;
  anchorPosition?: { x: number; y: number };
  children?: React.ReactNode;
}

export const QuickAddPopover = ({
  open,
  onOpenChange,
  date,
  startTime,
  endTime: initialEndTime,
  onMoreOptions,
  anchorPosition,
}: QuickAddPopoverProps) => {
  const [title, setTitle] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedType, setSelectedType] = useState("meeting");
  const [selectedColor, setSelectedColor] = useState("#6366F1");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const createAppointment = useCreateAppointment();
  const { canCreateAppointments, isPermissionLoaded } = useCalendarPermissions();
  const { toast } = useToast();
  const { data: teamGroups = [] } = useCalendarTeamGroups();

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
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setTitle("");
      setSelectedDuration(30);
      setSelectedType("meeting");
      setSelectedColor("#6366F1");
      setShowColorPicker(false);
      setSelectedGroupId(null);
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    // Delay to avoid the opening click from immediately closing
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onOpenChange]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onOpenChange]);

  const computedEndTime = useCallback(() => {
    const parts = startTime.split(':').map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
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

    const [year, month, day] = dateStr.split('-').map(Number);
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startDate = new Date(year, month - 1, day, startH || 0, startM || 0, 0);
    const endDate = new Date(year, month - 1, day, endH || 0, endM || 0, 0);

    try {
      const selectedGroup = teamGroups.find(g => g.id === selectedGroupId);
      await createAppointment.mutateAsync({
        title: title.trim(),
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        appointment_type: selectedType as any,
        color: selectedColor,
        team_member_ids: selectedGroup?.member_ids || [],
        visibility: selectedGroup ? 'team' : 'private',
        calendar_group_id: selectedGroupId || undefined,
      } as any);
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

  if (!open) return null;

  const endTimeStr = computedEndTime();

  // Calculate position: anchor to click position, ensure it stays in viewport
  const popoverWidth = 320;
  const popoverHeight = 420;
  let left = anchorPosition?.x ?? 200;
  let top = anchorPosition?.y ?? 200;

  // Keep within viewport bounds
  if (typeof window !== 'undefined') {
    if (left + popoverWidth > window.innerWidth - 16) {
      left = Math.max(16, (anchorPosition?.x ?? 200) - popoverWidth - 8);
    }
    if (top + popoverHeight > window.innerHeight - 16) {
      top = Math.max(16, window.innerHeight - popoverHeight - 16);
    }
  }

  return (
    <div
      ref={popoverRef}
      className="fixed z-[10000] w-80 rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
      style={{ left, top }}
    >
      {/* Color header bar */}
      <div className="h-2" style={{ backgroundColor: selectedColor }} />

      {/* Date/time header */}
      <div className="px-3 pt-3 pb-2 flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold text-foreground">{format(date, 'EEE, MMM d')}</span>
        <span className="text-muted-foreground">&middot;</span>
        <span className="tabular-nums text-muted-foreground">{startTime} &ndash; {endTimeStr}</span>
      </div>

      <div className="px-3 pb-3 space-y-3">
        {/* Title input */}
        <Input
          ref={inputRef}
          placeholder="Event title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-10 text-base font-medium border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary px-0"
          autoComplete="off"
        />

        {/* Duration chips */}
        <div>
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Duration</div>
          <div className="flex gap-1.5">
            {DURATION_CHIPS.map(chip => (
              <button
                key={chip.minutes}
                type="button"
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  selectedDuration === chip.minutes
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
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
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Type</div>
          <div className="flex flex-wrap gap-1.5">
            {EVENT_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  selectedType === type.value
                    ? 'ring-2 ring-offset-1 shadow-sm'
                    : 'opacity-50 hover:opacity-80'
                }`}
                style={{
                  backgroundColor: `${type.color}20`,
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

        {/* Calendar Group Selector */}
        {teamGroups.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Calendar</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  !selectedGroupId
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setSelectedGroupId(null)}
              >
                My Calendar
              </button>
              {teamGroups.map(group => (
                <button
                  key={group.id}
                  type="button"
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    selectedGroupId === group.id
                      ? 'ring-2 ring-offset-1 shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  style={selectedGroupId === group.id ? { backgroundColor: `${group.color}20`, color: group.color } : {}}
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }} />
                  {group.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color selector */}
        <div>
          <button
            type="button"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            <div className="w-4 h-4 rounded-full border border-border/50" style={{ backgroundColor: selectedColor }} />
            <Palette className="h-3.5 w-3.5" />
            <span>Color</span>
          </button>
          {showColorPicker && (
            <div className="flex gap-2 mt-2">
              {COLOR_DOTS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 rounded-full transition-all ${
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
            size="default"
            className="flex-1 h-9"
            onClick={handleSave}
            disabled={createAppointment.isPending || !title.trim()}
          >
            {createAppointment.isPending ? 'Creating...' : 'Save'}
          </Button>
          <Button
            size="default"
            variant="ghost"
            className="h-9 text-sm text-muted-foreground"
            onClick={handleMoreOptions}
          >
            More options
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
