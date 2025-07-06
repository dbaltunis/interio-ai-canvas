
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, BellOff, CalendarDays, Search, Filter } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationsPopupProps {
  onScheduleNotification: (notificationId: string) => void;
}

export const NotificationsPopup = ({ onScheduleNotification }: NotificationsPopupProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { data: notifications } = useNotifications();

  const unreadNotifications = notifications?.filter(n => !n.read) || [];
  
  const filteredNotifications = unreadNotifications
    .filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || notification.type === filterType;
      return matchesSearch && matchesType;
    })
    .slice(0, 20);

  const notificationTypes = [...new Set(unreadNotifications.map(n => n.type))];

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadNotifications.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadNotifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Notifications</h3>
            {unreadNotifications.length > 0 && (
              <Badge variant="secondary">
                {unreadNotifications.length} unread
              </Badge>
            )}
          </div>
          
          {unreadNotifications.length > 0 && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8">
                  <Filter className="w-3 h-3 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {notificationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <div className="max-h-80 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BellOff className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">
                {searchTerm || filterType !== "all" 
                  ? "No notifications match your filters" 
                  : "No unread notifications"
                }
              </p>
            </div>
          ) : (
            <ScrollArea className="h-80">
              <div className="space-y-2 p-4 pt-0">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-sm line-clamp-1">{notification.title}</h5>
                      <Badge className={`${getNotificationTypeColor(notification.type)} text-xs border-0 shrink-0`}>
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onScheduleNotification(notification.id)}
                        className="text-xs h-6"
                      >
                        <CalendarDays className="mr-1 h-3 w-3" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
