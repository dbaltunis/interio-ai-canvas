import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import { 
  X, 
  Bell, 
  Calendar, 
  Mail, 
  User, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Info,
  Clock
} from 'lucide-react';

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: string;
    avatar?: string;
    userName?: string;
    actionLabel?: string;
    actionUrl?: string;
    isRead?: boolean;
  };
  onDismiss?: (id: string) => void;
  onAction?: (id: string) => void;
  onClick?: (id: string) => void;
}

const NotificationItem = ({ notification, onDismiss, onAction, onClick }: NotificationItemProps) => {
  const iconMap = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle
  };

  const Icon = iconMap[notification.type];

  return (
    <Card 
      className={cn(
        "group hover-lift cursor-pointer transition-all duration-200",
        !notification.isRead && "border-l-4 border-l-primary"
      )}
      onClick={() => onClick?.(notification.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {notification.avatar ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={notification.avatar} alt={notification.userName} />
                <AvatarFallback>
                  {notification.userName?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className={cn(
                "p-2 rounded-lg",
                notification.type === 'success' && "bg-green-500/10 text-green-600",
                notification.type === 'warning' && "bg-yellow-500/10 text-yellow-600",
                notification.type === 'error' && "bg-red-500/10 text-red-600",
                notification.type === 'info' && "bg-blue-500/10 text-blue-600"
              )}>
                <Icon className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground">{notification.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 bg-primary rounded-full" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {notification.actionLabel && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(notification.id);
                    }}
                    className="text-xs"
                  >
                    {notification.actionLabel}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss?.(notification.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface NotificationCenterProps {
  notifications: NotificationItemProps['notification'][];
  onDismiss?: (id: string) => void;
  onAction?: (id: string) => void;
  onClick?: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export const NotificationCenter = ({
  notifications,
  onDismiss,
  onAction,
  onClick,
  onClearAll,
  className
}: NotificationCenterProps) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-foreground" />
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <StatusIndicator status="info" size="sm">
                {unreadCount} new
              </StatusIndicator>
            )}
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="p-4 bg-muted/30 rounded-lg inline-block mb-3">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onDismiss={onDismiss}
                onAction={onAction}
                onClick={onClick}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export { NotificationItem };