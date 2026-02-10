import { useState, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Clock, MapPin, Video, Edit, Trash2, ExternalLink, Calendar, Palette, ChevronRight, Check, X } from "lucide-react";
import { useDeleteAppointment, useUpdateAppointment } from "@/hooks/useAppointments";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { DURATION_CHIPS, EVENT_TYPES, COLOR_DOTS } from "./calendarConstants";

interface EventDetailPopoverProps {
  children: React.ReactNode;
  event: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    location?: string;
    description?: string;
    color?: string;
    video_meeting_link?: string;
    appointment_type?: string;
    isBooking?: boolean;
    isTask?: boolean;
    bookingData?: any;
    scheduler_name?: string;
  };
  onEdit?: (id: string) => void;
  disabled?: boolean;
}

export const EventDetailPopover = ({
  children,
  event,
  onEdit,
  disabled = false,
}: EventDetailPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const deleteAppointment = useDeleteAppointment();
  const updateAppointment = useUpdateAppointment();
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Inline edit state
  const [editTitle, setEditTitle] = useState(event.title);
  const [editType, setEditType] = useState(event.appointment_type || "meeting");
  const [editColor, setEditColor] = useState(event.color || "#6366F1");
  const [editDuration, setEditDuration] = useState(30);

  if (disabled || event.isTask) {
    return <>{children}</>;
  }

  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return <>{children}</>;
  }

  const eventColor = event.color || '#6366F1';
  const durationMins = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const handleStartEditing = () => {
    setEditTitle(event.title);
    setEditType(event.appointment_type || "meeting");
    setEditColor(event.color || "#6366F1");
    setEditDuration(durationMins);
    setShowColorPicker(false);
    setIsEditing(true);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowColorPicker(false);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;

    const newEndTime = new Date(startTime.getTime() + editDuration * 60000);

    try {
      await updateAppointment.mutateAsync({
        id: event.id,
        title: editTitle.trim(),
        end_time: newEndTime.toISOString(),
        appointment_type: editType as any,
        color: editColor,
      });
      setIsEditing(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleAdvancedEdit = () => {
    setOpen(false);
    setIsEditing(false);
    onEdit?.(event.id);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteAppointment.mutate(event.id);
    setShowDeleteConfirm(false);
    setOpen(false);
  };

  // Reset editing state when popover closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setIsEditing(false);
      setShowColorPicker(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        <PopoverContent
          className={`p-0 overflow-hidden ${isEditing ? 'w-80' : 'w-72'}`}
          side="right"
          align="start"
          sideOffset={8}
        >
          {/* Color header */}
          <div className="h-2" style={{ backgroundColor: isEditing ? editColor : eventColor }} />

          {isEditing ? (
            /* ===== INLINE EDIT MODE (same feel as QuickAddPopover) ===== */
            <div className="p-3 space-y-3">
              {/* Date/time header */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-semibold text-foreground">{format(startTime, 'EEE, MMM d')}</span>
                <span>&middot;</span>
                <span className="tabular-nums">
                  {format(startTime, 'HH:mm')} &ndash; {format(new Date(startTime.getTime() + editDuration * 60000), 'HH:mm')}
                </span>
              </div>

              {/* Title input */}
              <Input
                ref={titleInputRef}
                placeholder="Event title..."
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleEditKeyDown}
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
                        editDuration === chip.minutes
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      onClick={() => setEditDuration(chip.minutes)}
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
                        editType === type.value
                          ? 'ring-2 ring-offset-1 shadow-sm'
                          : 'opacity-50 hover:opacity-80'
                      }`}
                      style={{
                        backgroundColor: `${type.color}20`,
                        color: type.color,
                        ...(editType === type.value ? { ringColor: type.color } : {}),
                      }}
                      onClick={() => {
                        setEditType(type.value);
                        setEditColor(type.color);
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
                  <div className="w-4 h-4 rounded-full border border-border/50" style={{ backgroundColor: editColor }} />
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
                          editColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditColor(color)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="default"
                  className="flex-1 h-9"
                  onClick={handleSaveEdit}
                  disabled={updateAppointment.isPending || !editTitle.trim()}
                >
                  {updateAppointment.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  size="default"
                  variant="ghost"
                  className="h-9 text-sm text-muted-foreground"
                  onClick={handleAdvancedEdit}
                >
                  More options
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            /* ===== VIEW MODE ===== */
            <div className="p-3 space-y-3">
              {/* Title */}
              <div className="flex items-start gap-2">
                <div
                  className="w-3 h-3 rounded mt-0.5 flex-shrink-0"
                  style={{ backgroundColor: eventColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-tight line-clamp-2">
                    {event.isBooking ? (event.bookingData?.customer_name || 'Customer Booking') : event.title}
                  </div>
                  {event.appointment_type && (
                    <span className="text-[10px] text-muted-foreground capitalize mt-0.5 inline-block">
                      {event.appointment_type}
                    </span>
                  )}
                </div>
              </div>

              {/* Date and time */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/60" />
                <div>
                  <div className="font-medium text-foreground/80">
                    {format(startTime, 'EEEE, MMMM d')}
                  </div>
                  <div>
                    {format(startTime, 'h:mm a')} &ndash; {format(endTime, 'h:mm a')}
                    <span className="ml-1 opacity-60">({formatDuration(durationMins)})</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/60" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}

              {/* Video meeting */}
              {event.video_meeting_link && (
                <div className="flex items-center gap-2 text-xs">
                  <Video className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                  <a
                    href={event.video_meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Join video call
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              )}

              {/* Scheduler info for bookings */}
              {event.isBooking && event.scheduler_name && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/60" />
                  <span>{event.scheduler_name}</span>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <p className="text-xs text-muted-foreground line-clamp-3 pt-1 border-t border-border/30">
                  {event.description}
                </p>
              )}

              {/* Actions */}
              {!event.isBooking && (
                <div className="flex gap-1.5 pt-2 border-t border-border/30">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs flex-1"
                    onClick={handleStartEditing}
                  >
                    <Edit className="h-3 w-3 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
