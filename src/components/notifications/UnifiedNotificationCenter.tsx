import { useState } from "react";
import { Bell, CheckCheck, Trash2, Settings, Inbox, History, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { NotificationFilters } from "./NotificationFilters";
import { NotificationItem } from "./NotificationItem";
import { NotificationSettingsPanel } from "./NotificationSettingsPanel";
import {
  useUnifiedNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useClearReadNotifications,
  useUnreadNotificationCount,
} from "@/hooks/useUnifiedNotifications";
import { Skeleton } from "@/components/ui/skeleton";

export const UnifiedNotificationCenter = () => {
  const [activeTab, setActiveTab] = useState("inbox");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");
  const [search, setSearch] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { data: notifications = [], isLoading } = useUnifiedNotifications({
    category: category !== "all" ? category : undefined,
    priority: priority !== "all" ? priority : undefined,
    read: showUnreadOnly ? false : undefined,
    search: search || undefined,
  });

  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();
  const clearRead = useClearReadNotifications();

  const inboxNotifications = showUnreadOnly
    ? notifications.filter((n) => !n.read)
    : notifications;

  const mentionNotifications = notifications.filter(
    (n) => n.category === "team" && n.message.includes("@")
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "You're all caught up!"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={unreadCount === 0 || markAllAsRead.isPending}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearRead.mutate()}
            disabled={clearRead.isPending}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear read
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6 border-b">
          <TabsList className="h-12">
            <TabsTrigger value="inbox" className="gap-2">
              <Inbox className="h-4 w-4" />
              Inbox
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <History className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="mentions" className="gap-2">
              <AtSign className="h-4 w-4" />
              Mentions
              {mentionNotifications.filter((n) => !n.read).length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  {mentionNotifications.filter((n) => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Inbox Tab */}
        <TabsContent value="inbox" className="flex-1 flex flex-col mt-0 p-0">
          <div className="p-6 pb-4">
            <NotificationFilters
              category={category}
              priority={priority}
              search={search}
              showUnreadOnly={showUnreadOnly}
              onCategoryChange={setCategory}
              onPriorityChange={setPriority}
              onSearchChange={setSearch}
              onUnreadOnlyChange={setShowUnreadOnly}
            />
          </div>

          <ScrollArea className="flex-1 px-6">
            <div className="space-y-3 pb-6">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))
              ) : inboxNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No notifications</h3>
                  <p className="text-muted-foreground text-sm">
                    {showUnreadOnly
                      ? "You've read all your notifications"
                      : "You don't have any notifications yet"}
                  </p>
                </div>
              ) : (
                inboxNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={(id) => markAsRead.mutate(id)}
                    onDelete={(id) => deleteNotification.mutate(id)}
                    isLoading={markAsRead.isPending || deleteNotification.isPending}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all" className="flex-1 flex flex-col mt-0 p-0">
          <div className="p-6 pb-4">
            <NotificationFilters
              category={category}
              priority={priority}
              search={search}
              showUnreadOnly={false}
              onCategoryChange={setCategory}
              onPriorityChange={setPriority}
              onSearchChange={setSearch}
              onUnreadOnlyChange={() => {}}
            />
          </div>

          <ScrollArea className="flex-1 px-6">
            <div className="space-y-3 pb-6">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No notifications</h3>
                  <p className="text-muted-foreground text-sm">
                    Your notification history is empty
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={(id) => markAsRead.mutate(id)}
                    onDelete={(id) => deleteNotification.mutate(id)}
                    isLoading={markAsRead.isPending || deleteNotification.isPending}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Mentions Tab */}
        <TabsContent value="mentions" className="flex-1 flex flex-col mt-0 p-0">
          <ScrollArea className="flex-1 px-6 pt-6">
            <div className="space-y-3 pb-6">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))
              ) : mentionNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AtSign className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No mentions</h3>
                  <p className="text-muted-foreground text-sm">
                    When someone @mentions you, it will appear here
                  </p>
                </div>
              ) : (
                mentionNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={(id) => markAsRead.mutate(id)}
                    onDelete={(id) => deleteNotification.mutate(id)}
                    isLoading={markAsRead.isPending || deleteNotification.isPending}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1 mt-0 p-0">
          <ScrollArea className="flex-1 px-6 py-6">
            <NotificationSettingsPanel />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
