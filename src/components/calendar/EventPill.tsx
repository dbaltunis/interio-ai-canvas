import { memo } from "react";
import { format } from "date-fns";
import { Video, CheckCheck, MapPin, Calendar } from "lucide-react";
import { getEventStyling } from "./utils/calendarHelpers";

// --- Shared EventPill component used by Week, Day, and Month views ---

interface EventPillProps {
  event: any;
  variant: "week" | "day" | "month";
  height?: number;
  onClick?: () => void;
  onTaskToggle?: (id: string, currentStatus: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const EventPill = memo(({ event, variant, height = 40, onClick, onTaskToggle, className = "", style }: EventPillProps) => {
  const styling = getEventStyling(event);
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);

  if (variant === "month") {
    return (
      <div
        className={`flex items-center gap-1.5 text-[10px] cursor-pointer hover:opacity-80 transition-opacity rounded px-1.5 py-0.5 truncate ${className}`}
        style={{
          backgroundColor: styling.background,
          borderLeft: `2.5px solid ${styling.border}`,
          ...style,
        }}
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      >
        <span className="font-medium text-foreground/60 tabular-nums">
          {format(startTime, 'H:mm')}
        </span>
        <span className="text-foreground truncate font-medium">
          {event.isBooking ? (event.bookingData?.customer_name || 'Customer') : event.title}
        </span>
      </div>
    );
  }

  // Task rendering
  if (event.isTask) {
    return (
      <div
        className={`flex items-center gap-2 h-full cursor-pointer ${className}`}
        style={{
          backgroundColor: styling.background,
          borderLeft: `3px solid ${styling.border}`,
          borderRadius: '8px',
          padding: '2px 8px 2px 10px',
          ...style,
        }}
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      >
        <button
          type="button"
          className={`flex-shrink-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
            event.status === 'completed'
              ? "border-green-500 bg-green-500"
              : "border-muted-foreground/40 hover:border-primary"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onTaskToggle?.(event.id, event.status);
          }}
        >
          {event.status === 'completed' && <CheckCheck className="h-2 w-2 text-white" strokeWidth={3} />}
        </button>
        <span
          className="text-[11px] font-medium text-foreground leading-tight truncate"
          style={{ textDecoration: event.status === 'completed' ? 'line-through' : 'none' }}
        >
          {event.title}
        </span>
      </div>
    );
  }

  // Week/Day event rendering - Apple-style pill
  const title = event.isBooking ? (event.bookingData?.customer_name || 'Customer') : event.title;

  return (
    <div
      className={`rounded-lg overflow-hidden group transition-all duration-150 hover:shadow-md hover:brightness-[0.97] cursor-pointer h-full relative ${className}`}
      style={style}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      title={title}
    >
      {/* Left color accent bar */}
      <div
        className="absolute left-0 top-1 bottom-1 w-1 rounded-full"
        style={{ backgroundColor: styling.border }}
      />

      {/* Background fill */}
      <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: styling.background }} />

      {/* Content */}
      <div className="relative pl-3 pr-1.5 py-1 h-full flex flex-col overflow-hidden">
        {/* Title - adaptive clamping based on height */}
        <div
          className="text-[11px] font-semibold text-foreground leading-tight overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: height > 70 ? 3 : height > 45 ? 2 : 1,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {title}
        </div>

        {/* Time row */}
        {height > 28 && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
            <span className="tabular-nums">{format(startTime, 'H:mm')}</span>
            <span className="opacity-50">&ndash;</span>
            <span className="tabular-nums">{format(endTime, 'H:mm')}</span>
            {(event.video_meeting_link || event.video_provider) && (
              <Video className="w-2.5 h-2.5 text-blue-500 ml-0.5" />
            )}
          </div>
        )}

        {/* Location / description - only if tall enough */}
        {height > 65 && (event.location || event.description) && (
          <div className="text-[10px] text-muted-foreground/70 truncate mt-0.5 flex items-center gap-0.5">
            {event.location && <MapPin className="w-2.5 h-2.5 flex-shrink-0" />}
            {event.location || event.description}
          </div>
        )}

        {/* Booking scheduler name */}
        {height > 50 && event.isBooking && event.scheduler_name && (
          <div className="text-[10px] text-muted-foreground/70 truncate mt-0.5 flex items-center gap-0.5">
            <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
            {event.scheduler_name}
          </div>
        )}
      </div>
    </div>
  );
});
EventPill.displayName = 'EventPill';
