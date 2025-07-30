import { useState } from "react";
import { Bell, X, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePendingNotifications, useMarkNotificationRead } from "@/hooks/useAppointmentNotifications";
import { ProcessNotificationsButton } from "./ProcessNotificationsButton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const NotificationDropdown = () => {
  const { data: pendingNotifications = [], isLoading } = usePendingNotifications();
  const markAsRead = useMarkNotificationRead();
  const [isOpen, setIsOpen] = useState(false);

  const notificationCount = pendingNotifications.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-brand-neutral hover:text-brand-primary p-2"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium"
            >
              {notificationCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end" sideOffset={5}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {notificationCount > 0 && (
              <ProcessNotificationsButton />
            )}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notificationCount === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No pending notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {pendingNotifications.map((notification) => (
                <div key={notification.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                      </div>
                      
                      {notification.appointments && (
                        <div className="space-y-2">
                          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span>{notification.appointments.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(new Date(notification.appointments.start_time), "MMM d, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2">
                            <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                              📧 Notification Details:
                            </div>
                            <div>• Reminder scheduled for: {format(new Date(notification.scheduled_for), "MMM d 'at' h:mm a")}</div>
                            <div>• Will notify via {notification.channels.join(', ')}</div>
                            <div>• Click "Send Pending Notifications" above to send now</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 flex-wrap">
                        {notification.channels.map((channel) => (
                          <Badge 
                            key={channel} 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              channel === 'email' && "border-blue-200 text-blue-700",
                              channel === 'sms' && "border-green-200 text-green-700",
                              channel === 'push' && "border-purple-200 text-purple-700"
                            )}
                          >
                            {channel === 'email' && '📧'} 
                            {channel === 'sms' && '📱'} 
                            {channel === 'push' && '🔔'} 
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => markAsRead.mutate(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};