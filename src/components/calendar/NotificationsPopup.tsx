
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Clock, CheckCircle } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationsPopupProps {
  onScheduleNotification: (notificationId: string) => void;
}

export const NotificationsPopup = ({ onScheduleNotification }: NotificationsPopupProps) => {
  const { data: notifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Notifications</h3>
            <Badge variant="secondary">{unreadCount} unread</Badge>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications && notifications.length > 0 ? (
              notifications.slice(0, 10).map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg border ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onScheduleNotification(notification.id)}
                    >
                      <Calendar className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>
          
          {notifications && notifications.length > 10 && (
            <div className="text-center pt-2 border-t">
              <Button variant="ghost" size="sm">
                View all notifications
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
