import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  Calendar, 
  FileText, 
  Users, 
  Settings, 
  FolderOpen,
  Star,
  Check,
  Trash2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UnifiedNotification } from "@/hooks/useUnifiedNotifications";

const SOURCE_ICONS: Record<string, React.ElementType> = {
  project: FolderOpen,
  appointment: Calendar,
  quote: FileText,
  team: Users,
  system: Settings,
  general: Bell,
};

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-destructive text-destructive-foreground",
  normal: "bg-muted text-muted-foreground",
  low: "bg-muted/50 text-muted-foreground/70",
};

const TYPE_STYLES: Record<string, string> = {
  info: "border-l-blue-500",
  warning: "border-l-yellow-500",
  error: "border-l-destructive",
};

interface NotificationItemProps {
  notification: UnifiedNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  isLoading,
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const Icon = SOURCE_ICONS[notification.source_type || notification.category] || Bell;

  const handleAction = () => {
    if (notification.action_url) {
      // Mark as read when navigating
      if (!notification.read) {
        onMarkAsRead(notification.id);
      }
      navigate(notification.action_url);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  return (
    <div
      className={cn(
        "group relative p-4 border-l-4 rounded-lg bg-card transition-all hover:shadow-md",
        TYPE_STYLES[notification.type] || "border-l-primary",
        !notification.read && "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Priority Indicator */}
        {notification.priority === "high" && (
          <Star className="h-4 w-4 text-warning fill-warning flex-shrink-0 mt-0.5" />
        )}

        {/* Icon */}
        <div
          className={cn(
            "p-2 rounded-full flex-shrink-0",
            notification.read ? "bg-muted" : "bg-primary/10"
          )}
        >
          <Icon className={cn("h-4 w-4", notification.read ? "text-muted-foreground" : "text-primary")} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h4
                className={cn(
                  "text-sm font-medium leading-tight",
                  notification.read && "text-muted-foreground"
                )}
              >
                {notification.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
            </div>

            {/* Quick Actions - visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onMarkAsRead(notification.id)}
                  disabled={isLoading}
                  title="Mark as read"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(notification.id)}
                disabled={isLoading}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>

            {/* Category badge */}
            <Badge variant="outline" className="text-xs capitalize">
              {notification.category}
            </Badge>

            {/* Priority badge for high priority */}
            {notification.priority === "high" && (
              <Badge className={cn("text-xs", PRIORITY_STYLES.high)}>
                High Priority
              </Badge>
            )}

            {/* Action button if URL available */}
            {notification.action_url && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs gap-1"
                onClick={handleAction}
              >
                View details
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
