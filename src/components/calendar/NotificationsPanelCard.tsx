
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, BellOff, CalendarDays, Search, Filter } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationsPanelCardProps {
  onScheduleNotification: (notificationId: string) => void;
}

export const NotificationsPanelCard = ({ onScheduleNotification }: NotificationsPanelCardProps) => {
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
    .slice(0, 50); // Limit to 50 for performance

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              {unreadNotifications.length} unread notifications
            </CardDescription>
          </div>
          {unreadNotifications.length > 0 && (
            <Badge variant="secondary">
              {unreadNotifications.length}
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
                className="pl-8"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
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
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BellOff className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>
              {searchTerm || filterType !== "all" 
                ? "No notifications match your filters" 
                : "No unread notifications"
              }
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3 pr-4">
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
                      className="text-xs h-7"
                    >
                      <CalendarDays className="mr-1 h-3 w-3" />
                      Schedule
                    </Button>
                  </div>
                </div>
              ))}
              
              {unreadNotifications.length > 50 && (
                <div className="text-center py-2 text-sm text-muted-foreground">
                  Showing first 50 notifications. Use search to find specific ones.
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
