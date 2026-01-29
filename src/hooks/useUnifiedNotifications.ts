import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export interface NotificationFilters {
  category?: string;
  priority?: string;
  read?: boolean;
  search?: string;
}

export const useUnifiedNotifications = (filters?: NotificationFilters) => {
  return useQuery({
    queryKey: ["unified-notifications", filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      // Apply filters
      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters?.priority && filters.priority !== "all") {
        query = query.eq("priority", filters.priority);
      }
      if (filters?.read !== undefined) {
        query = query.eq("read", filters.read);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }

      // Map data with defaults for new fields
      return (data || []).map((n) => ({
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
    },
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) {
        console.error("Error fetching unread count:", error);
        return 0;
      }

      return count || 0;
    },
    refetchInterval: 30000,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
      queryClient.invalidateQueries({ queryKey: ["general-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
      queryClient.invalidateQueries({ queryKey: ["general-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "All caught up!",
        description: "All notifications marked as read.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
      queryClient.invalidateQueries({ queryKey: ["general-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useClearReadNotifications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id)
        .eq("read", true);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
      toast({
        title: "Cleared",
        description: "Read notifications have been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear notifications.",
        variant: "destructive",
      });
    },
  });
};

// Helper to create a notification via the edge function
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: {
      user_id: string;
      title: string;
      message: string;
      type?: "info" | "warning" | "error";
      category?: string;
      priority?: string;
      source_type?: string;
      source_id?: string;
      action_url?: string;
      metadata?: Record<string, unknown>;
      group_key?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("unified-notification-service", {
        body: notification,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
    },
  });
};
