import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Clock, MapPin, Video, Edit, Trash2, ExternalLink } from "lucide-react";

interface EventHoverCardProps {
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
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  disabled?: boolean;
}

export const EventHoverCard = ({ 
  children, 
  event, 
  onEdit, 
  onDelete,
  disabled = false 
}: EventHoverCardProps) => {
  if (disabled) {
    return <>{children}</>;
  }

  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);
  const eventColor = event.color || 'hsl(var(--primary))';

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-64 p-3" 
        side="right" 
        align="start"
        sideOffset={8}
      >
        <div className="space-y-2">
          {/* Title with color indicator */}
          <div className="flex items-start gap-2">
            <div 
              className="w-3 h-3 rounded mt-0.5 flex-shrink-0" 
              style={{ backgroundColor: eventColor }} 
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm leading-tight line-clamp-2">
                {event.title}
              </div>
            </div>
          </div>

          {/* Date and time */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span>
              {format(startTime, 'EEE, MMM d')} · {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* Video meeting */}
          {event.video_meeting_link && (
            <div className="flex items-center gap-2 text-xs text-blue-500">
              <Video className="h-3 w-3 flex-shrink-0" />
              <a 
                href={event.video_meeting_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                Join video call
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          )}

          {/* Description preview */}
          {event.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
              {event.description}
            </p>
          )}

          {/* Actions */}
          {(onEdit || onDelete) && (
            <div className="flex gap-1 pt-2 border-t">
              {onEdit && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 text-xs flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(event.id);
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(event.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
