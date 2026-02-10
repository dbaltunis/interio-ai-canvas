import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Clock, MapPin, Video, Edit, Trash2, ExternalLink, Calendar, Users } from "lucide-react";
import { useDeleteAppointment } from "@/hooks/useAppointments";
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteAppointment = useDeleteAppointment();

  if (disabled || event.isTask) {
    return <>{children}</>;
  }

  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);

  // Guard: if dates are invalid, just render children without popover
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

  const handleEdit = () => {
    setOpen(false);
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

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        <PopoverContent
          className="w-72 p-0 overflow-hidden"
          side="right"
          align="start"
          sideOffset={8}
        >
          {/* Color header */}
          <div className="h-2" style={{ backgroundColor: eventColor }} />

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
                  onClick={handleEdit}
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
