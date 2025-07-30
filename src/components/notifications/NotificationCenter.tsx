import { Bell, X, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePendingNotifications, useMarkNotificationRead } from "@/hooks/useAppointmentNotifications";
import { ProcessNotificationsButton } from "./ProcessNotificationsButton";
import { format } from "date-fns";

export const NotificationCenter = () => {
  const { data: pendingNotifications = [], isLoading } = usePendingNotifications();
  const markAsRead = useMarkNotificationRead();

  if (isLoading || pendingNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      <div className="flex justify-end">
        <ProcessNotificationsButton />
      </div>
      {pendingNotifications.slice(0, 3).map((notification) => (
        <Card key={notification.id} className="border-l-4 border-l-orange-500 bg-background shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-orange-500" />
                <CardTitle className="text-sm font-medium">{notification.title}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => markAsRead.mutate(notification.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="text-xs">
              {notification.message}
            </CardDescription>
            
            {notification.appointments && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{notification.appointments.title}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(notification.appointments.start_time), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              {notification.channels.map((channel) => (
                <Badge key={channel} variant="outline" className="text-xs">
                  {channel}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {pendingNotifications.length > 3 && (
        <Card className="bg-muted/50">
          <CardContent className="p-3 text-center">
            <span className="text-xs text-muted-foreground">
              +{pendingNotifications.length - 3} more notifications
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
};