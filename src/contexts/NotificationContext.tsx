import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface UnifiedNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error";
  category: string;
  priority: string;
  source_type: string | null;
  source_id: string | null;
  action_url: string | null;
  metadata: Record<string, unknown>;
  read: boolean;
  group_key: string | null;
  parent_id: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface NotificationContextType {
  notifications: UnifiedNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refetch: () => Promise<void>;
  browserNotificationsEnabled: boolean;
  requestBrowserPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Check browser notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setBrowserNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  const requestBrowserPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.log("Browser doesn't support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      setBrowserNotificationsEnabled(true);
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === "granted";
    setBrowserNotificationsEnabled(granted);
    return granted;
  }, []);

  const showBrowserNotification = useCallback((notification: UnifiedNotification) => {
    if (!browserNotificationsEnabled) return;

    const browserNotif = new Notification(notification.title, {
      body: notification.message,
      icon: "/favicon.ico",
      tag: notification.id,
      data: { action_url: notification.action_url },
    });

    browserNotif.onclick = () => {
      window.focus();
      if (notification.action_url) {
        window.location.href = notification.action_url;
      }
      browserNotif.close();
    };
  }, [browserNotificationsEnabled]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Cast to UnifiedNotification with defaults for new fields
      const typedData = (data || []).map((n) => ({
        ...n,
        category: n.category || "general",
        priority: n.priority || "normal",
        source_type: n.source_type || null,
        source_id: n.source_id || null,
        metadata: n.metadata || {},
        group_key: n.group_key || null,
        parent_id: n.parent_id || null,
        expires_at: n.expires_at || null,
      })) as UnifiedNotification[];
      
      setNotifications(typedData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = {
            ...payload.new,
            category: payload.new.category || "general",
            priority: payload.new.priority || "normal",
            metadata: payload.new.metadata || {},
          } as UnifiedNotification;
          
          setNotifications((prev) => [newNotification, ...prev]);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
          
          // Show browser notification for high priority
          if (newNotification.priority === "high") {
            showBrowserNotification(newNotification);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === payload.new.id ? { ...n, ...payload.new } as UnifiedNotification : n
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user?.id, fetchNotifications, toast, showBrowserNotification]);

  const markAsRead = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }, [user?.id]);

  const deleteNotification = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }, []);

  const clearAll = useCallback(async () => {
    if (!user?.id) return;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user.id)
      .eq("read", true);

    if (error) {
      console.error("Error clearing notifications:", error);
      throw error;
    }
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refetch: fetchNotifications,
    browserNotificationsEnabled,
    requestBrowserPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
