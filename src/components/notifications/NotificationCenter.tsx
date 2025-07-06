
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Bell, BellOff, Calendar as CalendarIcon, Clock, X } from "lucide-react";
import { useNotifications, useMarkAsRead } from "@/hooks/useNotifications";
import { useScheduleNotificationReminder } from "@/hooks/useNotificationCalendarIntegration";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [scheduleTime, setScheduleTime] = useState("09:00");

  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const scheduleReminder = useScheduleNotificationReminder();

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleScheduleReminder = async () => {
    if (!selectedNotification || !scheduleDate) return;

    const [hours, minutes] = scheduleTime.split(':').map(Number);
    const scheduledDateTime = new Date(scheduleDate);
    scheduledDateTime.setHours(hours, minutes);

    try {
      await scheduleReminder.mutateAsync({
        notificationId: selectedNotification.id,
        title: selectedNotification.title,
        message: selectedNotification.message,
        scheduleDate: scheduledDateTime,
        duration: 30
      });
      
      setScheduleDialogOpen(false);
      setSelectedNotification(null);
      setScheduleDate(undefined);
      setScheduleTime("09:00");
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    }
  };

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
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4 text-sm text-muted-foreground">Loading...</div>
              ) : notifications && notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 10).map((notification) => (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "p-3 rounded-lg border",
                        !notification.read && "bg-muted/50"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <Badge className={`${getNotificationTypeColor(notification.type)} text-xs border-0`}>
                            {notification.type}
                          </Badge>
                        </div>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notification.created_at), 'MMM d, HH:mm')}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedNotification(notification);
                            setScheduleDialogOpen(true);
                          }}
                          className="text-xs h-6"
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BellOff className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Reminder</DialogTitle>
            <DialogDescription>
              Create a calendar appointment for this notification
            </DialogDescription>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-1">{selectedNotification.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedNotification.message}</p>
              </div>

              <div>
                <Label>Schedule Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduleDate ? format(scheduleDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="schedule-time">Time</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleScheduleReminder}
                  disabled={!scheduleDate || scheduleReminder.isPending}
                  className="flex-1"
                >
                  {scheduleReminder.isPending ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Schedule
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setScheduleDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
